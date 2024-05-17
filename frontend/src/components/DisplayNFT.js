import React, { useState, useEffect } from 'react';
import { SecretNetworkClient } from "secretjs";
import DisplayIPFSImage from '../components/DisplayIPFSImage';

export default function DisplayNFT() {
    const [nftData, setNftData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const secretjs = new SecretNetworkClient({
                url: "https://lcd.testnet.secretsaturn.net",
                chainId: "pulsar-3",
            });

            try {
                const nftDataArray = [];
                for (let i = 0; i <= 10; i++) {
                    try {
                        const query_tx = await secretjs.query.compute.queryContract({
                            contract_address: process.env.REACT_APP_SECRET_CONTRACT_ADDRESS,
                            code_hash: process.env.REACT_APP_SECRET_CODE_HASH,
                            query: { retrieve_metadata: { token_id: i } },
                        });
                        if (query_tx.uri) { // Check if the URI exists
                            nftDataArray.push(query_tx);
                        }
                    } catch (error) {
                        console.error(`Error fetching NFT data for token ${i}:`, error);
                        // Continue to the next token if there is an error for a specific token
                    }
                }
                setNftData(nftDataArray);
            } catch (error) {
                console.error('Error fetching NFT data:', error);
                setNftData([]);
            }
        };

        fetchData();
    }, []);

    if (nftData.length === 0) {
        return <div className="flex flex-col full-height justify-center items-center px-6 lg:px-8 pt-4">
            <div>Loading...</div>
        </div>;
    }

    return (
        <div className="flex flex-col full-height justify-start items-center px-6 lg:px-8 pt-4">
            <div className="mt-20">
                <h1 className="text-white text-2xl mb-6">NFT Details</h1>
                {nftData.map((nft, index) => (
                    <div key={index} className="border-4 rounded-lg p-4 mb-4 w-full max-w-md bg-white/10">
                        <p className="text-white"><strong>Token ID:</strong> {nft.token_id}</p>
                        <p className="text-white"><strong>Owner:</strong> {nft.owner}</p>
                        <DisplayIPFSImage ipfsHash={nft.uri} />
                        <p className="text-white"><strong>Private Metadata:</strong> {nft.private_metadata}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
