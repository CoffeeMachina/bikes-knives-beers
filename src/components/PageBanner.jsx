import React from 'react';
import "./styles/PageBanner.css";
const PageBanner = (props) => {
    const {text, icon} = props;
    return (
        <>
            <h1 className="page-banner">{text} <i className={icon}></i></h1>
            {/*{text}*/}
        </>
    );
};

export default PageBanner;