import React, {useEffect, useState} from 'react';
import {BikeBrandsModels} from "./Bike/BikeBrandsModels";
import {toast} from "react-toastify";
import {getAuth} from "firebase/auth";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import {v4 as uuidv4} from "uuid";
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
import {db} from "../firebase";
import {useNavigate} from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const BikeForm = () => {
    const FILE_MB_CAP = 10; //MiB
    const FILE_BYTE_CAP = 1024 * 1024 * FILE_MB_CAP;
    const FILE_UPLOAD_CAP = 10;
    const FB_COLLECTION_NAME = 'bikes';
    const auth = getAuth();
    const [loading, setLoading] = useState(false);
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);

    const navigate = useNavigate();
    const [enterAddress, setEnterAddress] = useState(false);


    const [fileSizeExcess, setFileSizeExcess] = useState(false); //False is default
    const [brandPicked, setBrandPicked] = useState("");
    const [modelPicked, setModelPicked] = useState("");
    const [modelOptions, setModelOptions] = useState(filterBrandByModel(brandPicked));
    const [bikeNotListed, setBikeNotListed] = useState(false);

    const [bikeData, setBikeData] = useState({
        sellerName: "",
        brand: "",
        model: "",
        groupset: "",
        size:"",
        rims: "",
        brakeType: "",
        year: "",
        email: "",
        address: "",
        description: "",
        price: "",
        images: {},
        latitude: 0,
        longitude: 0,
    });

    const {
        sellerName,
        email,
        brand,
        model,
        groupset,
        size,
        rims,
        brakeType,
        year,
        address,
        description,
        price,
        images,
        latitude,
        longitude
    } = bikeData;



    function filterBrandByModel(brandPicked) {
        return BikeBrandsModels.filter(b => {
            return b.make === brandPicked
        }).map(model => {
            return model.model
        }).map(modx => {
            return {label: modx, value: modx, color: "#000000"}
        })

    }

    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);

        if (images.length > FILE_UPLOAD_CAP) {
            setLoading(false);
            toast.error(`Maximum ${FILE_UPLOAD_CAP} images are allowed`)
            return;
        }

        if (fileSizeExcess) {
            setLoading(false);
            toast.error(`You cannot upload anything above ${FILE_MB_CAP}}MiBs. Please reupload files.`)
            return;
        }

        let geolocation = {};
        let location;

        try {
            if (geolocationEnabled) {
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`)

                const data = await response.json()
                // console.log("POST GEOCODE API,", data)
                // geolocation.lat = data.results
                // console.log(data.results[0].geometry.location)
                // ? => if geometry exist otherwise (??) : 0
                geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
                geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;
                // console.log("geolocation: ", geolocation) //working


                location = data.status === "ZERO_RESULTS" && undefined;
                if (location === undefined) {
                    setLoading(false)
                    toast.error("Please enter a correct address.")
                    return;
                }
            } else {
                geolocation.lat = latitude;
                geolocation.lng = longitude;
            }

        } catch (e) {
            console.log("Geolocation ERROR: ", e)
        }

        //UPLOAD IMAGE TO STORAGE: loop-via image set ; save URL of image
        //firebase image upload to cloud storage
        async function storeImage(image) {
            return new Promise(async (resolve, reject) => {
                const storage = getStorage();
                //DOUBLE DELIM between filename items; TRIPLE DELIM between entire filename:
                const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
                const storageRef = ref(storage, `${FB_COLLECTION_NAME}/${filename}`);
                const uploadTask = uploadBytesResumable(storageRef, image);
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {
                        // Handle unsuccessful uploads
                        reject(error);
                        console.log("Promise ERROR: ", error)
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            // console.log('File available at', downloadURL);
                            resolve(downloadURL);
                            // console.log('File available at', downloadURL);

                        });
                    }
                );
            })
        }


        //multiple async operations; do something after ALL operations complete.
        // REFACTOR imgUrlsSerializer
        const imgUrls = await Promise.all(
            [...images].map((image) => storeImage(image))
        ).catch((error) => {
            setLoading(false);
            toast.error("Images not uploaded");
            return;
        });


        const bikeDataCopy = {
            ...bikeData,
            imgUrls,
            geolocation,
            timestamp: serverTimestamp(),
            userRef: auth.currentUser.uid,
        };
        delete bikeDataCopy.images;
        delete bikeDataCopy.latitude;
        delete bikeDataCopy.longitude;
        //VIEW UNDEFINED ~ imgUrls
        // console.log("bikeDataCopy:", bikeDataCopy)
        // console.log("==>images::", images)
        // console.log("==>imgUrls::", imgUrls)
        // console.log("==>bikeDataCopy.imgUrls::", bikeDataCopy.imgUrls)
        // console.log("==>bikeDataCopy.images2::",bikeDataCopy.images2)

        //RF?
        const docRef = await addDoc(collection(db, FB_COLLECTION_NAME), bikeDataCopy);

        setLoading(false)
        toast.success("Bike Sale created.")
        navigate(`/bikes/${docRef.id}`)


    }


    const onChange = (e) => {

        //files
        if (e.target.files) {
            let sizeAllSubByteCap = true; //assume size of all files
            // let files_vector = e.target.files;

            //CHECK IF FILES ARE ALL APPROPRIATE SIZE:
            console.log("# of FILES: ", e.target.files.length, "TESTING SPECIAL LOOP ON FileList:")
            for (let i = 0; i < e.target.files.length; i++) {

                if (e.target.files[i].size < FILE_BYTE_CAP) {
                    console.log("SUB-CAP: ", e.target.files[i])
                    // setFileSizeExcess(false);
                } else if (e.target.files[i].size > FILE_BYTE_CAP) {
                    console.log("FAT_FILE: ", e.target.files[i])
                    setFileSizeExcess(true)
                    sizeAllSubByteCap = false;
                    toast.error(`File ${e.target.files[i].name} is too damn big! Repick files and make sure they are less than 2MiB.`)
                    // return;
                }
            }
            if (sizeAllSubByteCap) {
                setFileSizeExcess(false);
            }

            setBikeData((prevState) => ({
                ...prevState,
                // [e.target.id]: e.target.files
                images: e.target.files
            }));


        }
        // Text / boolean / number / all else
        if (!e.target.files) {
            setBikeData((prevState) => ({
                ...prevState,
                //takes boolean; otherwise, takes e.target.value; e.g. non-boolean values
                [e.target.id]: e.target.value
            }))
        }
    }

    if (loading) {
        return <LoadingSpinner></LoadingSpinner>
    } else {

        return (
            <>


                <div className="row justify-content-center">
                    <div className="row">
                        <form onSubmit={onSubmit}>
                            <div className="row my-3">


                                <label htmlFor="brand" className="form-label">Make</label>
                                <input value={brand} onChange={onChange} className="form-control" id="brand"
                                       name="brand" type="text" placeholder="S-Works" minLength="2" maxLength="120"
                                       required
                                />
                            </div>

                            <div className="row my-3">
                                <label htmlFor="model" className="form-label">Model</label>
                                <input value={model} onChange={onChange} className="form-control" id="model"
                                       name="model" type="text" placeholder="Roubaix" required minLength="2"
                                       maxLength="120"/>
                            </div>


                            <div className="row my-3">
                                <label htmlFor="year" className="form-label">Model Year</label>
                                <input required value={year} onChange={onChange} className="form-control" id="year"
                                       type="number"
                                       min="0"
                                       max="2050"
                                       placeholder="2077"/>
                            </div>

                            <div className="row my-3">
                                <label htmlFor="groupset" className="form-label">Group Set</label>
                                <input
                                    required
                                    minLength="3" maxLength="120"
                                    value={groupset} onChange={onChange} className="form-control" id="groupset"
                                    type="text"
                                    placeholder="Dura-Ace"/>
                            </div>

                            <div className="row my-3">
                                <label htmlFor="size" className="form-label">Bike Size</label>
                                <input
                                    required
                                    minLength="1" maxLength="3"
                                    value={size} onChange={onChange} className="form-control" id="size"
                                    type="text"
                                    placeholder='e.g. M or 54'/>
                            </div>


                            {/* RIM VS DISC BRAKES*/}
                            {/*<div className="row"><h1>BRAKETYPE: {brakeType}</h1></div>*/}
                            <div className="row my-3">
                                <label htmlFor="brakeType" className="form-label">Brake System</label>
                                <div>

                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name="inlineRadioOptions"
                                               required
                                               id="brakeType" value="disc" onChange={onChange}/>
                                        <label className="form-check-label" htmlFor="inlineRadio1">Disc</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name="inlineRadioOptions"
                                               required
                                               id="brakeType" value="rim" onChange={onChange}/>
                                        <label className="form-check-label" htmlFor="inlineRadio2">Rim</label>
                                    </div>
                                </div>
                            </div>

                            <div className="row my-3">
                                <label htmlFor="rims" className="form-label">Rims</label>
                                <input minLength="2" maxLength="80" value={rims} onChange={onChange}
                                       className="form-control" id="rims" type="text"
                                       placeholder="Meilenstein EVO"/>
                            </div>


                            <div className="row my-3">
                                <label
                                    htmlFor="description"
                                    className="form-label"
                                >Bike Details</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={description}
                                    onChange={onChange}
                                    placeholder="S-works Tarmac (2022) Dura-Ace 54 stack "
                                    className="form-control shadow-lg form-text-center"
                                    aria-describedby="addressHelp"
                                    minLength="5"
                                    maxLength="500"
                                    required

                                />
                            </div>


                            <div className="row my-3">
                                <label htmlFor="email" className="form-label">Email Address:</label>
                                <input value={email} onChange={onChange} required id="email" type="email"
                                       className="form-control"
                                       placeholder="lance@KoM.com" minLength="5" maxLength="255"/>
                            </div>


                            <div className="row my-3">
                                <label htmlFor="sellerName" className="form-label">Your Name</label>
                                <input required value={sellerName} onChange={onChange} className="form-control"
                                       id="sellerName"
                                       type="text" placeholder="Elon Musk" minLength="3" maxLength="50"/>
                            </div>


                            <div className="row my-3">
                                <label htmlFor="price" className="form-label">Price</label>
                                <input value={price} onChange={onChange} className="form-control" id="price"
                                       type="number"
                                       min="0"
                                       placeholder="$"/>
                            </div>


                            <div className="row my-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox"
                                           value={enterAddress}
                                           id="flexCheckDefault"
                                           onChange={() => {
                                               setEnterAddress(prevState => !prevState)
                                           }}
                                    />
                                    <label className="form-check-label" htmlFor="flexCheckDefault">
                                        <p style={{fontSize: "1.35rem", fontWeight: "450"}}>Enter Meet up Address</p>
                                    </label>
                                </div>
                            </div>

                            {enterAddress &&
                                <div className="row my-3">
                                    <label
                                        htmlFor="description"
                                        className="form-label"
                                    >Address</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={address}
                                        onChange={onChange}
                                        placeholder="1600 Pennsylvania Avenue NW, Washington, DC 20500, USA"
                                        className="form-control shadow-lg form-text-center"
                                        aria-describedby="addressHelp"
                                        maxLength="120"
                                        minLength="0"
                                    />
                                </div>}






                            <div className="row my-3">
                                <label
                                    htmlFor="imageHelp"
                                    className="form-label"
                                >
                                    <p>Images</p>
                                    {/*<p>The First image will be the cover.</p>*/}
                                    <p id="imageHelp" className="form-text text-muted">
                                        Each image must be less than 10 MB <br/> The first image will be the cover
                                        (max: 10 images).</p>

                                    {/*<input type="file" className="form-control-file" id="imageHelp"/>*/}
                                    <input
                                        className="form-control-file image-button"
                                        type="file"
                                        id="images"
                                        onChange={onChange}
                                        accept=".jpg, .png, .jpeg, .gif, .mp4, .mkv, .webm"
                                        multiple
                                        required
                                    />
                                </label>
                            </div>


                            <div className="my-3 row justify-content-center">
                                <button type="submit" className="btn btn-primary">Create Listing</button>
                            </div>


                        </form>
                    </div>
                </div>


            </>
        );
    }
    ;
}

export default BikeForm;