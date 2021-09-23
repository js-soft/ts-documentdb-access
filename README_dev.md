# Development

## setup

1. run `npm i` in the root folder
2. run `npx lerna bootstrap` in the root folder. The [bootstrap command](https://github.com/lerna/lerna/tree/main/commands/bootstrap) will run `npm i`, `npm run prepublish` and `npm run prepare` in all packages, and link the coherent packages using `npm link`.

## run tests

### all

run `lerna run test:local --stream` in the root folder

`lerna run **` will run the given npm script in all packages that contain it. In that case it will run the `test:local` script in the packages.

### for one package

1. cd into the package directory
2. run `npm run test:local`

## increment version

Before opening a PR you should run `lerna version <major | minor | patch>` to increment the version of all changed packages.

## Publishing

After a PR is merged the pipeline will push all packages that are not pushed to the registry before.
