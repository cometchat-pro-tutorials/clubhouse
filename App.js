import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {CometChat} from '@cometchat-pro/react-native-chat';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from './components/login/Login';
import SignUp from './components/register/SignUp';
import Home from './components/home/Home';
import Search from './components/search/Search';
import CreateRoom from './components/room/CreateRoom';
import RoomDetail from './components/room/RoomDetail';
import Call from './components/call/Call';
import Notifications from './components/notifications/Notifications';

import {cometChatConfig} from './env';

import {showMessageWithActions} from './services/ui';

import Context from './context';

import Compass from './images/compass.svg';
import Logout from './images/logout.svg';
import Bell from './images/bell.svg';

const Stack = createNativeStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);

  const initCometChat = async () => {
    const appID = `${cometChatConfig.cometChatAppId}`;
    const region = `${cometChatConfig.cometChatRegion}`;
    const appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(region)
      .build();
    CometChat.init(appID, appSetting).then(
      () => {
        console.log('CometChat was initialized successfully');
      },
      (error) => {},
    );
  };

  const initAuthenticatedUser = async () => {
    const authenticatedUser = await AsyncStorage.getItem('auth');
    setUser(() => (authenticatedUser ? JSON.parse(authenticatedUser) : null));
  };

  useEffect(() => {
    initCometChat();
    initAuthenticatedUser();
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

  const leaveRoom = (navigation) => () => {
    navigation.goBack();
  };

  if (user) {
    return (
      <Context.Provider value={{user, setUser}}>
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
