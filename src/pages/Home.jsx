import { useNavigate } from "react-router-dom";
import {
  IoCloudUploadOutline,
  IoSparkles,
  IoShieldCheckmark,
  IoFlash,
  IoScanOutline,
  IoTimerOutline,
} from "react-icons/io5";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import Banner from "../assets/home-banner.svg";

export default function Home() {
  const navigate = useNavigate();

  const handleStartUploading = () => {
    navigate("/auth?redirect=dashboard");
  };

  return (
    <div className="min-h-screen relative bg-bg-dark font-sans selection:bg-brand-blue/30 px-2 sm:px-4 overflow-hidden">
      <Header />
  
      <main className="pt-16 pb-24 text-center">
        <div className="group">
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 italic-none">
            Turn your scans into{" "}
            <span className="bg-linear-to-t from-brand-blue to-white bg-clip-text text-transparent font-black">
              Magic.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-grey text-xs sm:text-lg md:text-xl mb-10 leading-relaxed">
            Experience the future of scanning. Our AI detects edges, enhances
            text, and organizes your life in seconds.
          </p>

          <button
            onClick={handleStartUploading}
            className="btn-primary flex items-center gap-3 mx-auto"
          >
            <IoCloudUploadOutline className="text-2xl" />
            Start Scanning Now
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {[
            {
              icon: <IoTimerOutline className="text-amber-400" />,
              title: "Instant Scan",
              desc: "No more waiting. Get your docs in a blink.",
            },
            {
              icon: <IoScanOutline className="text-blue-400" />,
              title: "Precision Warp",
              desc: "Correct perspective for a perfect finish.",
            },
            {
              icon: <IoShieldCheckmark className="text-emerald-400" />,
              title: "Secure Cloud",
              desc: "Your documents are for your eyes only.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={`p-4 sm:p-6 ${i % 2 !== 0 ? "bg-linear-to-t from-brand-blue/10 to-transparent border-transparent" : "border"} rounded-3xl border-brand-blue/30 transition-colors group`}
            >
              <div className="w-12 h-12 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ease-in-out duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-grey text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
