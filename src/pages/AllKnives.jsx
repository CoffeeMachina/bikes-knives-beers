import {async} from "@firebase/util";
import React, {Fragment, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import PageBanner from "../components/PageBanner";
import "../Cards/styles/KnifeCard.css";
import {toast} from "react-toastify";
import {
    collection,
    getDocs,
    orderBy,
    query,
    limit,
    startAfter
} from "firebase/firestore";
import {db} from "../firebase";
import LoadingSpinner from "../components/LoadingSpinner";
import KnifeCard from "../Cards/KnifeCard";

const AllKnives = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);
    const FIREBASE_STORE_COLLECTIONS = "knives";
    const LIMIT_SCROLL = 3;
    const [ready, setReady] = useState(true);
    let imagesLoaded = 0;

    function imageLoaded(n) {
        if (n === LIMIT_SCROLL) {
            // console.log("NEXT PAGE!")
            setReady(true);
            console.log("ready =", ready)
        }
        console.log("Image Loaded")
    }

    const [lastFetched, setLastFetched] = useState(null);
    const navigate = useNavigate();
    //edit profile
    const [changeDetail, setChangeDetail] = useState(false);
    const [knives, setKnives] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingCards, setLoadingCards] = useState(false);

    useEffect(() => {
        async function fetchUserKnives() {
            try {
                //Reference ("address") to firebase firestore
                const knifeRef = collection(db, FIREBASE_STORE_COLLECTIONS);
                //query through the firestore
                const q = query(knifeRef,
                    orderBy("timestamp", "desc"),
                    limit(LIMIT_SCROLL * 2));
                const querySnap = await getDocs(q);
                const lastCard = querySnap.docs[querySnap.docs.length - 1]; //last element in that FB_document array
                setLastFetched(lastCard);

                const queryKnives = [];
                querySnap.forEach((doc) => {
                    return queryKnives.push({
                        id: doc.id,
                        data: doc.data()
                    });
                });
                setKnives(queryKnives)
                setLoading(false);

            } catch (e) {
                console.log("Initial fetchUserKnives", e)
                toast.error(e)
            }
        }

        fetchUserKnives();
    }, [])

    async function fetchMoreCards() {
        try {
            setLoadingCards(true);
            //Reference ("address") to firebase firestore
            const knifeRef = collection(db, FIREBASE_STORE_COLLECTIONS);
            //query through the firestore
            const q = query(knifeRef,
                orderBy("timestamp", "desc"),
                startAfter(lastFetched),
                limit(LIMIT_SCROLL));
            const querySnap = await getDocs(q);
            // console.log("querySnap:",querySnap)
            const lastCard = querySnap.docs[querySnap.docs.length - 1]; //last element in that FB_document array
            setLastFetched(lastCard);

            const queryKnives = [];
            // console.log("queryKnives:", queryKnives.length, queryKnives)
            querySnap.forEach((doc) => {
                return queryKnives.push({
                    // queryKnives.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
            const snapshots = await Promise.all(queryKnives);
            // setKnives((prevState) => [...prevState, ...queryKnives]);
            setKnives((prevState) => [...prevState, ...snapshots]);

            imageLoaded(6);
            setLoading(false);
            setLoadingCards(false);
        } catch (e) {
            console.log("ERROR fetchMoreCards():", e)
            toast.error(e)
        }
    }

    return (
        <>
            <div className="container">
                <div className="d-flex text-center form-center">
                    <PageBanner
                        text={`Knife Market`}
                    />
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
            </div>

            {!loading && knives.length > 0 && (
                <Fragment>
                    <div className="card-layout">
                        <div className="row-cards">
                            {knives.map((knife) => (
                                <KnifeCard
                                    key={knife.id}
                                    id={knife.id}
                                    knife={knife.data}
                                    imgUrls={knife.data.imgUrls}
                                ></KnifeCard>
                            ))}
                        </div>
                    </div>
                </Fragment>
            )}

            <div className="container">
                <div className="d-flex text-center form-center">
                    <div className="row">
                        {lastFetched ?
                            (<button style={{marginBottom: "2rem", fontSize: "2.5rem", cursor: "pointer"}} type="button"
                                     onClick={fetchMoreCards}
                                     className="btn btn-primary profile-buttons">
                                <i
                                    style={{
                                        "--fa-secondary-opacity": 1.0, "--fa-primary-color": "#bdf678",
                                        "--fa-secondary-color": "#571ede"
                                    }}
                                    className="fa-duotone fa-arrow-down-short-wide fa-flip-horizontal"></i>
                                <span style={{color: "#f1ff07"}}> More Knives </span>
                                <i
                                    style={{
                                        "--fa-secondary-opacity": 1.0, "--fa-primary-color": "#bdf678",
                                        "--fa-secondary-color": "#571ede"
                                    }}
                                    className="fa-duotone fa-arrow-down-short-wide"></i>
                            </button>)
                            :

                            (<button style={{marginBottom: "2rem", fontSize: "2.5rem", cursor: "pointer"}} type="button"
                                     onClick={fetchMoreCards}
                                     hidden
                                     className="btn btn-primary profile-buttons">
                                <i
                                    style={{
                                        "--fa-secondary-opacity": 1.0, "--fa-primary-color": "#bdf678",
                                        "--fa-secondary-color": "#571ede"
                                    }}
                                    className="fa-duotone fa-arrow-down-short-wide fa-flip-horizontal"></i>
                                <span style={{color: "#f1ff07"}}> More Knives </span>
                                <i
                                    style={{
                                        "--fa-secondary-opacity": 1.0, "--fa-primary-color": "#bdf678",
                                        "--fa-secondary-color": "#571ede"
                                    }}
                                    className="fa-duotone fa-arrow-down-short-wide"></i>
                            </button>)

                            // <h1 className="display1">No more Beer.</h1>
                            // <LoadingSpinner></LoadingSpinner>
                        }
                        {loadingCards ? (<LoadingSpinner/>) : ""}
                    </div>
                </div>
            </div>
        </>

    );
};

export default AllKnives;