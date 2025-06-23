import { expect, test, describe } from "bun:test";
import { IPFSService } from "../sdk/src/services/ipfs";

describe("createContentHash", () => {
  const cases: Record<string, string> = {
    "hello world": "00349039aa3bd06b0338e1be1d77518829f87fad274590292e429d3044d77ae6",
    OpenAI: "0013c7c3b8381fb6be3c606d36e405feb27b6c40b1cce031e98488d9805d7c95",
    "": "00d1b34cbc802b9502833221dc0af4557a24240067a7e78bd2fae2efb617a39b",
  };

  for (const [input, expected] of Object.entries(cases)) {
    test(`hash for '${input}' matches Rust`, () => {
      expect(IPFSService.createContentHash(input)).toBe(expected);
    });
  }
});
