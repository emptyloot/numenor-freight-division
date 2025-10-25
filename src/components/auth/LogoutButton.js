import { useAuth } from '../../context/AuthContext';

//Mocks
jest.mock('firebase/auth');

/**
@description Renders a button to log the user out.
@returns {object} Render of the logout button
 */
const LogoutButton = () => {
  const { setIsAuthenticated } = useAuth();

  return (
    <button
      onClick={() => setIsAuthenticated(false)}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      Logout
    </button>
  );
};
export default LogoutButton;
