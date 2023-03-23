import React from 'react';
import {toast} from "react-toastify";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {doc, getDoc, serverTimestamp, setDoc} from "firebase/firestore";
import {db} from "../firebase";
import {useNavigate} from "react-router-dom";
import { BsGoogle } from "react-icons/bs";

const OAuth = () => {
    const navigate = useNavigate();
    const onGoogleClick = async () => {
        // toast.info("test google click")
        try {
            const auth = getAuth();
            // console.log("@OAuth.jsx ; auth: ", auth)
            const provider = new GoogleAuthProvider(); //google provider popup
            // console.log("@OAuth.jsx ; provider: ", provider)

            //promise for popup. @params: auth, provider (i.e. google.com)
            const result = await signInWithPopup(auth, provider);
            // console.log("@OAuth.jsx ; result -- signInWithPopup:", result)

            const user = result.user;
            // console.log("@OAuth.jsx ; user: ", user)
            //check if user exist in db:
            const docRef = doc(db, "users", user.uid); //@params: db, collection name, id:
            // console.log("@OAuth.jsx ; docRef:",docRef)

            //get user; returns promise; snapshot
            const docSnap = await getDoc(docRef);
            //if docSnap DNE: add to DB; otherwise, pass
            //time: serverTimestamp ~ time that user signed-up/created acct
            // console.log("@OAuth.jsx ; docSnap:",docSnap)
            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    name: user.displayName,
                    email: user.email,
                    time: serverTimestamp()
                })
                toast.success(`Welcome ${user.displayName}! Please confirm the email at ${user.email}`)
                navigate("/profile");

            }
            //sign-up: if account already exists, it signs you in:
            if (docSnap.exists()) {
                toast.success(`Welcome ${user.displayName}!`)
                navigate("/")
            }


            // else(docSnap.exists())
            // {
            //     toast.warn(`You have signed-up already! Logging you in... ${user.displayName} under ${user.email}`)
            // }


        } catch (err) {
            console.log("ERROR : @OAuth.jsx: ", err)
            toast.error("Could not authorized user.")
        }


    };

    return (
        <button
            style={{marginTop: "10px", color: "plum"}}
            type="button"
            onClick={onGoogleClick}
            className="btn btn-danger  form-control shadow-lg"> Continue with Google <BsGoogle style={{fontSize:"175%"}} ></BsGoogle>
        </button>
    );
};

export default OAuth;