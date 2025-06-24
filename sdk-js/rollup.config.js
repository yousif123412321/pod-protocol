import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";

export default {
  input: {
    index: "src/index.js",
    client: "src/client.js",
    types: "src/types.js",
    utils: "src/utils.js",
    "services/agent": "src/services/agent.js",
    "services/message": "src/services/message.js",
    "services/channel": "src/services/channel.js",
    "services/escrow": "src/services/escrow.js",
    "services/analytics": "src/services/analytics.js",
    "services/discovery": "src/services/discovery.js",
    "services/ipfs": "src/services/ipfs.js",
    "services/zk-compression": "src/services/zk-compression.js",
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
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      preventAssignment: true,
    }),
    json(),
    nodeResolve({
      browser: false,
      preferBuiltins: true,
      exportConditions: ['node'],
    }),
    commonjs({
      include: ["node_modules/**"],
      defaultIsModuleExports: 'auto',
      esmExternals: true,
      requireReturnsDefault: 'auto',
      ignoreDynamicRequires: true,
    }),
  ],
  external: [
    "@solana/web3.js",
    "@solana/spl-token",
    "@coral-xyz/anchor",
    "@coral-xyz/borsh",
    "@solana/wallet-adapter-base",
    "@lightprotocol/compressed-token",
    "@lightprotocol/stateless.js",
    "helia",
    "@helia/unixfs",
    "@helia/json",
    "multiformats",
    "keccak",
    "node-domexception",
    "node-fetch",
    "crypto-js",
    "axios",
  ],
};
