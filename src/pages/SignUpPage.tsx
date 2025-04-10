import React, { useState } from "react";
import { signUp, confirmSignUp } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"signUp" | "confirm">("signUp"); // Track sign-up or confirm step
  const [email, setEmail] = useState(""); // Store email for confirmation
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState(""); // For verification code
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const signUpResult = await signUp({
        username: email, // Cognito uses email as username
        password,
        options: {
          userAttributes: {
            email,
            "custom:username": username,
            ...(phoneNumber ? { phone_number: phoneNumber } : {}),
          },
        },
      });
      console.log("SignUp Result:", signUpResult);
      if (signUpResult.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setStep("confirm"); // Switch to confirmation UI
      }
    } catch (err) {
      setError("Error signing up: " + (err as Error).message);
      console.error("Error signing up:", err);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const confirmResult = await confirmSignUp({
        username: email, // Must match sign-up email
        confirmationCode: code,
      });
      console.log("Confirm Result:", confirmResult);
      if (confirmResult.isSignUpComplete) {
        console.log("Sign-up confirmed!");
        navigate("/signin"); // Redirect to sign-in
      }
    } catch (err) {
      setError("Error confirming: " + (err as Error).message);
      console.error("Error confirming:", err);
    }
  };

  return (
    <div>
      <h2>{step === "signUp" ? "Sign Up" : "Verify Your Email"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {step === "signUp" ? (
        <form onSubmit={handleSignUp}>
          <div>
            <label htmlFor="email">Email (Sign-in ID):</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="username">Username (Display Name):</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber">Phone Number (Optional):</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <button type="submit">Sign Up</button>
        </form>
      ) : (
        <form onSubmit={handleConfirm}>
          <div>
            <label htmlFor="code">Verification Code:</label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <button type="submit">Confirm</button>
        </form>
      )}
    </div>
  );
}

export default SignUpPage;