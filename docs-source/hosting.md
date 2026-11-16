# Hosting Storybook

Two ways to publish the Storybook catalogue (components, templates, examples and the
Showcase). Both are ready and **off**: each workflow is skipped, not failed, until you turn it
on with a repository variable. Turn on only one.

Wherever these steps say "repository variable" or "repository secret", go to the repository
on GitHub: **Settings → Secrets and variables → Actions**, then the **Variables** or
**Secrets** tab.

## Option A: GitHub Pages (needs a public repository)

On the free plan, GitHub Pages works only for public repositories. Before making it public,
read the history scan in the PR that added this file.

1. **Make the repository public:** Settings → General → Danger zone → Change visibility → Public.
2. **Turn on Pages:** Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. **Switch the workflow on:** add the repository variable `DEPLOY_STORYBOOK` = `true`.
4. **Deploy:** merge to `main`, or run the workflow by hand: Actions → "Storybook on GitHub Pages" → Run workflow.
5. **The site** is at `https://omhindlekar.github.io/agenticDesignSystem/`. The Showcase story in iframe mode:
   `https://omhindlekar.github.io/agenticDesignSystem/iframe.html?id=showcase-review-and-send--default&viewMode=story`

Workflow: `.github/workflows/storybook-pages.yml`.

## Option B: Cloudflare Pages (works with a private repository, free plan)

The repository stays private. The site gets a `*.pages.dev` address, which is **public** unless
you protect it with Cloudflare Access (step 6).

1. **Create a free Cloudflare account** at dash.cloudflare.com.
2. **Find your Account ID:** Workers & Pages → Overview. It is shown on the right; copy it.
3. **Create an API token:** My Profile (top right) → API Tokens → Create Token → Create Custom Token.
   - Name it `GitHub Storybook deploy`.
   - Permissions: **Account · Cloudflare Pages · Edit**.
   - Account resources: Include → your account.
   - Continue to summary → Create Token. Copy the token; it is shown only once.
4. **In GitHub, add:**
   - repository secret `CLOUDFLARE_API_TOKEN`: the token from step 3
   - repository secret `CLOUDFLARE_ACCOUNT_ID`: the ID from step 2
   - repository variable `CLOUDFLARE_PAGES_PROJECT` = `agentic-ds-storybook` (or another name; lowercase letters, numbers and hyphens)
   - repository variable `DEPLOY_STORYBOOK_CLOUDFLARE` = `true`
5. **Deploy:** merge to `main`, or Actions → "Storybook on Cloudflare Pages" → Run workflow. The first run creates the Pages project. The site is at `https://<project>.pages.dev/`, and the Showcase story in iframe mode at:
   `https://<project>.pages.dev/iframe.html?id=showcase-review-and-send--default&viewMode=story`
6. **Optional, to keep it private:** Cloudflare dashboard → Zero Trust → Access → Applications → Add an application → Self-hosted. Enter the `<project>.pages.dev` domain, then add a policy that allows only your email address (free for up to 50 users). Visitors then sign in with a one-time code sent to an allowed email.

Workflow: `.github/workflows/storybook-cloudflare.yml`.

### Netlify instead of Cloudflare

Netlify's free plan also works from a private repository. The same pattern applies, with
`NETLIFY_AUTH_TOKEN` (User settings → Applications → Personal access tokens) and
`NETLIFY_SITE_ID` (Site configuration → Site details) as repository secrets, and
`npx netlify-cli deploy --dir storybook-static --prod` as the deploy step. A workflow for it is
not included, so ask if you want one.

## Turning a deployment off

Set its variable to anything other than `true`, or delete the variable. Its workflow is then
skipped on the next merge.
