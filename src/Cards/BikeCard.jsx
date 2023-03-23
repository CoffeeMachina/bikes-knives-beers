import React, {Fragment} from 'react';
import Moment from "react-moment";
import {Link} from "react-router-dom";
import CardTextCollapse from "./CardTextCollapse";
import "./styles/BikeCard.css";

import {BsGear, BsGearWideConnected, BsGearFill} from "react-icons/bs";
import {GiCartwheel, GiNotebook} from "react-icons/gi";
import {BsPencilSquare, BsTrash} from "react-icons/bs";

const BikeCard = ({bike, id, onDelete, onEdit, imgUrls}) => {
    return (
        <Fragment>
            <div className="column-cards">
                <div className="card-dimensions">
                    <div className="card card-color">
                        <div className="card-thumb">
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
                                    src={bike.imgUrls.length > 0 ? bike.imgUrls[0] : "https://unsplash.com/photos/N9l4OF4A0Jw"}
                                    alt={`${bike.name}`}
                                />
                            </Link>

                        </div>

                        <div className="card-content">
                            <div className="card-details">
                                <div className="row justify-content-evenly ">
                                    <div className="text-center">
                                        <h3> {bike?.year} {bike.brand} {bike.model} {bike.brakeType.charAt(0).toLocaleUpperCase() + bike.brakeType.slice(1)}</h3>
                                        {bike.size && (<h3>Size: {bike?.size} </h3>)}
                                    </div>
                                </div>


                                <div className="row text-start">
                                    {bike.groupset && <div className="my-2 description-dividers">
                                        <BsGear className="description-icons"></BsGear>
                                        <CardTextCollapse
                                            collapseThreshold={25}
                                            textSize={60}
                                        >{bike.groupset}</CardTextCollapse>
                                    </div>}
                                </div>


                                <div className="row text-start">

                                    {bike.rims && <div className="my-2 description-dividers">
                                        <GiCartwheel className="description-icons"></GiCartwheel>
                                        <CardTextCollapse
                                            collapseThreshold={25}
                                            textSize={60}
                                        >{bike.rims}</CardTextCollapse>
                                    </div>}
                                </div>
                                <div className="row text-start">

                                    {bike.description && <div className="my-2 description-dividers">
                                        <GiNotebook className="description-icons"></GiNotebook>
                                        <CardTextCollapse
                                            collapseThreshold={25}
                                            textSize={60}
                                        >{bike.description}</CardTextCollapse>
                                    </div>}

                                </div>


                                <div className="row justify-content-evenly align-items-center">

                                    <div className="row justify-content-center">
                                        <div className="col-md-6 mt-2">
                                                <span style={{fontWeight: "710", fontSize: "183%"}}
                                                      className="price-delete-edit">${parseInt(bike.price).toLocaleString()}
                                                </span>
                                        </div>

                                        <div className="row justify-content-between">
                                            {onDelete && (
                                                <span
                                                    className="col-md-3"
                                                    style={{fontSize: "2.5rem", cursor: "pointer", color: "red"}}
                                                    onClick={() => onDelete(bike.id, bike.name, imgUrls)}>
                                                              <BsTrash></BsTrash>
                                                    </span>)}
                                            {onEdit && (
                                                <span
                                                    className="col-md-3"
                                                    onClick={() => onEdit(id)}
                                                    style={{fontSize: "2.5rem", cursor: "pointer", color: "red"}}
                                                >
                                                            <BsPencilSquare></BsPencilSquare>
                                                    </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>


                    </div>

                </div>

            </div>


        </Fragment>
    );
};

export default BikeCard;