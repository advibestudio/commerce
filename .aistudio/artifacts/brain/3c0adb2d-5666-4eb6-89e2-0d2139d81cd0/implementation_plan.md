# Fix GitHub Actions `setup-node` Lockfile Error

## Cause of the Error
GitHub Actions failed at the **Set up Node.js** step with:
> `Error: Dependencies lock file is not found in /home/runner/work/commerce/commerce. Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock`

Because AI Studio repositories do not export `package-lock.json` to GitHub, specifying `cache: 'npm'` inside `actions/setup-node@v4` causes the runner to abort when it cannot find a lockfile to hash.

## Planned Fix
1. **Update `.github/workflows/deploy.yml`**:
   - Remove `cache: 'npm'` from the `actions/setup-node@v4` step so Node.js 22 sets up cleanly without requiring a `package-lock.json` file.
   - Keep `npm install --legacy-peer-deps` and `npx vite build --base=./` so dependencies install directly from `package.json` and the `/admin` + `/admin-app` `404.html` SPA fallback builds and deploys to GitHub Pages.
