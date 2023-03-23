import React, {useEffect, useState} from 'react';
import {collection, getDocs, limit, orderBy, query} from "firebase/firestore";
import {db} from "../firebase";
import LoadingSpinner from "./LoadingSpinner";
import {Swiper, SwiperSlide} from "swiper/react";
import SwiperCore, {EffectFade, Autoplay, Navigation, Pagination} from "swiper";
import "swiper/css/bundle";
import "./styles/Slider.css";
import {useNavigate} from "react-router-dom";

const Slider = () => {
    const [listings, setListings] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    SwiperCore.use([Autoplay, Navigation, Pagination]);

    useEffect(() => {
        const fetchListings = async () => {
            const SLIDE_COUNT = 10;
            const listingsRef = collection(db, "listings");
            const queryListings = query(listingsRef,
                orderBy("timestamp", "desc"),
                limit(SLIDE_COUNT)) //most recent listings
            const querySnap = await getDocs(queryListings);
            let listings = [];
            querySnap.forEach((doc) => {
                return listings.push({
                    id: doc.id,
                    data: doc.data(),
                });
            });
            setListings(listings);
            // console.log(listings);
            setLoading(false);
        }

        fetchListings();

    }, [])


    if (loading) {
        return <LoadingSpinner/>
    }
    if (listings.length === 0) {
        return <></>
    }
    return listings && (
        <>
            <Swiper
                slidesPerView={1}
                navigation
                pagination={{type: "bullets"}}
                effect="fade"
                module={[EffectFade, Pagination]}
                autoplay={{delay: 1455}}
                style={{color: "#ff2961", fontSize: "1.72rem"}}


            >
                {listings.map(({data, id}) => (
                    <SwiperSlide
                        key={id}
                    >
                        <div
                            onDoubleClick={() => {
                                navigate(`category/${data.type}/${id}`)
                            }}
                            className="swiper-slide-style"
                            style={{
                                background: `url(${data.imgUrls[0]}) center no-repeat`,
                                backgroundSize: "contain",
                                cursor: "pointer",
                            }}>

                            <div className="badge-container">

                                <p className="slider-text-badge">
                                    {data.name}
                                </p>

                                <p className="slider-text-price">${(data.regularPrice.toLocaleString())}</p>
                            </div>

                        </div>

                    </SwiperSlide>
                ))}
            </Swiper>


        </>
    );
};

export default Slider;