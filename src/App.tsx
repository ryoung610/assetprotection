import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from "react-router-dom";
import { signOut, fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils"; // Add Hub for auth events
import TodoPage from "./pages/Todopage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  useEffect(() => {
    const listener = (data: any) => {
      console.log("Auth Event:", data);
      if (data.payload.event === "signedIn") {
        console.log("User signed in");
      } else if (data.payload.event === "signedOut") {
        console.log("User signed out");
      }
    };
    const unsubscribe = Hub.listen("auth", listener);

    Hub.listen("auth", listener);
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <Router>
      <div>
        <h1>Home Page</h1>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/signin">Sign In</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/todos">Todos</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/todos" element={<TodoPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession({ forceRefresh: true }); // Force token refresh
        console.log("Home Session:", session);
        if (!session.tokens?.idToken) throw new Error("No ID token in session");
        setIsSignedIn(true);
      } catch (err) {
        console.error("Home Auth Check Failed:", err);
        setIsSignedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsSignedIn(false);
      navigate("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (isSignedIn === null) return <p>Loading...</p>;
  return (
    <div>
      <h2>Welcome to My Website</h2>
      <p>This is the home page.</p>
      {isSignedIn ? (
        <>
          <p>You are signed in!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </>
      ) : (
        <>
          <p>You are not signed in.</p>
          <button onClick={() => navigate("/signin")}>Sign In</button>
        </>
      )}
    </div>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession({ forceRefresh: true }); // Force token refresh
        console.log("ProtectedRoute Session:", session);
        if (!session.tokens?.idToken) throw new Error("No ID token in session");
        setIsAuthenticated(true);
      } catch (err) {
        console.error("ProtectedRoute Auth Check Failed:", err);
        setIsAuthenticated(false);
        navigate("/signin");
      }
    };
    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) return <p>Loading...</p>;
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

export default App;