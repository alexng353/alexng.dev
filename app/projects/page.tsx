import { CatGif } from "@components/CatGif";
import Content from "@components/content";
import type { Metadata } from "next";
import Link from "next/link";

const CLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const isExternal = href.startsWith("http");
  const linkStyles =
    "w-full border text-center px-4 py-2 border-green-500 hover:bg-green-500 rounded-lg transition-all";

  if (isExternal) {
    return (
      <a className={linkStyles} href={href}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={linkStyles}>
      {children}
    </Link>
  );
};

export const metadata: Metadata = {
  title: "Alexander Ng | Projects",
  description:
    "This is a list of projects I've worked on, which mostly consist of a list of tools I've made.",
};

function Projects() {
  return (
    <Content>
      <div className="flex justify-center h-full">
        <div className="text-center max-w-xl h-full ">
          <h1 className="text-3xl">Projects</h1>
          <p>
            This is a list of projects I&apos;ve worked on, which mostly consist
            of a list of tools I&apos;ve made.
          </p>
          <br />
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <CLink href="https://futurity.work">Futurity</CLink>
            <CLink href="/projects/envx">Envx</CLink>
            <CLink href="/projects/ihostproxy">ihostproxy</CLink>
            <CLink href="/projects/github-discord-webhook">
              GitHub Discord Webhook Bridge
            </CLink>
            <CLink href="/projects/cf-ips">Cloudflare IPs</CLink>
          </div>
          <CatGif />
        </div>
      </div>
    </Content>
  );
}

export default Projects;
