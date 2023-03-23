import React, {useEffect, useState} from 'react';
import "./styles/Header.css";
import {useLocation, useNavigate} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {toast} from "react-toastify";
import { MdDirectionsBike } from "react-icons/md";
import { GiSpinningSword } from "react-icons/gi";
import { IoBeer } from "react-icons/io5";
import { TbDoorExit } from "react-icons/tb";
const Header = () => {
    const defaultPageState = "Sign In";
    const [pageState, setPageState] = useState(defaultPageState);
    const auth = getAuth();
    //useEffect hook to get changes of AUTH
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            //if user authenticated:
            if (user) {
                setPageState("Profile")
            } else setPageState(defaultPageState);

        })

    }, [auth])


    const [hamburgerToggle, setHamburgerToggle] = useState(false);
    const showHamburger = (hamburgerToggle) ? "show" : "";

    const location = useLocation();
    const navigate = useNavigate();

    //function for highlight feature; check active link.
    function pathMatchRoute(route) {
        if (route === location.pathname) {
            return true
        }
    }

    //hamburger fix:
    const clickHamburger = () => {
        setHamburgerToggle(!hamburgerToggle);
    }


    const onClickLogout = async (e) => {
        await auth.signOut();
        //send user to home page after signout
        toast.success(`You have successfully signed out.`)
        navigate("/")

    }

    // console.log(location)
    return (
        <>
            {/*<nav className="navbar navbar-expand-lg navbar-custom shadow-lg p-2 mb-5">*/}
            <nav className="navbar navbar-expand-lg navbar-custom shadow-lg p-2">
                <div className="container-fluid">
                    <a href="/#" style={{cursor: "pointer"}}
                       className="navbar-brand hover-on-brand"
                       onClick={(e) => {
                           e.preventDefault()
                           navigate("/")
                       }}
                    >

                        <span className="logo">
                            <MdDirectionsBike style={{fontSize:"112%", color:"lime"}}></MdDirectionsBike>


                            Market <GiSpinningSword style={{fontSize:"132%", color: "blueviolet"}}/> place
                           <IoBeer style={{fontSize:"135%", color: "#f5dc1d"}} />
                        </span>

                    </a>

                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={clickHamburger}    // <=
                        data-toggle="collapse"
                        data-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className={"collapse navbar-collapse " + showHamburger} id="navbarNav">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 text-center">


                            <li onClick={(e) => {
                                e.preventDefault();
                                navigate('/')
                            }}
                                className={`nav-item${pathMatchRoute("/") ? ' active' : ''}`}>
                                <a className="nav-link" href="/#"><span className="navbar-fonts"> Home </span></a>
                            </li>


                            {/*Sell iff logged in*/}
                            {pageState !== defaultPageState
                                ? <li onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/sell/bike')
                                }}
                                      className={`nav-item${pathMatchRoute("/sell/bike") ? ' active' : ''}`}>
                                    <a className="nav-link" href="/sell/bike"><span className="navbar-fonts">Sell</span></a>
                                </li>
                                : ""


                            }

                            <li onClick={(e) => {
                                e.preventDefault();
                                navigate("/bikes")
                            }}
                                className={`nav-item${pathMatchRoute("/bikes") ? ' active' : ''}`}>
                                <a href="/#" className="nav-link"><span className="navbar-fonts">Bikes</span></a>
                            </li>

                            <li onClick={(e) => {
                                e.preventDefault();
                                navigate("/knives")
                            }}
                                className={`nav-item${pathMatchRoute("/knives") ? ' active' : ''}`}>
                                <a href="/#" className="nav-link"><span className="navbar-fonts">Knives</span></a>
                            </li>

                            <li onClick={(e) => {
                                e.preventDefault();
                                navigate("/beers")
                            }}
                                className={`nav-item${pathMatchRoute("/beers") ? ' active' : ''}`}>
                                <a href="/#" className="nav-link"><span className="navbar-fonts">Beers</span></a>
                            </li>


                            <li onClick={(e) => {
                                e.preventDefault();
                                pageState === defaultPageState ? navigate("/sign-in") : navigate("/profile");
                            }}
                                className={`nav-item${
                                    (pathMatchRoute("/sign-in") || pathMatchRoute("/profile"))
                                        ? ' active'
                                        : ''}`}>
                                <a href="/#" className="nav-link"><span
                                    className="navbar-fonts">{pageState}</span></a>
                            </li>

                            {pageState === defaultPageState
                                ?
                                <li onClick={(e) => {
                                    e.preventDefault();
                                    navigate("/sign-up")
                                }}
                                    className={`nav-item${pathMatchRoute("/sign-up") ? ' active' : ''}`}>
                                    <a className="nav-link" href="/sign-up"><span
                                        className="navbar-fonts">Sign-Up</span></a>
                                </li>


                                : ""

                            }

                            {/*logout door*/}
                            {pageState !== defaultPageState
                                ? <li onClick={(e) => {
                                    e.preventDefault();
                                    onClickLogout();
                                }}
                                      className={`nav-item`}>
                                    <a className="nav-link" href="/sign-up">
                                        <span className="navbar-fonts">
                                            <TbDoorExit style={{marginBottom:"3px", fontSize:"165%"}} ></TbDoorExit>
                                        </span>
                                    </a>

                                </li>
                                : ""


                            }


                        </ul>

                    </div>


                </div>
            </nav>


        </>
    );
};

export default Header;