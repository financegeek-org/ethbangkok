const { ethers } = require("ethers");

// 1. Connect to an Ethereum provider

const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID"); // or use your own provider URL

// 2. Set up the backend wallet (the wallet sending the tokens)
const backendPrivateKey = "YOUR_BACKEND_WALLET_PRIVATE_KEY"; // Don't hardcode in production, use environment variables
const wallet = new ethers.Wallet(backendPrivateKey, provider);

// 3. ERC-20 Token Contract details
const tokenAddress = "ERC20_TOKEN_CONTRACT_ADDRESS"; // The address of the ERC-20 token you want to transfer
const tokenABI = [
  "function transfer(address recipient, uint256 amount) public returns (bool)"
];
const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);

// 4. The customer wallet address (recipient)
const customerWalletAddress = "CUSTOMER_WALLET_ADDRESS";

// 5. The amount to transfer (in the token's smallest unit, e.g., wei for ETH, or the token's decimal equivalent)
const amountToSend = ethers.utils.parseUnits("10.0", 18); // Example: Sending 10 tokens with 18 decimals

// 6. Transfer function
async function transferTokens() {
  try {
    // Send the transfer transaction
    const tx = await tokenContract.transfer(customerWalletAddress, amountToSend);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction successful:", receipt);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}

transferTokens();
