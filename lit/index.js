import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import { LitNetwork, LIT_RPC } from "@lit-protocol/constants";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { api } from "@lit-protocol/wrapped-keys";
import { getEncryptedKey } from "@lit-protocol/wrapped-keys/src/lib/api/index.js";
import * as ethers from "ethers";

import { getEnv, mintPkp, getChainInfo } from "./utils.js";
import { litActionCode } from "./litAction.js";

const { generatePrivateKey } = api;

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const TOGETHER_API_KEY = getEnv("TOGETHER_API_KEY");
const LIT_PKP_PUBLIC_KEY = process.env["LIT_PKP_PUBLIC_KEY"];
const LIT_NETWORK =
  process.env["LIT_NETWORK"] || LitNetwork.DatilDev;
const CHAIN_TO_SEND_TX_ON = getEnv("CHAIN_TO_SEND_TX_ON");

export const polygonOpenAI = async () => {
  let litNodeClient;
  let pkpInfo = {
    publicKey: LIT_PKP_PUBLIC_KEY,
  };

  try {
    const chainInfo = getChainInfo(CHAIN_TO_SEND_TX_ON) || "yellowstone";
    const ethersWallet = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting to the Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to the Lit network");

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersWallet,
      network: LIT_NETWORK,
      debug: false,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    if (LIT_PKP_PUBLIC_KEY === undefined || LIT_PKP_PUBLIC_KEY === "") {
      console.log("🔄 PKP wasn't provided, minting a new one...");
      pkpInfo = (await mintPkp(ethersWallet));
      console.log("✅ PKP successfully minted");
      console.log(`ℹ️  PKP token ID: ${pkpInfo.tokenId}`);
      console.log(`ℹ️  PKP public key: ${pkpInfo.publicKey}`);
      console.log(`ℹ️  PKP ETH address: ${pkpInfo.ethAddress}`);
    } else {
      console.log(`ℹ️  Using provided PKP: ${LIT_PKP_PUBLIC_KEY}`);
      pkpInfo = {
        publicKey: LIT_PKP_PUBLIC_KEY,
        ethAddress: ethers.utils.computeAddress(`0x${LIT_PKP_PUBLIC_KEY}`),
      };
    }

    console.log("🔄 Creating AuthMethod using the ethersSigner...");
    const authMethod = await EthWalletProvider.authenticate({
      signer: ethersWallet,
      litNodeClient,
    });
    console.log("✅ Finished creating the AuthMethod");

    console.log("🔄 Getting the Session Signatures...");
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: pkpInfo.publicKey,
      chain: "ethereum",
      authMethods: [authMethod],
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
      ],
    });
    console.log("✅ Generated the Session Signatures");

    console.log("🔄 Generating wrapped key...");
    const response = await generatePrivateKey({
      pkpSessionSigs,
      network: "evm", // Polygon Amoy testnet
      memo: "Polygon key for NFT minting",
      litNodeClient,
    });
    console.log(
      `✅ Generated wrapped key with id: ${response.id} and public key: ${response.generatedPublicKey}`
    );

    const {
      ciphertext: polygonCipherText,
      dataToEncryptHash: polygonDataToEncryptHash,
    } = await getEncryptedKey({
      pkpSessionSigs,
      litNodeClient,
      id: response.id,
    });
/*
    const accessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: pkpInfo.ethAddress,
        },
      },
    ];
*/
// lit action will allow anyone to decrypt this api key with a valid authSig
const chain = 'ethereum';
const accessControlConditions = [
  {
    contractAddress: '',
    standardContractType: '',
    chain,
    method: 'eth_getBalance',
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '0',
    },
  },
];

    const {
      ciphertext: togetherKeyCipherText,
      dataToEncryptHash: togetherKeyDataToEncryptHash,
    } = await encryptString(
      {
        accessControlConditions: accessControlConditions,
        dataToEncrypt: TOGETHER_API_KEY,
      },
      litNodeClient
    );

    const prompt = "Should I buy DogeCoin?";

    console.log("🔄 Executing the Lit Action...");
    const litActionResponse = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      code: litActionCode,
      jsParams: {
        accessControlConditions,
        polygonCipherText,
        polygonDataToEncryptHash,
        togetherKeyCipherText,
        togetherKeyDataToEncryptHash,
        prompt,
      },
    });
    console.log("✅ Executed the Lit Action");
    console.log(litActionResponse);

    return litActionResponse;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient.disconnect();
  }
};

polygonOpenAI();
