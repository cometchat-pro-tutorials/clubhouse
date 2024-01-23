import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {CometChat} from '@cometchat-pro/react-native-chat';

const JoinCall = ({route, navigation}) => {
  console.log("Joining Call");
  const {room} = route.params;
  const [callSettings, setCallSettings] = useState();

  useEffect(() => {
    if (room) {
      startCall();
    }
  }, []);

  const startCall = () => {
    console.log("Starting call with room", room);
    const sessionID = room.id;
    const audioOnly = true;
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

    //get logged in user
    CometChat.getLoggedinUser().then(user => {
      console.log("Currently logged in user: ", user);
        // Setup your call here
    }).catch(error => {
        console.log("Error getting logged in user: ", error);
    });

    const callSettings = new CometChat.CallSettingsBuilder()
      .enableDefaultLayout(defaultLayout)
      .setSessionID(sessionID)
      .setIsAudioOnlyCall(audioOnly)
      .setCallEventListener(callListener)
      .build();
    
    console.log("Call settings created", callSettings);
    setCallSettings(() => callSettings);
  };

  if (callSettings) {
    console.log("Rendering CometChat CallingComponent with settings", callSettings);
    return (
      //REMOVE background color once functioning
      <View style={{height: '100%', width: '100%', position: 'relative', backgroundColor: 'red'}}>
        <CometChat.CallingComponent callsettings={callSettings} />
      </View>
    );
  }

  return <></>;
};

export default JoinCall;
