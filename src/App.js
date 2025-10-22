import { Routes, Route } from 'react-router-dom';

import Homepage from './components/homepage/Homepage.js';
import Background from './components/background/Background.js';
import Header from './components/header/Header.js';
import About from './components/aboutus/About.js';
import CreateShipment from './components/scheduleshipmentspage/CreateShipment.js';

/**
@description The main application component that assembles the page layout and defines the routes.
@returns {object} (JSX.element) The rendered application with a persistent background and header.
 */
function App() {
  return (
    <div>
      <Background />
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/schedule" element={<CreateShipment />} />
      </Routes>
      </div>
  );
}

export default App;
