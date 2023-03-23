import React, {useEffect, useRef, useState} from 'react';
import PageBanner from "../components/PageBanner";
import {toast} from "react-toastify";
import {getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject} from "firebase/storage";
import {getAuth} from "firebase/auth";
import {v4 as uuidv4} from "uuid";
import {collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc} from "firebase/firestore";
import {db} from "../firebase";
import {useNavigate, useParams} from "react-router-dom";
import "./styles/EditBike.css";


const EditBike = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);
    const FILE_MB_CAP = 10; //MiB
    const FILE_BYTE_CAP = 1024 * 1024 * FILE_MB_CAP;
    const FILE_UPLOAD_CAP = 10;
    const FB_COLLECTION_NAME = 'bikes';
    const auth = getAuth();
    const [loading, setLoading] = useState(false);
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);

    const navigate = useNavigate();
    const [newImages, setNewImages] = useState(false);
    // const [preEditImgUrls, setPreEditImgUrls] = useState(null);


    const [fileSizeExcess, setFileSizeExcess] = useState(false); //False is default
    // const [brandPicked, setBrandPicked] = useState("");
    // const [modelPicked, setModelPicked] = useState("");
    // const [modelOptions, setModelOptions] = useState(filterBrandByModel(brandPicked));
    // const [bikeNotListed, setBikeNotListed] = useState(false);
    const [bike, setBike] = useState(null);

    const [bikeData, setBikeData] = useState({
        sellerName: "",
        brand: "",
        model: "",
        groupset: "",
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
        rims,
        brakeType,
        year,
        address,
        description,
        price,
        images,
        latitude,
        longitude,
    } = bikeData;


    const params = useParams(); //to get route parameter established by App.js

    useEffect(() => {
        if (bike && bike.userRef !== auth.currentUser.uid) {
            toast.error("Wrong turn. 🗿")
            navigate("/")
        }
    }, [auth.currentUser.uid, bike, navigate])


    //useEffect to fetch the user edit
    useEffect(() => {
        setLoading(true);
        const fetchListing = async () => {
            const docRef = doc(db, FB_COLLECTION_NAME, params.bikeId)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setBike(docSnap.data());
                setBikeData({
                    ...docSnap.data()
                })
                // setPreEditImgUrls(bikeData.imgUrls)

                setLoading(false);
            } else {
                navigate("/")
                toast.error("That Listing Does Not Exist 🗿")
            }
        }
        fetchListing();
    }, [navigate, params.bikeId])

    // console.log("bike", bike)
    // console.log("bikeData",bikeData)
    // console.log("bikeData [IMG URLS]",bikeData.imgUrls)
    // console.log("Params@BikeID: ",params.bikeId)
    // PURE FUNCTION
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
                    toast.error(`File ${e.target.files[i].name} is too damn big! Repick files and make sure they are less than ${FILE_MB_CAP}MiB.`)
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
    // const parseFileNameDelete = (file) => {
    //     const parse1 = file.substring(file.lastIndexOf("/") + 1);
    //     return decodeURI(parse1.substring(0, parse1.lastIndexOf("?")))
    // }
    // FIXED PARSING FOR image WITH BUCKET:
    const parseFileNameDelete = (file) => {
        const parse1 = file.substring(file.lastIndexOf("bikes%2Fi") + 8);
        return decodeURI(parse1.substring(0, parse1.lastIndexOf("?")))
    }


    async function deleteImage(imageToDelete, index, listingName) {
        const imageName = imageToDelete;
        let parsedImage = parseFileNameDelete(imageToDelete);
        console.log("PARSED IMAGE:", parsedImage)
        // imageToDelete : parsedFilename on firebase/storage
        new Promise(async (resolve, reject) => {
            const storage = getStorage();
            const deleteRef = ref(storage, `${FB_COLLECTION_NAME}/${parsedImage}`)
            deleteObject(deleteRef)
                .then(() => {
                    // console.log(`SUCCESSFULLY DELETED: ${imageName.slice(0,15)}...`)
                    toast.success(`Deleted Image ${index + 1} from ${listingName}`)
                }).catch((error) => {
                console.log("Error deleting image: ", error)
                toast.error("Error Deleting Image.")
            })

        })

    }

    const onDelete = async (listingId, listingName, imgUrls) => {
        console.log('test on delete ListingId', listingId)
        console.log("IMGURLS FROIM CARD: ", imgUrls)

        await deleteDoc(doc(db, FB_COLLECTION_NAME, listingId))
        const updatedListings = bike.filter((b) => b.id !== listingId);
        setBike(updatedListings); //refresh with updated listings
        // storage removal process: promises broken

        try {
            const deleteImagesQueue = await Promise.all(
                [...imgUrls].map((image, index) => deleteImage(image, index, listingName))
            ).catch((error) => {
                setLoading(false);
                console.log("Did not delete: ERROR", error)
                // toast.error("Images did not delete")
                return;

            })
            // toast.success(`Successfully deleted ${listingName}.`)


        } catch (e) {
            console.log("ERROR DELETE:", e)
        }


    }


    // const onSubmit = async (e) => {
    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            if (images.length > FILE_UPLOAD_CAP) {
                setLoading(false);
                toast.error(`Maximum ${FILE_UPLOAD_CAP} images are allowed`)
                return;
            }
        } catch (e) {
            console.log("error in images.length:")
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
                console.log("POST GEOCODE API,", data)
                // geolocation.lat = data.results

                console.log(data.results[0].geometry.location)
                // ? => if geometry exist otherwise (??) : 0
                geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
                geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;
                console.log("geolocation: ", geolocation) //working


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


        //IF NEW IMAGES:
        if (newImages) {
            // onDelete(bike.id,bike.name,bike.imgUrls)
            console.log("Initialize On Delete for OLD IMAGES:...")


            let listingName = bikeData.brand;
            const deleteImagesQueue = await Promise.all(
                bikeData.imgUrls.map((image, index) => deleteImage(image, index, listingName))
            ).catch((error) => {
                setLoading(false);
                console.log("Did not delete: ERROR", error)
                // toast.error("Images did not delete")
                return;
            })


            // toast.success(`Successfully deleted ${listingName}.`)
            console.log("Delete Promises Completed!")


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

            const docRef = doc(db, FB_COLLECTION_NAME, params.bikeId);
            await updateDoc(docRef, bikeDataCopy)
            setLoading(false)
            toast.success(`Bike post edited!`)
            navigate(`/`)


        } else {
            //NO NEW IMAGES:
            // const imgUrls = preEditImgUrls;

            const bikeDataCopy = {
                ...bikeData,
                imgUrls: bikeData.imgUrls,
                geolocation,
                timestamp: serverTimestamp(),
                userRef: auth.currentUser.uid,
            };
            delete bikeDataCopy.images;
            delete bikeDataCopy.latitude;
            delete bikeDataCopy.longitude;

            //RF?
            const docRef = doc(db, FB_COLLECTION_NAME, params.bikeId);
            await updateDoc(docRef, bikeDataCopy)

            setLoading(false)
            toast.success(`Bike post edited!`)
            navigate(`/`)

        }

    }


    if (loading) {
        return (
            <div style={{display: "flex", justifyContent: "center"}}>
                <i className="fas fa-spinner fa-pulse fa-8x spinner-color"></i>
            </div>)
    } else {
        return (
            <>

                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">

                            <div className="row justify-content-center">


                                <div className="row">

                                    <div style={{display: "flex", justifyContent: "center"}}>
                                        {/*<PageBanner text="Edit" icon="fa-light fa-pencil"/>*/}

                                        <h1 className="edit-banner">Edit Bike<i className="fa-light fa-pencil"></i></h1>

                                    </div>
                                    <form onSubmit={onSubmit}>
                                        {/*<form>*/}

                                        <div className="row mb-3">


                                            <label htmlFor="brand" className="form-label">Make</label>
                                            <input value={brand} onChange={onChange} className="form-control"
                                                   id="brand"
                                                   name="brand" type="text" placeholder="S-Works" minLength="2"
                                                   maxLength="120"
                                                   required
                                            />
                                        </div>

                                        <div className="row my-3">
                                            <label htmlFor="model" className="form-label">Model</label>
                                            <input value={model} onChange={onChange} className="form-control"
                                                   id="model"
                                                   name="model" type="text" placeholder="Roubaix" required
                                                   minLength="2"
                                                   maxLength="120"/>
                                        </div>


                                        <div className="row my-3">
                                            <label htmlFor="year" className="form-label">Model Year</label>
                                            <input required value={year} onChange={onChange}
                                                   className="form-control"
                                                   id="year"
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
                                                value={groupset} onChange={onChange} className="form-control"
                                                id="groupset"
                                                type="text"
                                                placeholder="Dura-Ace"/>
                                        </div>


                                        {/* RIM VS DISC BRAKES*/}
                                        {/*<div className="row"><h1>BRAKETYPE: {brakeType}</h1></div>*/}
                                        <div className="row my-3">
                                            <label htmlFor="brakeType" className="form-label">Brake System</label>
                                            <div>

                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio"
                                                           name="inlineRadioOptions"
                                                           required
                                                           id="brakeType" value="disc" checked onChange={onChange}/>
                                                    <label className="form-check-label"
                                                           htmlFor="inlineRadio1">Disc</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio"
                                                           name="inlineRadioOptions"
                                                           required
                                                           id="brakeType" value="rim" onChange={onChange}/>
                                                    <label className="form-check-label"
                                                           htmlFor="inlineRadio2">Rim</label>
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
                                            <input value={email} onChange={onChange} required id="email"
                                                   type="email"
                                                   className="form-control"
                                                   placeholder="lance@KoM.com" minLength="5" maxLength="255"/>
                                        </div>


                                        <div className="row my-3">
                                            <label htmlFor="sellerName" className="form-label">Your Name</label>
                                            <input required value={sellerName} onChange={onChange}
                                                   className="form-control"
                                                   id="sellerName"
                                                   type="text" placeholder="Elon Musk" minLength="3"
                                                   maxLength="50"/>
                                        </div>


                                        <div className="row my-3">
                                            <label htmlFor="price" className="form-label">Price</label>
                                            <input value={price} onChange={onChange} className="form-control"
                                                   id="price"
                                                   type="number"
                                                   min="0"
                                                   placeholder="$"/>
                                        </div>


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

                                        <div className="row my-3">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox"
                                                       value={newImages}
                                                       id="flexCheckDefault"
                                                       onChange={() => {
                                                           setNewImages(prevState => !prevState)
                                                       }}
                                                />
                                                <label className="form-check-label" htmlFor="flexCheckDefault">
                                                    <p style={{fontSize: "1.35rem", fontWeight: "450"}}>Upload New
                                                        Images</p>
                                                </label>
                                            </div>
                                        </div>


                                        {newImages && (<div className="row my-3">
                                            <label
                                                htmlFor="imageHelp"
                                                className="form-label"
                                            >
                                                <p>Images</p>
                                                {/*<p>The First image will be the cover.</p>*/}
                                                <p id="imageHelp" className="form-text text-muted">
                                                    Each image must be less than 10 MB <br/> The first image will be
                                                    the
                                                    cover
                                                    (max: 10 images).</p>

                                                {/*<input type="file" className="form-control-file" id="imageHelp"/>*/}
                                                <input
                                                    className="form-control-file image-button"
                                                    type="file"
                                                    id="images"
                                                    onChange={onChange}
                                                    accept=".jpg, .png, .jpeg, .gif, .mp4, .mkv, .webm"
                                                    multiple
                                                />
                                            </label>
                                        </div>)}


                                        <div className="my-3 row justify-content-center">
                                            <button type="submit" className="btn btn-primary">Create Listing
                                            </button>
                                        </div>


                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </>
        );
    }
    ;
}


export default EditBike;