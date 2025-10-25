/* eslint-disable */
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDyOnvFQtAGTlJqp9Up4OkCKDDuA33dg-U',
  authDomain: 'numenor-freight-division.firebaseapp.com',
  projectId: 'numenor-freight-division',
  storageBucket: 'numenor-freight-division.appspot.com',
  messagingSenderId: '156194112407',
  appId: '1:156194112407:web:b3b13746da90fd81e63ad2',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
export const firestore = getFirestore(app);

if (window.location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(firestore, 'localhost', 8080);
}
