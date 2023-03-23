import React, {useEffect, useState} from 'react';
import "./styles/SignIn.css";
import girl from "../../src/assets/images/yaaasqueen.jpg";
import {Link, useNavigate} from "react-router-dom";
import OAuth from "../components/OAuth";
import {signInWithEmailAndPassword, getAuth} from "firebase/auth";
import {toast} from "react-toastify";
import PageBanner from "../components/PageBanner";
import {TbDoorEnter} from "react-icons/tb";


const SignIn = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const {email, password} = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }))
    }
    const onSubmitSignIn = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            // get user crendentials
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const userName = userCredential.user.displayName;
            console.log(userName)
            if (userCredential) {
                toast.success(`Welcome Back,  ${userName}! You are signed in with ${email}`)
                navigate("/")


            }
            if (!userCredential) {
                toast.error("Invalid credentials. Try again please!")

            }


        } catch (err) {
            console.log(err)
            toast.error("Bad user credentials.")

        }
    }


    return (
        <>
            <div className="container">
                <div className="text-center">
                    <PageBanner text="Sign In"></PageBanner>
                </div>

                <div className="row justify-content-center align-items-center">
                    <div className="col-md-8 text-lg-center col-lg-6">

                        <img className="img-fluid girl-photo" src={girl} alt="girl on bicycle"/>

                    </div>

                    <div className="col-lg-6">

                        <div>
                            <form
                                className="form-div"
                                style={{width: "600px"}}
                                onSubmit={onSubmitSignIn}
                            >
                                <div className="row">
                                    <div className="row">
                                        <label
                                            htmlFor="email"
                                            className="form-label"
                                        >Email Address</label>

                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={onChange}
                                            placeholder="elon@whitehouse.gov"
                                            className="form-control"
                                            aria-describedby="emailHelp"
                                        />
                                        <small id="emailHelp" className="form-text text-muted">
                                            We'll never share your email with anyone else.
                                        </small>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="row">
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
                                            <div id="emailHelpNewAccount" className="form-text">Don't have an
                                                account? <br/><Link
                                                    to="/sign-up">New Account</Link></div>
                                            <div id="emailHelpNewPassword" className="form-text">Forgot your
                                                password?<br/>
                                                <Link to="/forgot-password"> Reset Password </Link></div>

                                        </div>


                                        <button style={{marginTop: "5px", color: "plum"}} type="submit"
                                                className="btn btn-primary form-control text-uppercase"> Sign in <TbDoorEnter style={{fontSize:"175%"}}></TbDoorEnter>
                                        </button>


                                        <OAuth></OAuth>


                                    </div>
                                </div>

                            </form>

                        </div>

                    </div>
                </div>


            </div>


        </>
    );
};
export default SignIn;
