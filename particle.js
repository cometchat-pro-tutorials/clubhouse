import { particleInfoConfig } from './env';
import { Avalanche } from '@particle-network/chains';
import {
  AAFeeMode,
  AccountName,
  Env,
  EvmService,
  LoginType,
  ParticleInfo,
  SupportAuthType,
  SmartAccountInfo
} from '@particle-network/rn-auth';
import * as particleAuth from '@particle-network/rn-auth';

// Get your project id and client from dashboard,  
// https://dashboard.particle.network/
ParticleInfo.projectId = particleInfoConfig.apiKey; // your project id
ParticleInfo.clientKey = particleInfoConfig.clientKey; // your client key 


// Initialize Particle
const chainInfo = Avalanche;
const env = Env.Production;
particleAuth.init(chainInfo,env);

// Function to handle Particle Authcore registration
/*
* @param type Login type, support phone, email, json web token, google, apple and more.
* @param account When login type is email, phone or jwt, you could pass email address, phone number or jwt.
* @param supportAuthType Controls whether third-party login buttons are displayed. default will show all third-party login buttons.
* @param socialLoginPrompt Social login prompt, optional.
* @param authorization message:evm->hex sign message . solana is base58, uniq:unique sign,only support evm
* @returns Result, userinfo or error
*/
const registerWithParticle = async (email, password) => {
    // Implement the registration logic using Particle Authcore
    // Example (modify according to your needs):
    const type = LoginType.Email;
    const supportAuthType = [SupportAuthType.All];
    const result = await particleAuth.login(type, email, supportAuthType);
  
    if (result.status) {
        const userInfo = result.data;
        console.log(userInfo);
        return result; // Ensure that result is returned
    } else {
        const error = result.data;
        console.error(error);
        return result; // Ensure that result is returned even in case of error
    }
  };

  // Function to handle Particle Authcore login  --- similar code as register just separated for clarity
const loginWithParticle = async (email, password) => {
  const type = LoginType.Email; // Assuming email login type
  const supportAuthType = [SupportAuthType.All]; // Supports all auth types

  try {
      const result = await particleAuth.login(type, email, supportAuthType);

      if (result.status) {
          // Login successful, return the user info
          const userInfo = result.data;
          console.log("Particle login successful:", userInfo);
          return userInfo;
      } else {
          // Login failed, log the error and return null
          const error = result.data;
          console.error("Particle login error:", error);
          return null;
      }
  } catch (error) {
      // Exception occurred, log the error and return null
      console.error("Particle login exception:", error);
      return null;
  }
};


  
  // Export the functions
  export { registerWithParticle, loginWithParticle };