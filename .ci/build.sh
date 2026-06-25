set -e
set -x

npm ci

npm run build --workspaces

# linting
npm run lint:eslint
npm run lint:prettier

# auditing
npm exec --workspaces -- npx license-check
npx better-npm-audit audit --exclude 1120793,1120792
