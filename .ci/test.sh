set -e
set -x

export CONNECTION_STRING="mongodb://127.0.0.1:27017"
npm run test:ci --workspaces

export CONNECTION_STRING="mongodb://127.0.0.1:27018"
npm run test:ci --workspaces
