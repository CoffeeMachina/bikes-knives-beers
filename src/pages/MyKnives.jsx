import React, {Fragment, useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import KnifeCard from "../Cards/KnifeCard";
import "../Cards/styles/KnifeCard.css";
import PageBanner from "../components/PageBanner";
import {getAuth, updateProfile} from "firebase/auth";
import {toast} from "react-toastify";
import {collection, doc, updateDoc, deleteDoc, getDocs, orderBy, query, where, getDoc} from "firebase/firestore";
import {db} from "../firebase";
import {deleteObject, getStorage, ref} from "firebase/storage";

const MyKnives = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);
    const FIREBASE_STORE_COLLECTIONS = "knives";
    const navigate = useNavigate();
    const auth = getAuth();
    //edit profile
    const [changeDetail, setChangeDetail] = useState(false);
    const [knives, setKnives] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: auth.currentUser.displayName,
        email: auth.currentUser.email,
        profilePicture: auth.currentUser.photoURL,

    });
    const {name, email, profilePicture} = formData;
    const onClickLogout = async (e) => {
        await auth.signOut();
        //send user to home page after signout
        toast.success(`You have successfully signed out from ${email}`)
        navigate("/")
    }

    // //apply useRef for focus shift to Inputfield
    const inputRef = useRef();

    const focus = () => {
        inputRef.current.focus();
    }

    //focus on form
    useEffect(() => {
        focus()
    }, [changeDetail])

    useEffect(() => {
        const fetchUserKnives = async () => {
            //Reference ("address") to firebase firestore
            const knifeRef = collection(db, FIREBASE_STORE_COLLECTIONS);
            //query through the firestore
            const q = query(knifeRef, where("userRef", "==", auth.currentUser.uid), orderBy("timestamp", "desc"));
            const querySnap = await getDocs(q);
            let queryKnives = [];
            querySnap.forEach((doc) => {
                //push into queryListings collection:
                return queryKnives.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
            setKnives(queryKnives);
            setLoading(false);
        }
        fetchUserKnives();
    }, [auth.currentUser.uid])
    const onChangeName = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }))
    }

    const parseFileNameDelete = (file) => {
        const parse1 = file.substring(file.lastIndexOf("/") + 1);
        return decodeURI(parse1.substring(0, parse1.lastIndexOf("?")))
    }

    async function deleteImage(imageToDelete, index, docName) {
        const imageName = imageToDelete;
        // imageToDelete : parsedFilename on firebase/storage
        return new Promise(async (resolve, reject) => {
            const storage = getStorage();
            const deleteRef = ref(storage, imageToDelete)
            deleteObject(deleteRef)
                .then(() => {
                    // console.log(`SUCCESSFULLY DELETED: ${imageName.slice(0,15)}...`)
                    toast.success(`Deleted Image ${index + 1} from ${docName}`)
                }).catch((error) => {
                console.log("Error deleting image: ", error)
                toast.error("Error Deleting Image.")
            })

        })
    }

    //DELETE FROM COLLECTION
    const onDelete = async (docId, docName, imgUrls) => {
        console.log('test on delete docId', docId)
        console.log("IMGURLS FROIM CARD: ", imgUrls)
        // const nameToDelete = docName;
        // console.log("@Profile.jsx _ onDelete: ", docName)
        //prompt window @ user // add modal to improve?
        if (window.confirm(`Are you sure you want to delete ${docName}?`)) {
            //knife REMOVAL PROCESS  ~ WORKING.
            await deleteDoc(doc(db, FIREBASE_STORE_COLLECTIONS, docId))
            const updatedKnives = knives.filter((knife) => knife.id !== docId);
            setKnives(updatedKnives); //refresh with updated listings
            // storage removal process: promises broken

            try {
                const deleteImagesQueue = await Promise.all(
                    [...imgUrls].map((image, index) => deleteImage(image, index, docName))
                ).catch((error) => {
                    setLoading(false);
                    console.log("Did not delete: ERROR", error)
                    // toast.error("Images did not delete")
                    return;

                })
                // toast.success(`Successfully deleted ${listingName}.`)


            } catch (e) {
                console.log("ERROR DELETE:", e)
            }
        }

    }

    const onEdit = (docId) => {
        // toast.success("knife Edit coming soon!")
        navigate(`/edit-knife/${docId}`);
    }

    //add name change to database
    const submitNameChange = async () => {
        try {
            if (auth.currentUser.displayName !== name) {
                //update displayName in firebase auth
                await updateProfile(auth.currentUser, {
                    displayName: name,
                });
                //update name in the firestore
                const docRef = doc(db, "users", auth.currentUser.uid)
                await updateDoc(docRef, {
                    name
                })

                toast.success(`Profile details updated to ${name}`)
            }

        } catch (error) {
            toast.error("Could not update profile detail")
        }

    }
    return (
        <>
            <div className="container">
                <div className="d-flex text-center form-center ">
                    <PageBanner
                        text={`${name}`}/>

                    <div className="row">

                        {/*CREATE NEW knife BUTTON*/}
                        <Link to="/sell/knife">
                            <button style={{marginBottom: "2rem", fontSize: "2.5rem"}} type="submit"
                                    className="btn btn-primary profile-buttons">
                                <i
                                    style={{
                                        "--fa-secondary-opacity": 1.0, "--fa-primary-color": "#bdf678",
                                        "--fa-secondary-color": "#571ede"
                                    }}
                                    className="fa-duotone fa-knife-kitchen fa-flip-horizontal"></i>
                                <span style={{color: "#f1ff07"}}> Post New Knife </span>
                                <i
                                    style={{
                                        "--fa-secondary-opacity": 1.0, "--fa-primary-color": "#bdf678",
                                        "--fa-secondary-color": "#571ede"
                                    }}
                                    className="fa-duotone fa-knife-kitchen"></i>
                            </button>
                        </Link>
                    </div>


                    {/*<div className="d-lg-flex flex-sm-row">*/}
                    <div className="row justify-content-center">
                        <div className="row justify-content-center">
                            <form>
                                <div className="row justify-content-center">
                                    <div className="col-lg-12">
                                        <label
                                            htmlFor="name"
                                            className="form-label"
                                        >My Account</label>
                                        <input
                                            style={changeDetail ? {color: "indianred"} : {color: "lightslategray"}}

                                            type="text"
                                            id="name"
                                            name="name"
                                            value={name}
                                            placeholder="John Wick"
                                            className="form-control shadow-lg"
                                            aria-describedby="emailHelp"
                                            disabled={!changeDetail}
                                            onChange={onChangeName}
                                            ref={inputRef}
                                        />
                                    </div>

                                </div>

                                {/*email*/}
                                <div className="row justify-content-center">
                                    <div className="col-lg-12">

                                        <label
                                            htmlFor="email"
                                            className="form-label"
                                        >Email</label>
                                        <input
                                            style={changeDetail ? {color: "lightslategray"} : {color: "lightslategray"}}
                                            type="text"
                                            id="email"
                                            name="email"
                                            value={email}
                                            placeholder="John Wick"
                                            className="form-control shadow-lg"
                                            aria-describedby="emailHelp"
                                            disabled
                                        />
                                    </div>

                                    {/*EDIT NAME // APPLY CHANGES*/}
                                    <div
                                        style=
                                            {{
                                                display: "flex",
                                                justifyContent: "space-evenly",
                                                color: "slateblue"
                                            }}
                                        id="nameHelp"
                                        className="mb-3">
                                        <span
                                            className="edit-name-sign-out-font"
                                            onClick={() => {
                                                changeDetail && submitNameChange()
                                                setChangeDetail((prevState) => !prevState)

                                            }}
                                            // onClick={() => { func1(); func2();}}

                                            style={{
                                                color: `${changeDetail ? 'firebrick' : 'slateblue'} `,
                                                cursor: "pointer"
                                            }}
                                        >
                                            {changeDetail ? "Apply changes" : "edit name"}
                                        </span>
                                        {/*SIGN OUT DOOR ICON*/}
                                        <span
                                            style={{cursor: "pointer"}}
                                            className="link-primary edit-name-sign-out-font"
                                            onClick={onClickLogout}
                                        >Sign Out</span>

                                    </div>

                                </div>


                            </form>
                        </div>

                    </div>

                </div>
            </div>

            <div>


                {!loading && knives.length > 0 && (


                    <Fragment>
                        <div className="card-layout">
                            <PageBanner
                                text={`Your Knives`}
                            />

                            <div className="row-cards">

                                {knives.map((knife) => (
                                    <KnifeCard
                                        key={knife.id}
                                        id={knife.id}
                                        knife={knife.data}
                                        imgUrls={knife.data.imgUrls}
                                        onDelete={() => onDelete(knife.id, knife.data.model, knife.data.imgUrls)}
                                        onEdit={() => onEdit(knife.id)}
                                    ></KnifeCard>
                                ))}
                            </div>


                        </div>


                    </Fragment>


                )}


            </div>


        </>

    );
};

export default MyKnives;