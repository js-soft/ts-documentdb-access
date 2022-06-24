set -e
set -x

npm exec --workspaces -- npx enhanced-publish --if-possible
