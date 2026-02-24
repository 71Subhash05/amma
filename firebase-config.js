// Firebase Configuration - Uses environment variables in production
const firebaseConfig = {
  apiKey: "AIzaSyDRC6ugiIRVifq-FnrIWMd-DCz8wNUhI5o",
  authDomain: "dictionary-31851.firebaseapp.com",
  databaseURL: "https://dictionary-31851-default-rtdb.firebaseio.com",
  projectId: "dictionary-31851",
  storageBucket: "dictionary-31851.firebasestorage.app",
  messagingSenderId: "184633697044",
  appId: "1:184633697044:web:e35bbfb41fce73b5e89801",
  measurementId: "G-TT3J8W8RGT"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  alert('Database connection failed. Please refresh the page.');
}
