// Import the functions you need from the SDKs you need
// import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: `${process.env.REACT_APP_FB_APIKEY}`,
    authDomain: `${process.env.REACT_APP_FB_AUTHDOMAIN}`,
    projectId: `${process.env.REACT_APP_FB_PROJECTID}`,
    storageBucket: `${process.env.REACT_APP_FB_STORAGEBUCKET}`,
    messagingSenderId: `${process.env.REACT_APP_FB_MESSAGINGSENDERID}`,
    appId: `${process.env.REACT_APP_FB_APPID}`,
    measurementId: `${process.env.REACT_APP_FB_MEASUREMENTID}`
};

// Initialize Firebase
initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore()
