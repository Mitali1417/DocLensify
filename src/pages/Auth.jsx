import { useState } from "react";
import { auth } from "../firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(userCredential.user, {
          displayName: username,
        });
        console.log(`Welcome to the family, ${username}!`);
      }
      nav("/dashboard");
    } catch (err) {
      setError(
        isLogin
          ? "Oops! Credentials don't match."
          : "Could not create account.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      nav("/dashboard");
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div className="auth-card  container mx-auto">
      <h2 style={{ marginBottom: "4px", fontWeight: "400" }}>
        {isLogin ? "Welcome back" : "Join DocLensify"}
      </h2>
      <p style={{ marginBottom: "32px" }}>
        {isLogin ? "Sign in to continue" : "Create your account to get started"}
      </p>

      <button onClick={loginWithGoogle} className="btn-outline">
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          width="20"
          alt="G"
        />
        Continue with Google
      </button>

      <div
        style={{
          margin: "20px 0",
          fontSize: "14px",
          backgroundColor: "var(--border)",
          height: "1px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span style={{ backgroundColor: "var(--card)", padding: "0 10px" }}>
          or
        </span>
      </div>

      <form onSubmit={handleAuth}>
        {!isLogin && (
          <input
            placeholder="Username"
            type="text"
            required
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          placeholder="Email address"
          type="email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p style={{ color: "#d93025", fontSize: "14px", marginTop: "10px" }}>
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              color: "var(--blue)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            {isLogin ? "Create account" : "I have an account"}
          </button>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "auto" }}
            disabled={loading}
          >
            {loading ? "..." : isLogin ? "Sign in" : "Sign up"}
          </button>
        </div>
      </form>
    </div>
  );
}
