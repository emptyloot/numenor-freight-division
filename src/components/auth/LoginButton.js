/**
@description  Renders a button to initiate the user authentication flow.
 When clicked, it triggers the sign-in process via a specified provider, such as Discord.
 It can be customized with properties to handle login events and disabled states.
@returns {object} Render of the login button
 */
function LoginButton() {
  return (
    <div>
      <a
        href="/"
        className="bg-[#FFC107] text-[#0B2545] font-bold px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
      >
        Login
      </a>
    </div>
  );
}

export default LoginButton;
