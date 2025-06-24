declare module 'node-sodium' {
  export function sodium_malloc(size: number): Buffer;
  export function sodium_free(buffer: Buffer): void;
  export function sodium_mlock(buffer: Buffer): void;
  export function sodium_munlock(buffer: Buffer): void;
  export function sodium_memzero(buffer: Buffer): void;
  export function sodium_memcmp(a: Buffer, b: Buffer): number;
  export function crypto_hash_sha256(input: Buffer): Buffer;
  export function randombytes_buf(size: number): Buffer;
} 