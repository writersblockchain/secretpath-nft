import React, { useState, useEffect } from 'react';
import { SecretNetworkClient } from "secretjs";

export default function DisplayNFT() {
    const [nftData, setNftData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const secretjs = new SecretNetworkClient({
                url: "https://lcd.testnet.secretsaturn.net",
                chainId: "pulsar-3",
            });

            try {
                const query_tx = await secretjs.query.compute.queryContract({
                    contract_address: process.env.REACT_APP_SECRET_CONTRACT_ADDRESS,
                    code_hash: process.env.REACT_APP_SECRET_CODE_HASH,
                    query: { retrieve_metadata: { token_id: 1 } },
                });
                setNftData(query_tx);
            } catch (error) {
                console.error('Error fetching NFT data:', error);
                setNftData(null);
            }
        };

        fetchData();
    }, []);

    if (!nftData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>NFT Details</h1>
            <p><strong>Metadata URL:</strong> <a href={nftData.metadata} target="_blank" rel="noopener noreferrer">View Image</a></p>
            <p><strong>Owner:</strong> {nftData.owner}</p>
            <p><strong>Private Metadata:</strong> {nftData.private_metadata}</p>
            <p><strong>Token ID:</strong> {nftData.token_id}</p>
            <img src={nftData.metadata} alt="NFT" style={{ maxWidth: '100%' }} />
        </div>
    );
}
