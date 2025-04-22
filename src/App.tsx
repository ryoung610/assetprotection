import { useEffect, useState } from 'react';
import { getCurrentUser, signIn, signUp, confirmSignUp } from '@aws-amplify/auth';
import { Chat } from './pages/Chat';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './components/chat/ChatPage';



const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Handle sign-in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn({ username, password });
      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  // Handle sign-up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signUp({
        username,
        password,
        options: {
          userAttributes: { email },
        },
      });
      setShowConfirmation(true); // Show confirmation code input
    } catch (err: any) {
      console.error('Sign-up error:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
    }
  };

  // Handle confirmation code
  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await confirmSignUp({ username, confirmationCode });
      setShowConfirmation(false);
      setIsSignUpMode(false); // Switch to sign-in mode
      setConfirmationCode('');
      setEmail('');
    } catch (err: any) {
      console.error('Confirmation error:', err);
      setError(err.message || 'Failed to confirm sign-up. Please check the code.');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {isAuthenticated ? (
        <ChatPage />
      ) : (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isSignUpMode ? (showConfirmation ? 'Confirm Sign-Up' : 'Sign Up') : 'Sign In'}
          </h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          {isSignUpMode && showConfirmation ? (
            // Confirmation form
            <form onSubmit={handleConfirmSignUp} className="space-y-4">
              <div>
                <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700">
                  Confirmation Code
                </label>
                <input
                  id="confirmationCode"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter confirmation code"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">
                Back to{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setShowConfirmation(false);
                    setIsSignUpMode(false);
                    setError(null);
                  }}
                >
                  Sign In
                </button>
              </p>
            </form>
          ) : (
            // Sign-in or Sign-up form
            <form onSubmit={isSignUpMode ? handleSignUp : handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              {isSignUpMode && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isSignUpMode ? 'Sign Up' : 'Sign In'}
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">
                {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setIsSignUpMode(!isSignUpMode);
                    setError(null);
                    setUsername('');
                    setPassword('');
                    setEmail('');
                  }}
                >
                  {isSignUpMode ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default App;