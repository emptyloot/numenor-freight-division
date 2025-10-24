/**
 * @description Displays the user's profile information, including their avatar and username.
 * @param {string} user - The user's username.
 * @returns {object} Render of the user profile
 */
const UserProfile = ({ user }) => {
  // Placeholder user data
  const placeholderUser = {
    username: 'Guest',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
  };

  const displayUser = user || placeholderUser;

  return (
    <div className="flex items-center">
      <img src={displayUser.avatar} alt={`${displayUser.username}'s avatar`} className="w-10 h-10 rounded-full mr-4" />
      <span className="text-white font-bold">{displayUser.username}</span>
    </div>
  );
};

export default UserProfile;
