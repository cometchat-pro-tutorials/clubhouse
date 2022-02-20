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
import validator from 'validator';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import Context from '../../context';

import {insertFirebaseDatabase} from '../../services/firebase';
import {showMessage} from '../../services/ui';

const CreateRoom = () => {
  const [roomTitle, setRoomTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {user} = useContext(Context);

  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  const onRoomTitleChanged = (roomTitle) => {
    setRoomTitle(() => roomTitle);
  };

  const createRoom = async () => {
    if (validator.isEmpty(roomTitle)) {
      showMessage('Error', 'Please input the room title');
    }
    setIsLoading(true);
    const room = buildRoom();
    await insertFirebaseDatabase({
      key: 'rooms/',
      id: room.id,
      payload: room,
    });
    await createCometChatGroup(room);
    setIsLoading(false);
    showMessage('Info', `${roomTitle} was created successfully`);
    setRoomTitle(() => '');
  };

  const buildRoom = () => ({
    id: uuidv4(),
    roomTitle,
    createdBy: user,
  });

  const createCometChatGroup = async (room) => {
    const groupType = CometChat.GROUP_TYPE.PUBLIC;
    const password = '';
    const group = new CometChat.Group(
      room.id,
      room.roomTitle,
      groupType,
      password,
    );
    await CometChat.createGroup(group);
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
      <TextInput
        autoCapitalize="none"
        onChangeText={onRoomTitleChanged}
        placeholder="Room Title"
        placeholderTextColor="#ccc"
        style={styles.createRoomInput}
      />
      <TouchableOpacity style={styles.createRoomBtn} onPress={createRoom}>
        <Text style={styles.createRoomTxt}>Create Room</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1EFE3',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  createRoomInput: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 12,
  },
  createRoomBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  createRoomTxt: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default CreateRoom;
