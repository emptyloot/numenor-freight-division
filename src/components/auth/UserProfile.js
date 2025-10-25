import { useAuth } from '../../context/AuthContext';

/**
 * @description Displays the user's profile information, including their avatar and username.
 * If no user is logged in, it shows a guest profile.
 * @returns {object} Render of the user profile
 */
const UserProfile = () => {
  const { currentUser } = useAuth();

  // Placeholder user data
  const placeholderUser = {
    username: 'Guest',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
  };

  const displayUser = currentUser || placeholderUser;

  // Construct the avatar URL if the user has an avatar hash
  const avatarUrl =
    currentUser && currentUser.avatar
      ? `https://cdn.discordapp.com/avatars/${currentUser.discordId}/${currentUser.avatar}.png`
      : placeholderUser.avatar;

  return (
    <div className="flex items-center">
      <img src={avatarUrl} alt={`${displayUser.username}'s avatar`} className="w-10 h-10 rounded-full mr-4" />
      <span className="text-white font-bold">{displayUser.username}</span>
    </div>
  );
};

export default UserProfile;
