import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase/firebase";
import { IoArrowForward, IoLogoGoogle } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import Banner from "../assets/home-banner.svg";

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
        await updateProfile(userCredential.user, { displayName: username });
        console.log(`Welcome to the family, ${username}! 🎊`);
      }
      nav("/dashboard");
    } catch (err) {
      setError(
        isLogin
          ? "Oops! Credentials don't match."
          : "Could not create account. Try again!",
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
      setError("Google sign-in failed. Please try again!");
    }
  };

  return (
    <div className="min-h-[95vh] relative flex items-center justify-center p-4">
      <div className="w-full relative max-w-md bg-card-dark border border-border-dark rounded-lg p-8 md:p-10 shadow-2xl overflow-hidden">
       <div className="relative z-10">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-linear-to-t from-muted-grey to-white bg-clip-text mb-2">
            {isLogin ? "Welcome back" : "Join DocLensify"}
          </h2>
          <p className="text-muted-grey text-sm">
            {isLogin
              ? "Your document library is waiting"
              : "Start your journey with us today"}
          </p>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full text-sm flex items-center justify-center gap-3 bg-bg-dark border border-border-dark hover:bg-white/10 text-white py-2 rounded-lg transition-all duration-300 group shadow-lg"
        >
          <IoLogoGoogle className="text-xl group-hover:scale-110 transition-transform" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-dark"></div>
          </div>
          <span className="relative px-4 bg-card-dark text-xs font-bold text-muted-grey uppercase tracking-widest">
            or
          </span>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <input
              placeholder="Full Name"
              type="text"
              required
              className="w-full"
              onChange={(e) => setUsername(e.target.value)}
            />
          )}

          <input
            placeholder="Email address"
            type="email"
            required
            className="w-full"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Password"
            type="password"
            required
            className="w-full"
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-red-400 text-xs font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              {loading
                ? <CgSpinner className="animate-spin" />
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
              <IoArrowForward className="text-lg" />
            </button>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-grey transition-colors"
            >
              {isLogin
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
     
       </div>



       <div className="absolute top-0 left- right-0 w-[200%] z-0 aspect-video rotate-45 opacity-40">
              <img src={Banner} alt="hero banner" />
            </div>
         <div className="absolute top-0 left- -right-20 w-[200%] z-0 aspect-video rotate-180 opacity-30">
              <img src={Banner} alt="hero banner" />
            </div>
      
      </div>

       
    </div>
  );
}
