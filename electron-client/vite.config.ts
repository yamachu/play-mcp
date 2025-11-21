import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";

type ElectronPlugin = typeof import("vite-plugin-electron/simple.js").default;
const electronPlugin = electron as unknown as ElectronPlugin;

export default defineConfig({
  plugins: [
    electronPlugin({
      main: {
        entry: "src/main.ts",
      },
    }),
  ],
});
