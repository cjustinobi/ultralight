import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import { polyfillNode } from 'esbuild-plugin-polyfill-node'
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
      'crypto-browserify': resolve(__dirname, 'node_modules/crypto-browserify'),
      'process': resolve(__dirname, 'process-polyfill.js'),
      'process/browser': resolve(__dirname, 'process-polyfill.js'),
      events: resolve(__dirname, './events-polyfill.js'),
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      util: 'util',
      assert: 'assert',
      buffer: 'buffer/',
      portalnetwork: resolve(__dirname, '../portalnetwork/dist'),
      '@lodestar/types': resolve(__dirname, '../portalnetwork/node_modules/@lodestar/types'),
      '@chainsafe/discv5': resolve(__dirname, '../portalnetwork/node_modules/@chainsafe/discv5'),
      '@chainsafe/enr': resolve(__dirname, '../portalnetwork/node_modules/@chainsafe/enr'),
      '@ethereumjs/util': resolve(__dirname, '../portalnetwork/node_modules/@ethereumjs/util'),
      '@libp2p/crypto': resolve(__dirname, '../portalnetwork/node_modules/@libp2p/crypto') ,
    },
    fallback: {
      "process": resolve(__dirname, 'process-polyfill.js')
    }
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
      plugins: [
        polyfillNode({
          globals: {
            buffer: true,
            global: true,
            process: true,
          }
        }),

      ],
      alias: {
        events: resolve(__dirname, './events-polyfill.js')
      }
    },
    include: [
      'process',
      'crypto-browserify',
      '@libp2p/crypto',
      '@libp2p/interface',
      '@chainsafe/enr',
      '@lodestar/types',
      '@chainsafe/discv5',
      '@ethereumjs/util',
      'portalnetwork',
      'buffer', 
      'crypto', 
      'stream', 
      'util', 
      'assert',
      'prom-client',
      'react',
      'react-dom',
      'react/jsx-dev-runtime',
      '@multiformats/multiaddr',
      '@tauri-apps/api/core',
    ],
    // exclude: ['portalnetwork', 'prom-client'],
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'vite-plugin-node-polyfills/shims/buffer',
        'vite-plugin-node-polyfills/shims/process',
        'crypto',
        'crypto-browserify',
        'fs', 
        'path', 
        'os',
        // 'portalnetwork',
        'child_process', 
        '@tauri-apps/api',
        '@lodestar/types',
        '@chainsafe/discv5',
        '@chainsafe/enr',
        '@ethereumjs/util',
        '@libp2p/crypto',
        'debug'
        // 'eventemitter3'
      ],
    },
    output: {
      manualChunks: {
        vendor: ['buffer', 'process'],
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [
        /portalnetwork/,
        /node_modules/,
      ]
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
