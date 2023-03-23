import {async} from "@firebase/util";
import React, {Fragment, useEffect, useState} from 'react';
import {v4 as uu} from 'uuid';
import {Link, useNavigate} from "react-router-dom";
import PageBanner from "../components/PageBanner";
// import "./styles/AllBeers.css";
import "../Cards/styles/BeerCard.css";
import {getAuth, updateProfile} from "firebase/auth";
import {toast} from "react-toastify";
import {
    collection,
    doc,
    updateDoc,
    deleteDoc,
    getDocs,
    orderBy,
    query,
    where,
    getDoc,
    limit,
    startAfter
} from "firebase/firestore";
import {db} from "../firebase";
import BeerCard from "../Cards/BeerCard";
import LoadingSpinner from "../components/LoadingSpinner";


const AllBeers = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);
    const LIMIT_SCROLL = 3;
    const [ready, setReady] = useState(true);
    let imagesLoaded = 0;

    function imageLoaded(n) {
        if (n === LIMIT_SCROLL) {
            // console.log("NEXT PAGE!")
            setReady(true);
            // console.log("ready =", ready)
        }
        // console.log("Image Loaded")
    }


    const [lastFetched, setLastFetched] = useState(null);
    const FIREBASE_STORE_COLLECTIONS = "beers";
    const navigate = useNavigate();
    //edit profile
    const [changeDetail, setChangeDetail] = useState(false);
    const [beers, setBeers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingCards, setLoadingCards] = useState(false);

    useEffect(() => {
        async function fetchUserBeers() {
            try {
                //Reference ("address") to firebase firestore
                const beerRef = collection(db, FIREBASE_STORE_COLLECTIONS);
                //query through the firestore
                const q = query(beerRef,
                    orderBy("timestamp", "desc"),
                    limit(6));
                const querySnap = await getDocs(q);
                const lastCard = querySnap.docs[querySnap.docs.length - 1]; //last element in that FB_document array
                setLastFetched(lastCard);

                const queryBeers = [];
                querySnap.forEach((doc) => {
                    //push into queryListings collection:
                    return queryBeers.push({
                        id: doc.id,
                        data: doc.data()
                    });
                });
                setBeers(queryBeers)
                // imageLoaded(6);
                setLoading(false);

            } catch (e) {
                console.log("Initial fetchUserBeers", e)
                toast.error(e)
            }
        }

        fetchUserBeers();
    }, [])

    async function fetchMoreCards() {
        try {
            setLoadingCards(true);
            //Reference ("address") to firebase firestore
            const beerRef = collection(db, FIREBASE_STORE_COLLECTIONS);
            //query through the firestore
            const q = query(beerRef,
                orderBy("timestamp", "desc"),
                startAfter(lastFetched),
                limit(LIMIT_SCROLL));
            const querySnap = await getDocs(q);
            // console.log("querySnap:",querySnap)
            const lastCard = querySnap.docs[querySnap.docs.length - 1]; //last element in that FB_document array
            setLastFetched(lastCard);

            const queryBeers = [];
            // console.log("queryBeers:", queryBeers.length, queryBeers)
            querySnap.forEach((doc) => {
                //push into queryListings collection:
                return queryBeers.push({
                    // queryBeers.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
            const snapshots = await Promise.all(queryBeers);
            // setBeers((prevState) => [...prevState, ...queryBeers]);
            setBeers((prevState) => [...prevState, ...snapshots]);

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
                        text={`Beer Market`}
                    />
                    <div className="row">
                        <Link to="/sell/beer">
                            <button style={{marginBottom: "2rem", fontSize: "2.5rem"}} type="submit"
                                    className="btn btn-primary profile-buttons">
                                <i
                                    style={{
                                        "--fa-secondary-opacity": 1.0, "--fa-primary-color": "#bdf678",
                                        "--fa-secondary-color": "#571ede"
                                    }}
                                    className="fa-duotone fa-beer-mug fa-flip-horizontal"></i>
                                <span style={{color: "#f1ff07"}}> Post New Beer </span>
                                <i
                                    style={{
                                        "--fa-secondary-opacity": 1.0, "--fa-primary-color": "#bdf678",
                                        "--fa-secondary-color": "#571ede"
                                    }}
                                    className="fa-duotone fa-beer-mug"></i>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>


            <div className="row justify-content-center">
                {!loading && beers.length > 0 && (
                    <Fragment>
                        <div className="card-layout">
                            <div className="row-cards">

                                {beers.map((beer) => (
                                    <BeerCard
                                        key={beer.id}
                                        // key={uu()}
                                        id={beer.id}
                                        beer={beer.data}
                                        imgUrls={beer.data.imgUrls}
                                    ></BeerCard>
                                ))}
                            </div>
                        </div>
                    </Fragment>
                )}
            </div>


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
                                <span style={{color: "#f1ff07"}}> More Beers </span>
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
                                <span style={{color: "#f1ff07"}}> More Beers </span>
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

export default AllBeers;