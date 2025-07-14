import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // Conditional import for cartographer plugin if in production on Replit
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      // Alias for '@' to point to client/src
      "@": path.resolve(import.meta.dirname, "client", "src"),
      // Alias for '@shared' to point to shared
      "@shared": path.resolve(import.meta.dirname, "shared"),
      // Alias for '@assets' pointing to public assets
      "@assets": path.resolve(import.meta.dirname, "client", "public", "attached_assets"),
    },
  },
  // Set root to client directory for proper Vite setup
  root: path.resolve(import.meta.dirname, "client"), 

  // Define the directory that contains static assets that should be served as-is
  publicDir: path.resolve(import.meta.dirname, "client", "public"), 

  build: {
    // Output directory for production build, relative to the project root (/app)
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true, // Clear the output directory before building
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3004', // Proxy API requests to your backend
        changeOrigin: true,
        secure: false, // Set to true if your backend uses HTTPS
      },
    },
  },
  // Other potential configurations you might have for CSS, etc.
  // css: {
  //   postcss: {
  //     plugins: [
  //       require('tailwindcss'),
  //       require('autoprefixer'),
  //     ],
  //   },
  // },
});
