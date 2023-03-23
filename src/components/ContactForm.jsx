import React, {useEffect, useState} from 'react';
import {doc, getDoc} from "firebase/firestore";
import {db} from "../firebase";
import {toast} from "react-toastify";
import "./styles/ContactForm.css";
import PageBanner from "./PageBanner";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import PageBeer from "../pages/PageBeer";

const ContactForm = ({userRef, listing, name = "user"}) => {
    const [seller, setSeller] = useState(null);
    const [spoiler, setSpoiler] = useState(false);
    const [message, setMessage] = useState("");
    const [showMessage, setShowMessage] = useState(false);
    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            //if user authenticated:
            if (user) {
                setShowMessage(true)
            }
        })

    }, [auth])


    useEffect(() => {
        const getSeller = async () => {
            const docRef = doc(db, "users", userRef)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSeller(docSnap.data())
            } else {
                toast.error("Seller data not available.")
            }
        }
        getSeller();
    }, [userRef])

    return (
        <>
            {/*{spoiler}*/}

            {/*<PageBanner text={seller !== null ? seller.email : ""} ></PageBanner>*/}
            {showMessage ? (
                <form action="">
                    <div className="mb-3">
                        <label style={{display: "flex", justifyContent: "center"}}
                               htmlFor="message"
                               className="form-">
                            {/*Send {seller !== null && listing.name} a message.*/}
                            {/*{seller !== null && <PageBanner text={`Send ${listing?.name} a message:`}></PageBanner>}*/}
                            {seller !== null && <PageBanner text={`Send ${name ? name : ""} a message:`}></PageBanner>}

                        </label>
                    </div>
                    <div className="mb-3" style={{display: "flex", justifyContent: "center"}}>
                    <textarea
                        id="message"
                        name="message"
                        value={message}
                        onChange={(m) => {
                            setMessage(m.target.value)
                        }}

                        rows="2"
                        placeholder="Hello...."
                        className="form-control"
                        style={{maxWidth: "750px"}}
                    />

                    </div>
                    <div className="row justify-content-center">

                        <a style={{display: "flex", justifyContent: "center"}}
                           href={`mailto:${seller !== null && seller.email}?Subject=${seller !== null && auth.currentUser.displayName}&body=${message}`}>
                            <button type="button" className="btn btn-primary">
                                send message
                            </button>

                        </a>
                    </div>
                    <div>

                    </div>
                </form>
            )
            :
                (
                    <div className="row justify-content-center text-center">
                        <PageBanner text="Sign-in to send message."></PageBanner>
                    </div>
                )
            }


        </>
    );
};

export default ContactForm;