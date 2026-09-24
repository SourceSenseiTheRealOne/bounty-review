# Verification and limits

Inspected on 2026-09-24. Application/contract source baseline: [`3d275bf80483a24f3594921f18497837b6ef937d`](https://github.com/SourceSenseiTheRealOne/bounty-review/tree/3d275bf80483a24f3594921f18497837b6ef937d). This is an engineering inspection, not an audit certificate or proof of production readiness.

## Local execution

| Check | Observed result |
| --- | --- |
| Foundry tests | 21 passed; zero failed or skipped, using Foundry 1.5.1 and Solc 0.8.24 in an isolated container |
| Web production build | Passed using the checked-in Node 22 Dockerfile and lockfile |
| ESLint and TypeScript | `npm run lint` and `npx tsc --noEmit` passed |
| Production browser | HTTP 200; desktop and 390px mobile wallet-disconnected view rendered with no page errors or horizontal overflow |
| Hosted service | Root, health and config requests repeatedly timed out; native browser navigation also timed out |

Contract tests use `MockAgentPlatform`. They exercise state transitions, callback authorization, verdict handling and payout behavior locally. They do not execute live Somnia inference, OpenAI, GitHub App writes or Pinata.

No wallet was connected. No signatures, transactions, PR-generation requests or paid provider calls were triggered. This pass neither restores hosting nor deploys a replacement contract.

## Testnet readback

Network: Somnia testnet, chain ID `50312`. RPC: `https://api.infra.testnet.somnia.network/`. Inspection block: **497055778**.

| Identity | Address |
| --- | --- |
| Documented bounty contract | `0xf920336C3e1A681dBbFBF690D334C60313ab9889` |
| Template registry | `0x7486949c6f8c6878EF03fc0E911f0Ed679Cc0CaD` |
| Agent platform | `0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776` |
| Fixed payout collector | `0xeE59b12EB683A346b3D8A4CB43d5aFa8AD3303F3` |

The documented deployment receipts returned success at the expected addresses:

- [Registry deployment](https://shannon-explorer.somnia.network/tx/0x01abad703bd92c92f123a2a97f64ace6a726fd269e6d159cf7fbc45bff15191a), block `404600169`.
- [Bounty deployment](https://shannon-explorer.somnia.network/tx/0xe298b464881a6497c92051a3332d930467eeca73f9f5e09fc82fb319ecca610d), block `404602095`.

Read-only getters returned **2 projects, 2 scan jobs, 0 incidents and 0 fixes**. The registry returned 12 templates. No completed finding-to-payout run is established for this documented bounty address. Other deployments, if any, were not assessed.

`agentPlatform`, `vulnerabilityRegistry` and `PLATFORM_PAYOUT_WALLET` agreed with the identities above. `automationApiBase` still returned the original `https://p01--somnibountyai--yrnf5wlhj7v8.code.run` endpoint. `requiredAutomationFee()` returned `960000000000000000` wei at the inspection block; it is a fee quote, not evidence that the chain completed.

## Source-to-deployment parity is not established

Compiling the current source with the checked-in Foundry configuration did not reproduce deployed runtime bytecode, even when ignoring compiler-declared immutable slots:

| Contract | Deployed runtime bytes | Compiled runtime bytes |
| --- | ---: | ---: |
| Bounty contract | 24118 | 23705 |
| Template registry | 5623 | 5624 |

The current ABI's `RAW_AGENT_CALLBACK_SELECTOR()` getter reverted on the documented bounty contract. A different source revision or build configuration may explain the mismatch; the inspection did not establish which one. Do not call the current source an exact verified copy of that deployment or change live callback configuration based only on the README.

## Dependency risks retained by scope

`npm audit --json` against the published web lockfile reported **10 affected packages: 1 critical, 8 high, 1 moderate** on the inspection date. These are package-level findings, not a count of distinct vulnerabilities.

| Severity | Packages |
| --- | --- |
| Critical | `next` |
| High | `brace-expansion`, `browserslist`, `js-yaml`, `nanoid`, `postcss`, `sharp`, `viem`, `ws` |
| Moderate | `baseline-browser-mapping` |

The owner chose a presentation-only release, so neither package manifests nor lockfiles were updated. Build success does not clear these advisories. Keep local previews on loopback without real credentials; resolve dependency and runtime-provenance issues before exposing a credential-bearing service.

## Follow-up work, not part of this release

Reconcile deployed artifacts and source, restore or replace hosting deliberately, patch dependencies, prove a bounded live lifecycle, and evaluate authenticated provider access, prompt-injection resistance, concurrent PR creation and test-backed fix verification. These remain separate engineering tasks.
