import React, {Fragment, useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../firebase";
import LoadingSpinner from "../components/LoadingSpinner";
import {Swiper, SwiperSlide} from "swiper/react";
import SwiperCore, {EffectFade, Autoplay, Navigation, Pagination} from "swiper";
import "swiper/css/bundle";
import "./styles/PageItem.css";
import {getAuth} from "firebase/auth";
import ContactForm from "../components/ContactForm";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import BeerCard from "../Cards/BeerCard";

const PageBeer = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);
    SwiperCore.use([Autoplay, Navigation, Pagination]);

    const FIREBASE_STORE_COLLECTIONS = "beers";
    const auth = getAuth();
    const params = useParams();

    const [beer, setBeer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contactSeller, setContactSeller] = useState(false);

    // console.log(beer)
    useEffect(() => {
        const fetchBeer = async () => {
            const docRef = doc(db, FIREBASE_STORE_COLLECTIONS, params.beerId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setBeer(docSnap.data());
                setLoading(false);
            }
        };
        fetchBeer();
    }, [params.beerId])

    if (loading) {
        return (
            <LoadingSpinner></LoadingSpinner>
        )
    }
    return (
        <Fragment>
            <main>
                <div className="container-lg">
                    <Swiper
                        style={{color: "#ff2961", fontSize: "1.72rem"}}
                        slidesPerView={1}
                        navigation
                        // pagination={{type: "progressbar"}}
                        pagination={{type: "bullets"}}
                        effect="fade"
                        module={[EffectFade, Pagination]}
                        autoplay={{delay: 1900}}

                    >
                        {beer.imgUrls.map((url, i) => (
                            <SwiperSlide
                                key={i}
                            >
                                <div
                                    className="swiper-slide-style"
                                    style={{
                                        background: `url(${beer.imgUrls[i]}) center no-repeat`,
                                        backgroundSize: "contain"
                                    }}>

                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>


                    {/*<BottomBar></BottomBar>*/}

                    <div className="d-flex flex-row justify-content-center">
                        {/*<PageBanner text="Contact Seller" />*/}
                    </div>

                    <div className="row">
                        {/*protect loads via beer?.userRef just in case cannot load*/}
                        {/*protect button by adding ?-mark in case page does not load in time*/}
                        {beer.userRef !== auth.currentUser?.uid && !contactSeller &&
                            (
                                <div className="row justify-content-center mt-3">
                                    <button
                                        onClick={() => {
                                            setContactSeller(!contactSeller)
                                        }}
                                        style={{maxWidth: "750px"}} className="btn btn-primary" type="button">
                                        Contact Seller
                                    </button>
                                </div>
                            )}

                        {contactSeller ? (
                            <ContactForm userRef={beer.userRef} beer={beer} name={beer.sellerName}/>) : ""}

                    </div>

                    <div style={{marginTop: "15px"}} className="d-flex flex-row justify-content-center">
                        <div className="row">
                            <div className="col-6">
                                <BeerCard
                                    key={params.beerId}
                                    // key={uu()}
                                    id={params.beerId}
                                    beer={beer}
                                    imgUrls={beer.imgUrls}
                                ></BeerCard>

                            </div>
                        </div>

                    </div>


                    {beer.geolocation.lat !== 0 && beer.geolocation.lng !== 0 && (<div className="row justify-content-center">
                        <div className=" d-lg-inline-flex flex-column div-map-region div-map">
                            <MapContainer
                                center={[beer.geolocation.lat, beer.geolocation.lng]}
                                zoom={13}
                                scrollWheelZoom={true}
                                style={{height: "65%", width: "100%"}}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker
                                    position={[beer.geolocation.lat, beer.geolocation.lng]}
                                >
                                    <Popup>
                                        {beer.address}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>)}

                </div>

            </main>

        </Fragment>
    );


};

export default PageBeer;