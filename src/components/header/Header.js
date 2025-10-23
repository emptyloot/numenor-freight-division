import { Link, useLocation } from 'react-router-dom';
import LoginButton from '../auth/LoginButton.js';

import Logo from '../logo/Logo.js';
/**
@description Provides navigation for website to be persistent on all pages. 
Includes logo for home page navigation. 
@returns {object} (JSX.element) render logo and navigation links for website.
 */
function Header() {
  const location = useLocation();
  const secondaryLink =
    location.pathname === '/' ? { to: '/about', text: 'About us' } : { to: '/', text: 'Calculator' };

  return (
    <header className="relative z-10 p4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          <Link
            to={secondaryLink.to}
            className="border-2 border-[#FFC107] text-[#FFC107] px-4 py-2 rounded-full hover:bg-[#FFC107] hover:text-[#0B2545] transition-colors"
          >
            {secondaryLink.text}
          </Link>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}

export default Header;
