import React, {Fragment} from 'react';
import Moment from "react-moment";
import {Link} from "react-router-dom";
import CardTextCollapse from "./CardTextCollapse";
import "./styles/BeerCard.css";
import {
    GiBeerStein,
    GiSunflower,
    GiHops,
    GiTwirlyFlower,
    GiSpotedFlower,
    GiLotusFlower,
    GiSodaCan,
    GiBeerBottle, GiBeerHorn, GiNotebook, GiTongue, GiFlowers, GiVineFlower
} from "react-icons/gi"; //GiSunflower: Flavor/Aroma
import {IoBeer, IoBeerSharp, IoFlaskSharp} from "react-icons/io5"; // for ABV
import {BsPencilSquare, BsTrash} from "react-icons/bs";


const BeerCard = ({beer, id, onDelete, onEdit, imgUrls}) => {
    const beerIconStyles = {color: "darkred", fontSize: "1.452em", marginBottom: "7px", marginRight: "12px"};
    const getTotalPrice = (p, q) => {
        return (parseFloat(p) * parseFloat(q)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
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
                                    {beer.timestamp?.toDate()}

                                </Moment>
                            </div>
                            <div className="price-tag">
                                <span>
                                    ${(getTotalPrice(beer.quantity, beer.price))}
                                </span>
                            </div>

                            <Link to={`/beers/${id}`} style={{textDecoration: "none"}}>
                                <img
                                    className="image-centering image-attributes"
                                    key={beer.id}
                                    loading="lazy"
                                    src={beer.imgUrls.length > 0 ? beer.imgUrls[0] : ""}
                                    alt={`${beer.name}`}
                                />
                            </Link>

                        </div>

                        <div className="card-content">
                            <div className="card-details">
                                <div className="row justify-content-evenly">
                                    <div className="beer-abv-ibu">
                                        <div className="col-6">
                                            <GiHops style={{marginBottom: "12px", marginRight: "3px"}}
                                                    className="hop-icon"></GiHops>
                                            <span className="">
                                                    {beer.abv} <i className="fa-light fa-percent"></i> ABV
                                                </span>
                                        </div>
                                        <div className="col-6">
                                            <GiHops style={{marginBottom: "12px", marginRight: "3px"}}
                                                    className="hop-icon"></GiHops>
                                            <span className="">{beer.ibu} IBUs</span>
                                        </div>


                                    </div>

                                    {/*BREWERY*/}
                                    <div className="text-center">
                                        <h3>
                                            <IoBeer
                                                // style={beerIconStyles}></IoBeer>{beer.brewery} {beer.beerName.charAt(0).toLocaleUpperCase() + beer.beerName.slice(1)}
                                                style={beerIconStyles}></IoBeer>{beer.brewery}
                                        </h3>


                                        <h3>
                                            <GiBeerStein
                                                style={beerIconStyles}></GiBeerStein> {beer?.year} {beer.beerName.charAt(0).toLocaleUpperCase() + beer.beerName.slice(1)}
                                        </h3>

                                        <h3>
                                            <GiFlowers
                                                style={beerIconStyles}></GiFlowers> {beer.beerStyle}
                                        </h3>


                                    </div>
                                </div>

                                {beer.description && <div className="description-dividers">
                                    <GiNotebook className="description-icons"></GiNotebook>
                                    <CardTextCollapse
                                        collapseThreshold={25}
                                        textSize={60}
                                    >{beer.description}
                                    </CardTextCollapse>
                                </div>}

                            </div>

                        </div>

                        <div className="property-footer">
                            <div className="row justify-content-between description-dividers">

                                <div className="col-md-7 justify-content-center property-footer-icon">
                                    {/*<span>${(beer.price)}/{beer.vesselType}</span>*/}
                                    <span>
                                        ${(beer.price)}/{beer.vesselType === 'can' ?
                                        <GiSodaCan style={{fontSize: "2.25rem", color: "darkred"}}/> :
                                        <GiBeerBottle style={{
                                            fontSize: "2.5rem",
                                            color: "darkred"
                                        }}/>}{beer.vesselCapacity}oz

                                    </span>
                                </div>

                                <div className="col-md-4 justify-content-center property-footer-icon ">
                                    <span>
                                        <i className="fa-sharp fa-solid fa-tally"></i> q: {parseInt(beer.quantity).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="property-footer">
                            <div className="row justify-content-evenly">

                                <div className="property-footer-icon col-md-6">
                                    <span> Total: ${(getTotalPrice(beer.quantity, beer.price))}</span>
                                </div>

                                <div className="col-md-6">
                                    {onDelete && (
                                        <span
                                            className="col-md-3"
                                            style={{fontSize: "2.5rem", cursor: "pointer"}}
                                            onClick={() => onDelete(beer.id, beer.name, imgUrls)}>
                                        <BsTrash></BsTrash>
                                    </span>)}

                                    {onEdit && (
                                        <span
                                            className="col-md-3"
                                            onClick={() => onEdit(id)}
                                            style={{fontSize: "2.5rem", cursor: "pointer"}}
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

        </Fragment>

    );
};

export default BeerCard;