import { Tooltip } from "@mui/material";
import Link from "next/link";
import { MdArticle, MdContactPage } from "react-icons/md";
import { SiGithub, SiLinkedin } from "react-icons/si";

// Dark icons on a light page, white on a dark page (react-icons fill follows
// currentColor, so a text-color class is all we need).
const ICON =
  "text-gray-800 dark:text-white hover:scale-110 transition-all ease-in-out";

export const HeadIcons = () => (
  <div className="inline-flex gap-3">
    <Tooltip title="Github">
      <a
        href="https://github.com/alexng353"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SiGithub className={`h-6 w-6 ${ICON}`} />
      </a>
    </Tooltip>
    <Tooltip title="LinkedIn">
      <a
        href="https://www.linkedin.com/in/alexng353/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SiLinkedin className={`h-6 w-6 ${ICON}`} />
      </a>
    </Tooltip>
    <Tooltip title="Contact">
      <Link href="/contact">
        <MdContactPage
          style={{ position: "relative", top: "-2" }}
          className={`h-7 w-7 ${ICON}`}
        />
      </Link>
    </Tooltip>
    <Tooltip title="Blog">
      <Link href="/blog">
        <MdArticle
          style={{ position: "relative", top: "-2" }}
          className={`h-7 w-7 ${ICON}`}
        />
      </Link>
    </Tooltip>
  </div>
);
