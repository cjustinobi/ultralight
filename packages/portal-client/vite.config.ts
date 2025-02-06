import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import commonjs from '@rollup/plugin-commonjs'
import { resolve } from 'path'

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'util', 'stream', 'process', 'events'],
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
      zlib: 'browserify-zlib',
      'crypto-browserify': resolve(__dirname, 'node_modules/crypto-browserify'),
      'process': resolve(__dirname, 'process-polyfill.js'),
      'process/browser': resolve(__dirname, 'process-polyfill.js'),
      events: 'events',
      stream: 'stream-browserify',
      'readable-stream': 'readable-stream',
      crypto: 'crypto-browserify',
      util: 'util',
      assert: 'assert',
      buffer: 'buffer/',
      portalnetwork: resolve(__dirname, 'ultralight/packages/portalnetwork'),
      '@chainsafe/discv5': resolve('@chainsafe/discv5'),
      '@chainsafe/discv5/packet': resolve('@chainsafe/discv5/packet'),
      '@ethereumjs/util': resolve(__dirname, '@ethereumjs/util'),
      '@chainsafe/enr': resolve(__dirname, '@chainsafe/enr'),
      '@libp2p/crypto': resolve(__dirname, '@libp2p/crypto'),
      '@lodestar/types': resolve(__dirname, '@lodestar/types'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process.browser': 'true',
    'fs.promises': '{}',
    '__dirname': JSON.stringify(process.cwd()),
    '__filename': JSON.stringify(import.meta.url),
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
      define: {
        global: 'globalThis',
      },
      alias: {
        events: resolve(__dirname, './events-polyfill.js'),
      }
    },
    include: [
      'events',
      '@ethereumjs/util',
      '@ethereumjs/common',
      'readable-stream',
    ],
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      plugins:[commonjs()],
      external: [
        'level',
        'crypto',
        'events',
        'heap-js',
        'fs', 
        'path', 
        'os',
        'prom-client',
        'memory-level',
        'portalnetwork',
        'child_process', 
        '@tauri-apps/api',
        '@lodestar/types',
        '@lodestar/light-client',
        '@chainsafe/discv5',
        '@chainsafe/as-sha256',
        '@chainsafe/discv5/packet',
        '@chainsafe/enr',
        '@chainsafe/ssz',
        '@ethereumjs/util',
        '@ethereumjs/block',
        '@ethereumjs/evm',
        '@libp2p/crypto',
        'debug',
        '@capacitor/core',
        'react', 
        'react-dom',
        'react/jsx-runtime',
        'eventemitter3',
        'ethereum-cryptography/keccak.js',
        'isomorphic-ws',
      ],
    },
    output: {
      manualChunks: {
        vendor: ['buffer', 'process'],
      }
    },
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
}))
