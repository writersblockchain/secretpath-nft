import React, { useState } from 'react';
import OpenAI from "openai";
import abi from "../abi/SecretNFT.json";
import { ethers } from 'ethers';
import axios from 'axios';
import {
  arrayify,
  hexlify,
  SigningKey,
  keccak256,
  recoverPublicKey,
  computeAddress,
} from "ethers/lib/utils";
import { ecdh, chacha20_poly1305_seal } from "@solar-republic/neutrino";
import {
  bytes,
  bytes_to_base64,
  json_to_bytes,
  sha256,
  concat,
  text_to_bytes,
  base64_to_bytes,
} from "@blake.regalia/belt";
import secretpath_abi from "../abi/abi.js";
import { ClipLoader } from 'react-spinners';

export default function CreateNFT() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [secretMessage, setSecretMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState('');
  const [image, setImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [uri, setUri] = useState("");
  const [loading, setLoading] = useState(false);

  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS; 
  const JWT = `Bearer ${process.env.REACT_APP_PINATA}`;

  const pinJSONToIPFS = async (name, description, compressedImage) => {
    const data = JSON.stringify({
      pinataContent: {
        name: name,
        description: description,
        external_url: "https://pinata.cloud",
        image: compressedImage,
      },
      pinataMetadata: {
        name: `${name}.json`
      }
    });

    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: JWT
        }
      });
      const ipfsHash = res.data.IpfsHash;
      setUri(ipfsHash.toString());
      console.log('Pinned JSON to IPFS:', res.data);
      return ipfsHash; // Return the URI
    } catch (error) {
      console.error('Error pinning JSON to IPFS:', error);
    }
  };

  const generateAndCompressImage = async (description) => {
    try {
      setLoading(true);
      const response = await openai.images.generate({
        model: "dall-e-2",
        prompt: description,
        n: 1,
        size: "256x256", // Requesting a smaller size
        response_format: "b64_json"
      });
      const imageData = response.data[0].b64_json;
      const imageUrl = `data:image/png;base64,${imageData}`;
      setImage(imageUrl);

      // Compress the image
      const img = new Image();
      img.src = imageUrl;
      return new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Adjust the quality parameter to control the level of compression
          const compressedImageUrl = canvas.toDataURL('image/jpeg', 0.5); // 50% quality
          setCompressedImage(compressedImageUrl);
          console.log('Compressed image:', compressedImageUrl);
          resolve(compressedImageUrl);
          setLoading(false);
        };
        img.onerror = (error) => {
          console.error('Error loading image:', error);
          setLoading(false);
          reject(error);
        };
      });
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false);
    }
  };

  const mint = async (uri) => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
        alert('Please install MetaMask first!');
        return;
    }

    try {
        // Request account access if needed
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // Connect to your deployed contract
        const contractABI = abi.abi;
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        let address = await signer.getAddress();

        // Log the address and URI
        console.log('Minting to address:', address);
        console.log('With URI:', uri);

        // Execute the mint function from the contract
        const tx = await contract.safeMint(address, uri);
        
        await tx.wait();
        setTransactionHash(tx.hash);
        console.log(`Transaction hash: ${tx.hash}`);

    } catch (error) {
        console.error('Error minting NFT:', error);
        alert('Failed to mint NFT!');
    }
  };

  const encrypt = async (e, token_id, uri, secretMessage ) => {
    e.preventDefault();

    const iface = new ethers.utils.Interface(secretpath_abi);
    const routing_contract = process.env.REACT_APP_SECRET_CONTRACT_ADDRESS;
    const routing_code_hash = process.env.REACT_APP_SECRET_CODE_HASH;

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    const [myAddress] = await provider.send("eth_requestAccounts", []);

    const wallet = ethers.Wallet.createRandom();
    const userPrivateKeyBytes = arrayify(wallet.privateKey);
    const userPublicKey = new SigningKey(wallet.privateKey).compressedPublicKey;
    const userPublicKeyBytes = arrayify(userPublicKey);
    const gatewayPublicKey = "A20KrD7xDmkFXpNMqJn1CLpRaDLcdKpO1NdBBS7VpWh3";
    const gatewayPublicKeyBytes = base64_to_bytes(gatewayPublicKey);

    const sharedKey = await sha256(
      ecdh(userPrivateKeyBytes, gatewayPublicKeyBytes)
    );

    const callbackSelector = iface.getSighash(
      iface.getFunction("upgradeHandler")
    );
    const callbackGasLimit = 300000;

    // Create the data object from form state
    const data = JSON.stringify({
        owner: myAddress,
         token_id: token_id,
            uri: uri,
         private_metadata: secretMessage, 
     
       });

    let publicClientAddress = "0x3879E146140b627a5C858a08e507B171D9E43139";

    const callbackAddress = publicClientAddress.toLowerCase();
    console.log("callback address: ", callbackAddress);
    console.log(data);
    console.log(callbackAddress);

    // Payload construction
    const payload = {
      data: data,
      routing_info: routing_contract,
      routing_code_hash: routing_code_hash,
      user_address: myAddress,
      user_key: bytes_to_base64(userPublicKeyBytes),
      callback_address: bytes_to_base64(arrayify(callbackAddress)),
      callback_selector: bytes_to_base64(arrayify(callbackSelector)),
      callback_gas_limit: callbackGasLimit,
    };

    const payloadJson = JSON.stringify(payload);
    const plaintext = json_to_bytes(payload);
    const nonce = crypto.getRandomValues(bytes(12));

    const [ciphertextClient, tagClient] = chacha20_poly1305_seal(
      sharedKey,
      nonce,
      plaintext
    );
    const ciphertext = concat([ciphertextClient, tagClient]);
    const ciphertextHash = keccak256(ciphertext);
    const payloadHash = keccak256(
      concat([
        text_to_bytes("\x19Ethereum Signed Message:\n32"),
        arrayify(ciphertextHash),
      ])
    );
    const msgParams = ciphertextHash;

    const params = [myAddress, msgParams];
    const method = "personal_sign";
    const payloadSignature = await provider.send(method, params);
    const user_pubkey = recoverPublicKey(payloadHash, payloadSignature);

    const _info = {
      user_key: hexlify(userPublicKeyBytes),
      user_pubkey: user_pubkey,
      routing_code_hash: routing_code_hash,
      task_destination_network: "pulsar-3",
      handle: "execute_store_confidential_metadata",
      nonce: hexlify(nonce),
      payload: hexlify(ciphertext),
      payload_signature: payloadSignature,
      callback_gas_limit: callbackGasLimit,
    };

    const functionData = iface.encodeFunctionData("send", [
      payloadHash,
      myAddress,
      routing_contract,
      _info,
    ]);

    const gasFee = await provider.getGasPrice();
    let amountOfGas = gasFee.mul(callbackGasLimit).mul(3).div(2);

    const tx_params = {
      gas: hexlify(150000),
      to: publicClientAddress,
      from: myAddress,
      value: hexlify(amountOfGas),
      data: functionData,
    };

    try {
      const txHash = await provider.send("eth_sendTransaction", [tx_params]);
      console.log(`Transaction Hash: ${txHash}`);

    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const compressedImage = await generateAndCompressImage(description);
      if (compressedImage) {
        const uri = await pinJSONToIPFS(name, description, compressedImage);
        if (uri) {
          const mintPromise = mint(uri);
          const encryptPromise = encrypt(e, "2", uri, secretMessage);
          await Promise.all([mintPromise, encryptPromise]);
        } else {
          console.error('URI is not defined');
        }
      } else {
        console.error('Compressed image is not defined');
      }
    } catch (error) {
      console.error('Error in the NFT creation process:', error);
    }
  };

  return (
    <div className="flex flex-col full-height justify-start items-center px-6 lg:px-8 pt-4">
      <div className="mt-20">
        <form onSubmit={handleSubmit} className="space-y-4" style={{ width: '360px' }}>
          <div className="text-white">Create NFT</div>
          <div className="border-4 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium leading-6 text-white w-full">
              </label>
              <input style={{ width: '320px' }}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="NFT Name"
                required
                className="mt-2 block pl-2 rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium leading-6 text-white">
                NFT Description
              </label>
              <textarea
                value={description}
                input style={{ width: '320px' }}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Your NFT description here"
                required
                className="mt-2 block pl-2 rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                rows="4"
              ></textarea>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium leading-6 text-white">
                NFT confidential message
              </label>
              <textarea
                input style={{ width: '320px' }}
                value={secretMessage}
                onChange={(e) => setSecretMessage(e.target.value)}
                placeholder="Your confidential message here"
                required
                className="mt-2 block pl-2  rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                rows="4"
              ></textarea>
            </div>
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create NFT
              </button>
            </div>
          </div>
        </form>
        {loading ? (
          <div className="flex justify-center mt-4">
            <ClipLoader size={50} color={"#123abc"} loading={loading} />
          </div>
        ) : (
          compressedImage && <img src={compressedImage} alt="Compressed" />
        )}
      </div>
    </div>
  );
}