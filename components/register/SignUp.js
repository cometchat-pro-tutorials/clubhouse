import React, {useState, useRef} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {CometChat} from '@cometchat-pro/react-native-chat';
import {launchImageLibrary} from 'react-native-image-picker';
import validator from 'validator';

import {cometChatConfig} from '../../env';

import {
  insertFirebaseDatabase,
  createUser,
  uploadFile,
} from '../../services/firebase';
import {showMessage} from '../../services/ui';

import ImageGallery from '../../images/image-gallery.svg';

const SignUp = () => {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);

  const createdAccount = useRef();

  const selectAvatar = () => {
    const options = {
      mediaType: 'photo',
    };
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) return null;
      if (response.assets && response.assets.length) {
        const uri = response.assets[0].uri;
        const fileName = response.assets[0].fileName;
        const type = response.assets[0].type;
        if (uri && fileName) {
          setUserAvatar(() => ({
            name: fileName,
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            type: type || 'video/quicktime',
          }));
        }
      }
    });
  };

  const onFullnameChanged = (fullname) => {
    setFullname(() => fullname);
  };

  const onEmailChanged = (email) => {
    setEmail(() => email);
  };

  const onPasswordChanged = (password) => {
    setPassword(() => password);
  };

  const onConfirmPasswordChanged = (confirmPassword) => {
    setConfirmPassword(() => confirmPassword);
  };

  const register = async () => {
    if (isSignupValid({confirmPassword, email, fullname, password})) {
      setIsLoading(true);
      const userCredential = await createUser(email, password);
      if (userCredential) {
        const id = userCredential._tokenResponse.localId;
        createdAccount.current = buildCreatedAccount({id, fullname, email});
        await insertFirebaseDatabase({
          key: 'users/',
          id,
          payload: createdAccount.current,
        });
        await uploadUserAvatar();
      } else {
        setIsLoading(false);
        showMessage(
          'Error',
          'Fail to create your account, your account might be existed',
        );
      }
    }
  };

  const isSignupValid = ({confirmPassword, email, password, fullname}) => {
    if (!userAvatar) {
      showMessage('Error', 'Please upload your avatar');
      return false;
    }
    if (validator.isEmpty(fullname)) {
      showMessage('Error', 'Please input your full name');
      return false;
    }
    if (validator.isEmpty(email) || !validator.isEmail(email)) {
      showMessage('Error', 'Please input your email');
      return false;
    }
    if (validator.isEmpty(password)) {
      showMessage('Error', 'Please input your password');
      return false;
    }
    if (validator.isEmpty(confirmPassword)) {
      showMessage('Error', 'Please input your confirm password');
      return false;
    }
    if (password !== confirmPassword) {
      showMessage(
        'Error',
        'Your confirm password must be matched with your password',
      );
      return false;
    }
    return true;
  };

  const buildCreatedAccount = ({id, fullname, email}) => ({
    id,
    fullname,
    email,
  });

  const uploadUserAvatar = async () => {
    const localFile = await fetch(userAvatar.uri);
    const blob = await localFile.blob();
    await uploadFile({
      fileRef: `users/${userAvatar.name}`,
      blob,
      contentType: userAvatar.type,
      onError: onUploadAvatarError,
      onSuccess: onUploadAvatarSuccess,
    });
  };

  const onUploadAvatarError = () => {
    setUserAvatar(null);
  };

  const onUploadAvatarSuccess = (downloadUrl) => {
    if (!downloadUrl) return;
    createdAccount.current.avatar = downloadUrl;
    insertFirebaseDatabase({
      key: 'users/',
      id: createdAccount.current.id,
      payload: createdAccount.current,
    });
    createCometChatAccount();
  };

  const createCometChatAccount = async () => {
    const authKey = `${cometChatConfig.cometChatAuthKey}`;
    const user = new CometChat.User(createdAccount.current.id);
    user.setName(createdAccount.current.fullname);
    user.setAvatar(createdAccount.current.avatar);
    const cometChatUser = await CometChat.createUser(user, authKey);
    if (cometChatUser) {
      showMessage(
        'Info',
        `${fullname} was created successfully! Please sign in with your created account`,
      );
      setIsLoading(false);
      setUserAvatar(null);
    } else {
      setIsLoading(false);
      setUserAvatar(null);
    }
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
      <TouchableOpacity
        style={styles.uploadAvatarContainer}
        onPress={selectAvatar}>
        {!userAvatar && (
          <>
            <ImageGallery width={100} height={100} />
            <Text style={styles.uploadAvatarTitle}>Upload your avatar</Text>
          </>
        )}
        {userAvatar && (
          <Image style={styles.userAvatar} source={{uri: userAvatar.uri}} />
        )}
      </TouchableOpacity>
      <TextInput
        autoCapitalize="none"
        onChangeText={onFullnameChanged}
        placeholder="Full name"
        placeholderTextColor="#ccc"
        style={styles.registerInput}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={onEmailChanged}
        placeholder="Email"
        placeholderTextColor="#ccc"
        style={styles.registerInput}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={onPasswordChanged}
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        style={styles.registerInput}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={onConfirmPasswordChanged}
        placeholder="Confirm Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        style={styles.registerInput}
      />
      <TouchableOpacity style={styles.registerBtn} onPress={register}>
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
  uploadAvatarContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  userAvatar: {
    borderRadius: 128 / 2,
    height: 128,
    width: 128,
  },
  uploadAvatarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 16,
  },
  registerInput: {
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 12,
  },
  registerBtn: {
    backgroundColor: '#D9CCB9',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  registerTxt: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default SignUp;
