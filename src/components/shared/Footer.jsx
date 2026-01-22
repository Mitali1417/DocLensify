import { IoHeart, IoLogoGithub, IoLogoLinkedin } from "react-icons/io5";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-bg-dark border-t border-border-dark py-4 mt-4 sm:mt-10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 group">
            <span className="text-white font-bold tracking-tight">
              DocLensify{" "}
              <span className="text-muted-grey font-medium text-xs ml-1">
                v1.0
              </span>
            </span>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-border-dark font-medium flex items-center gap-1.5">
              Built for greatness with{" "}
              <IoHeart className="text-red-500 animate-pulse" /> by
              <Link
                to="http://mitali.vercel.app/"
                className="text-muted-grey/60 hover:text-brand-blue cursor-pointer transition-colors"
              >
                {" "}
                Mitali
              </Link>
            </p>
            <p className="text-[10px] font-bold text-muted-grey/50 uppercase tracking-[0.2em]">
              © {currentYear} All Rights Reserved
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://github.com/Mitali1417"
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-card-dark rounded-xl border border-border-dark text-muted-grey hover:text-white hover:border-brand-blue/50 transition-all"
            >
              <IoLogoGithub size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/mitalis14/"
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-card-dark rounded-xl border border-border-dark text-muted-grey hover:text-white hover:border-brand-blue/50 transition-all"
            >
              <IoLogoLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
