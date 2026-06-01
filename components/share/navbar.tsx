import Link from "next/link";
import { MdContactPage } from "react-icons/md";
import { SiGithub, SiLinkedin } from "react-icons/si";
import { ThemeToggle } from "../theme-toggle";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Section links — take remaining width and scroll horizontally on
            narrow screens so they never push the icons off-screen. */}
        <div className={styles.links}>
          <Link href="/" className={styles.item}>
            /home
          </Link>
          <Link href="/projects" className={styles.item}>
            /projects
          </Link>
          <Link href="/blog" className={styles.item}>
            /blog
          </Link>
          <Link href="/open-source" className={styles.item}>
            /open-source
          </Link>
        </div>

        <div className={styles.right}>
          <a
            href="https://github.com/alexng353"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className={styles.item}
          >
            <SiGithub className="size-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/alexng353/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className={styles.item}
          >
            <SiLinkedin className="size-5" />
          </a>
          <Link href="/contact" aria-label="Contact" className={styles.item}>
            <MdContactPage className="size-6" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
