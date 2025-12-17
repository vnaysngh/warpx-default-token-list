require("dotenv").config();
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const { put } = require("@vercel/blob");

const env = process.env;
const TOKEN = env.VERCEL_BLOB_READ_WRITE_TOKEN;
const STORE_ID = env.VERCEL_BLOB_STORE_ID;
const DESTINATION_KEY = env.VERCEL_BLOB_OBJECT_KEY;
const MAINNET_KEY = env.VERCEL_BLOB_MAINNET_OBJECT_KEY;
const TESTNET_KEY = env.VERCEL_BLOB_TESTNET_OBJECT_KEY;
const MAINNET_CHAIN_ID = Number(env.MAINNET_CHAIN_ID);
const TESTNET_CHAIN_ID = Number(env.TESTNET_CHAIN_ID);

if (!TOKEN || !STORE_ID) {
  console.error(
    "Missing BLOB_READ_WRITE_TOKEN (or VERCEL_BLOB_READ_WRITE_TOKEN) and BLOB_STORE_ID (or VERCEL_BLOB_STORE_ID)."
  );
  process.exit(1);
}

const runStep = (label, command) => {
  console.log(`\n>>> ${label}`);
  execSync(command, { stdio: "inherit" });
};

const readArtifact = () => {
  const artifactPath = path.join(
    __dirname,
    "..",
    "build",
    "warpx-default.tokenlist.json"
  );
  if (!fs.existsSync(artifactPath)) {
    throw new Error("Token list artifact not found. Did the build succeed?");
  }
  return fs.readFileSync(artifactPath, "utf8");
};

const filterNetworkList = (
  baseList,
  chainId,
  label,
  { allowEmpty = false } = {}
) => {
  const tokens = baseList.tokens.filter((token) => token.chainId === chainId);
  if (!tokens.length) {
    if (allowEmpty) {
      console.warn(
        `No tokens found for ${label} (chainId ${chainId}). Skipping ${label} upload.`
      );
      return null;
    }
    throw new Error(
      `No tokens found for ${label} (chainId ${chainId}). Cannot publish a ${label} list without tokens.`
    );
  }
  return {
    ...baseList,
    tokens
  };
};

const serialize = (obj) => Buffer.from(JSON.stringify(obj, null, 2), "utf8");

const uploadPayload = async (key, payload, label) => {
  console.log(`Uploading ${label} token list to ${key} ...`);
  const { url } = await put(key, payload, {
    access: "public",
    addRandomSuffix: false,
    token: TOKEN,
    storeId: STORE_ID,
    contentType: "application/json"
  });
  console.log(`${label} list published to ${url}`);
};

const publish = async () => {
  runStep("Running tests", "yarn test");
  runStep("Building token list", "yarn build");

  const baseList = JSON.parse(readArtifact());
  const mainnetList = filterNetworkList(baseList, MAINNET_CHAIN_ID, "mainnet", {
    allowEmpty: true
  });
  const testnetList = filterNetworkList(baseList, TESTNET_CHAIN_ID, "testnet");

  await uploadPayload(
    DESTINATION_KEY,
    serialize(baseList),
    "combined (multi-chain)"
  );
  if (mainnetList) {
    await uploadPayload(MAINNET_KEY, serialize(mainnetList), "mainnet");
  }
  await uploadPayload(TESTNET_KEY, serialize(testnetList), "testnet");
};

publish().catch((error) => {
  console.error(error);
  process.exit(1);
});
