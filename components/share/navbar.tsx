import Link from "next/link";
import { MdContactPage } from "react-icons/md";
import { SiGithub, SiLinkedin } from "react-icons/si";
import { ThemeToggle } from "../theme-toggle";

const item =
  "text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 hover:underline";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-2.5">
        {/* Section links — take remaining width and scroll horizontally on
            narrow screens so they never push the icons off-screen. */}
        <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto whitespace-nowrap text-sm sm:gap-4">
          <Link href="/" className={item}>
            /home
          </Link>
          <Link href="/projects" className={item}>
            /projects
          </Link>
          <Link href="/blog" className={item}>
            /blog
          </Link>
          <Link href="/open-source" className={item}>
            /open-source
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <a
            href="https://github.com/alexng353"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className={item}
          >
            <SiGithub className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/alexng353/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className={item}
          >
            <SiLinkedin className="h-5 w-5" />
          </a>
          <Link href="/contact" aria-label="Contact" className={item}>
            <MdContactPage className="h-5 w-5" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
