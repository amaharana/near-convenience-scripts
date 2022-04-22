
// Script to create some NEAR dev accounts on testnet and transfer the balance to given account.
const usageString = 'USAGE: node get-testnet-tokens.js <testnet_account_id_to_receive_tokens>';
const { exit } = require('process');
const { BN } = require('bn.js');
const nearAPI = require("near-api-js");

async function main() {
    validateArguments();
    
    const config = getTestnetConfig(new nearAPI.keyStores.InMemoryKeyStore());
    const keyPair = nearAPI.KeyPair.fromRandom('ed25519');
    const near = await nearAPI.connect(config);
    const beneficiaryAccountId = process.argv[2];

    const startingBalance = await getNearBalance(near, beneficiaryAccountId);
    console.log(`${beneficiaryAccountId} starting balance: ${startingBalance}`);

    // stay under rate limit
    for (var i = 0; i < 8; i++) {
        const throwawayAccountId = generateAccountId();

        console.log(`Creating account ${throwawayAccountId}`);
        await near.accountCreator.createAccount(throwawayAccountId, keyPair.publicKey);
        await config.keyStore.setKey(config.networkId, throwawayAccountId, keyPair);

        console.log(`Deleting account ${throwawayAccountId} and transferring balance to ${beneficiaryAccountId}`);        
        const throwawayAccount = await near.account(throwawayAccountId);
        await throwawayAccount.deleteAccount(beneficiaryAccountId);
    }

    const endingBalance = await getNearBalance(near, beneficiaryAccountId);
    console.log(`${beneficiaryAccountId} ending balance: ${endingBalance}`);
}

async function getNearBalance(near, accountId) {
    const account = await near.account(accountId);
    const balance = (await account.getAccountBalance()).total;
    return nearAPI.utils.format.formatNearAmount(balance);
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
        console.log(usageString);
        exit(1);
    }
}

main();
