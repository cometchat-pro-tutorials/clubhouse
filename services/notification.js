import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {getFirebaseData, insertFirebaseDatabase} from './firebase';

export const addNotification = async ({userId, image, message}) => {
  if (!userId) return;
  const notifications = await getNotifications(userId);
  const newNotification = buildNotification(image, message);
  const updatedNotifications = notifications
    ? [...notifications, newNotification]
    : [newNotification];
  insertFirebaseDatabase({
    key: 'notifications/',
    id: userId,
    payload: updatedNotifications,
  });
};

const getNotifications = async (userId) => {
  if (!userId) return;
  return await getFirebaseData('notifications/', userId);
};

const buildNotification = (image, message) => ({
  notificationId: uuidv4(),
  notificationImage: image,
  notificationTitle: message,
});
