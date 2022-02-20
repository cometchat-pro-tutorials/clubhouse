import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {CometChat} from '@cometchat-pro/react-native-chat';

const JoinCall = ({route, navigation}) => {
  const {room} = route.params;
  const [callSettings, setCallSettings] = useState();

  useEffect(() => {
    if (room) {
      startCall();
    }
  }, []);

  const startCall = () => {
    const sessionID = room.id;
    const audioOnly = false;
    const defaultLayout = true;
    const callListener = new CometChat.OngoingCallListener({
      onUserListUpdated: (userList) => {},
      onCallEnded: (call) => {
        navigation.goBack();
      },
      onError: (error) => {
        navigation.goBack();
      },
      onAudioModesUpdated: (audioModes) => {},
    });

    const callSettings = new CometChat.CallSettingsBuilder()
      .enableDefaultLayout(defaultLayout)
      .setSessionID(sessionID)
      .setIsAudioOnlyCall(audioOnly)
      .setCallEventListener(callListener)
      .build();

    setCallSettings(() => callSettings);
  };

  if (callSettings) {
    return (
      <View style={{height: '100%', width: '100%', position: 'relative'}}>
        <CometChat.CallingComponent callsettings={callSettings} />
      </View>
    );
  }

  return <></>;
};

export default JoinCall;
