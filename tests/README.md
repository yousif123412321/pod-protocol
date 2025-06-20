# 🧪 PoD Protocol Tests

These tests use the Anchor framework and run against a live Solana cluster. Before running the tests, ensure you have installed all dependencies by running `bun install` in the project root.
Before running them you need to configure a few environment variables so the
provider can connect to the network:

- `ANCHOR_PROVIDER_URL` – RPC URL of the cluster to test against (for example,
  `https://api.devnet.solana.com`).
- `ANCHOR_WALLET` – path to the keypair that will pay for test transactions.

Ensure the wallet has sufficient SOL and that the machine running the tests has
network connectivity to the specified cluster. The tests will fail if they
cannot reach the cluster defined by `ANCHOR_PROVIDER_URL`.

Run the tests from the repository root with:

```bash
bun test
```
