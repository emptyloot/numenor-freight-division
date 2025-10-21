import React, { useState, useEffect } from 'react';

import Calculator from '../../utils/Calculator.js';
import { useNavigate } from 'react-router-dom';

function Homepage() {
  const [energy, setEnergy] = useState('');
  const [tiles, setTiles] = useState('');
  const [quote, setQuote] = useState(0);
  useEffect(() => {
    const hexCost = Calculator(energy, tiles);
    setQuote(hexCost);
  }, [energy, tiles]);

  const navigate = useNavigate();
  const handleScheduleClick = () => {
    navigate('/schedule');
  };

  return (
    <main className="container mx-auto p-4 text-center text-[#EDF2F4]">
      <div>
        {/*Inspiring message */}
        <h1 className="text 4x1 md:text-5x1 font-bold mt-8">"By land or sea, the world turns on our trade"</h1>
        {/*Calculator */}
        <div className="bg-[#4A6572]/80 p-8 rounded-2x1 mt-12 backdrop-blur-sm border border-white/10">
          <h2 className="text-2x1 font-semibold mb-6">"Instant Quote Calculator"</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="tp-energy" className="block text-left mb-1">
                Enter TP Energy:
              </label>
              <input
                id="tp-energy"
                type="number"
                min="0"
                value={energy}
                onChange={(e) => setEnergy(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="number-tiles" className="block text-left mb-1">
                Enter Number of Tiles:
              </label>
              <input
                id="number-tiles"
                typ="number"
                min="0"
                value={tiles}
                onChange={(e) => setTiles(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
              />
            </div>
            <div className="pt-4">
              <div className="w-full p-3 rounded-lg bg-gray-700/60 text-x1 font-bold text-[#ffc107]">
                {quote > 0 ? `${quote.toLocaleString()} Hex` : '--- Hex'}
              </div>
            </div>
            <div className="pt-6">
              <button
                type="button"
                onClick={handleScheduleClick}
                className="w-full bg-[#FFC107] text-[#0b2545] font-bold text-lg p-3 rounded-full hover:opacity-90 transition-opacity"
              >
                Schedule This Delivery
              </button>
            </div>
          </form>
        </div>
        <div className="mt-24 text-lg space-y-2">
          <p>Step 1: Get an instant and transparent quote</p>
          <p>Step 2: Schedule your delivery with our secure system</p>
          <p>Step 3: Track your cargo's progress in your dashboard</p>
        </div>
      </div>
    </main>
  );
}

export default Homepage;
