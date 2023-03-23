import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import {getAuth} from "firebase/auth";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import {v4 as uuidv4} from "uuid";
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
import {db} from "../firebase";
import {useNavigate} from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const BeerForm = () => {
    const FILE_MB_CAP = 10; //MiB
    const FILE_BYTE_CAP = 1024 * 1024 * FILE_MB_CAP;
    const FILE_UPLOAD_CAP = 10;
    const FB_COLLECTION_NAME = 'beers';
    const auth = getAuth();
    const [loading, setLoading] = useState(false);
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);

    const navigate = useNavigate();
    const [enterAddress, setEnterAddress] = useState(false);


    const [fileSizeExcess, setFileSizeExcess] = useState(false); //False is default

    const [beerData, setbeerData] = useState({
        sellerName: "",
        brewery: "",
        beerName: "",
        beerStyle: "",
        countryOrigin: "",
        vesselType: "",
        vesselCapacity: "",
        address: "",
        description: "",
        price: "",
        quantity: "",
        totalPrice: "",
        ibu: "",
        abv: "",
        images: {},
        email: "",
        latitude: 0,
        longitude: 0,
    });

    const {
        sellerName, //default ""
        brewery,
        beerName,
        beerStyle,
        countryOrigin,
        vesselType,
        vesselCapacity,
        address, //default ""
        description,
        price,
        quantity,
        totalPrice,
        ibu,
        abv,
        images,
        email,
        latitude,
        longitude,
    } = beerData;


    const getTotalPrice = () => {
        beerData.totalPrice = beerData.price * beerData.quantity;
        return ((beerData.price * beerData.quantity).toFixed(4));
    }


    async function onSubmit(e) {
        setLoading(true);
        e.preventDefault();

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

        //Geocoding API @ google cloud console
        let geolocation = {};
        // Google API ? goeolocation True : ""
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
            console.log("GEOLOCATION ERROR: ", e)
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


        const beerDataCopy = {
            ...beerData,
            imgUrls,
            geolocation,
            timestamp: serverTimestamp(),
            userRef: auth.currentUser.uid,
        };
        delete beerDataCopy.images;
        delete beerDataCopy.latitude;
        delete beerDataCopy.longitude;
        //VIEW UNDEFINED ~ imgUrls
        console.log("beerDataCopy:", beerDataCopy)
        console.log("==>images::", images)
        console.log("==>imgUrls::", imgUrls)
        console.log("==>beerDataCopy.imgUrls::", beerDataCopy.imgUrls)
        // console.log("==>beerDataCopy.images2::",beerDataCopy.images2)

        //RF?
        const docRef = await addDoc(collection(db, FB_COLLECTION_NAME), beerDataCopy);

        setLoading(false)
        toast.success("Beer Sale created.")
        navigate(`/beers/${docRef.id}`)


    }


    const onChange = (e) => {

        //files
        if (e.target.files) {
            let sizeAllSubByteCap = true; //assume size of all files

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

            setbeerData((prevState) => ({
                ...prevState,
                images: e.target.files
            }));


        }
        // Text / boolean / number / all else
        if (!e.target.files) {
            setbeerData((prevState) => ({
                ...prevState,
                [e.target.id]: e.target.value
            }))
        }
    }

    if (loading) {
        return <LoadingSpinner></LoadingSpinner>
    } else {

        return (
            <>
                {loading && <LoadingSpinner/>}
                <div className="row justify-content-center">
                    <div className="row">
                        <form onSubmit={onSubmit}>
                            {/*<form>*/}

                            {/* RADIO ~ fixed vs folder */}
                            <div className="row my-3">
                                <label htmlFor="vesselType" className="form-label">Vessel Type</label>
                                <div>
                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name="inlineRadioOptions"
                                               required
                                               id="vesselType" value="can" onChange={onChange}/>
                                        <label className="form-check-label" htmlFor="inlineRadio1">Can</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name="inlineRadioOptions"
                                               required
                                               id="vesselType" value="bottle" onChange={onChange}/>
                                        <label className="form-check-label" htmlFor="inlineRadio2">Bottle</label>
                                    </div>
                                </div>
                            </div>

                            <div className="row my-3">
                                <label htmlFor="brewery" className="form-label">Brewery</label>
                                <input value={brewery} onChange={onChange} className="form-control" id="brewery"
                                       name="brewery" type="text" placeholder="Stone Brewing"
                                       minLength="2" maxLength="50"
                                       required
                                />
                            </div>

                            <div className="row my-3">
                                <label htmlFor="beerName" className="form-label">Beer</label>
                                <input value={beerName} onChange={onChange} className="form-control" id="beerName"
                                       name="beerName" type="text"
                                       placeholder="STONE ///FEAR.MOVIE.LIONS" minLength="2"
                                       maxLength="50"
                                       required
                                />
                            </div>

                            <div className="row my-3">
                                <label htmlFor="beerStyle" className="form-label">Beer Style</label>
                                <input value={beerStyle} onChange={onChange} className="form-control" id="beerStyle"
                                       name="beerStyle" type="text"
                                       placeholder="DOUBLE IPA" minLength="2"
                                       maxLength="50"
                                       required
                                />
                            </div>


                            <div className="row my-3">
                                <label htmlFor="abv" className="form-label">ABV %</label>
                                <input value={abv} onChange={onChange} className="form-control" id="abv"
                                       type="number"
                                       min="0"
                                       max="100"
                                       step=".01"

                                       required
                                       placeholder="%"/>
                            </div>


                            <div className="row my-3">
                                <label htmlFor="ibu" className="form-label">IBUs</label>
                                <input value={ibu} onChange={onChange} className="form-control" id="ibu" name="ibu"
                                       type="number"
                                       min="1"
                                       max="120"
                                       step=".01"
                                       required
                                       placeholder="hoppy"/>
                            </div>


                            <div className="row my-3">
                                <label htmlFor="countryOrigin" className="form-label">Place of Origin</label>
                                <input value={countryOrigin} onChange={onChange} className="form-control"
                                       id="countryOrigin"
                                       type="text" required
                                       placeholder="Escondido, California"/>
                            </div>


                            <div className="row my-3">
                                <label htmlFor="vesselCapacity" className="form-label">Beer Capacity (oz)</label>
                                <input value={vesselCapacity} onChange={onChange} className="form-control"
                                       id="vesselCapacity"
                                       type="number"
                                       placeholder="oz"
                                       min="0"
                                       max="2500"
                                       step=".01"
                                       required
                                />
                            </div>

                            <div className="row my-3">
                                <label htmlFor="price" className="form-label">Price</label>
                                <input value={price} onChange={onChange} className="form-control" id="price"
                                       type="number"
                                       min="1"
                                       max="250000"
                                       step=".01"
                                       required
                                       placeholder="$"/>
                            </div>

                            <div className="row my-3">
                                <label htmlFor="quantity" className="form-label">Quantity</label>
                                <input value={quantity} onChange={onChange} className="form-control" id="quantity"
                                       type="number"
                                       min="1"
                                       max="1024"
                                       step=".01"
                                       required
                                       placeholder="# of cans/bottles"/>
                            </div>

                            <div className="row my-3">
                                <label style={{color: "mediumslateblue", fontWeight: "550"}}
                                       htmlFor="totalPrice" className="form-label">Total Price</label>
                                <input
                                    readOnly
                                    style={{color: "mediumslateblue", fontWeight: "550", backgroundColor: '#ebd38d'}}
                                    className="form-control"
                                    id="totalPrice"
                                    onChange={onChange}
                                    // type="text" value={'$'+`${totalPrice.toLocaleString()}`}
                                    type="text" value={'$' + `${getTotalPrice(beerData.price, beerData.quantity)}`}
                                    aria-label="readonly input example"/>
                            </div>


                            <div className="row my-3">
                                <label
                                    htmlFor="description"
                                    className="form-label"
                                >Overall Info</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={description}
                                    onChange={onChange}
                                    placeholder="This is our take on a hazy East Coast Double IPA. Juicy and smooth with just the right touch of West Coast bitterness in the finish. The aroma on this beer is insane and reminds us of getting fresh fruit from a farm stand on the side of the road. Now, make that a farm stand on the side of the road in Yakima, WA during hop harvest. The aroma of fresh hops envelops! "
                                    className="form-control shadow-lg form-text-center"
                                    aria-describedby="addressHelp"
                                    minLength="5"
                                    maxLength="255"
                                    required
                                />
                            </div>

                            <div className="row my-3">
                                <label htmlFor="sellerName" className="form-label">Your Name</label>
                                <input required value={sellerName} onChange={onChange} className="form-control"
                                       id="sellerName"
                                       type="text" placeholder="Scooby Doo" minLength="3" maxLength="50"/>
                            </div>

                            <div className="row my-3">
                                <label htmlFor="email" className="form-label">Email Address:</label>
                                <input required id="email" type="email" className="form-control" value={email}
                                       onChange={onChange}
                                       placeholder="Scooby@DoobyDoo.com" minLength="5" maxLength="255"/>
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
                                </div>

                            }


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

export default BeerForm;