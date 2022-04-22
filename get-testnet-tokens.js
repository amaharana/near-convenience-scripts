
// Script to create some NEAR dev accounts on testnet and transfer the balance to given account.

const { exit } = require('process');
const { BN } = require('bn.js');
const nearAPI = require("near-api-js");

async function main() {
    
    validateArguments();
    const beneficiaryAccount = process.argv[2];
    const config = getTestnetConfig(new nearAPI.keyStores.InMemoryKeyStore());
    const keyPair = nearAPI.KeyPair.fromRandom('ed25519');
    const near = await nearAPI.connect(config);

    for (var i = 0; i < 1; i++) {
        const throwawayAccountId = generateAccountId();

        console.log(`Creating account ${throwawayAccountId}`);
        await near.accountCreator.createAccount(throwawayAccountId, keyPair.publicKey);
        await config.keyStore.setKey(config.networkId, throwawayAccountId, keyPair);

        console.log(`Deleting account ${throwawayAccountId} and transferring balance to ${beneficiaryAccount}`);        
        const throwawayAccount = await near.account(throwawayAccountId);
        await throwawayAccount.deleteAccount(beneficiaryAccount);
    }
}

function generateAccountId() {
    const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000) + 10000000000000);
    return `dev-${Date.now()}-${randomNumber}`;
}

function getTestnetConfig(keyStore) {
    return {
        networkId: 'testnet',
        keyStore,
        nodeUrl: process.env.NEAR_CLI_TESTNET_RPC_SERVER_URL || 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        helperAccount: 'testnet',
        explorerUrl: 'https://explorer.testnet.near.org',
    };
}

function validateArguments() {
    // first arg is path to "node", second arg is script name
    if (process.argv.length != 3) {
        console.log("USAGE: node get-testnet-tokens.js <testnet_account_id_to_receive_tokens>");
        exit(1);
    }
}

main();
