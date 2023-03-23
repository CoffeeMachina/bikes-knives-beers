import React, {useEffect, useState} from 'react';
import "./styles/SignIn.css";
import girl from "../../src/assets/images/yaaasqueen.jpg";
import {Link, useNavigate} from "react-router-dom";
import OAuth from "../components/OAuth";
import "./styles/SignIn.css";
import {getAuth, sendPasswordResetEmail, signInWithEmailAndPassword} from "firebase/auth";
import { toast } from "react-toastify";
import PageBanner from "../components/PageBanner";

const ForgotPassword = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);

    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    const onChange = (e) => {
        setEmail(e.target.value)
    }

    const onSubmitForgotPassword = async (e) =>{
        e.preventDefault();
        try {
            const auth = getAuth();
            // get user crendentials
           await sendPasswordResetEmail(auth, email)
            toast.success(`Email was sent to ${email}. (👻Please check Junk mail folder!)`)


        } catch (err) {
            console.log(err)
            toast.error("Bad user credentials.")

        }


    }

    return (
        <>
            <div className="container">
                <div className="text-center">
                    <PageBanner text="Reset Password"/>
                </div>

                <div className="row justify-content-center">
                    <div className="col-md-9 text-lg-center col-lg-6">
                        <img className="img-fluid girl-photo" src={girl} alt="girl on bicycle"/>

                    </div>

                    <div className="col-lg-6">
                        <div>
                            <form
                                className={"form-div"}
                                style={{width: "600px"}}
                                onSubmit={onSubmitForgotPassword}
                            >


                                <div className="mb-3">
                                    <label
                                        htmlFor="email"
                                        className="form-label"
                                    >Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={onChange}
                                        placeholder="Email address"
                                        className="form-control"
                                        aria-describedby="emailHelp"
                                    />
                                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.
                                    </div>
                                </div>


                                <div className="mb-3">

                                    <div style={{display: "flex", justifyContent: "space-between"}}>
                                        <div id="emailHelpNewAccount" className="form-text">Don't have an account? <br/><Link
                                            to="/sign-up">New Account</Link></div>
                                        <div id="emailHelpNewPassword" className="form-text">Forgot your password?<br/>
                                            <Link to="/forgot-password">Reset Password </Link></div>

                                    </div>


                                    <button style={{marginTop: "5px", color: "plum"}} type="submit"
                                            className="btn btn-primary form-control shadow-lg text-uppercase">
                                        Reset Password via Email <i className="fa-solid fa-key"></i>
                                    </button>

                                    <OAuth></OAuth>

                                </div>

                            </form>
                        </div>
                    </div>

                </div>
            </div>



        </>
    );
};
export default ForgotPassword;
