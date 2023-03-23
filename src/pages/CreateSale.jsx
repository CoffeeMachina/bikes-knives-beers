import React, {useEffect, useState} from 'react';
import "./styles/CreateSale.css";
import BikeForm from "../Forms/BikeForm";
import KnifeForm from "../Forms/KnifeForm";
import BeerForm from "../Forms/BeerForm";
import {useParams} from "react-router-dom";

const CreateListing = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);
    const params = useParams();

    const selectionOptions = ["bike", "knife", "beer"];
    const currentOption = params.saleType;
    // const [pickedOption, setPickedOption] =useState("bike");
    // params.saleType
    console.log("test Params: ", params.saleType)
    const [saleType, setSaleType] = useState(params.saleType);
    const saleTypeOptions = [
        {label: "bike", value: "bike", color: "limegreen"},
        {label: "knife", value: "knife", color: "slateblue"},
        {label: "beer", value: "beer", color: "hotpink"},
    ];
    const handleChange = (option) => {
        setSaleType(option)
    }


    return (
        <>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <label htmlFor="sale-select" className="form-label">Type of Sale

                        </label>
                        <select
                            onChange={e => setSaleType(e.target.value)}
                            name="sale" id="sale-select" className="form-select">
                            <option value={`${currentOption}`}>{currentOption}</option>
                            {selectionOptions.filter((x) => x !== currentOption).map((y,i) => (
                                <option key={i} value={`${y}`}>{y}</option>
                            ))}


                        </select>
                    </div>


                    {saleType === 'bike' && <div className="row justify-content-center">
                        <div className="col-lg-6"><BikeForm></BikeForm></div>
                    </div>}

                    {saleType === 'knife' && <div className="row justify-content-center">
                        <div className="col-lg-6"><KnifeForm></KnifeForm></div>
                    </div>}

                    {saleType === 'beer' && <div className="row justify-content-center">
                        <div className="col-lg-6"><BeerForm></BeerForm></div>
                    </div>}

                </div>
            </div>
        </>)

}

export default CreateListing;