import electron from "vite-plugin-electron/simple";

export default {
  plugins: [
    electron({
      main: {
        entry: "src/main.ts",
      },
    }),
  ],
};
