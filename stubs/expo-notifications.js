// Web stub — expo-notifications is not supported on web
export default {};
export const setNotificationHandler = () => {};
export const getPermissionsAsync = async () => ({ status: 'denied' });
export const requestPermissionsAsync = async () => ({ status: 'denied' });
export const getExpoPushTokenAsync = async () => ({ data: null });
export const scheduleNotificationAsync = async () => {};
export const cancelAllScheduledNotificationsAsync = async () => {};
export const setNotificationChannelAsync = async () => {};
export const AndroidImportance = { MAX: 5, DEFAULT: 3 };
export const addNotificationReceivedListener = () => ({ remove: () => {} });
export const addNotificationResponseReceivedListener = () => ({ remove: () => {} });
