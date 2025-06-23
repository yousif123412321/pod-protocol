import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: {
    index: "src/index.ts",
    client: "src/client.ts",
    types: "src/types.ts",
    utils: "src/utils.ts",
    "services/agent": "src/services/agent.ts",
    "services/message": "src/services/message.ts",
    "services/channel": "src/services/channel.ts",
    "services/escrow": "src/services/escrow.ts",
    "services/analytics": "src/services/analytics.ts",
    "services/discovery": "src/services/discovery.ts",
    "services/ipfs": "src/services/ipfs.ts",
    "services/zk-compression": "src/services/zk-compression.ts",
  },
  output: [
    {
      dir: "dist",
      format: "cjs",
      sourcemap: true,
      entryFileNames: "[name].js",
    },
    {
      dir: "dist",
      format: "esm",
      sourcemap: true,
      entryFileNames: "[name].esm.js",
    },
  ],
  plugins: [
    json(),
    nodeResolve({
      browser: false,
      preferBuiltins: true,
    }),
    commonjs({
      include: ["node_modules/**"],
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist",
      outputToFilesystem: true,
      exclude: ["**/*.test.ts", "node_modules/**"],
      noEmitOnError: false,
      compilerOptions: {
        composite: false,
        incremental: false,
        skipLibCheck: true,
        target: "ES2020",
        module: "ESNext",
      },
    }),
  ],
  external: [
    "@solana/web3.js",
    "@solana/spl-token",
    "@coral-xyz/anchor",
    "@solana/wallet-adapter-base",
    "helia",
    "@helia/unixfs",
    "@helia/json",
    "multiformats",
    "keccak",
  ],
};
