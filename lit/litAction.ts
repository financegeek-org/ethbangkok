import { Buffer } from "buffer";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

(async () => {
  try {
    const apiKey = await Lit.Actions.decryptAndCombine({
      accessControlConditions: accessControlConditions,
      ciphertext: apiKeyCipherText,
      dataToEncryptHash: apiKeyDataToEncryptHash,
      authSig: null,
      chain: "ethereum",
    });

    const decryptedPrivateKey = await Lit.Actions.decryptAndCombine({
      accessControlConditions: accessControlConditions,
      ciphertext: polygonCipherText,
      dataToEncryptHash: polygonDataToEncryptHash,
      chain: "ethereum",
      authSig: null,
    });

    const LIT_PREFIX = "lit_";
    if (!decryptedPrivateKey.startsWith(LIT_PREFIX)) {
      throw new Error(
        `PKey was not encrypted with salt; all wrapped keys must be prefixed with '${LIT_PREFIX}'`
      );
    }

    const noSaltPrivateKey = decryptedPrivateKey.slice(LIT_PREFIX.length);

    const toSign = await LitActions.runOnce(
      { waitForResponse: true, name: "Lit Actions Test" },
      async () => {
        // Get data
        const payloadData = {
          "user": inputUser || "steve",
        };
        const responseData = await fetch(
          "https://ethbangkok-be.vercel.app/api/data/",
          {
            headers: {
              'Content-Type': 'application/json',
              //'Authorization': 'Bearer ' + dataApiKey,
            },
            method: "POST",
            body: JSON.stringify(payloadData),
          }
        );
        const resultData = await responseData.json();
        const data = resultData.data;


        // Get inference
        const messages = [
          {
            "role": "system",
            "content": "You are a therapy cat helping the user feel better and more positive. Take into account that the user has the following mental health challenges. " + data,
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
              'Authorization': 'Bearer ' + apiKey,
            },
            method: "POST",
            body: JSON.stringify(payloadInf),
          }
        );
        const resultInf = await responseInf.json();
        const answer = resultInf.choices[0].message.content;

        const toSign = answer.replace(/\n/g, " ").replace(/\*\*/g, "").trim();
        return toSign;
      }

    );
    console.log("Llama Response:", toSign);

    const polygonKeyPair = Keypair.fromSecretKey(
      Buffer.from(noSaltPrivateKey, "hex")
    );

    const signature = nacl.sign.detached(
      new TextEncoder().encode(toSign),
      polygonKeyPair.secretKey
    );

    console.log("Solana Signature:", signature);

    const isValid = nacl.sign.detached.verify(
      Buffer.from(toSign),
      signature,
      polygonKeyPair.publicKey.toBuffer()
    );

    if (!isValid) {
      console.log("Signature is not valid");
      LitActions.setResponse({ response: "false" });
    }

    LitActions.setResponse({
      response: `Signed message. Is signature valid: ${isValid}`,
    });
  } catch (e) {
    LitActions.setResponse({ response: e.message });
  }
})();
