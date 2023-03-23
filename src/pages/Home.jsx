import React, {Fragment, useEffect, useState} from 'react';
import PageBanner from "../components/PageBanner";
import {collection, getDocs, limit, orderBy, query, startAfter} from "firebase/firestore";
import {db} from "../firebase";
import {toast} from "react-toastify";
import BikeCard from "../Cards/BikeCard";
import "./styles/Home.css";
import {Link, useNavigate} from "react-router-dom";
import KnifeCard from "../Cards/KnifeCard";
import BeerCard from "../Cards/BeerCard";

const Home = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);
    const CARD_BIKE_LIMIT = 3;
    const CARD_KNIFE_LIMIT = 3;
    const CARD_BEER_LIMIT = 3;

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [bikes, setBikes] = useState(null);
    const [lastFetchedBike, setLastFetchedBike] = useState(null);
    /*KNIVES*/
    const [knives, setKnives] = useState(null);
    const [lastFetchedKnife, setLastFetchedKnife] = useState(null);
    // BEERS\
    const [beers, setBeers] = useState(null);
    const [lastFetchedBeer, setLastFetchedBeer] = useState(null);


    /*BIKES*/
    useEffect(() => {
        async function fetchUserBikes() {
            try {
                //Reference ("address") to firebase firestore
                const bikeRef = collection(db, "bikes");
                //query through the firestore
                const q = query(bikeRef,
                    orderBy("timestamp", "desc"),
                    limit(CARD_BIKE_LIMIT));
                const querySnap = await getDocs(q);
                const lastCardBike = querySnap.docs[querySnap.docs.length - 1]; //last element in that FB_document array
                setLastFetchedBike(lastCardBike);

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
    /*BIKES*/


    // KNIVES
    useEffect(() => {
        async function fetchUserKnives() {
            try {
                //Reference ("address") to firebase firestore
                const knifeRef = collection(db, "knives");
                //query through the firestore
                const q2 = query(knifeRef,
                    orderBy("timestamp", "desc"),
                    limit(CARD_KNIFE_LIMIT));
                const querySnap = await getDocs(q2);
                const lastCardKnife = querySnap.docs[querySnap.docs.length - 1]; //last element in that FB_document array
                setLastFetchedKnife(lastCardKnife);

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
    // KNIVES


    // BEERS
    useEffect(() => {
        async function fetchUserBeers() {
            try {
                const beerRef = collection(db, "beers");
                const q3 = query(beerRef,
                    orderBy("timestamp", "desc"),
                    limit(CARD_BEER_LIMIT));
                const querySnap = await getDocs(q3);
                const lastCardBeer = querySnap.docs[querySnap.docs.length - 1]; //last element in that FB_document array
                setLastFetchedBeer(lastCardBeer);

                const queryBeers = [];
                querySnap.forEach((doc) => {
                    return queryBeers.push({
                        id: doc.id,
                        data: doc.data()
                    });
                });
                setBeers(queryBeers)
                setLoading(false);

            } catch (e) {
                console.log("Initial fetchUserBeers", e)
                toast.error(e)
            }
        }

        fetchUserBeers();
    }, [])


    return (
        <div className="container">

            {/* BIKE BLOCK */}
            <div className="d-flex text-center form-center">
                <div className="text-center" style={{cursor: "pointer"}} onClick={() => {
                    navigate("/bikes")
                }}>
                    <PageBanner text="Bikes"/>
                </div>
                <div className="row justify-content-center">
                    {!loading && bikes?.length > 0 && (
                        <Fragment>
                            <div className="card-layout">
                                <div className="row-cards">
                                    {bikes.map((bike) => (
                                        <BikeCard
                                            key={bike.id}
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
                <div className="row">
                    <Link to="/bikes">
                        <button style={{marginBottom: "2rem", fontSize: "2.5rem"}} type="submit"
                                className="btn btn-primary profile-buttons">

                            <span style={{color: "#f1ff07"}}> See All Bikes </span>

                        </button>
                    </Link>
                </div>


            </div>
            {/* BIKE BLOCK */}

            {/*KNIFE BLOCK*/}
            <div className="d-flex text-center form-center">
                <div className="text-center" style={{cursor: "pointer"}} onClick={() => {
                    navigate("/knives")
                }}>
                    <PageBanner text="Knives"/>
                </div>
                <div className="row justify-content-center">
                    {!loading && knives?.length > 0 && (
                        <Fragment>
                            <div className="card-layout">
                                <div className="row-cards text-start">
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
                </div>
                <div className="row">
                    <Link to="/knives">
                        <button style={{marginBottom: "2rem", fontSize: "2.5rem"}} type="submit"
                                className="btn btn-primary profile-buttons">
                            <span style={{color: "#f1ff07"}}> Sell All Knives </span>
                        </button>
                    </Link>
                </div>
            </div>
            {/*KNIFE BLOCK*/}

            {/*BEER BLOCK*/}
            <div className="d-flex text-center form-center">
                <div className="text-center" style={{cursor: "pointer"}} onClick={() => {
                    navigate("/beers")
                }}>
                    <PageBanner text="Beers"/>
                </div>
                <div className="row justify-content-center">
                    {!loading && beers?.length > 0 && (
                        <Fragment>
                            <div className="card-layout">
                                <div className="row-cards">

                                    {beers.map((beer) => (
                                        <BeerCard
                                            key={beer.id}
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
                <div className="row">
                    <button style={{marginBottom: "2rem", fontSize: "2.5rem"}} type="submit"
                            className="btn btn-primary profile-buttons"
                            onClick={() => {
                                navigate("/beers")
                            }}>
                        <span style={{color: "#f1ff07"}}> See All Beers </span>
                    </button>
                </div>

            </div>


            {/*BEER BLOCK*/}

            <div className="row text-center my-2">

                <h3 className=" display-6">Made with ❤️ by DDH
                    <button onClick={() => {
                        navigate("/updates")
                    }} className="btn btn-primary mx-2 my-4">Updates</button>
                </h3>


            </div>

        </div>


    );
};

export default Home;