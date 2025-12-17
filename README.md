# warpx-default-token-list

This repository hosts the default token list shipped with the WarpX interface.
It reuses the Uniswap-compatible token list schema so the JSON artifact can be
consumed anywhere the standard is supported. The list currently tracks tokens
for the MegaETH mainnet (chain ID `4326`) and MegaETH testnet (chain ID `6343`)
only.

## Adding a token

To request a new token for the WarpX interface,
[file an issue](https://github.com/vnaysngh/warpx-default-token-list/issues/new?assignees=&labels=token+request&template=token-request.md&title=Add+%7BTOKEN_SYMBOL%7D%3A+%7BTOKEN_NAME%7D)
with links that help us validate the token.

## Dev

Run `yarn` once to install dependencies, then use `yarn test` to validate the list
and `yarn build` to regenerate the JSON artifact. Commit the `build` folder each
time you change tokens so downstream consumers get the latest list.

### Disclaimer

Requesting a token addition does not guarantee inclusion. Reviews happen on a
best-effort basis and WarpX may reject requests that do not meet our requirements.
