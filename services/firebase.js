import { auth, storage, database } from '../firebase';
import { 
  ref as databaseRef, 
  set as databaseSet, 
  get as databaseGet, 
  child as databaseChild, 
  onValue as databaseOnValue, 
  off as databaseOff, 
  query as databaseQuery, 
  equalTo, 
  orderByChild,
  enableLogging  
} from 'firebase/database';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  ref as storageRef, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';

// Enable verbose logging
enableLogging(true);

const insertFirebaseDatabase = async ({ key, id, payload }) => {
  try {
    await databaseSet(databaseRef(database, `${key}/${id}`), payload);
  } catch (error) {
    console.error("Error inserting into Firebase database:", error);
    throw error;
  }
};

const updateFirebaseDatabase = async ({ key, id, nestedKey, payload }) => {
  const fullPath = `${key}/${id}/${nestedKey}`;
  try {
    await databaseSet(databaseRef(database, fullPath), payload);
    console.log("Firebase database updated successfully at path:", fullPath);
  } catch (error) {
    console.error("Error updating Firebase database at path:", fullPath, error);
    throw error;
  }
};

const getFirebaseData = async (key, id) => {
  try {
    console.log("Get Firebase Data for key:", key, "and id:", id);
    const ref = databaseRef(database, `${key}/${id}`);
    const snapshot = await databaseGet(ref);
    console.log("Snapshot taken:", snapshot.exists() ? 'Data exists' : 'No data found');
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.val();
  } catch (error) {
    console.error("Error getting Firebase data:", error);
    throw error;
  }
};

const getRef = (child) => databaseRef(database, child);

// Utility function to create a Firebase reference path as a string
const createFirebaseRefPath = (node, id = '') => {
  // Construct the path as a string
  let path = node;
  if (id) {
    path += `/${id}`;
  }
  return path;
};


const getDataRealtime = (node, id, callback) => {
  const refPath = createFirebaseRefPath(node, id);

  console.log("Type of refPath:", typeof refPath);
  console.log("Value of refPath:", refPath);

  if (typeof refPath !== 'string' || !refPath.trim()) {
    console.error("Invalid refPath: must be a non-empty string");
    return;
  }

  try {
    const ref = databaseRef(database, refPath);
    console.log("Database Ref: ", ref);
    databaseOnValue(ref, (snapshot) => {
      callback(snapshot.val());
    });

    return () => databaseOff(ref);
  } catch (error) {
    console.error("Error in getDataRealtime:", error);
  }
};


const getDataRealtimeQuery = async ({ path, queryKey, criteria, callback }) => {
  const ref = databaseRef(database, path);
  const queryRef = databaseQuery(ref, orderByChild(queryKey), equalTo(criteria));
  databaseOnValue(queryRef, (snapshot) => callback(snapshot.val()));
  return () => databaseOff(queryRef);
};

const off = (refPath) => {
  const ref = databaseRef(database, refPath);
  databaseOff(ref);
};

const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

const createUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);

const uploadFile = async ({ fileRef, blob, contentType, onError, onSuccess }) => {
  const storageFileRef = storageRef(storage, fileRef);
  const uploadTask = uploadBytesResumable(storageFileRef, blob, { contentType });
  uploadTask.on('state_changed', 
    (snapshot) => {}, 
    (error) => onError(error),
    async () => {
      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
      onSuccess(downloadUrl);
    }
  );
};

export {
  insertFirebaseDatabase,
  updateFirebaseDatabase,
  getFirebaseData,
  getRef,
  getDataRealtime,
  getDataRealtimeQuery,
  off,
  signIn,
  createUser,
  uploadFile,
};
