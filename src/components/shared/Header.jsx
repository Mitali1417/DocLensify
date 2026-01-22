import { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import {
  BiChevronDown,
  BiLogOut,
  BiGridAlt,
  BiLogIn,
  BiArrowFromLeft,
} from "react-icons/bi";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase/firebase";
import ConfirmDialog from "./ConfirmDialog";
import { IoArrowForward } from "react-icons/io5";
import { BsArrowBarUp } from "react-icons/bs";

export default function Header() {
  const nav = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogoutRequest = () => {
    setShowMenu(false);
    setIsLogoutDialogOpen(true);
  };

  const confirmSignOut = async () => {
    try {
      await signOut(auth);
      nav("/");
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setIsLogoutDialogOpen(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="py-2 px-4 rounded-lg max-w-7xl mx-auto top-4 z-50 sticky bg-bg-dark shadow-2xl">
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        title="Sign Out"
        message="Are you sure you want to sign out? You will be redirected to the home page."
        onConfirm={confirmSignOut}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
      <div className="flex justify-between items-center">
        <div
          onClick={() => nav(user ? "/dashboard" : "/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src="logo.png" alt="Logo" className="w-10 h-10 rounded-lg" />
          <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
            DocLensify
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <div
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 cursor-pointer hover:bg-card-light/30 p-1.5 pr-3 rounded-2xl transition-all border border-transparent hover:border-border-dark"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-linear-to-br from-brand-blue to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(user.displayName || user.email)
                  )}
                </div>

                <div className="hidden md:flex flex-col items-start leading-tight">
                  <h6 className="text-sm font-bold text-white">
                    {user.displayName || "Champion"}
                  </h6>
                  <span className="text-[10px] text-muted-grey font-medium uppercase tracking-wider">
                    Workspace
                  </span>
                </div>

                <BiChevronDown
                  className={`text-muted-grey transition-transform duration-300 ${showMenu ? "rotate-180" : ""}`}
                />
              </div>

              {showMenu && (
                <>
                  <div
                    onClick={() => setShowMenu(false)}
                    className="fixed inset-0 z-10"
                  />
                  <div className="absolute top-[calc(100%+12px)] right-0 z-20 bg-card-dark border border-border-dark rounded-2xl shadow-2xl w-56 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-border-dark bg-white/5">
                      <p className="text-[10px] font-bold text-muted-grey uppercase tracking-widest mb-1">
                        Signed in as
                      </p>
                      <p className="text-xs font-medium text-white truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          nav("/dashboard");
                        }}
                        className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-blue hover:shadow-lg hover:shadow-brand-blue/20"
                      >
                        <BiGridAlt className="text-lg" /> Dashboard
                      </button>

                      <div className="h-px bg-border-dark my-1 mx-2" />

                      <button
                        onClick={handleLogoutRequest}
                        className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/10"
                      >
                        <BiLogOut className="text-lg" /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {location.pathname !== "/auth" && (
                <>
                  <button
                    onClick={() => nav("/auth")}
                    className="btn-outline px-5 py-2 text-sm"
                  >
                    Log in <IoArrowForward />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
