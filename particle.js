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

// Particle configuration
const particleConfig = {
  particleId: particleInfoConfig.apiKey,
  clientKey: particleInfoConfig.clientKey,
};

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
    } else {
        const error = result.data;
        console.error(error);
    }
  };
  
  // Export the functions
  export { registerWithParticle };