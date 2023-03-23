import React, {Fragment} from 'react';
import Moment from "react-moment";
import {Link} from "react-router-dom";
import CardTextCollapse from "./CardTextCollapse";
import "./styles/KnifeCard.css";
import {
    GiBeerStein,
    GiEvilHand,
    GiHoneypot,
    GiHops,
    GiMetalBar,
    GiNotebook,
    GiRelicBlade,
    GiWeightScale, GiWoodenSign
} from "react-icons/gi";
import {BsPencilSquare, BsTrash} from "react-icons/bs";


// GiKitchenKnives
// GiBowieKnife
// GiPencilRuler
// LENGTH
// RxRulerHorizontal

//weight
// FaWeightHanging

const BeerCard = ({knife, id, onDelete, onEdit, imgUrls}) => {
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
                                    {knife.timestamp?.toDate()}

                                </Moment>
                            </div>
                            <div className="price-tag">
                                <span>
                                    ${(parseInt(knife?.price)).toLocaleString()}
                                </span>
                            </div>
                            <Link to={`/knives/${id}`} style={{textDecoration: "none"}}>
                                <img
                                    className="image-centering image-attributes"
                                    loading="lazy"
                                    key={knife.id}
                                    src={knife.imgUrls.length > 0 ? knife.imgUrls[0] : "https://unsplash.com/photos/N9l4OF4A0Jw"}
                                    alt={`${knife.name}`}
                                />
                            </Link>

                        </div>

                        <div className="card-content">
                            <div className="card-details">
                                <div className="row justify-content-evenly">
                                    <div className="text-center">
                                        <h3>{knife.brand}</h3>
                                        <h3>{knife.model}</h3>
                                    </div>

                                    <div className="row knife-specs">
                                        <div className="col-4">
                                            <i className="fa-solid fa-ruler-horizontal spec-icon"></i>
                                            <span>{knife.bladeLength}" <br/> Blade Length</span>

                                        </div>
                                        <div className="col-4">
                                            <i className="fa-solid fa-ruler-vertical spec-icon"></i>
                                            <span>{knife.handleLength}</span> <br/> <span> Handle Length</span>

                                        </div>


                                        <div className="col-4">
                                            <i className="fa-sharp fa-solid fa-ruler-triangle spec-icon"></i>
                                            <span>{knife.overallLength} <br/> Overall Length</span>
                                        </div>
                                    </div>
                                    <div className="row justify-content-center">
                                        <div className="col-5">
                                            <i className="fa-sharp fa-solid fa-weight-hanging spec-icon"></i>
                                            <span>{knife.weight} oz.</span>
                                        </div>
                                    </div>
                                </div>


                                <div className="description-dividers">
                                    <GiRelicBlade className="description-icons"></GiRelicBlade>
                                    <CardTextCollapse
                                        collapseThreshold={50}
                                        textSize={60}
                                    >{knife.bladeSteel}
                                    </CardTextCollapse>
                                </div>

                                <div className="description-dividers">
                                    <GiEvilHand className="description-icons"></GiEvilHand>
                                    <CardTextCollapse
                                        collapseThreshold={50}
                                        textSize={60}
                                    >{knife.handleMaterial}
                                    </CardTextCollapse>
                                </div>


                                <div className="description-dividers">
                                    <GiWoodenSign className="description-icons"></GiWoodenSign>
                                    <CardTextCollapse
                                        collapseThreshold={50}
                                        textSize={60}
                                    >{knife.description}
                                    </CardTextCollapse>
                                </div>


                            </div>
                            <div className="property-footer">
                                <div className="row justify-content-center">
                                    <div className="col-md-6">
                                        <span>Total: ${parseInt(knife.price).toLocaleString()}</span>
                                    </div>
                                    <div className="row justify-content-between">
                                        {onDelete && (
                                            <span
                                                className="col-md-3"
                                                style={{fontSize: "2.5rem", cursor:"pointer"}}
                                                onClick={() => onDelete(knife.id, knife.name, imgUrls)}>
                                        <BsTrash></BsTrash>
                                    </span>)}

                                        {onEdit && (
                                            <span
                                                className="col-md-3"
                                                onClick={() => onEdit(id)}
                                                style={{fontSize: "2.5rem", cursor:"pointer"}}
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

        </Fragment>

    );
};

export default BeerCard;