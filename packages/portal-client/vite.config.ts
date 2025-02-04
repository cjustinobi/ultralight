import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { resolve } from 'path'

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'util', 'stream'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  commonjsOptions: {
    esmExternals: true,
  },
  resolve: {
    alias: {
      'crypto-browserify': resolve(__dirname, 'node_modules/crypto-browserify'),
      process: 'process/browser',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      util: 'util',
      assert: 'assert',
      buffer: 'buffer/',
      portalnetwork: resolve(__dirname, '../../portalnetwork'), 
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    'fs.promises': '{}',
    'process.version': '"v16.0.0"',
    'process.platform': '"browser"',
    '__dirname': JSON.stringify(process.cwd()),
    '__filename': JSON.stringify(import.meta.url),
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
      define: {
        global: 'globalThis'
      }
    },
    include: [
      'process',
      'crypto-browserify',
      '@libp2p/crypto',
      '@chainsafe/enr',
      'portalnetwork',
      'buffer', 
      'crypto', 
      'stream', 
      'util', 
      'assert',
    ],
    // exclude: ['portalnetwork']
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      external: [
        'vite-plugin-node-polyfills/shims/buffer',
        'vite-plugin-node-polyfills/shims/process',
        'crypto',
        'crypto-browserify',
        'fs', 
        'path', 
        'os',
        'portalnetwork',
      ],
    },
    output: {
      manualChunks: {
        vendor: ['buffer', 'process'],
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  esbuild: {
    target: 'es2022',
  },
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
