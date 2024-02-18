import "@ethersproject/shims/dist/index.js"
import { ethers } from 'ethers';
import socialKeysABI from '../../abi/socialkey.json';
// Import ABI and contract addresses as needed

 // Assuming these are the known network parameters
  const rpcUrl = "https://mevm.devnet.m1.movementlabs.xyz/v1";
  //const rpcUrl= "https://api.avax.network/ext/bc/C/rpc";
  //const chainId = 336; // The chain ID for your custom network

   const contractAddress = '0xf7333e9fb03f25088879005fdCA9406993f33878'; //M1 Social Keys
 // const contractAddress = '0xfedA2BAE8F800E990fF3f0848eBd7Eb24b4f6408'; //Avax Social Keys (hottakes.io)

export const initializeEthers = async () => {

    // Initialize a StaticJsonRpcProvider with your RPC URL
    /*const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl, {
        name: "MoveVM",
        chainId: chainId
    });*/

  // Ethers.js initialization and interaction logic
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, socialKeysABI, provider);


  // Example interaction
  // Function to call keysBalance
    const getKeysBalance = async (address) => {
    try {
        console.log(`Contract found. Fetching keysBalance for address: ${address}`);
        const balance = await contract.keysBalance(address,address);
        console.log(`Keys Balance: ${balance}`);
    } catch (error) {
        console.error(`Error fetching keysBalance: ${error.message}`);
    }
    };

    getKeysBalance(contractAddress);

};
