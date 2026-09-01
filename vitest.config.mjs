import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [
        cloudflareTest({
            wrangler: {
                configPath: "./wrangler.toml",
            },
        }),
    ],
    test: {
        setupFiles: ["./test/setup.js"],
    },
});
