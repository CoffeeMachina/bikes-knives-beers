import React from 'react';
import "./styles/BikeSlideCard.css";
import Moment from "react-moment";
import {Link} from "react-router-dom";

const BikeSlideCard = ({bike, id}) => {
    return (
        <div className="card-dimensions">
            <div className="card-color">
                <div className="card-picture">
                    <div className="button-tag">
                        <Moment
                            fromNow
                        >
                            {bike.timestamp?.toDate()}

                        </Moment>
                    </div>
                    <div className="price-tag">
                                <span>
                                    ${(parseInt(bike?.price)).toLocaleString()}
                                </span>
                    </div>

                    <Link to={`/bikes/${id}`} style={{textDecoration: "none"}}>
                        <img
                            className="image-centering image-attributes"
                            loading="lazy"
                            key={bike.id}
                            src={bike.imgUrls.length > 0 ? bike.imgUrls[0] : ""}
                            alt={`${bike.name}`}
                        />
                    </Link>

                </div>
            </div>


        </div>
    );
};

export default BikeSlideCard;