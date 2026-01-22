import { useEffect, useState } from "react";

import Header from "../components/shared/Header";
import UploadZone from "../components/UploadZone";
import Gallery from "../components/Gallery";
import PageLoader from "../components/shared/PageLoader";
import Hero from "../components/Hero";
import Footer from "../components/shared/Footer";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase/firebase";

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

  return (
    <div className="dashboard-layout bg-bg-dark min-h-screen container mx-auto mt-2 sm:mt-6 px-2 sm:px-4">
      <Header />
      <main className="mt-4">
        <Hero user={user} />

        {user ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <UploadZone />
            <Gallery />
          </div>
        ) : (
          <div className="text-center py-20 bg-card-dark rounded-3xl border border-dashed border-border-dark">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to start your collection?
            </h2>
            <p className="text-muted-grey mb-8">
              Login to save your scans and view them from anywhere! ✨
            </p>
            <button className="btn-primary">Login to My Workspace</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
