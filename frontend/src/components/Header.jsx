import { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
    <header
      style={{
        borderBottom: "1px solid #e5e7eb3c",
        padding: "16px 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <div
          onClick={() => nav("/dashboard")}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <div>
            <h6
              style={{
                fontSize: "18px",
                fontWeight: "800",
                lineHeight: "1.2",
              }}
            >
              DocLensify
            </h6>
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "0.5px",
              }}
            >
              Document Scanner
            </p>
          </div>
        </div>

        {/* User Section */}
        {user && (
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowMenu(!showMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "10px",
                transition: "background 0.2s",
                background: showMenu ? "var(--card)" : "transparent",
              }}
              onMouseEnter={(e) =>
                !showMenu && (e.currentTarget.style.background = "var(--card)")
              }
              onMouseLeave={(e) =>
                !showMenu && (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  marginRight: "4px",
                }}
              >
                <h6
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {user.displayName || "User"}
                </h6>
                <span
                  style={{
                    fontSize: "12px",
                  }}
                >
                  {user.email}
                </span>
              </div>

              {/* Avatar */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                }}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  getInitials(user.displayName || user.email)
                )}
              </div>

              {/* Dropdown Arrow */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  transition: "transform 0.2s",
                  transform: showMenu ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                {/* Backdrop */}
                <div
                  onClick={() => setShowMenu(false)}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 10,
                  }}
                />

                {/* Menu */}
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "10px",
                    boxShadow:
                      "0 10px 25px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)",
                    minWidth: "220px",
                    overflow: "hidden",
                    zIndex: 20,
                  }}
                >
                  <div style={{ padding: "8px" }}>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        nav("/dashboard");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "white",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "var(--border)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "transparent")
                      }
                    >
                      Dashboard
                    </button>

                    <div
                      style={{
                        height: "1px",
                        background: "var(--border)",
                        margin: "8px 0",
                      }}
                    />

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleLogout();
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#dc2626",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#ff000012")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "transparent")
                      }
                    >
                      {" "}
                      Sign Out
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
