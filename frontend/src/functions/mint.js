import React, { useState } from 'react';
import { ethers } from 'ethers';
import abi from "../abi/SecretNFT.json";
import { UseOpenAI} from './openAI';


export async function MintNFT () {
    const [transactionHash, setTransactionHash] = useState('');
    const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

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
            const contractABI = abi;
            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

            const uri = await UseOpenAI("best buy");

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

};


