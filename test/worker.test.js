import {
    createExecutionContext,
    waitOnExecutionContext,
} from "cloudflare:test";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import worker, { classifyGitRequest } from "../worker.js";
import { network } from "./network";

const PRIVATE_DISABLED = { PRIVATE_GIT_MODE: "disabled" };
const PRIVATE_ENABLED = { PRIVATE_GIT_MODE: "passthrough" };

async function invoke(request, env = PRIVATE_DISABLED) {
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    return response;
}

function gitInfo(path = "owner/repo.git") {
    return {
        host: "github.com",
        path: `/${path}`,
        fullUrl: `https://github.com/${path}`,
    };
}

describe("Git Smart HTTP route classification", () => {
    it("accepts only upload-pack discovery and POST", () => {
        expect(classifyGitRequest(
            "GET",
            gitInfo("owner/repo.git/info/refs"),
            new URLSearchParams("service=git-upload-pack"),
            new Headers()
        )).toBe("git-discovery");

        expect(classifyGitRequest(
            "POST",
            gitInfo("owner/repo.git/git-upload-pack"),
            new URLSearchParams(),
            new Headers({
                "content-type": "application/x-git-upload-pack-request",
            })
        )).toBe("git-upload-pack");

        expect(classifyGitRequest(
            "GET",
            gitInfo("owner/repo/info/refs"),
            new URLSearchParams("service=git-upload-pack"),
            new Headers()
        )).toBe("git-discovery");
    });

    it("rejects receive-pack and malformed upload-pack routes", () => {
        expect(classifyGitRequest(
            "GET",
            gitInfo("owner/repo.git/info/refs"),
            new URLSearchParams("service=git-receive-pack"),
            new Headers()
        )).toBe("forbidden-git-write");

        expect(classifyGitRequest(
            "POST",
            gitInfo("owner/repo.git/git-upload-pack/extra"),
            new URLSearchParams(),
            new Headers({
                "content-type": "application/x-git-upload-pack-request",
            })
        )).toBe("forbidden-git-write");
    });
});

describe("Git Smart HTTP proxy", () => {
    it("keeps the homepage available at the root path", async () => {
        const response = await invoke(new Request("https://proxy.example/"));
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toContain("text/html");
    });

    it("rejects insecure or credential-bearing embedded target URLs", async () => {
        let upstreamCalled = false;
        network.use(http.all(/https?:\/\/github\.com\/.*/, () => {
            upstreamCalled = true;
            return new HttpResponse(null, { status: 500 });
        }));

        const insecure = await invoke(new Request(
            "https://proxy.example/http://github.com/owner/repo.git/info/refs?service=git-upload-pack"
        ));
        const embeddedCredential = await invoke(new Request(
            "https://proxy.example/https://user:token@github.com/owner/repo.git/info/refs?service=git-upload-pack"
        ));

        expect(insecure.status).toBe(400);
        expect(embeddedCredential.status).toBe(400);
        expect(upstreamCalled).toBe(false);
    });

    it("preserves caching for ordinary public downloads", async () => {
        let upstreamCalls = 0;
        network.use(
            http.get(
                "https://raw.githubusercontent.com/owner/repo/main/file.txt",
                () => {
                    upstreamCalls++;
                    return new HttpResponse("public content", {
                        status: 200,
                        headers: { "cache-control": "public, max-age=3600" },
                    });
                }
            ),
            http.head(
                "https://proxy.example/raw.githubusercontent.com/owner/repo/main/file.txt",
                () => new HttpResponse(null, { status: 204 })
            )
        );

        const url = "https://proxy.example/raw.githubusercontent.com/owner/repo/main/file.txt";
        const first = await invoke(new Request(url));
        const second = await invoke(new Request(url));

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        expect(await second.text()).toBe("public content");
        expect(second.headers.get("x-cache-status")).toBe("HIT");
        expect(upstreamCalls).toBe(1);
    });

    it("proxies public discovery without caching", async () => {
        let upstreamCalls = 0;
        network.use(http.get(
            "https://github.com/owner/repo.git/info/refs",
            ({ request }) => {
                upstreamCalls++;
                expect(new URL(request.url).search).toBe("?service=git-upload-pack");
                return new HttpResponse("001e# service=git-upload-pack\\n0000", {
                    status: 200,
                    headers: {
                        "content-type": "application/x-git-upload-pack-advertisement",
                        "cache-control": "public, max-age=3600",
                    },
                });
            }
        ));

        const url = "https://proxy.example/github.com/owner/repo.git/info/refs?service=git-upload-pack";
        const first = await invoke(new Request(url));
        const second = await invoke(new Request(url));

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        expect(upstreamCalls).toBe(2);
        expect(first.headers.get("cache-control")).toBe("no-store");
        expect(first.headers.get("x-cache-status")).toBe("BYPASS");
    });

    it("streams upload-pack POST bodies without retrying", async () => {
        const requestBody = new TextEncoder().encode("0009want 1\\n0000");
        const responseBody = new TextEncoder().encode("0008NAK\\n");
        let upstreamCalls = 0;
        network.use(http.post(
            "https://github.com/owner/repo.git/git-upload-pack",
            async ({ request }) => {
                upstreamCalls++;
                expect(request.headers.get("git-protocol")).toBe("version=2");
                expect(request.headers.get("content-type"))
                    .toBe("application/x-git-upload-pack-request");
                expect(new Uint8Array(await request.arrayBuffer()))
                    .toEqual(requestBody);
                return new HttpResponse(responseBody, {
                    status: 200,
                    headers: {
                        "content-type": "application/x-git-upload-pack-result",
                        "cache-control": "public, max-age=3600",
                    },
                });
            }
        ));

        const response = await invoke(new Request(
            "https://proxy.example/github.com/owner/repo.git/git-upload-pack",
            {
                method: "POST",
                headers: {
                    "content-type": "application/x-git-upload-pack-request",
                    "git-protocol": "version=2",
                },
                body: requestBody,
            }
        ));

        expect(response.status).toBe(200);
        expect(new Uint8Array(await response.arrayBuffer()))
            .toEqual(responseBody);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(upstreamCalls).toBe(1);
    });

    it("fails closed when private credential forwarding is disabled", async () => {
        let upstreamCalled = false;
        network.use(http.get(/https:\/\/github\.com\/.*/, () => {
            upstreamCalled = true;
            return new HttpResponse(null, { status: 500 });
        }));

        const response = await invoke(new Request(
            "https://proxy.example/github.com/owner/repo.git/info/refs?service=git-upload-pack",
            { headers: { authorization: "Basic dXNlcjp0b2tlbg==" } }
        ));

        expect(response.status).toBe(403);
        expect(response.headers.get("cache-control")).toBe("private, no-store");
        expect(upstreamCalled).toBe(false);
    });

    it("forwards Basic credentials only on enabled Git pull routes", async () => {
        const authorization = "Basic dXNlcjp0b2tlbg==";
        network.use(http.get(
            "https://github.com/owner/private.git/info/refs",
            ({ request }) => {
                expect(request.headers.get("authorization")).toBe(authorization);
                expect(request.headers.get("git-protocol")).toBe("version=2");
                return new HttpResponse("private refs", {
                    status: 200,
                    headers: {
                        "content-type": "application/x-git-upload-pack-advertisement",
                        "cloudflare-cdn-cache-control": "public, max-age=86400",
                        "set-cookie": "session=private",
                        "x-github-target": "private-path",
                    },
                });
            }
        ));

        const response = await invoke(new Request(
            "https://proxy.example/github.com/owner/private.git/info/refs?service=git-upload-pack",
            {
                headers: {
                    authorization,
                    "git-protocol": "version=2",
                },
            }
        ), PRIVATE_ENABLED);

        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe("private, no-store");
        expect(response.headers.get("cloudflare-cdn-cache-control")).toBeNull();
        expect(response.headers.get("set-cookie")).toBeNull();
        expect(response.headers.get("x-github-target")).toBeNull();
    });

    it("never shares authenticated responses between credentials", async () => {
        const seen = [];
        network.use(http.get(
            "https://github.com/owner/private.git/info/refs",
            ({ request }) => {
                seen.push(request.headers.get("authorization"));
                return new HttpResponse(`private-${seen.length}`, {
                    status: 200,
                    headers: {
                        "content-type": "application/x-git-upload-pack-advertisement",
                        "cache-control": "public, max-age=86400",
                    },
                });
            }
        ));

        const url = "https://proxy.example/github.com/owner/private.git/info/refs?service=git-upload-pack";
        const first = await invoke(new Request(url, {
            headers: { authorization: "Basic dXNlcjp0b2tlbjE=" },
        }), PRIVATE_ENABLED);
        const second = await invoke(new Request(url, {
            headers: { authorization: "Basic dXNlcjp0b2tlbjI=" },
        }), PRIVATE_ENABLED);

        expect(new TextDecoder().decode(await first.arrayBuffer()))
            .toBe("private-1");
        expect(new TextDecoder().decode(await second.arrayBuffer()))
            .toBe("private-2");
        expect(seen).toEqual([
            "Basic dXNlcjp0b2tlbjE=",
            "Basic dXNlcjp0b2tlbjI=",
        ]);
    });

    it("rejects non-Basic private credentials before contacting GitHub", async () => {
        let upstreamCalled = false;
        network.use(http.get(/https:\/\/github\.com\/.*/, () => {
            upstreamCalled = true;
            return new HttpResponse(null, { status: 500 });
        }));

        const response = await invoke(new Request(
            "https://proxy.example/github.com/owner/private.git/info/refs?service=git-upload-pack",
            { headers: { authorization: "Bearer secret" } }
        ), PRIVATE_ENABLED);

        expect(response.status).toBe(400);
        expect(upstreamCalled).toBe(false);
    });

    it("preserves upstream authentication failures without caching", async () => {
        let upstreamCalls = 0;
        network.use(http.get(
            "https://github.com/owner/private.git/info/refs",
            () => {
                upstreamCalls++;
                return new HttpResponse("Repository not found", {
                    status: 404,
                    headers: { "www-authenticate": "Basic realm=GitHub" },
                });
            }
        ));

        const request = () => new Request(
            "https://proxy.example/github.com/owner/private.git/info/refs?service=git-upload-pack",
            { headers: { authorization: "Basic dXNlcjpiYWQ=" } }
        );
        const first = await invoke(request(), PRIVATE_ENABLED);
        const second = await invoke(request(), PRIVATE_ENABLED);

        expect(first.status).toBe(404);
        expect(first.headers.get("www-authenticate")).toBe("Basic realm=GitHub");
        expect(second.status).toBe(404);
        expect(upstreamCalls).toBe(2);
    });

    it("does not retry upload-pack POST failures", async () => {
        let upstreamCalls = 0;
        network.use(http.post(
            "https://github.com/owner/repo.git/git-upload-pack",
            () => {
                upstreamCalls++;
                return new HttpResponse("temporary failure", { status: 503 });
            }
        ));

        const response = await invoke(new Request(
            "https://proxy.example/github.com/owner/repo.git/git-upload-pack",
            {
                method: "POST",
                headers: {
                    "content-type": "application/x-git-upload-pack-request",
                },
                body: new Uint8Array([0, 0, 0, 0]),
            }
        ));

        expect(response.status).toBe(503);
        expect(upstreamCalls).toBe(1);
    });

    it("never forwards credentials to ordinary GitHub resources", async () => {
        let upstreamCalled = false;
        network.use(http.get(/https:\/\/raw\.githubusercontent\.com\/.*/, () => {
            upstreamCalled = true;
            return new HttpResponse("unexpected", { status: 200 });
        }));

        const response = await invoke(new Request(
            "https://proxy.example/raw.githubusercontent.com/owner/repo/main/file.txt",
            { headers: { authorization: "Basic dXNlcjp0b2tlbg==" } }
        ), PRIVATE_ENABLED);

        expect(response.status).toBe(403);
        expect(upstreamCalled).toBe(false);
    });

    it("blocks cross-host redirects without forwarding credentials", async () => {
        let redirected = false;
        network.use(
            http.get(
                "https://github.com/owner/private.git/info/refs",
                () => new HttpResponse(null, {
                    status: 302,
                    headers: { location: "https://evil.example/steal" },
                })
            ),
            http.get("https://evil.example/steal", () => {
                redirected = true;
                return new HttpResponse("leaked", { status: 200 });
            })
        );

        const response = await invoke(new Request(
            "https://proxy.example/github.com/owner/private.git/info/refs?service=git-upload-pack",
            { headers: { authorization: "Basic dXNlcjp0b2tlbg==" } }
        ), PRIVATE_ENABLED);

        expect(response.status).toBe(502);
        expect(redirected).toBe(false);
    });

    it("follows bounded same-host discovery redirects", async () => {
        const authorization = "Basic dXNlcjp0b2tlbg==";
        let redirectedCalls = 0;
        network.use(
            http.get(
                "https://github.com/owner/old.git/info/refs",
                () => new HttpResponse(null, {
                    status: 301,
                    headers: {
                        location: "https://github.com/owner/new.git/info/refs?service=git-upload-pack",
                    },
                })
            ),
            http.get(
                "https://github.com/owner/new.git/info/refs",
                ({ request }) => {
                    redirectedCalls++;
                    expect(request.headers.get("authorization"))
                        .toBe(authorization);
                    return new HttpResponse("renamed refs", { status: 200 });
                }
            )
        );

        const response = await invoke(new Request(
            "https://proxy.example/github.com/owner/old.git/info/refs?service=git-upload-pack",
            { headers: { authorization } }
        ), PRIVATE_ENABLED);

        expect(response.status).toBe(200);
        expect(redirectedCalls).toBe(1);
    });

    it("keeps push and arbitrary POST requests disabled", async () => {
        const receive = await invoke(new Request(
            "https://proxy.example/github.com/owner/repo.git/info/refs?service=git-receive-pack"
        ));
        const arbitrary = await invoke(new Request(
            "https://proxy.example/api.github.com/repos/owner/repo/issues",
            { method: "POST", body: "{}" }
        ));

        expect(receive.status).toBe(405);
        expect(arbitrary.status).toBe(405);
    });
});
