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
import BikeCard from "../Cards/BikeCard";

const PageBike = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);
    SwiperCore.use([Autoplay, Navigation, Pagination]);

    const FIREBASE_STORE_COLLECTIONS = "bikes";
    const auth = getAuth();
    const params = useParams();

    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contactSeller, setContactSeller] = useState(false);

    // console.log(bike)
    useEffect(() => {
        const fetchBike = async () => {
            const docRef = doc(db, FIREBASE_STORE_COLLECTIONS, params.bikeId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setBike(docSnap.data());
                setLoading(false);
            }
        };
        fetchBike();
    }, [params.bikeId])

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
                        {bike.imgUrls.map((url, i) => (
                            <SwiperSlide
                                key={i}
                            >
                                <div
                                    className="swiper-slide-style"
                                    style={{
                                        background: `url(${bike.imgUrls[i]}) center no-repeat`,
                                        backgroundSize: "contain"
                                    }}>

                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>


                    <div className="row">
                        {/*protect loads via beer?.userRef just in case cannot load*/}
                        {/*protect button by adding ?-mark in case page does not load in time*/}
                        {bike.userRef !== auth.currentUser?.uid && !contactSeller &&
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
                            <ContactForm userRef={bike.userRef} bike={bike} name={bike.sellerName}/>) : ""}

                    </div>

                    <div style={{marginTop: "15px"}} className="d-flex flex-row justify-content-center">
                        <div className="row">
                            <div className="col-6">
                                <BikeCard
                                    key={params.bikeId}
                                    id={params.bikeId}
                                    bike={bike}
                                    imgUrls={bike.imgUrls}
                                ></BikeCard>

                            </div>
                        </div>

                    </div>


                    {bike.geolocation.lat !== 0 && bike.geolocation.lng !== 0 && (
                        <div className="row justify-content-center">
                            <div className=" d-lg-inline-flex flex-column div-map-region div-map">
                                <MapContainer
                                    center={[bike.geolocation.lat, bike.geolocation.lng]}
                                    zoom={13}
                                    scrollWheelZoom={true}
                                    style={{height: "65%", width: "100%"}}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker
                                        position={[bike.geolocation.lat, bike.geolocation.lng]}
                                    >
                                        <Popup>
                                            {bike.address}
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

export default PageBike;