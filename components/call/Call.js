import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, StyleSheet, Text, Modal, FlatList } from 'react-native';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import {CometChatCalls} from '@cometchat/calls-sdk-react-native';
import {updateFirebaseDatabase, getFirebaseData} from '../../services/firebase';

const JoinCall = ({route, navigation}) => {
  console.log("Joining Call");
  const {room} = route.params;
  const [callSettings, setCallSettings] = useState();
  const [callToken, setCallToken] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [currentActionType, setCurrentActionType] = useState(null);

  useEffect(() => {
    const fetchAuthTokenAndStartCall = async () => {
      if (room) {
        try {
          // Get logged in user to create authToken for Direct Call
          let loggedInUser = await CometChat.getLoggedinUser();
          let authToken = loggedInUser.getAuthToken();
          console.log("the authToken for Direct Call: ", authToken);
          let sessionID = room.id;

          // Generate the token for the call using the auth token and session id (which is the ROOM id)
          await CometChatCalls.generateToken(sessionID, authToken).then(
            res => {
              console.log("Call token fetched: ", res.token);
              setCallToken(res.token); // Store the token in state
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
    const switchCameraButton = false;
    const switchToVideoCallButton = false;
    const pauseVideoButton = false;
    const callListener = new CometChatCalls.OngoingCallListener({
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

    const callSettings = new CometChatCalls.CallSettingsBuilder()
      .enableDefaultLayout(defaultLayout)
      .setIsAudioOnlyCall(audioOnly)
      .setCallEventListener(callListener)
      .showSwitchCameraButton(switchCameraButton)
      .showSwitchToVideoCallButton(switchToVideoCallButton)
      .showPauseVideoButton(pauseVideoButton)
      .build();
    
    console.log("Call settings created", callSettings);
    setCallSettings(() => callSettings);
  };

   
  const onThumbsUp = () => {
    console.log("Thumbs Up clicked");
    setCurrentActionType('thumbsUp');
    showParticipants();
  };

  const onThumbsDown = () => {
    console.log("Thumbs Down clicked");
    setCurrentActionType('thumbsDown');
    showParticipants();
    // Handle the thumbs down action here
  };

  const fetchCallParticipants = async () => {
    const groupId = room.id; // Assuming 'room.id' is your group ID
    const limit = 30; // Adjust as needed
    const groupMemberRequest = new CometChat.GroupMembersRequestBuilder(groupId)
      .setLimit(limit)
      .build();

    try {
      const fetchedMembers = await groupMemberRequest.fetchNext();
      setParticipants(fetchedMembers);
      console.log("Fetched call participants: ", fetchedMembers);
    } catch (error) {
      console.error("Error fetching call participants: ", error);
    }
  };


  const showParticipants = () => {
      fetchCallParticipants();
      setIsModalVisible(true);
  };
  
  const handleParticipantPress = async (roomId, participantUid, actionType) => {
    try {
      // Fetch the entire room data
      const roomData = await getFirebaseData('rooms', roomId);
      if (roomData && roomData.speakers) {
        const speakerData = roomData.speakers[participantUid];
        if (!speakerData) {
          console.error(`Speaker with UID ${participantUid} not found.`);
          return;
        }
        
        const currentTime = Date.now();
        let newExpiryTimestamp = speakerData.expiryTimestamp;
        
        if (actionType === 'thumbsUp') {
          newExpiryTimestamp += 5 * 60 * 1000; // Add 5 minutes
        } else if (actionType === 'thumbsDown') {
          // Calculate time difference and reduce by 1 minute or 20% of the difference, whichever is smaller
          const timeDifference = speakerData.expiryTimestamp - currentTime;
          const reductionAmount = Math.min(timeDifference * 0.2, 1 * 60 * 1000); // 1 minute or 20%
          newExpiryTimestamp -= reductionAmount;
        } else {
          console.error("Invalid actionType:", actionType);
          return;
        }
        
        // Update the expiryTimestamp in the database
        await updateFirebaseDatabase({
          key: 'rooms/' + roomId + '/speakers',
          id: participantUid,
          nestedKey: 'expiryTimestamp',
          payload: newExpiryTimestamp
        });
        
        console.log("Expiry timestamp updated for speaker:", participantUid, "to", newExpiryTimestamp);
      } else {
        console.error("Room data not found or missing speakers.");
      }
    } catch (error) {
      console.error("Error updating expiry timestamp:", error);
    }
  };
  
  


  if (callSettings) {
    return (
        <View style={styles.container}>
            <View style={styles.callContainer}>
                <CometChatCalls.Component callSettings={callSettings} callToken={callToken} />
            </View>
            <View style={styles.buttonContainer}>
                {/* Replace onPress with fetching participants and showing modal */}
                <TouchableOpacity style={styles.button} onPress={onThumbsUp}>
                    <Text style={styles.buttonText}>Thumbs Up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onThumbsDown}>
                    <Text style={styles.buttonText}>Thumbs Down</Text>
                </TouchableOpacity>
            </View>
            {/* Modal to display participants */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalView}>
                <FlatList
                  data={participants}
                  keyExtractor={item => item.uid}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleParticipantPress(room.id, item.uid, currentActionType)}>
                      <Text style={styles.participantName}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setIsModalVisible(false)}
                    >
                        <Text>Close</Text>
                    </TouchableOpacity>
                </View>

            </Modal>
        </View>
    );
  } else {
    // Default return if callSettings is not available
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  callContainer: {
    flex: 0.8, // 80% of the screen for the call
  },
  buttonContainer: {
    flex: 0.2, // 20% of the screen for buttons
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Light grey background for buttons
  },
  button: {
    backgroundColor: '#007bff', // Bootstrap primary button color
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff', // White text color
  },
  modalView: {
    // Style for your modal view
    position: 'absolute', // Position the modal absolutely within its parent
    bottom: 0, // Align it to the bottom
    width: '100%', // Take full width to center horizontally
    height: '20%', // Take 20% of the screen height
    backgroundColor: '#fff', // Set a background color
    borderTopRightRadius: 20, // Optional: for rounded corners at the top
    borderTopLeftRadius: 20, // Optional: for rounded corners at the top
    padding: 20, // Inner padding
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
  },
  participantItem: {
    // Style for each participant item
  },
  participantName: {
    // Style for participant name text
  },
  closeButton: {
    // Add any specific styles for your close button if needed
    marginTop: 10,
    alignSelf: 'center', // Ensure the button is centered
    backgroundColor: '#ddd', // Example button color
    padding: 10,
    borderRadius: 5,
  },
});

export default JoinCall;
