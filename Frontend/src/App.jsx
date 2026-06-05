import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { AuroraText } from "./components/AuroraText";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";



const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
    
  );
};

export default App;
