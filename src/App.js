import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import "./index.css";
import "./App.css";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import React from "react";
import AllBeers from "./pages/AllBeers";
import MyBikes from "./pages/MyBikes";
import EditBike from "./pages/EditBike";
import MyBeers from "./pages/MyBeers";
import MyKnives from "./pages/MyKnives";
import EditBeer from "./pages/EditBeer";
import EditKnife from "./pages/EditKnife";
import PageBike from "./pages/PageBike";
import PageKnife from "./pages/PageKnife";
import PageBeer from "./pages/PageBeer";
import ContactForm from "./components/ContactForm";
import AllBikes from "./pages/AllBikes";
import AllKnives from "./pages/AllKnives";
import CreateSale from "./pages/CreateSale";
import DevNotes from "./pages/DevNotes";

function App() {
    return (
        <BrowserRouter>
            <Header></Header>
            <Routes>
                <Route exact path="/" element={<Home/>}></Route>
                {/*PRIVATE ROUTES*/}

                <Route path="/profile" element={<PrivateRoute/>}>
                    <Route path="/profile" element={<Profile/>}></Route>
                </Route>

                {/*TESTING CARDS*/}
                <Route path="/profile/bikes" element={<PrivateRoute/>}>
                    <Route path="/profile/bikes" element={<MyBikes/>}></Route>
                </Route>

                <Route path="/profile/knives" element={<PrivateRoute/>}>
                    <Route path="/profile/knives" element={<MyKnives/>}></Route>
                </Route>

                <Route path="/profile/beers" element={<PrivateRoute/>}>
                    <Route path="/profile/beers" element={<MyBeers/>}></Route>
                </Route>


                {/*PRIVATE ROUTES*/}
                <Route path="/sell" element={<PrivateRoute/>}>
                    <Route path="/sell/:saleType" element={<CreateSale/>}></Route>
                </Route>

                {/*FORM for BKB*/}

                <Route path="edit-bike" element={<PrivateRoute/>}>
                    <Route path="/edit-bike/:bikeId" element={<EditBike/>}></Route>
                </Route>

                <Route path="edit-beer" element={<PrivateRoute/>}>
                    <Route path="/edit-beer/:beerId" element={<EditBeer/>}></Route>
                </Route>
                <Route path="edit-knife" element={<PrivateRoute/>}>
                    <Route path="/edit-knife/:knifeId" element={<EditKnife/>}></Route>
                </Route>


                <Route path="/forgot-password" element={<ForgotPassword/>}></Route>

                <Route path="/bikes" element={<AllBikes/>}></Route>
                <Route path="/knives" element={<AllKnives/>}></Route>
                <Route path="/beers" element={<AllBeers/>}></Route>
                <Route path="/updates" element={<DevNotes/>}></Route>

                {/*WORKING*/}

                {/*INDIVIDUAL POST CLICK:*/}
                <Route path="/beers/:beerId" element={<PageBeer/>}></Route>
                <Route path="/knives/:knifeId" element={<PageKnife/>}></Route>
                <Route path="/bikes/:bikeId" element={<PageBike/>}></Route>

                {/*BIKE POSTS*/}
                {/*<Route path="/sell/bikes/:bikeId" element={<Listing/>}></Route>*/}


                <Route path="/sign-in" element={<SignIn/>}></Route>
                <Route path="/sign-up" element={<SignUp/>}></Route>

                <Route path="/contact-form-demo" element={<ContactForm/>}></Route>


            </Routes>

            <ToastContainer
                position="top-center"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                theme="dark"
            />

        </BrowserRouter>

    );
}

export default App;