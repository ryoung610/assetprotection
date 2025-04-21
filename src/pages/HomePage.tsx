import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAuthSession, signOut } from "aws-amplify/auth";

const Home: React.FC = () => {
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
        console.error("Home Auth Check Failed:", err);
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

  if (isSignedIn === null) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Protect Your Assets with Secure Collaboration
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Join secure group chats to manage and protect your assets with confidence.
          </p>
          {isSignedIn ? (
            <Link
              to="/group/default-group-id"
              className="inline-block bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition"
            >
              Join a Group Chat
            </Link>
          ) : (
            <Link
              to="/signin"
              className="inline-block bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition"
            >
              Sign In to Start
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Asset Protection App?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">Secure Group Chats</h3>
              <p className="text-gray-600">
                Collaborate with your team in encrypted group chats to discuss asset protection strategies.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">Media Sharing</h3>
              <p className="text-gray-600">
                Share images and documents securely, stored in protected cloud storage.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">Real-Time Updates</h3>
              <p className="text-gray-600">
                Stay informed with instant message updates, keeping your team in sync.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-blue-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Secure Your Assets?
          </h2>
          <p className="text-lg mb-8">
            {isSignedIn
              ? "Explore group chats or manage your profile to get started."
              : "Sign up or sign in to join the asset protection community."}
          </p>
          <div className="flex justify-center space-x-4">
            {isSignedIn ? (
              <>
                <Link
                  to="/group/default-group-id"
                  className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
                >
                  Go to Group Chat
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
                <Link
                  to="/signin"
                  className="bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>🥳 Asset Protection App &copy; 2025</p>
      </footer>
    </div>
  );
};

export default Home;