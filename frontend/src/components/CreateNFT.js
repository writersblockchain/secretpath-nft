import {React, useState} from 'react'
import OpenAI from "openai";


export default function CreateNFT() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [secretMessage, setSecretMessage] = useState("");

  // const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

  let generateImage = async () => {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: "a white siamese cat",
      n: 1,
      size: "1024x1024",
    });
   let image_url = response.data[0].url;
    console.log(image_url);

  }

  let handleSubmit = async (e) => {
    e.preventDefault();
    console.log(name, description, secretMessage);
   
  }
  return (
    <div className="flex flex-col full-height justify-start items-center px-6 lg:px-8 pt-4">
      <div className="text-white text-xl font-bold text-center">
        Cross-Chain NFT Demo
        <h6 className="text-xs hover:underline">
          <a
            href="https://docs.scrt.network/secret-network-documentation/confidential-computing-layer/ethereum-evm-developer-toolkit/usecases/nfts"
            rel="noopener noreferrer"
          >
            [click here for docs]
          </a>
        </h6>
      </div>
      <div className=" mb-20 mt-20 ">
      <form onSubmit={handleSubmit} className="space-y-4 ">
        <div className="text-white">Create NFT</div>
        <div className="border-4 rounded-lg p-4">
          <div>
            <label className="block text-sm font-medium leading-6 text-white">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="NFT Name"
              required
              className="mt-2 block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium leading-6 text-white">
              NFT Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Your NFT description here"
              required
              className="mt-2 block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              rows="4"
            ></textarea>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium leading-6 text-white">
              NFT confidential message
            </label>
            <textarea
              value={secretMessage}
              onChange={(e) => setSecretMessage(e.target.value)}
              placeholder="Your confidential message here"
              required
              className="mt-2 block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              rows="4"
            ></textarea>
          </div>
         
        </div>
        <button
          type="submit"
          className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create NFT
        </button>
      </form>
      
    </div>
    </div>

  )
}
