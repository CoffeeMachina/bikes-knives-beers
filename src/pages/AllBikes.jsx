import React, {Fragment, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import PageBanner from "../components/PageBanner";
import "../Cards/styles/BeerCard.css";
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
import BeerCard from "../Cards/BeerCard";
import LoadingSpinner from "../components/LoadingSpinner";
import BikeCard from "../Cards/BikeCard";

const AllBikes = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);
    const FIREBASE_STORE_COLLECTIONS = "bikes";
    const LIMIT_SCROLL = 3;
    const [lastFetched, setLastFetched] = useState(null);
    const navigate = useNavigate();
    //edit profile
    const [bikes, setBikes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingCards, setLoadingCards] = useState(false);

    useEffect(() => {
        async function fetchUserBikes() {
            try {
                //Reference ("address") to firebase firestore
                const bikeRef = collection(db, FIREBASE_STORE_COLLECTIONS);
                //query through the firestore
                const q = query(bikeRef,
                    orderBy("timestamp", "desc"),
                    limit(LIMIT_SCROLL * 2));
                const querySnap = await getDocs(q);
                const lastCard = querySnap.docs[querySnap.docs.length - 1]; //last element in that FB_document array
                setLastFetched(lastCard);

                const queryBikes = [];
                querySnap.forEach((doc) => {
                    return queryBikes.push({
                        id: doc.id,
                        data: doc.data()
                    });
                });
                setBikes(queryBikes)
                setLoading(false);

            } catch (e) {
                console.log("Initial fetchUserBikes", e)
                toast.error(e)
            }
        }

        fetchUserBikes();
    }, [])

    async function fetchMoreCards() {
        try {
            setLoadingCards(true);
            //Reference ("address") to firebase firestore
            const bikeRef = collection(db, FIREBASE_STORE_COLLECTIONS);
            //query through the firestore
            const q = query(bikeRef,
                orderBy("timestamp", "desc"),
                startAfter(lastFetched),
                limit(LIMIT_SCROLL));
            const querySnap = await getDocs(q);
            // console.log("querySnap:",querySnap)
            const lastCard = querySnap.docs[querySnap.docs.length - 1]; //last element in that FB_document array
            setLastFetched(lastCard);

            const queryBikes = [];
            // console.log("queryBikes:", queryBikes.length, queryBikes)
            querySnap.forEach((doc) => {
                return queryBikes.push({
                    // queryBikes.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
            const snapshots = await Promise.all(queryBikes);
            // setBikes((prevState) => [...prevState, ...queryBikes]);
            setBikes((prevState) => [...prevState, ...snapshots]);

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
                        text={`Bike Market`}
                    />
                    <Link to="/sell/bike">
                        <button style={{marginBottom: "2rem", fontSize: "2.5rem"}} type="submit"
                                className="btn btn-primary profile-buttons">

                            <span style={{color: "#f1ff07"}}> Post New Bike </span>

                        </button>
                    </Link>
                    {/*CREATE NEW BEER BUTTON*/}
                    <div className="row">

                    </div>

                    {/*<div className="d-lg-flex flex-sm-row">*/}
                    <div className="row justify-content-center">
                        {!loading && bikes.length > 0 && (
                            <Fragment>
                                <div className="card-layout">
                                    <div className="row-cards">
                                        {bikes.map((bike) => (
                                            <BikeCard
                                                key={bike.id}
                                                // key={uu()}
                                                id={bike.id}
                                                bike={bike.data}
                                                imgUrls={bike.data.imgUrls}
                                            ></BikeCard>
                                        ))}
                                    </div>
                                </div>
                            </Fragment>
                        )}
                    </div>

                </div>
            </div>

            <div className="container">
                <div className="d-flex text-center form-center">
                    <div className="row">
                        {lastFetched ?
                            (<button style={{marginBottom: "2rem", fontSize: "2.5rem", cursor: "pointer"}} type="button"
                                     onClick={fetchMoreCards}
                                     className="btn btn-primary profile-buttons">

                                <span style={{color: "#f1ff07"}}> More Bikes </span>

                            </button>)
                            :

                            (<button style={{marginBottom: "2rem", fontSize: "2.5rem", cursor: "pointer"}} type="button"
                                     onClick={fetchMoreCards}
                                     hidden
                                     className="btn btn-primary profile-buttons">

                                <span style={{color: "#f1ff07"}}> More Bikes </span>

                            </button>)
                        }
                        {loadingCards ? (<LoadingSpinner/>) : ""}
                    </div>
                </div>
            </div>
        </>

    );
};

export default AllBikes;