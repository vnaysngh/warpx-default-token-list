const ciVersion = process.env.VERSION;
const { version } = require("../package.json");
const megaethMainnet = require("./tokens/megaeth-mainnet.json");
const megaethTestnet = require("./tokens/megaeth-testnet.json");
const { getAddress } = require("ethers/lib/utils");

const normalizeAddress = (address) => {
  if (typeof address !== "string") {
    throw new Error("Token address must be a string");
  }
  const lower = address.toLowerCase();
  if (!lower.startsWith("0x")) {
    throw new Error(`Invalid address format: ${address}`);
  }
  if (lower.length === 42) {
    return getAddress(lower);
  }
  if (lower.length === 66) {
    return getAddress(`0x${lower.slice(-40)}`);
  }
  throw new Error(`Unsupported address length for ${address}`);
};

module.exports = function buildList() {
  const parsed = ciVersion
    ? ciVersion.match(/(\d+).(\d+).(\d+)/)?.[0]?.split(".")
    : version.split(".");
  return {
    name: "WarpX Default List",
    timestamp: new Date().toISOString(),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2]
    },
    tags: {},
    logoURI: "https://warpx.exchange/logo.png",
    keywords: ["warpx", "default"],
    tokens: [...megaethMainnet, ...megaethTestnet]
      .map((token) => ({
        ...token,
        address: normalizeAddress(token.address)
      }))
      // sort them by symbol for easy readability
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      })
  };
};
