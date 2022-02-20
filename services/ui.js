import {Alert} from 'react-native';

export const showMessage = (title, message) => {
  Alert.alert(title, message);
};

export const showMessageWithActions = ({title, message, actions}) => {
  Alert.alert(title, message, actions);
};
