import React from 'react';
import "./styles/LoadingSpinner.css";
import loader from "../assets/svg/SpinnerTransparent.svg";
const LoadingSpinner = () => {
    return (
        <>
            <div style={{marginTop:"2rem",display:"flex",justifyContent:"center", alignContent:"center"}} >
                    <img src={loader} alt="loading bar"/>
            </div>
        </>
    );
};

export default LoadingSpinner;