# Engineering

Bounty Review separates the bounty state machine from the services that gather code and prepare a patch. The public name was SomniBounty AI during the Somnia Agentathon; source-level identities retain that name.

## Components

| Component | Responsibility | Source |
| --- | --- | --- |
| Browser console | Wallet connection, registration, tier funding, job logs and paid history | `apps/web/src/components/security-console.tsx`, `apps/web/src/hooks/use-somnibounty.ts` |
| Bounty contract | Project/job/incident/fix state, request fees, callback dispatch and collector payout | `smart_contract/src/SomniBountyAI.sol` |
| Template registry | Owner-managed vulnerability templates supplied to discovery | `smart_contract/src/VulnerabilityRegistry.sol` |
| Snapshot endpoint | GitHub tree/blob reads and reduced evidence text | `apps/web/src/app/api/repo/snapshot/route.ts` |
| PR endpoint | Constrained model output, GitHub branch/commit/PR creation and existing-PR reuse | `apps/web/src/app/api/fix-pr/route.ts` |
| Provider clients | GitHub App authentication, chain reads, OpenAI requests and IPFS pinning | `apps/web/src/lib/agents/server.ts`, `apps/web/src/app/api/ipfs/` |

The app and route handlers run together as a Next.js standalone service. There is no application database in this repository. Contract state and events supply the job view; GitHub and IPFS hold external artifacts.

## Request chain

1. `setupBountyTiers` checks project ownership and minimum tiers, collects escrow plus an agent-fee reserve, and requests a snapshot.
2. The JSON API agent calls the snapshot endpoint. It fetches bounded Solidity files and returns a short `agentInput` string.
3. An LLM request classifies the evidence as a severity, `NONE` or `NEEDS_REVIEW`. A second LLM request accepts or rejects a candidate.
4. A valid candidate reserves a tier amount into an incident. The JSON API agent calls `/api/fix-pr?jobId=...`.
5. The backend asks OpenAI for file replacements, validates their shape/path bounds, writes a Git branch and opens a PR. It reuses an existing PR found under the job-derived branch.
6. The contract records the PR URL as fix proof. A final LLM verdict of `VALID` triggers payout to the hardcoded platform collector.

The source contains both a typed callback and a raw-selector fallback. Both restrict the sender to the configured platform, require a pending request and delete it before dispatch. Payout updates state before the external transfer and uses a reentrancy guard. These controls do not establish that the LLM's security judgment is correct.

## Trust and verification limits

- **Evidence is partial.** The snapshot endpoint selects Solidity files heuristically, then reduces the agent text to two files and a short character budget. It is not a full-repository audit.
- **Review is specialized.** The second-review prompt explicitly favors `tx.origin` authorization findings. A twelve-template registry does not prove twelve vulnerability classes work end to end.
- **A PR URL is not execution proof.** The final-review payload includes repository, incident text and proof URL. This code does not run the proposed fix's tests or verify that a maintainer merged it before paying.
- **The backend is trusted for evidence and patches.** Provider credentials can read/mutate configured GitHub installations. On-chain payout gating does not remove that trust boundary. Repository text remains prompt-injection input even when prompts say to ignore instructions.
- **GET can mutate external state.** `/api/fix-pr` may call OpenAI and create GitHub objects. Do not crawl it as a read-only health endpoint. Job-status checks and existing-PR lookup are not proof of caller authentication or race-safe durable idempotency.
- **Payouts use a fixed collector.** This is a platform-operated prototype, not arbitrary researcher-address payout routing.

No production security audit is claimed. The callback compatibility described by current source must not be assumed to match the historical deployment; see [evidence](evidence.md).

## Presentation boundary

This refresh changes documentation and visible product copy. Contract source, tests, ABIs, wallet hooks, backend behavior, provider prompts, package manifests and lockfiles remain unchanged. The original hosting URL and on-chain configuration are historical identities, not targets to rewrite during a rename.
