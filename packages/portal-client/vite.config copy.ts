import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import polyfillNode from 'rollup-plugin-polyfill-node'
import tsconfigPaths from 'vite-tsconfig-paths'
import { builtinModules } from 'module'

// @ts-expect-error process is a Node.js global
const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      }
      
    }),
    polyfillNode(), // Handles Node.js polyfills automatically
    tsconfigPaths(), // Auto-resolve paths from tsconfig.json
  ],
  resolve: {
    alias: {
      portalnetwork: '/ultralight/packages/portalnetwork/dist',
      fs: 'node-stdlib-browser/mock/empty',
      child_process: 'node-stdlib-browser/mock/empty',
      stream: 'stream-browserify',
      path: 'path-browserify',
      util: 'util/',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process.browser': true,
    '__dirname': JSON.stringify(process.cwd()),
    '__filename': JSON.stringify(import.meta.url),
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
      define: {
        global: 'globalThis',
      },
      inject: ['node_modules/node-stdlib-browser/helpers/esbuild/shim'],
    },
    include: [
      'buffer',
      'process',
    ]
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        ...builtinModules, 
        /^node:.*/,
        // 'fs', 
        // 'child_process',
      ], // Automatically exclude built-in Node.js modules
      // output: {
      //   manualChunks: {
      //     vendor: ["@chainsafe/discv5", "@chainsafe/enr"],
      //   },
      // },
    },
    output: {
      manualChunks: {
        vendor: ['buffer', 'process'],
      },
    },
  },
  esbuild: {
    target: 'es2022',
  },
  // Vite options tailored for Tauri development
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'], // Ignore Tauri's Rust code
    },
  },
}))
