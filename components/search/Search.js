import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import SearchIcon from '../../images/search.svg';

import Context from '../../context';

import {
  getRef,
  getDataRealtimeQuery,
  insertFirebaseDatabase,
} from '../../services/firebase';

import {addNotification} from '../../services/notification';
import {showMessage} from '../../services/ui';

const Search = () => {
  const [keywords, setKeywords] = useState();
  const [users, setUsers] = useState();

  const {user, setUser} = useContext(Context);

  const usersRef = getRef('users');

  useEffect(() => {
    if (keywords && keywords.length) {
      searchUsers();
    }
  }, [keywords]);

  const searchUsers = async () => {
    await getDataRealtimeQuery({
      ref: usersRef,
      query: 'fullname',
      criteria: keywords,
      callback: onUsersLoaded,
    });
  };

  const onUsersLoaded = (val) => {
    if (val) {
      const keys = Object.keys(val);
      const data = keys.map((key) => val[key]);
      setUsers(() => transformUsers(data));
    }
  };

  const transformUsers = (data) => {
    return data
      ?.map((eachUser) => ({
        ...eachUser,
        hasFollow: user.followers?.includes(eachUser.id),
      }))
      .filter((eachUser) => eachUser.id !== user.id);
  };

  const onKeywordsChanged = (keywords) => {
    setKeywords(keywords);
  };

  const renderUser = (item) => {
    const user = item.item;
    if (user.hasFollow) return <></>;
    return (
      <View style={styles.user}>
        <View style={styles.left}>
          <Image style={styles.avatar} source={{uri: user.avatar}} />
          <View style={styles.description}>
            <Text style={styles.fullname}>{user.fullname}</Text>
            <Text>{getUserTag(user.fullname)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.followBtn} onPress={follow(user)}>
          <View style={styles.followTxtContainer}>
            <Text style={styles.followTxt}>Follow</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const getUserTag = (fullname) => {
    if (!fullname) return;
    const tag = fullname.split(' ').join('-').toLowerCase();
    return `@${tag}`;
  };

  const follow = (following) => () => {
    if (!following || !following.id) return;
    user.followers = user.followers
      ? [...user.followers, following.id]
      : [following.id];
    insertFirebaseDatabase({
      key: 'users/',
      id: user.id,
      payload: user,
    });
    setUser(user);
    setUsers((prevUsers) =>
      prevUsers.filter((eachUser) => eachUser.id !== following.id),
    );
    showMessage('Info', `You has followed ${following.fullname}`);
    // send a notification for the selected user.
    addNotification({
      userId: following.id,
      image: user.avatar,
      message: `${user.fullname} has followed you`,
    });
  };

  const getKey = (item) => {
    return item.id;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchIcon width={16} height={16} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          onChangeText={onKeywordsChanged}
          value={keywords}
          placeholder="Search"
        />
      </View>
      <FlatList
        numColumns={1}
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => getKey(item)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1EFE3',
    flex: 1,
  },
  searchContainer: {
    backgroundColor: '#e5ddd3',
    borderRadius: 4,
    margin: 12,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    top: 14,
    left: 12,
  },
  searchInput: {
    fontSize: 18,
    paddingHorizontal: 36,
    paddingVertical: 12,
  },
  user: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 28,
  },
  description: {
    marginLeft: 12,
  },
  fullname: {
    fontWeight: 'bold',
    paddingBottom: 4,
  },
  followBtn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  followTxtContainer: {
    borderColor: '#2563eb',
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 32,
    paddingVertical: 8,
  },
  followTxt: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
});

export default Search;
