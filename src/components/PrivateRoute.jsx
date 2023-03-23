import React from 'react';
import {Navigate, Outlet} from "react-router-dom";
import useAuthStatus from "../hooks/useAuthStatus";
import LoadingSpinner from "./LoadingSpinner";

const PrivateRoute = () => {
    //custon hook implementation:
    const {loggedIn, checkingStatus} = useAuthStatus();
    // const loggedIn = false;

    //activate loadbar b/c page renders before FB data arrives.
    if (checkingStatus) {
        return (
            <LoadingSpinner></LoadingSpinner>
        )
    }


    return loggedIn ? <Outlet></Outlet> : <Navigate to="/sign-in"/>

};

export default PrivateRoute;