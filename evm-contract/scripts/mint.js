const { ethers } = require("hardhat");
require("dotenv").config();

const nftAddress = process.env.CONTRACT_ADDRESS;

async function mint() {
  const SecretNFT = await hre.ethers.getContractFactory("SecretNFT");
  const secretNFT = await SecretNFT.attach(nftAddress);

  const uri =
    "https://drive.google.com/file/d/11V41wMsSpttyqWNUmI0ZhMX3pjQZaLwF/view?usp=sharing";

  const tx = await secretNFT.safeMint(
    "0x49e01eb08bBF0696Ed0df8cD894906f7Da635929",
    uri
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log("mint function executed successfully!");
}
mint();
