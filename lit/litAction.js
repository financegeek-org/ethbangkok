// @ts-nocheck

const _litActionCode = async () => {
  const infApiKey = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext: togetherKeyCipherText,
    dataToEncryptHash: togetherKeyDataToEncryptHash,
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
        "content": "The user will give a short sentence on how they're feeling. Respond with ONLY a prompt for an image generator for a cute cat that will make the user feel better based on how they're feeling. Take into account that the user has the following mental health challenges. " + data,
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
    console.log(answer);

    return answer; // return the tx to be broadcast to all other nodes
  });


  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  Lit.Actions.setResponse({ response: answer });
};

export const litActionCode = `(${_litActionCode.toString()})();`;