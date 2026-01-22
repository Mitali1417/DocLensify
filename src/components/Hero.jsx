import {
  IoCloudUploadOutline,
  IoSparkles,
  IoArrowForward,
  IoRocket,
} from "react-icons/io5";

export default function Hero({ user }) {
  return (
    <div className="relative overflow-hidden bg-card-dark rounded-lg border border-border-dark/50 p-8 md:p-12 mb-8 shadow-gallery">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-linear-to-t from-muted-grey to-white bg-clip-text mb-2 leading-tight">
              Welcome back,{" "} <br />
              <span className="text-brand-blue">
                {user.displayName || "Champion"}
              </span>
              {""} !
            </h1>
            <p className="text-muted-grey text-sm sm:text-lg max-w-xl font-medium leading-relaxed">
              Your creative journey continues. Ready to transform more documents
              into <span className="text-white italic">masterpieces</span>{" "}
              today?
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 justify-end animate-in zoom-in duration-1000">
          <div className="relative p-4 bg-bg-dark rounded-2xl border border-border-dark shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="w-64 h-40 bg-card-light/20 rounded-xl border border-dashed border-border-dark flex flex-col items-center justify-center gap-2 text-muted-grey italic text-sm">
              <IoCloudUploadOutline size={40} className="text-brand-blue/50" />
              Your Next Scan Here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
