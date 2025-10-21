import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Homepage from './components/homepage/Homepage.js';
import Background from './components/background/Background.js';
import Header from './components/header/Header.js';
import About from './components/aboutus/About.js';
import CreateShipment from './components/scheduleshipmentspage/CreateShipment.js';
import React from 'react';

/**
@description The main application component that assembles the page layout and defines the routes.
@returns {React.element} The rendered application with a persistent background and header.
 */
function App() {
  return (
    <BrowserRouter>
      <Background />
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/schedule" element={<CreateShipment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
