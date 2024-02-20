import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {CometChat} from '@cometchat/chat-sdk-react-native';

import {getRef, getDataRealtime, off} from '../../services/firebase';
import {updateFirebaseDatabase, getFirebaseData} from '../../services/firebase';
import {addNotification} from '../../services/notification';
import {showMessageWithActions} from '../../services/ui';
import "@ethersproject/shims"
import { ethers } from 'ethers';
import socialKeysABI from '../../abi/socialkey.json';
import { initializeEthers } from '../web3/initializeEthers'; 
import * as particleAuth from '@particle-network/rn-auth';
import { loginWithParticle } from '../../particle';

import Add from '../../images/add.svg';

import Context from '../../context';


const Home = ({navigation}) => {
  const [rooms, setRooms] = useState();

  const roomsRef = getRef('rooms');

  const {user, setRoomDetail} = useContext(Context);

  useEffect(() => {
    let isMounted = true; // Flag to track mounted state

  // Asynchronously initialize Firebase and ethers
  const initialize = async () => {
    if (isMounted) {
      await initParticleFirebase();
    }
  };
  
    // Function to initialize Firebase
    const initParticleFirebase = async () => {
      try {
        const isLoggedIn = await particleAuth.isLogin();
        if (!isLoggedIn) {
          // Prompt user to log in
          const particleResult = await loginWithParticle(email, password);
          console.log(particleResult);
        } else {
          // User is already logged in, fetch their info
          const userInfo = await particleAuth.getUserInfo();
          console.log(userInfo);
        }
      } catch (error) {
        console.error("Particle initialization failed:", error);
      }
    
      try {
        await getRooms(); // Assuming getRooms() returns a Promise
        console.log("Firebase initialization completed");
      } catch (error) {
        console.error("Firebase initialization failed:", error);
      }
    };

    initialize();
  
    /// Cleanup function
    return () => {
      isMounted = false; // Indicate component is unmounting
      // Perform any cleanup for Firebase if needed
      off(roomsRef); // Assuming off is a cleanup function
      console.log("Cleanup performed");
    };
  }, []); // Ensure this effect is only run once on mount and cleanup on unmount
  

  const getRooms = () => {
    // Call getDataRealtime with the correct parameters
    // Since you're fetching all rooms, only provide the 'node' parameter
    getDataRealtime("rooms","", onRoomsLoaded);
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
      <TouchableOpacity style={styles.room} onPress={handleItemClicked(room)}>
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

  // Function to handle button press
  const handlePressEthers = async () => {
    console.log("Ethers button pressed");
    await initializeEthers(); // Call your ethers function
};

  const handleItemClicked = (room) => async () => {
    setRoomDetail(room);
    if (room.createdBy.email === user.email) {
      showMessageWithActions({
        title: 'Confirm',
        message: 'Please select the below options',
        actions: [
          {
            text: 'View',
            onPress: async () => await joinRoom(room),
          },
          {
            text: 'Edit',
            onPress: () => editRoom(),
          },
        ],
      });
    } else {
      await joinRoom(room);
    }
  };

  const joinRoom = async (room) => {
    await joinCometChatGroup(room);
  
    // Check if the user is already a speaker in the room
    const roomData = await getFirebaseData('rooms', room.id);
    if (roomData && roomData.speakers && !roomData.speakers[user.id]) {
      
      // User is not a speaker yet, add them
      let newExpiryTimestamp = Date.now() + 30 * 60000;
      let loggedInUser = await CometChat.getLoggedinUser();

      // Construct the path and payload for updating Firebase
      const updatePath = `rooms/${room.id}/speakers`;
      await updateFirebaseDatabase({
        key: updatePath,
        id: loggedInUser.getUid(),
        nestedKey: 'expiryTimestamp',
        payload: newExpiryTimestamp
      });
  
      console.log(`${user.fullname} added as a speaker to room: ${room.roomTitle}`);
    }
  
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

  const editRoom = () => {
    navigation.navigate('Edit Room');
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
       {/* <TouchableOpacity style={styles.button} onPress={handlePressEthers}>
            <Text style={styles.buttonText}>Run Ethers Functionality</Text>
         </TouchableOpacity>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1EFE3',
    flex: 1,
    position: 'relative',
  },
  button: {
    marginBottom: 20, // Add margin to separate it from the "Start a Room" button
    backgroundColor: 'blue',
    padding: 20,
    borderRadius: 5,
    alignSelf: 'center', // This will center the button
  },
  buttonText: {
      color: 'white',
      fontSize: 16,
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
