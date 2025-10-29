import { Routes, Route } from 'react-router-dom';

import Homepage from './components/homepage/Homepage.js';
import Background from './components/background/Background.js';
import Header from './components/header/Header.js';
import About from './components/aboutus/About.js';
import CreateShipment from './components/scheduleshipmentspage/CreateShipment.js';
import ProtectedRoute from './components/auth/ProtectedRoute.js';
import AuthCallback from './components/auth/AuthCallback.js';
import Dashboard from './components/dashboard/Dashboard.js';

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
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <CreateShipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
      <footer>
        <p>
          Flag icon by Aratan Isildurion, used under
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">
            CC BY-SA 4.0
          </a>
          .
        </p>
      </footer>
    </div>
  );
}

export default App;
