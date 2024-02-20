import "@ethersproject/shims/dist/index.js"
import { ethers } from 'ethers';
import socialKeysABI from '../../abi/socialkey.json';
// Import Particle Authcore
import * as particleAuth from '@particle-network/rn-auth';
import { GasFeeLevel } from '@particle-network/rn-auth';
import { particleInfoConfig } from '../../env';
import {
    AccountName,
    Appearance,
    CommonError,
    Env,
    EvmService,
    FiatCoin,
    Language,
    LoginAuthorization,
    LoginType,
    ParticleInfo,
    SecurityAccount,
    SecurityAccountConfig,
    SupportAuthType,
    iOSModalPresentStyle,
    SmartAccountInfo
} from '@particle-network/rn-auth';

// Function to send transaction
async function sendTransaction(receiverAddress, amount) {
    const isLoggedIn = await particleAuth.isLogin();
    if (!isLoggedIn) {
        // Prompt user to log in
        const particleResult = await loginWithParticle(email, password);
        console.log("particleResult.status: ",particleResult.status); 
       // console.log("Particle Object: ",particleResult);
    } else {
        // User is already logged in, fetch their info
        const userInfo = await particleAuth.getUserInfo();
        console.log("user info: ",userInfo);
    }
    
    // Use EvmService to estimate gas and suggest gas fees s
    //const suggestedGasFees = await particleAuth.EvmService.suggeseGasFee();
   // console.log("Suggested Gas Fees:", suggestedGasFees);

    // Prepare transaction details
    const from = await particleAuth.getAddress(); // User's Ethereum address
    const to = receiverAddress;
    const value = ethers.utils.parseEther(amount).toString();
    const data = "0x"; // Data to send, if any
    // Estimate gas limit here (this is a placeholder, implement according to your contract or use ethers estimateGas method)
    const gasLimit = ethers.utils.hexlify(21000); // Example gas limit for a simple ETH transfer
    const chainId = await particleAuth.getChainId();

    const transaction = {
        from,
        to,
        value,
        data,
        gasLimit,
        maxPriorityFeePerGas: ethers.utils.hexlify(ethers.utils.parseUnits('2', 'gwei')),
        maxFeePerGas: ethers.utils.hexlify(ethers.utils.parseUnits('100', 'gwei')),
        chainId: ethers.utils.hexlify(chainId),
    };
    
    const serializedTransaction = JSON.stringify(transaction);

    try {
        
        // Use Particle Network's signAndSendTransaction method
        const result = await particleAuth.signAndSendTransaction(serializedTransaction);
        console.log("Transaction result:", result);
    } catch (error) {
        console.error("Transaction error:", error);
    }
      
    


    // Estimate gas for the transaction
    //const gasEstimate = await particleAuth.EvmService.estimateGas(from, to, value, data);
   // console.log("Estimated Gas:", gasEstimate);

    // Prepare and send the transaction using a suitable gas fee level using EVMService - not working as intended for me
   /* try {
      console.log("Gas Fee provided, GasFeeLevel.high");
        const txResult = await particleAuth.EvmService.createTransaction(
            from, data, value, to, GasFeeLevel.high
        );
        console.log("Transaction result:", txResult);
    } catch (error) {
        console.error("Transaction error:", error);
    }
}*/


    /*
    const web3Provider = new ethers.providers.Web3Provider(particleProvider, "any");
    const signer = web3Provider.getSigner();
    const tx = {
      to: receiverAddress,
      value: ethers.utils.parseEther(amount),
    };
  
    try {
      const transactionResponse = await signer.sendTransaction(tx);
      console.log("Transaction response:", transactionResponse);
    } catch (error) {
      console.error("Transaction error:", error);
    }
  }
  */
}
  export default sendTransaction;