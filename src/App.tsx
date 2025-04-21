import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { signOut, fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import NavBar from "./components/Layout/NavBar";
import MainPage from "./pages/MainPage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import ProfilePage from "./pages/ProfilePage";
import Home from "./pages/HomePage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession({ forceRefresh: true });
        if (!session.tokens?.idToken) throw new Error("No ID token in session");
        setIsSignedIn(true);
      } catch (err) {
        console.error("Auth Check Failed:", err);
        setIsSignedIn(false);
      }
    };
    checkAuth();
  }, []);

  if (isSignedIn === null) return <p className="text-center p-4">Loading...</p>;
  return isSignedIn ? <>{children}</> : <Navigate to="/signin" />;
}

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
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Router>
        {/* Sidebar */}
        <div className="w-64 h-screen bg-white shadow-md fixed">
          <NavBar />
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/group/:groupId"
              element={
                <ProtectedRoute>
                  <MainPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
