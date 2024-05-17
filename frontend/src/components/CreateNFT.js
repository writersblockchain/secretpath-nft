import {React, useState} from 'react'
import OpenAI from "openai";
import abi from "../abi/SecretNFT.json";
import { ethers } from 'ethers';


export default function CreateNFT() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [secretMessage, setSecretMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState('');
  const [image, setImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);

  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
  
 

const generateAndCompressImage = async (prompt) => {
  try {
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
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
    };
  } catch (error) {
    console.error('Error generating image:', error);
  }
};


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

      const uri = ""

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



  let handleSubmit = async (e) => {
    e.preventDefault();
    generateAndCompressImage("a cinnamon role eating itself")
    console.log(name, description, secretMessage);
   
  }
  return (
    <div className="flex flex-col full-height justify-start items-center px-6 lg:px-8 pt-4">
   
      <div className=" mt-20  ">
      <form onSubmit={handleSubmit} className="space-y-4  " style={{ width: '360px' }}>
        <div className="text-white">Create NFT</div>
        <div className="border-4 rounded-lg p-4 " >
          <div >
            <label  className="block text-sm font-medium leading-6 text-white w-full" >
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
      {compressedImage && <img src={compressedImage} alt="Compressed" />}
    </div>
    </div>

  )
}
