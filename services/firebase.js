import {
  database,
  databaseRef,
  databaseSet,
  databaseGet,
  databaseChild,
  databaseOnValue,
  databaseQuery,
  equalTo,
  orderByChild,
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  storage,
  storageRef,
  uploadBytesResumable,
  getDownloadURL,
  databaseOff,
} from '../firebase';

const insertFirebaseDatabase = async ({key, id, payload}) => {
  await databaseSet(databaseRef(database, key + id), payload);
};

const getFirebaseData = async (key, id) => {
  const ref = databaseRef(database);
  const snapshot = await databaseGet(databaseChild(ref, `${key}${id}`));
  if (!snapshot || !snapshot.exists()) {
    return null;
  }
  return snapshot.val();
};

const getRef = (child) => databaseRef(database, child);

const getDataRealtime = (ref, callback) => {
  databaseOnValue(ref, (snapshot) => {
    callback(snapshot.val());
  });
};

const getDataRealtimeQuery = async ({ref, query, criteria, callback}) => {
  const snapshot = await databaseGet(
    databaseQuery(ref, orderByChild(query), equalTo(criteria)),
  );
  callback(snapshot.val());
};

const off = (ref) => {
  databaseOff(ref);
};

const signIn = async (email, password) =>
  await signInWithEmailAndPassword(auth, email, password);

const createUser = async (email, password) =>
  await await createUserWithEmailAndPassword(auth, email, password);

const uploadFile = async ({fileRef, blob, contentType, onError, onSuccess}) => {
  const storageFileRef = storageRef(storage, fileRef);
  const uploadTask = uploadBytesResumable(storageFileRef, blob, {
    contentType,
  });
  uploadTask.on(
    'state_changed',
    (snapshot) => {},
    (error) => {
      onError();
    },
    async () => {
      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
      if (downloadUrl) {
        onSuccess(downloadUrl);
      }
    },
  );
};

export {
  insertFirebaseDatabase,
  getFirebaseData,
  getRef,
  getDataRealtime,
  getDataRealtimeQuery,
  off,
  signIn,
  createUser,
  uploadFile,
};
