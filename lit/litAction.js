// @ts-nocheck

const _litActionCode = async () => {
  const infApiKey = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext: togetherKeyCipherText,
    dataToEncryptHash: togetherKeyDataToEncryptHash,
    authSig: null,
    chain: 'ethereum',
  });
  const polygonKey = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext: polygonKeyCipherText,
    dataToEncryptHash: polygonKeyDataToEncryptHash,
    authSig: null,
    chain: 'ethereum',
  });


  // the code in the function given to runOnce below will only be run by one node
  let answer = await Lit.Actions.runOnce({ waitForResponse: true, name: "txnSender" }, async () => {
    // Get data
    const payloadData = {

    };
    const responseData = await fetch(
      "https://ethbangkok-be.vercel.app/api/data/",
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify(payloadData),
      }
    );
    const resultData = await responseData.json();
    const data = resultData.data;
    console.log(data);

    // Get inference
    const messages = [
      {
        "role": "system",
        "content": "The user will give a short sentence on how they're feeling. Respond with ONLY a prompt for an image generator that will make the user feel better based on how they're feeling using format \"cute superhero cat that X\" where X is doing something to cheer the user up. Take into account that the user has the following mental health challenges. " + data,
      },
      {
        "role": "user",
        "content": query,
      },
    ];
    const payloadInf = {
      "model": "meta-llama/Llama-Vision-Free",
      "messages": messages,
    };
    const responseInf = await fetch(
      "https://api.together.xyz/v1/chat/completions",
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + infApiKey,
        },
        method: "POST",
        body: JSON.stringify(payloadInf),
      }
    );
    const resultInf = await responseInf.json();
    const answer = resultInf.choices[0].message.content;

    const imageResponse = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Bearer ' + infApiKey
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell-Free',
        //model: 'black-forest-labs/FLUX.1-schnell',
        steps: 2,
        n: 1,
        height: 1024,
        width: 1024,
        prompt: answer, //'cats in geometric patterns on cavas',
        seed: 22, // randomize?
        // negative_prompt: 'string'
      })
    });
    const responseArr = await imageResponse.json();
    console.log(responseArr);
    const dataArr = responseArr.data;
    //console.log( dataArr[0].url);
    const imageUrl = dataArr[0].url;

    console.log(imageUrl);

    // Generate polygon NFT
    // https://rpc-amoy.polygon.technology/
    // https://polygon-amoy.drpc.org
    const provider = new ethers.providers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
    const wallet = new ethers.Wallet(polygonKey, provider);
    console.log('Wallet address:', wallet.address);
    const contractAddress = "0x892997c4376da36809ee9301bc8c6463fd67530a";
    // The contract ABI and address (replace with actual contract details)
    const contractAbi = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "imageUrl",
            "type": "string"
          }
        ],
        "name": "mint",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    const nftContract = new ethers.Contract(contractAddress, contractAbi, wallet);

    // Fetch current gas price from the provider
    const gasPrice = await provider.getGasPrice();
    console.log("Current Gas Price: ", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");
    // Estimate the gas limit for the mint function
    const gasLimit = await nftContract.estimateGas.mint(wallet.address, imageUrl);
    // Set the gas fee parameters (increase maxPriorityFeePerGas and maxFeePerGas)
    const tx = {
      to: contractAddress,
      data: nftContract.interface.encodeFunctionData("mint", [wallet.address, imageUrl]),
      gasLimit: gasLimit,
      maxPriorityFeePerGas: ethers.utils.parseUnits("25", "gwei"), // Set higher tip (25 gwei in this example)
      maxFeePerGas: ethers.utils.parseUnits("100", "gwei"), // Set max fee (100 gwei in this example)
    };
    // Send the transaction
    console.log("Transaction:", tx);
    const txResponse = await wallet.sendTransaction(tx);
    console.log("Transaction hash:", txResponse.hash);


    //const tx = await nftContract.mint("0x6871D69057bf6e1Da3C9be4164048c78B5beFd41", imageUrl);
    //console.log('Transaction hash:', tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    console.log('New Token ID:', receipt.logs[0].topics[3]);

    return imageUrl;
  });

  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  Lit.Actions.setResponse({ response: answer });
};

export const litActionCode = `(${_litActionCode.toString()})();`;