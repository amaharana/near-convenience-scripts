
// Script to create some NEAR dev accounts on testnet and write the keypairs to local filesystem keystore

const { writeFile } = require('fs').promises;
const nearAPI = require("near-api-js");
const path = require("path");
const homedir = require("os").homedir();
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
const keyStore = new nearAPI.keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
const config = {
    networkId: 'testnet',
    keyStore,
    nodeUrl: process.env.NEAR_CLI_TESTNET_RPC_SERVER_URL || 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    helperAccount: 'testnet',
    explorerUrl: 'https://explorer.testnet.near.org',
};

async function main() {
    const keyPair = nearAPI.KeyPair.fromRandom('ed25519');
    const near = await nearAPI.connect(config);

    for (var i = 0; i < 5; i++) {
        const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000) + 10000000000000);
        const accountId = `dev-${Date.now()}-${randomNumber}`;
        const accountFilePath = path.join(credentialsPath, `${accountId}.json`);

        await near.accountCreator.createAccount(accountId, keyPair.publicKey);
        await keyStore.setKey(config.networkId, accountId, keyPair);
        await writeFile(accountFilePath, accountId);

        console.log(`Created ${accountId}`);
    }
}

main();
