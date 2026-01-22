import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Header from "../components/Header";
import UploadZone from "../components/UploadZone";
import Gallery from "../components/Gallery";
import PageLoader from "../components/shared/PageLoader";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <PageLoader />;

  if (!user) return <h2>Please login to view your dashboard!</h2>;

  return (
    <div className="dashboard-layout">
      <Header />
      <main className="p-2">
        <UploadZone />
        <Gallery />
      </main>
    </div>
  );
}
