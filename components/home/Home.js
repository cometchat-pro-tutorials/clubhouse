import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {CometChat} from '@cometchat-pro/react-native-chat';

import {getRef, getDataRealtime, off} from '../../services/firebase';
import {addNotification} from '../../services/notification';

import Add from '../../images/add.svg';

import Context from '../../context';

const Home = ({navigation}) => {
  const [rooms, setRooms] = useState();

  const roomsRef = getRef('rooms');

  const {user} = useContext(Context);

  useEffect(() => {
    getRooms();
    return () => {
      off(roomsRef);
    };
  }, []);

  const getRooms = () => {
    getDataRealtime(roomsRef, onRoomsLoaded);
  };

  const onRoomsLoaded = (val) => {
    if (val) {
      const keys = Object.keys(val);
      const data = keys.map((key) => val[key]);
      setRooms(() => data);
    }
  };

  const renderRoom = (item) => {
    const room = item.item;
    return (
      <TouchableOpacity style={styles.room} onPress={roomDetail(room)}>
        <View style={styles.left}>
          <Text style={styles.roomTitle}>{room.roomTitle}</Text>
        </View>
        <View style={styles.authorContainer}>
          <Text style={styles.createdByTxt}>Created by</Text>
          <Image
            style={styles.authorAvatar}
            source={{uri: room.createdBy.avatar}}
          />
          <Text style={styles.authorFullname}>{room.createdBy.fullname}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const roomDetail = (room) => async () => {
    await joinCometChatGroup(room);
    navigation.navigate('Room Detail', {room});
  };

  const joinCometChatGroup = async (room) => {
    const password = '';
    const groupType = CometChat.GROUP_TYPE.PUBLIC;
    try {
      await CometChat.joinGroup(room.id, groupType, password);
      if (user.id !== room.createdBy.id) {
        await addNotification({
          userId: room.createdBy.id,
          image: user.avatar,
          message: `${user.fullname} has joined ${room.roomTitle}`,
        });
      }
    } catch (error) {}
  };

  const getKey = (item) => {
    return item.id;
  };

  const createRoom = () => {
    navigation.navigate('Create Room');
  };

  return (
    <View style={styles.container}>
      <FlatList
        numColumns={1}
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item) => getKey(item)}
      />
      <View style={styles.startRoomContainer}>
        <TouchableOpacity style={styles.startRoomBtn} onPress={createRoom}>
          <Add width={18} height={18} />
          <Text style={styles.startRoomTxt}>Start a Room</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1EFE3',
    flex: 1,
    position: 'relative',
  },
  room: {
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'column',
    margin: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
  },
  roomTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  authorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 8,
  },
  createdByTxt: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingRight: 8,
  },
  authorAvatar: {
    borderRadius: 8,
    height: 36,
    marginRight: 8,
    width: 36,
  },
  authorFullname: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  startRoomContainer: {
    bottom: 32,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  startRoomBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startRoomTxt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default Home;
