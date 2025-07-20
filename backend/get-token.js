import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'any-value', // Emulator ignores apiKey
  authDomain: 'city-pulse-813ee.firebaseapp.com',
  projectId: 'city-pulse-813ee',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099');

async function getIdToken() {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'avadhootsghewade4757@gmail.com', '12345678');
    const idToken = await userCredential.user.getIdToken();
    console.log('ID Token:', idToken);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getIdToken();
