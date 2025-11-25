import { useAuth } from '../../context/AuthContext';

/**
@description Renders a button to log the user out.
@returns {object} Render of the logout button
 */
const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-off-white font-bold py-2 px-4 rounded">
      Logout
    </button>
  );
};
export default LogoutButton;
