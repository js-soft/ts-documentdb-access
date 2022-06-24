# Development

## setup

Run `npm i` in the root folder. npm will link the coherent packages to the root node_modules folder.

## run tests

### all

run `npm run test:local --workspaces` in the root folder

`npm run ** --workspaces` will run the given npm script in all packages that contain it. In that case it will run the `test:local` script in the packages.

### for one package

`npm run test:local --workspace <mongo | loki | ...>`

## increment version

Before opening a PR you should run `npm version <major | minor | patch> --workspaces` to increment the version of all packages or `npm version <major | minor | patch> --workspace <a-package>` for one package.

## Publishing

After a PR is merged the pipeline will push all packages that are not pushed to the registry before.
