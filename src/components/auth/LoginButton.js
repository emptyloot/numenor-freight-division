/**
@description  Renders a button to initiate the user authentication flow.
 When clicked, it triggers the sign-in process via a specified provider, such as Discord.
 It can be customized with properties to handle login events and disabled states.
@returns {object} Render of the login button
 */
const LoginButton = () => {
  return (
    <button className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2 px-4 rounded-md flex items-center">
      Login with Discord
    </button>
  );
};
export default LoginButton;
