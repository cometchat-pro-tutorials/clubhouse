import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import {CometChatCalls} from '@cometchat/calls-sdk-react-native';

const JoinCall = ({route, navigation}) => {
  console.log("Joining Call");
  const {room} = route.params;
  const [callSettings, setCallSettings] = useState();

  useEffect(() => {
    const fetchAuthTokenAndStartCall = async () => {
      if (room) {
        try {
          // Get logged in user to create authToken for Direct Call
          let loggedInUser = await CometChat.getLoggedinUser();
          let authToken = loggedInUser.getAuthToken();
          const sessionID = room.id;

          // Generate the token for the call using the auth token and session id (which is the ROOM id)
          await CometChatCalls.generateToken(authToken, sessionID).then(
            res => {
              console.log("Call token fetched: ", res.token);
            },
            err => {
              console.log("Generating call token failed with error: ", err);
            }
          );

          // Start the call
          startCall();
        } catch (error) {
          console.error("Error in fetchAuthTokenAndStartCall: ", error);
        }
      }
    };

    fetchAuthTokenAndStartCall();
  }, [room]);

  const startCall = () => {
    console.log("Starting call with room", room);
    const audioOnly = true;
    const defaultLayout = true;
    const callListener = new CometChat.OngoingCallListener({
      onUserJoined: user => {
        console.log("user joined:", user);
      },
      onUserLeft: user => {
          console.log("user left:", user);
      },
      onUserListUpdated: userList => {
          console.log("user list:", userList);
      },
      onCallEnded: () => {
          console.log("Call ended");
      },
      onCallEndButtonPressed: () => {
          console.log("End Call button pressed");
      },
      onError: error => {
          console.log('Call Error: ', error);
      },
      onAudioModesUpdated: (audioModes) => {
          console.log("audio modes:", audioModes);
      },
      onCallSwitchedToVideo: (event) => {
          console.log("call switched to video:", event);
      },
      onUserMuted: (event) => {
          console.log("user muted:", event);
      }
    });

    const callSettings = new CometChat.CallSettingsBuilder()
      .enableDefaultLayout(defaultLayout)
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
        <CometChatCalls.Component callsettings={callSettings} callToken={callToken} />
      </View>
    );
  }

  return <></>;
};

export default JoinCall;
