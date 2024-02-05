import React, {useState, useContext, useEffect} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import validator from 'validator';

import {cometChatConfig} from '../../env';

import Context from '../../context';

import { loginWithParticle } from '../../particle';
import {getFirebaseData, signIn} from '../../services/firebase';
import {showMessage} from '../../services/ui';

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New state variables for tracking authentication stages
  const [isParticleAuthInProgress, setIsParticleAuthInProgress] = useState(false);
  const [isAwaiting2FA, setIsAwaiting2FA] = useState(false);

  const {setUser} = useContext(Context);

  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  const onEmailChanged = (email) => {
    setEmail(() => email);
  };

  const onPasswordChanged = (password) => {
    setPassword(() => password);
  };  

  const login = async () => {
    if (isUserCredentialsValid(email, password)) {
        setIsLoading(true);
        try {
            const userCredential = await signIn(email, password);
            if (userCredential) {
                const userId = userCredential.user.uid;
                console.log("Firebase login successful, UserID:", userId);

                // Now perform Particle login
                const particleResult = await loginWithParticle(email, password);
                console.log("Particle Result: ",particleResult);
                console.log("particleResult.status: ",particleResult.status); 
                if (particleResult) {
                    await loginCometChat(userId);
                } else {
                    console.log("Particle login failed");
                    // Handle Particle login failure
                }
            } else {
                console.log("Firebase login failed");
                setIsLoading(false);
                showMessage('Error', 'Firebase authentication failed');
            }
        } catch (error) {
            console.error("Firebase login error:", error);
            setIsLoading(false);
            showMessage('Error', 'Error during Firebase login');
        }
    }
  };


  const isUserCredentialsValid = (email, password) => {
    return validator.isEmail(email) && password;
  };
  

  const loginCometChat = async (id) => {
    if (!id) return;
    console.log("proceeding to use the updated SDK approach");
    CometChat.getLoggedinUser().then(
        user => {
            if (!user) {
                CometChat.login(id, `${cometChatConfig.cometChatAuthKey}`).then(
                    user => {
                        console.log("Login Successful:", { user });
                        handleSuccessfulLogin(user, id);
                    },
                    error => {
                        console.log("Login failed with exception:", { error });
                        setIsLoading(false);
                        showMessage('Error', 'CometChat login failed');
                    }
                );
            } else {
                // User is already logged in to CometChat
                handleSuccessfulLogin(user, id);
            }
        },
        error => {
            console.log("Error getting logged in user: ", error);
            setIsLoading(false);
            showMessage('Error', 'Error in CometChat getLoggedinUser');
        }
    );
  };

  const handleSuccessfulLogin = async (cometChatUser, userId) => {
      const authenticatedUser = await getUser(userId);
      if (authenticatedUser) {
          setIsLoading(false);
          setUser(authenticatedUser);
          saveAuthedInfo(authenticatedUser);
          navigation.navigate('Home');
      } else {
          setIsLoading(false);
          showMessage('Info', 'Cannot load the authenticated information, please try again');
      }
  };

  const getUser = async (id) => {
    if (!id) {
      return null;
    }
    return await getFirebaseData('users/', id);
  };

  const saveAuthedInfo = (authenticatedUser) => {
    AsyncStorage.setItem('auth', JSON.stringify(authenticatedUser));
  };

  const register = (route) => () => {
    navigation.navigate(route);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoTitle}>Podium</Text>
      </View>
  
      {isLoading && <ActivityIndicator size="large" color="#3B82F6" />}
      {isAwaiting2FA && <Text style={styles.infoText}>Please complete 2FA verification.</Text>}
  
      <TextInput
        autoCapitalize="none"
        onChangeText={onEmailChanged}
        placeholder="Email"
        placeholderTextColor="#ccc"
        style={styles.loginInput}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={onPasswordChanged}
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        style={styles.loginInput}
      />
  
      <TouchableOpacity style={styles.loginBtn} onPress={login}>
        <Text style={styles.loginTxt}>Login</Text>
      </TouchableOpacity>
  
      <TouchableOpacity style={styles.registerBtn} onPress={register('SignUp')}>
        <Text style={styles.registerTxt}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  infoText: {
    textAlign: 'center',
    color: '#007bff',
    marginVertical: 10,
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  loginInput: {
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 12,
  },
  loginBtn: {
    backgroundColor: '#D9CCB9',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  loginTxt: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  registerBtn: {
    backgroundColor: '#fff',
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 4,
    padding: 8,
  },
  registerTxt: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default Login;
