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

const EditRoom = () => {
  const [roomTitle, setRoomTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {roomDetail} = useContext(Context);

  useEffect(() => {
    if (roomDetail) {
      console.log(roomDetail.roomTitle);
      setRoomTitle(roomDetail.roomTitle);
    }
  }, [roomDetail]);

  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  const onRoomTitleChanged = (roomTitle) => {
    setRoomTitle(() => roomTitle);
  };

  const editRoom = async () => {
    if (isRoomValid()) {
      setIsLoading(true);
      buildRoomPayload();
      await insertFirebaseDatabase({
        key: 'rooms/',
        id: roomDetail.id,
        payload: roomDetail,
      });
      await editCometChatGroup();
      setIsLoading(false);
      showMessage('Info', `${roomTitle} was updated successfully`);
    }
  };

  const isRoomValid = () => {
    if (validator.isEmpty(roomTitle)) {
      showMessage('Error', 'Please input the room title');
      return false;
    }
    return true;
  };

  const buildRoomPayload = () => {
    roomDetail.roomTitle = roomTitle;
  };

  const editCometChatGroup = async () => {
    const group = new CometChat.Group(
      roomDetail.id,
      roomTitle,
      CometChat.GROUP_TYPE.PUBLIC,
    );
    await CometChat.updateGroup(group);
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
        defaultValue={roomTitle}
        onChangeText={onRoomTitleChanged}
        placeholder="Room Title"
        placeholderTextColor="#ccc"
        style={styles.editRoomInput}
      />
      <TouchableOpacity style={styles.editRoomBtn} onPress={editRoom}>
        <Text style={styles.editRoomTxt}>Edit Room</Text>
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
  editRoomInput: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 12,
  },
  editRoomBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  editRoomTxt: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default EditRoom;
