import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    json(),
    resolve({
      browser: false,
      preferBuiltins: true,
    }),
    commonjs({
      include: ['node_modules/**'],
      namedExports: {
        '@coral-xyz/anchor': ['BN', 'AnchorProvider', 'Program']
      }
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist",
    }),
  ],
  external: [
    "@solana/web3.js",
    "@coral-xyz/anchor",
    "@solana/wallet-adapter-base",
  ],
};
