import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Homepage from './components/homepage/Homepage.js';
import Background from './components/background/Background.js'
import Header from './components/header/Header.js'
import About from './components/aboutus/About.js'

function App() {
  return (
    <BrowserRouter>
        <Background />
        <Header />
        <Routes>
          <Route path="/" element={<Homepage/>} />
          <Route path="/about" element={<About/>} />
        </Routes>
    </BrowserRouter>

  );
}

export default App;
