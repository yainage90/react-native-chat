import { Alert } from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  getStorage,
  uploadBytesResumable,
  ref,
  getDownloadURL,
} from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../../firebase_config';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
} from 'firebase/firestore';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const storage = getStorage(app);

const getCurrentUser = () => {
  const { uid, email, displayName, photoURL } = auth.currentUser;
  return {
    uid,
    email,
    name: displayName,
    photoURL,
  };
};

const uploadImage = async photoURL => {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      resolve(xhr.response);
    };
    xhr.onerror = e => {
      reject(new TypeError('Request Failed.'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', photoURL);
    xhr.send(null);
  });

  const user = auth.currentUser;
  const storageRef = ref(storage, `/profile/${user.uid}/profile.png`);
  const uploadTask = uploadBytesResumable(storageRef, blob, {
    contentType: 'image/png',
  });

  return uploadTask;
};

const signup = async ({ email, password, name, photoURL }) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  if (photoURL.startsWith('https')) {
    await updateProfile(user, {
      displayName: name,
      photoURL: photoURL,
    });
  } else {
    await uploadImage(photoURL)
      .then(snapshot => {
        return getDownloadURL(snapshot.ref);
      })
      .then(storageUrl => {
        return updateProfile(user, {
          displayName: name,
          photoURL: storageUrl,
        });
      })
      .then(() => {});
  }

  return auth.currentUser;
};

const updatePhotoURL = async photoURL => {
  const user = auth.currentUser;

  if (photoURL.startsWith('https')) {
    await updateProfile(user, {
      photoURL: photoURL,
    });
  } else {
    await uploadImage(photoURL)
      .then(snapshot => {
        return getDownloadURL(snapshot.ref);
      })
      .then(storageUrl => {
        return updateProfile(user, {
          photoURL: storageUrl,
        });
      })
      .then(() => {});
  }

  return auth.currentUser.photoURL;
};

const login = async ({ email, password }) => {
  const user = await signInWithEmailAndPassword(auth, email, password)
    .then(userCredentail => {
      const user = userCredentail.user;
      console.log(
        `Logged in. uid=${user.uid} email=${user.email} photoURL=${user.photoURL}`,
      );
      return user;
    })
    .catch(error => {
      console.log(error.code, error.message);
      Alert.alert(`code: ${error.code}\nmessage: ${error.message}`);
    });

  return user;
};

const logout = async () => {
  await signOut(auth)
    .then(() => {
      console.log('Logged out');
    })
    .catch(e => {
      console.error(`Logout failed.\n${e.message}`);
    });
};

export { getCurrentUser, signup, login, logout, updatePhotoURL };

// database

const db = getFirestore(app);

const createChannel = async ({ title, description }) => {
  const newChannelRef = doc(collection(db, 'channels'));
  const id = newChannelRef.id;
  const newChannel = {
    id,
    title,
    description,
    createdAt: Date.now(),
  };
  await setDoc(newChannelRef, newChannel)
    .then(() => {
      console.log(`Channel created. ID=${id}`);
    })
    .catch(e => {
      console.error(`Channel creation failed.\n${e}`);
    });

  return id;
};

const createMessage = async ({ channelId, message }) => {
  const messagesRef = doc(
    collection(db, 'channels', channelId, 'messages'),
    message._id,
  );
  await setDoc(messagesRef, {
    ...message,
    createdAt: Date.now(),
  })
    .then(() => {
      console.log(`Message sent. channelId=${channelId} text=${message.text}`);
    })
    .catch(e => {
      console.error(
        `Message send failed. channeldId=${channelId}, errorMessage=${e.message}`,
      );
    });
};

export { db, createChannel, createMessage };
