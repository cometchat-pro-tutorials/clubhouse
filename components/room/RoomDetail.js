import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {CometChat} from '@cometchat-pro/react-native-chat';

import Call from '../../images/call.svg';

const RoomDetail = ({route, navigation}) => {
  const {room} = route.params;

  const [members, setMembers] = useState([]);

  useEffect(() => {
    navigation.setOptions({title: room.roomTitle});
    getMembers();
    onGroupUpdated();
    return () => {
      CometChat.removeGroupListener(room.id);
    };
  }, []);

  const getMembers = async () => {
    if (!room) return;
    const limit = 30;
    const groupMemberRequest = new CometChat.GroupMembersRequestBuilder(room.id)
      .setLimit(limit)
      .build();
    try {
      const members = await groupMemberRequest.fetchNext();
      setMembers(() => members);
    } catch (error) {}
  };

  const onGroupUpdated = () => {
    if (room?.id) {
      CometChat.addGroupListener(
        room.id,
        new CometChat.GroupListener({
          onGroupMemberJoined: (message, joinedUser, joinedGroup) => {
            setMembers((prevMembers) => [...prevMembers, joinedUser]);
          },
          onGroupMemberLeft: (message, leftUser, leftGroup) => {
            setMembers((prevMembers) =>
              prevMembers.filter((member) => member.uid !== leftUser.uid),
            );
          },
        }),
      );
    }
  };

  const renderMember = (item) => {
    const member = item.item;
    return (
      <View style={styles.member}>
        <Image style={styles.avatar} source={{uri: member.avatar}} />
        <Text style={styles.name}>{member.name}</Text>
      </View>
    );
  };

  const getKey = (item) => {
    return item.id;
  };

  const joinCall = () => {
    console.log("Join call triggered", room);
    navigation.navigate('Call', {room});
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.members}
        numColumns={3}
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => getKey(item)}
      />
      <View style={styles.joinCallContainer}>
        <TouchableOpacity style={styles.joinCallBtn} onPress={joinCall}>
          <Call width={18} height={18} />
          <Text style={styles.joinCallTxt}>Speak On It!</Text>
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
  members: {
    padding: 12,
  },
  member: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 32,
    height: 96,
    width: 96,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 8,
  },
  joinCallContainer: {
    bottom: 32,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  joinCallBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinCallTxt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default RoomDetail;
