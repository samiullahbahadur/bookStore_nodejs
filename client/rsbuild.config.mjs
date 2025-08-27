import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: "My BookStore App",
    favicon: "",
    meta: [
      {
        name: "description",
        content: "An Online bookStore build with rsbuild +react ",
      },
    ],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
