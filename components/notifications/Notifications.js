import React, {useState, useEffect, useContext} from 'react';
import {View, Text, Image, FlatList, StyleSheet} from 'react-native';

import {getRef, getDataRealtime, off} from '../../services/firebase';

import Context from '../../context';

const Notifications = () => {
  const [notifications, setNotifications] = useState();

  const {user} = useContext(Context);

  const notificationsRef = getRef(`notifications/${user.id}`);

  useEffect(() => {
    getNotifications();
    return () => {
      off(notificationsRef);
    };
  }, []);

  const getNotifications = () => {
    getDataRealtime(notificationsRef, onNotificationsLoaded);
  };

  const onNotificationsLoaded = (val) => {
    if (val) {
      const keys = Object.keys(val);
      const data = keys.map((key) => val[key]);
      setNotifications(() => data);
    }
  };

  const renderNotification = (item) => {
    const notification = item.item;
    return (
      <View style={styles.notification}>
        <View style={styles.left}>
          <Image
            style={styles.image}
            source={{uri: notification.notificationImage}}
          />
          <View style={styles.description}>
            <Text style={styles.title}>{notification.notificationTitle}</Text>
          </View>
        </View>
      </View>
    );
  };

  const getKey = (item) => {
    return item.notificationId;
  };

  return (
    <View style={styles.container}>
      <FlatList
        numColumns={1}
        data={notifications}
        renderItem={renderNotification}
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
  notification: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 22,
  },
  description: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    paddingBottom: 4,
  },
});

export default Notifications;
