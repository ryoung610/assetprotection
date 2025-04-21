import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { FaHome, FaUser, FaCog, FaSignInAlt, FaSignOutAlt, FaUserPlus } from "react-icons/fa"; // Import icons

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  // Check authentication state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession({ forceRefresh: true });
        if (!session.tokens?.idToken) throw new Error("No ID token in session");
        setIsSignedIn(true);
      } catch (err) {
        console.error("NavBar Auth Check Failed:", err);
        setIsSignedIn(false);
      }
    };
    checkAuth();
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsSignedIn(false);
      navigate("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (isSignedIn === null) return null; // Avoid rendering until auth state is checked

  return (
    <nav className="bg-gray-100 p-4 flex justify-between items-center shadow-md">
      <ul className="flex space-x-6">
        <li>
          <Link to="/" className="flex items-center text-blue-600 font-medium hover:underline">
            <FaHome className="mr-2" /> Home
          </Link>
        </li>
        {!isSignedIn && (
          <>
            <li>
              <Link to="/signup" className="flex items-center text-blue-600 font-medium hover:underline">
                <FaUserPlus className="mr-2" /> Sign Up
              </Link>
            </li>
            <li>
              <Link to="/signin" className="flex items-center text-blue-600 font-medium hover:underline">
                <FaSignInAlt className="mr-2" /> Sign In
              </Link>
            </li>
          </>
        )}
        {isSignedIn && (
          <>
            <li>
              <Link to="/profile" className="flex items-center text-blue-600 font-medium hover:underline">
                <FaUser className="mr-2" /> Profile
              </Link>
            </li>
            <li>
              <Link to="/group/default-group-id" className="flex items-center text-blue-600 font-medium hover:underline">
                <FaCog className="mr-2" /> Group Chat
              </Link>
            </li>
          </>
        )}
      </ul>
      {isSignedIn && (
        <button
          onClick={handleSignOut}
          className="flex items-center text-blue-600 font-medium hover:underline"
        >
          <FaSignOutAlt className="mr-2" /> Sign Out
        </button>
      )}
    </nav>
  );
};

export default NavBar;
