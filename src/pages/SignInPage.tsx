import React, { useState } from "react";
import { signIn } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const signInResult = await signIn({ username: email, password });
      console.log("SignIn Result:", signInResult);
      console.log("Next Step:", signInResult.nextStep); // Log nextStep
      if (signInResult.isSignedIn) {
        console.log("Sign-in successful!");
        navigate("/profile");
      } else {
        setError(`Sign-in incomplete: ${signInResult.nextStep.signInStep}`);
      }
    } catch (err) {
      setError("Error signing in: " + (err as Error).message);
      console.error("SignIn Error:", err);
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSignIn}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignInPage;