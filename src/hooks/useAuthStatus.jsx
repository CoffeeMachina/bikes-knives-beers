import React, {useEffect, useState} from 'react';
import {getAuth, onAuthStateChanged} from "firebase/auth";

 const useAuthStatus = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    // check if person is authen or not.
    // need time for status; so we can apply loading effect
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoggedIn(true);
            }
            setCheckingStatus(false);
        })
    }, [])


    return {loggedIn, checkingStatus}
};

export default useAuthStatus;