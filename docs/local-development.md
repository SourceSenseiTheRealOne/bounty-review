# Local development

Use Node.js 22 or newer and npm for the web app. The checked-in Dockerfile uses Node 22. Solidity checks use Foundry with Solc 0.8.24 and the repository's existing optimizer/via-IR settings.

Known dependency vulnerabilities remain in the lockfile. Keep this prototype local and omit real provider credentials when inspecting the UI.

## Safe UI inspection

From the repository root:

```bash
cd apps/web
npm ci
npm run dev -- --hostname 127.0.0.1 --port 4350
```

Open `http://127.0.0.1:4350`. Without a connected wallet, the homepage shows its connection screen. No GitHub App, OpenAI or Pinata credential is needed for that screen. Do not connect a funded wallet merely to capture a screenshot.

For a production build:

```bash
cd apps/web
npm run lint
npx tsc --noEmit
npm run build
npm run start -- --hostname 127.0.0.1 --port 4350
```

Run each command group from the repository root. Build and start are local checks, not deployment steps.

## Tests

```bash
node --test scripts/test-presentation.mjs
cd smart_contract
forge test
forge build
```

The Foundry tests use a mock platform and synthetic local balances. They do not broadcast. The web package does not currently define a unit-test or browser-test command; do not infer web test coverage from the contract suite.

## Credentials and write boundaries

`apps/web/.env.example` lists the integration variables. If a separately authorized integration task needs them, copy that example to `apps/web/.env.local` from the repository root and fill it through your local secret manager. Never commit or paste the populated file.

- `NEXT_PUBLIC_SOMNIA_RPC_URL`, `NEXT_PUBLIC_SOMNIBOUNTY_ADDRESS` and `NEXT_PUBLIC_VULNERABILITY_REGISTRY_ADDRESS` are browser configuration, not secrets. Next.js captures public variables at build time.
- `SOMNIA_RPC_URL`, `SOMNIBOUNTY_ADDRESS` and `VULNERABILITY_REGISTRY_ADDRESS` configure server reads.
- GitHub App credentials authorize repository access and PR writes; `OPENAI_API_KEY` enables paid model calls; `PINATA_JWT` enables uploads. Keep them server-only.
- `/api/fix-pr` is a GET endpoint with external write effects. `/api/health` is the health route.
- `flow:live`, `diagnose:live` and deployment scripts need source inspection and separate operational authorization before use. Do not run them as generic validation commands.

Historical addresses are in [evidence](evidence.md). The observed source/runtime mismatch is unresolved; copying those addresses into a new deployment does not prove compatibility.

## Docker

For a credential-free connection-screen preview:

```bash
docker build -f apps/web/Dockerfile -t bounty-review:local .
docker run --rm -p 127.0.0.1:4350:3000 bounty-review:local
```

The existing Compose service and provider configuration retain their technical identities. This presentation refresh does not alter hosting, secrets or on-chain state. The former Northflank URL is historical evidence and is not advertised as a working demo.
