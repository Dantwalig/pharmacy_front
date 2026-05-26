# Contributing

Thanks for contributing to `pharmacy_front`. This guide covers how we branch,
commit, write code, and open pull requests.

## Getting set up

See the [README](README.md#getting-started) for prerequisites and local setup.
In short:

```bash
npm install
cp .env.example .env.local   # then point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

## Branching

- Branch off `main`.
- Use a short, descriptive branch name. Prefix by the kind of change where it
  helps:
  - `feat/<short-name>` — new functionality
  - `fix/<short-name>` — bug fix
  - `refactor/<short-name>` — internal change, no behaviour change
  - `docs/<short-name>` — documentation
- Keep a branch focused on one logical change. Smaller PRs get reviewed faster.

## Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <summary>
```

- `feat:` a new feature
- `fix:` a bug fix
- `refactor:` a code change that neither fixes a bug nor adds a feature
- `docs:` documentation only
- `style:` formatting / non-functional
- `test:` tests
- `chore:` tooling, deps, config

Examples:

```
feat(patient): add prescription upload to checkout
refactor(ui): adopt StatusBadge across all portals
fix(auth): clear stale cookies when refresh token is missing
```

Write the summary in the imperative mood and explain the *why* in the body when
it isn't obvious.

## Code conventions

- **TypeScript everywhere.** Prefer real types over `any`.
- **Design tokens, not raw hex.** Use the brand token utilities
  (`bg-brand-navy`, `text-brand-teal`, …). See
  [`src/DESIGN_TOKENS.md`](src/DESIGN_TOKENS.md).
- **Status pills** use the shared `StatusBadge`
  (`src/components/shared/StatusBadge.tsx`) — don't hand-roll status colours.
- **Icons** come from Heroicons, sized with Tailwind (`w-5 h-5`).
- **All user-facing strings must be translated.** Never hardcode display text —
  use `t('...')`. See the [internationalization guide](docs/i18n.md).
- **API calls** go through the shared axios instance in `src/lib/api.ts`.

## Internationalization workflow

The app ships in English (`en`), French (`fr`), and Kinyarwanda (`rw`). When you
add or change a user-facing string:

1. Add the key and English value to `src/lib/i18n/en.ts` (the source of truth).
2. Add the same key to `fr.ts` and `rw.ts`.
3. For translations you are not fluent in, add the key with a best-effort value
   and **flag it for native-speaker review** rather than leaving it missing —
   see [`docs/i18n.md`](docs/i18n.md) for the exact convention.

Keys must exist in all three files so nothing falls back silently.

## Before you open a PR

- [ ] `npm run build` passes clean (this also type-checks).
- [ ] `npm run lint` passes.
- [ ] New strings are present in `en`, `fr`, and `rw`.
- [ ] You manually exercised the affected screens in the browser.
- [ ] No secrets, `.env.local`, or local-only notes are committed.

## Opening the pull request

- Target `main`.
- Fill in the [pull request template](.github/pull_request_template.md):
  what changed, why, and how to test it.
- Link any related issue.
- Keep the description specific — list the screens/flows a reviewer should
  check.

## Reporting bugs & requesting features

Open a GitHub issue describing the problem or proposal. For anything
security-related, **do not open a public issue** — follow
[`SECURITY.md`](SECURITY.md) instead.
