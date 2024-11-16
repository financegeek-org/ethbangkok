import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import 'dotenv/config'

export async function POST(req: NextRequest) {
  const { action, customerWallet } = (await req.json());
  if (action == "claim") {
    // claim tokens
    // 10 + level per day
    // 1. Connect to an Ethereum provider
    const provider = new ethers.JsonRpcProvider("https://worldchain-sepolia.gateway.tenderly.co"); // or use your own provider URL

    // 2. Set up the backend wallet (the wallet sending the tokens)
    const backendPrivateKey = process.env.SYSTEM_WALLET; // Don't hardcode in production, use environment variables
    const wallet = new ethers.Wallet(backendPrivateKey, provider);

    // 3. ERC-20 Token Contract details
    const tokenAddress = "0xC143a7c1d9a75C99219D06b0AbF457E48093AF9b"; // The address of the ERC-20 token you want to transfer
    const tokenABI = [
      "function transfer(address recipient, uint256 amount) public returns (bool)"
    ];
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);

    // 4. The customer wallet address (recipient)
    const customerWalletAddress = customerWallet;

    // 5. The amount to transfer (in the token's smallest unit, e.g., wei for ETH, or the token's decimal equivalent)
    const amountToSend = ethers.parseUnits("1.0", 18); // Example: Sending 10 tokens with 18 decimals

    // 6. Transfer function
    let receipt;
    try {
      // Send the transfer transaction
      const tx = await tokenContract.transfer(customerWalletAddress, amountToSend);

      // Wait for the transaction to be mined
      receipt = await tx.wait();
      console.log("Transaction successful:", receipt);
    } catch (error) {
      console.error("Transaction failed:", error);
      return NextResponse.json({ error, status: 500 });
    }
    return NextResponse.json({ receipt, status: 200 });
  }
  if (action == "feed") {
    // free feed
  }
  if (action == "train") {
    // cost tokens to train
  }
}
