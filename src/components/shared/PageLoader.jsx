import { ImSpinner9 } from "react-icons/im";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-bg-dark flex flex-col items-center justify-center z-50 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute inset-0 bg-brand-blue/20 blur-3xl rounded-full animate-pulse" />

        <div className="relative bg-card-dark  rounded-3xl border border-border-dark shadow-2xl duration-300 animate-pulse">
          <img src="logo.png" className="aspect-square rounded-3xl h-24 w-24" />
          <ImSpinner9 className="absolute -top-2 -right-2 text-2xl animate-spin duration-300" />
        </div>
      </div>
    </div>
  );
}
