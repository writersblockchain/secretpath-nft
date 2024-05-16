import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenAI from "openai";
import abi from "../abi/SecretNFT.json";
import { ethers } from 'ethers';

export default function HomePage() {
  const [transactionHash, setTransactionHash] = useState('');

  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

  const openai = new OpenAI({
    apiKey: "test",
  
});

const generateImage = async (prompt) => {
  try {
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
    });
    const imageUrl = response.data[0].url;
    console.log(imageUrl);
    return imageUrl; // Return the URL for use in the component
} catch (error) {
    console.error('Error generating image:', error);
    return null; // Return null or handle the error as needed
}

}

const mint = async () => {
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

      const uri = await generateImage("best buy");

      // Execute the mint function from the contract
      const tx = await contract.safeMint(
          "0x49e01eb08bBF0696Ed0df8cD894906f7Da635929",
          uri
      );
      
      await tx.wait();
      setTransactionHash(tx.hash);
      console.log(`Transaction hash: ${tx.hash}`);

  } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Failed to mint NFT!');
  }
};




  let navigate = useNavigate();

  function handleClick() {
    navigate('/image');
  }

 
  return (
    <div>
      <button onClick={mint}>Mint NFT</button>
{/* <CreateNFT /> */}
    </div>
  );
}
