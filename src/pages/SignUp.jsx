import React, {useEffect, useState} from 'react';
import "./styles/SignIn.css";
import girl from "../../src/assets/images/yaaasqueen.jpg";
import {Link, useNavigate} from "react-router-dom";
import OAuth from "../components/OAuth";
import {db} from "../firebase";
import {getAuth, createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import {doc, serverTimestamp, setDoc} from "firebase/firestore";
import {toast} from "react-toastify";
import PageBanner from "../components/PageBanner";
import {TbDoorEnter} from "react-icons/tb";

const SignUp = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const {name, email, password} = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }))
    };


    const formOnSubmit = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth()
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            updateProfile(auth.currentUser, {
                displayName: name,
            })
            const user = userCredential.user;
            const formDataCopy = {...formData};
            delete formDataCopy.password;
            formDataCopy.timestamp = serverTimestamp();

            //add user to database
            await setDoc(doc(db, "users", user.uid), formDataCopy); //params: db, collections, user.uid

            //add time account was created. Server timestamp?

            console.log(user)
            // console.log("user keys: ", Object.keys(user))
            // console.log("user values: ", Object.values(user))
            toast.success(`Welcome ${user.displayName}! Your email sign-up was successful!`)
            navigate("/")

        } catch (error) {
            console.log("@SignUp.jsx: ", error)
            toast.error("Registration Failed. Try again or another email.")
        }


    }


    return (
        <>
            <div className="container">

                <div className="text-center">
                    <PageBanner
                        text="Sign Up"/>
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
                                onSubmit={formOnSubmit}
                            >
                                <div className="mb-3">
                                    <label
                                        htmlFor="name"
                                        className="form-label"
                                    >Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={onChange}
                                        placeholder="Elon Musk"
                                        className="form-control"
                                        aria-describedby="text"
                                    />
                                    <div id="emailHelp" className="form-text">We'll never share your email with anyone
                                        else.
                                    </div>
                                </div>

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
                                        placeholder="elon@tesla.com"
                                        className="form-control"
                                        aria-describedby="emailHelp"
                                    />
                                    <div id="emailHelp" className="form-text">We'll never share your email with anyone
                                        else.
                                    </div>
                                </div>


                                <div className="mb-3">
                                    <label
                                        htmlFor="password"
                                        className="form-label"
                                    >Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={onChange}
                                        placeholder="Enter a valid password"
                                        className="form-control"
                                        aria-describedby="emailHelp"

                                    />

                                    <div style={{display: "flex", justifyContent: "space-between"}}>
                                        {/*<div id="emailHelpNewAccount" className="form-text">*/}
                                        {/*    Don't have an*/}
                                        {/*    account? <br/><Link*/}
                                        {/*        to="/sign-up">New Account</Link>*/}
                                        {/*</div>*/}
                                        <div id="emailHelpNewPassword" className="form-text">Forgot your password?<br/>
                                            <Link to="/forgot-password">Reset Password </Link></div>

                                    </div>


                                    <button style={{marginTop: "5px", color: "plum"}} type="submit"
                                            className="btn btn-primary form-control shadow-lg text-uppercase"> Sign
                                        up <TbDoorEnter style={{fontSize: "175%"}}></TbDoorEnter>
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
export default SignUp;
