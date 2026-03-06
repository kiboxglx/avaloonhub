// vite.config.js
import { defineConfig } from "file:///C:/Users/PC%20GAMER/avaloonhub/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/PC%20GAMER/avaloonhub/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { visualizer } from "file:///C:/Users/PC%20GAMER/avaloonhub/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "C:\\Users\\PC GAMER\\avaloonhub";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    // Bundle Analyzer — generates bundle-report.html after `npm run build`
    visualizer({
      filename: "bundle-report.html",
      open: false,
      // set to true to auto-open browser on build
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor libraries into separate cacheable chunks.
        // The browser caches each chunk independently — updating app code
        // won't invalidate the vendor chunks.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
          "vendor-supabase": ["@supabase/supabase-js"]
        }
      }
    },
    // Warn when any individual chunk exceeds 150KB gzipped
    chunkSizeWarningLimit: 150
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQQyBHQU1FUlxcXFxhdmFsb29uaHViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQQyBHQU1FUlxcXFxhdmFsb29uaHViXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9QQyUyMEdBTUVSL2F2YWxvb25odWIvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICAvLyBCdW5kbGUgQW5hbHl6ZXIgXHUyMDE0IGdlbmVyYXRlcyBidW5kbGUtcmVwb3J0Lmh0bWwgYWZ0ZXIgYG5wbSBydW4gYnVpbGRgXHJcbiAgICB2aXN1YWxpemVyKHtcclxuICAgICAgZmlsZW5hbWU6ICdidW5kbGUtcmVwb3J0Lmh0bWwnLFxyXG4gICAgICBvcGVuOiBmYWxzZSwgICAgICAvLyBzZXQgdG8gdHJ1ZSB0byBhdXRvLW9wZW4gYnJvd3NlciBvbiBidWlsZFxyXG4gICAgICBnemlwU2l6ZTogdHJ1ZSxcclxuICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgLy8gU3BsaXQgaGVhdnkgdmVuZG9yIGxpYnJhcmllcyBpbnRvIHNlcGFyYXRlIGNhY2hlYWJsZSBjaHVua3MuXHJcbiAgICAgICAgLy8gVGhlIGJyb3dzZXIgY2FjaGVzIGVhY2ggY2h1bmsgaW5kZXBlbmRlbnRseSBcdTIwMTQgdXBkYXRpbmcgYXBwIGNvZGVcclxuICAgICAgICAvLyB3b24ndCBpbnZhbGlkYXRlIHRoZSB2ZW5kb3IgY2h1bmtzLlxyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICAgICd2ZW5kb3ItY2hhcnRzJzogWydyZWNoYXJ0cyddLFxyXG4gICAgICAgICAgJ3ZlbmRvci1tb3Rpb24nOiBbJ2ZyYW1lci1tb3Rpb24nXSxcclxuICAgICAgICAgICd2ZW5kb3Itc3VwYWJhc2UnOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy8gV2FybiB3aGVuIGFueSBpbmRpdmlkdWFsIGNodW5rIGV4Y2VlZHMgMTUwS0IgZ3ppcHBlZFxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxNTAsXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnUixTQUFTLG9CQUFvQjtBQUM3UyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsa0JBQWtCO0FBSDNCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBLElBRU4sV0FBVztBQUFBLE1BQ1QsVUFBVTtBQUFBLE1BQ1YsTUFBTTtBQUFBO0FBQUEsTUFDTixVQUFVO0FBQUEsTUFDVixZQUFZO0FBQUEsSUFDZCxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBSU4sY0FBYztBQUFBLFVBQ1osZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ3pELGlCQUFpQixDQUFDLFVBQVU7QUFBQSxVQUM1QixpQkFBaUIsQ0FBQyxlQUFlO0FBQUEsVUFDakMsbUJBQW1CLENBQUMsdUJBQXVCO0FBQUEsUUFDN0M7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSx1QkFBdUI7QUFBQSxFQUN6QjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
