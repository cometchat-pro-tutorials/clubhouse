import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import {CometChatCalls} from '@cometchat/calls-sdk-react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from './components/login/Login';
import SignUp from './components/register/SignUp';
import Home from './components/home/Home';
import Search from './components/search/Search';
import CreateRoom from './components/room/CreateRoom';
import EditRoom from './components/room/EditRoom';
import RoomDetail from './components/room/RoomDetail';
import Call from './components/call/Call';
import Notifications from './components/notifications/Notifications';

import {cometChatConfig} from './env';

import {showMessage, showMessageWithActions} from './services/ui';

import Context from './context';

import Compass from './images/compass.svg';
import Logout from './images/logout.svg';
import Bell from './images/bell.svg';

const Stack = createNativeStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);
  const [roomDetail, setRoomDetail] = useState(null);

  const initCometChat = async () => {
    const appID = `${cometChatConfig.cometChatAppId}`;
    const region = `${cometChatConfig.cometChatRegion}`;
    console.log("This is the appID cometChat is configured to use: ", appID);
    console.log("This is the region cometChat is configured to use: ", region);

    //Basic CometChat Sign in
    const appSetting = new CometChat.AppSettingsBuilder()
                        .subscribePresenceForAllUsers()
                        .setRegion(region)
                        .autoEstablishSocketConnection(true)
                        .build();
    CometChat.init(appID, appSetting).then(
      () => {
        console.log("Initialization completed successfully");
      }, error => {
        console.log("Initialization failed with error:", error);
      }
    );
    
    //CometCall (audio & video) sign in
    const callAppSettings = new CometChatCalls.CallAppSettingsBuilder()
      .setAppId(appID)
      .setRegion(region)
      .build();

    CometChatCalls.init(callAppSettings).then(
      () => {
        console.log('CometChatCalls was initialized successfully');
      },
      (error) => {
        console.log('CometChatCalls initialization failed with error:', error);
      },
    );
  };

  const initAuthenticatedUser = async () => {
    console.log("Initiate Authenticated User...");
    const authenticatedUser = await AsyncStorage.getItem('auth');
    setUser(() => (authenticatedUser ? JSON.parse(authenticatedUser) : null));
    console.log("User is set");
  };

  useEffect(() => {
    initCometChat();
    console.log("initCometChat done");
    initAuthenticatedUser();
    console.log("initAuthenticatedUser done");
  }, []);

  const search = (navigation) => () => {
    navigation.navigate('Search');
  };

  const notifications = (navigation) => () => {
    navigation.navigate('Notifications');
  };

  const logout = (navigation) => () => {
    showMessageWithActions({
      title: 'Confirm',
      message: 'Do you want to log out?',
      actions: [
        {text: 'Cancel'},
        {text: 'OK', onPress: () => handleLogout(navigation)},
      ],
    });
  };

  const handleLogout = async (navigation) => {
    await CometChat.logout();
    removeAuthedInfo();
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  const removeAuthedInfo = () => {
    AsyncStorage.removeItem('auth');
    setUser(null);
  };

  const leaveRoom = (navigation) => async () => {
    try {
      await leaveCometChatGroup();
    } catch (e) {
      console.log(e);
    }
    navigation.goBack();
  };

  const leaveCometChatGroup = async () => {
    if (roomDetail && roomDetail.createdBy.email !== user.email) {
      await CometChat.leaveGroup(roomDetail.id);
    } else {
      showMessage('Info', 'Owner cannot leave the room');
    }
  };

  if (user) {
    return (
      <Context.Provider value={{user, setUser, roomDetail, setRoomDetail}}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={Home}
              options={({navigation}) => ({
                headerStyle: {
                  backgroundColor: '#F1EFE3',
                },
                headerLeft: () => (
                  <TouchableOpacity onPress={search(navigation)}>
                    <Compass width={36} height={36} />
                  </TouchableOpacity>
                ),
                headerRight: () => (
                  <View style={styles.homeHeaderRight}>
                    <TouchableOpacity
                      onPress={notifications(navigation)}
                      style={styles.bellBtn}>
                      <Bell width={24} height={24} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={logout(navigation)}>
                      <Logout width={24} height={24} />
                    </TouchableOpacity>
                  </View>
                ),
              })}
            />
            <Stack.Screen
              name="Search"
              component={Search}
              options={() => ({
                headerStyle: {
                  backgroundColor: '#F1EFE3',
                },
              })}
            />
            <Stack.Screen
              name="Create Room"
              component={CreateRoom}
              options={() => ({
                headerStyle: {
                  backgroundColor: '#F1EFE3',
                },
              })}
            />
            <Stack.Screen
              name="Edit Room"
              component={EditRoom}
              options={() => ({
                headerStyle: {
                  backgroundColor: '#F1EFE3',
                },
              })}
            />
            <Stack.Screen
              name="Room Detail"
              component={RoomDetail}
              options={({navigation}) => ({
                headerStyle: {
                  backgroundColor: '#F1EFE3',
                },
                headerRight: () => (
                  <View>
                    <TouchableOpacity onPress={leaveRoom(navigation)}>
                      <Text style={styles.leaveQuitelyTxt}>Leave Quitely</Text>
                    </TouchableOpacity>
                  </View>
                ),
              })}
            />
            <Stack.Screen name="Call" component={Call} />
            <Stack.Screen
              name="Notifications"
              component={Notifications}
              options={() => ({
                headerStyle: {
                  backgroundColor: '#F1EFE3',
                },
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Context.Provider>
    );
  }

  return (
    <Context.Provider value={{user, setUser}}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </Context.Provider>
  );
};

const styles = StyleSheet.create({
  homeHeaderRight: {
    flexDirection: 'row',
  },
  bellBtn: {
    marginRight: 8,
  },
  leaveQuitelyTxt: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default App;
