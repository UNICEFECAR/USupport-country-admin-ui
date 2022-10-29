import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotFound } from "#pages";

import "./App.scss";

// AOS imports
import "aos/dist/aos.css";
import AOS from "aos";

function App() {
  AOS.init({
    offset: 10,
    duration: 1000,
    easing: "ease-in-sine",
    delay: 300,
    anchorPlacement: "top-bottom",
    once: false,
  });

  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
