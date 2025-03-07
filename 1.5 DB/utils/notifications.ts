import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    // Web implementation for notifications
    return null;
  }

  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function sendPushNotification(expoPushToken: string, title: string, body: string) {
  if (Platform.OS === 'web') {
    // Web implementation using service workers
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      } catch (error) {
        console.error('Error sending web notification:', error);
      }
    }
    return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}