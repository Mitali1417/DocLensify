import { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { BiChevronDown, BiLogOut } from "react-icons/bi";

export default function Header() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      nav("/");
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

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
    <header className="border-b border-border-dark p-2 top-0 z-50 sticky bg-bg-dark">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => nav("/dashboard")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src="/logo.png"
            alt="logo"
            className="w-12 h-12 object-cover rounded-full"
          />
        </div>

        {/* User Section */}
        {user && (
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-4 cursor-pointer hover:bg-card-dark py-2 px-4 rounded-lg"
            >
              <div className="flex flex-col items-end mr-2">
                <h6 className="font-semibold">{user.displayName || "User"}</h6>
                <span className="text-sm">{user.email}</span>
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-700 flex items-center justify-center text-white font-semibold text-sm">
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

              {/* Dropdown Arrow */}

              <div className={`${showMenu ? "rotate-180" : "rotate-0"}`}>
                <BiChevronDown />
              </div>
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                {/* Backdrop */}
                <div
                  onClick={() => setShowMenu(false)}
                  className="fixed inset-0 z-10"
                />

                {/* Menu */}
                <div className="absolute top-[calc(100% + 8px)] right-0 z-20 bg-card-dark border border-border-dark rounded-lg shadow-md max-w-44 w-full">
                  <div className="text-sm p-2">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        nav("/dashboard");
                      }}
                      className="w-full text-left rounded-lg px-2.5 py-2 text-white transition-all hover:bg-border-dark"
                    >
                      Dashboard
                    </button>

                    <div className="h-px bg-border-dark my-2" />

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleLogout();
                      }}
                      className="w-full  text-left rounded-lg px-2.5 py-2 text-red-600 transition-all hover:bg-red-600/20"
                    >
                      Sign out
                      <BiLogOut className="inline-block ml-2" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
