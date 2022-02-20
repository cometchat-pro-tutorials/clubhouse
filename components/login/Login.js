import React, {useState, useContext, useEffect} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {CometChat} from '@cometchat-pro/react-native-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import validator from 'validator';

import {cometChatConfig} from '../../env';

import Context from '../../context';

import {getFirebaseData, signIn} from '../../services/firebase';
import {showMessage} from '../../services/ui';

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      const userCredential = await signIn(email, password);
      if (!userCredential) return;
      const userId = userCredential.user.uid;
      await loginCometChat(userId);
    } else {
      setIsLoading(false);
      showMessage('Error', 'Your username or password is not correct');
    }
  };

  const isUserCredentialsValid = (email, password) => {
    return validator.isEmail(email) && password;
  };

  const loginCometChat = async (id) => {
    if (!id) return;
    const user = await CometChat.login(
      id,
      `${cometChatConfig.cometChatAuthKey}`,
    );
    if (user) {
      const authenticatedUser = await getUser(id);
      if (authenticatedUser) {
        setIsLoading(false);
        setUser(authenticatedUser);
        saveAuthedInfo(authenticatedUser);
        navigation.navigate('Home');
      } else {
        setIsLoading(false);
        showMessage(
          'Info',
          'Cannot load the authenticated information, please try again',
        );
      }
    } else {
      setIsLoading(false);
      showMessage('Error', 'Your username or password is not correct');
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
        <Text style={styles.logoTitle}>Clubhouse</Text>
      </View>
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
