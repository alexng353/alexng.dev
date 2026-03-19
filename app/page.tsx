import Content from "@components/content";
import { HeadIcons } from "@components/home/head-icons";
import { ListItem } from "@components/list-item";
import { SnowBanner } from "@components/snow-banner";
import styles from "@styles/Home.module.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  SiDocker,
  SiExpress,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiMongodb,
  SiNextdotjs as SiNextDotJs,
  SiNodedotjs as SiNodeDotJs,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiRedis,
  SiRust,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

export const metadata: Metadata = {
  title: "Alexander Ng | Portfolio",
  description: "A portfolio of some web dev named alex",
};

const projects = [
  {
    name: "Futurity",
    href: "https://futurity.work",
    description:
      "Enterprise on-premise AI deployments, integrations and plugins for clients around the world.",
    tech: ["TypeScript", "React", "Next.js"],
  },
  {
    name: "Envx",
    href: "/projects/envx",
    description:
      "CLI tool for securely sharing and synchronizing environment variables using RSA-4096 encryption.",
    tech: ["Rust"],
  },
  {
    name: "ihostproxy",
    href: "/projects/ihostproxy",
    description:
      "Self-hosted SOCKS5 proxy with a web UI for credential management and IP whitelisting.",
    tech: ["Go", "Docker"],
  },
  {
    name: "GitHub Discord Webhook Bridge",
    href: "/projects/github-discord-webhook",
    description:
      "Forwards GitHub webhook events to Discord channels with formatted embeds. Multi-user, multi-repo.",
    tech: ["TypeScript", "Bun"],
  },
  {
    name: "Cloudflare IPs",
    href: "/projects/cf-ips",
    description:
      "Convenience wrapper that grabs Cloudflare IP ranges and formats them for nginx.",
    tech: ["Next.js"],
  },
];


function Home() {
  return (
    <>
      <SnowBanner />
      <Content>
        <HeadIcons />

        <h1 className="text-4xl tracking-wide mt-1">Alexander Ng</h1>
        <div className="flex flex-col gap-4 mt-3">
          <p>
            An 19-year-old Full Stack web developer based in{" "}
            <span className="text-fuchsia-500">Vancouver, Canada. </span>
            I&apos;m currently working as a{" "}
            <a
              href="https://futurity.work"
              className="text-green-400 hover:underline"
            >
              Founding Software Engineer at Futurity
            </a>
            , an international AI startup providing enterprise on-premise AI
            deployments, integrations and plugins for clients around the world.
            Primarily, I write a lot of TypeScript, React and Next, but I also
            have some experience with Rust, Python, and GoLang.
          </p>
          <p>
            In my spare time, I like to build stuff, play games, and learn new
            things, which currently include Kubernetes and WASM, I&apos;m also
            learning mobile development in Tauri.
          </p>
        </div>

        <h2 className="text-3xl mt-10 mb-4">Projects</h2>
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.name} {...project} />
          ))}
        </div>

        <h2 className="text-3xl mt-10 mb-4">Open Source</h2>
        <div className="flex flex-col gap-4">
          <p>
            I had my first contributions to open source merged in late 2024, and
            so far, I&apos;ve contributed to{" "}
            <a href="https://github.com/rpgp/rpgp" className="text-green-400 hover:underline">rpgp</a>,{" "}
            <a href="https://github.com/railwayapp/cli" className="text-green-400 hover:underline">The Railway CLI</a>,
            {" "}and{" "}
            <a href="https://github.com/mastra-ai/mastra" className="text-green-400 hover:underline">Mastra</a>.
            {" "}I plan to continue contributing to rpgp, and I&apos;m looking
            forwards to contributing to the next open source project I find
            problems with.
          </p>
          <p>
            I&apos;m actually thinking about making a blog post about my
            experiences with open source, but to be honest, my biggest piece of
            advice would be to use open source software until you start having
            problems with it. Then, fix those problems. If it really boils down
            to just this, I don&apos;t think it&apos;s worth bothering with a
            blog post.
          </p>
          <p>
            Outside of other people&apos;s open source projects, I also often
            write my own tools, scripts and other small projects,
            &quot;abusing&quot; my abilities as a developer to make my life
            easier. You can find some of these examples on my{" "}
            <Link href="/projects" className="text-green-400 hover:underline">projects</Link>{" "}
            page, or my{" "}
            <a href="https://github.com/alexng353" className="text-green-400 hover:underline">Github</a>{" "}
            page.
          </p>
        </div>

        <h2 className="text-3xl mt-10 mb-4">Technologies</h2>
        <ul
          className={`grid grid-cols-2 gap-y-6 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 font-medium ${styles.robotoMono}`}
        >
          <ListItem icon={SiNextDotJs} text="Next" />
          <ListItem icon={SiReact} text="React" />
          <ListItem icon={SiTailwindcss} text="Tailwind" />
          <ListItem icon={SiExpress} text="ExpressJS" />
          <ListItem icon={SiNodeDotJs} text="Node" />
          <ListItem icon={SiTypescript} text="TypeScript" />
          <ListItem icon={SiPrisma} text="Prisma" />
          <ListItem icon={SiPython} text="Python" />
          <ListItem icon={SiGit} text="Git" />
          <ListItem icon={SiGithub} text="GitHub" />
          <ListItem icon={SiGithubactions} text="CI/CD" />
          <ListItem icon={SiRust} text="Rust" />
          <ListItem icon={SiDocker} text="Docker" />
          <ListItem icon={SiMongodb} text="MongoDB" />
          <ListItem icon={SiPostgresql} text="PostgreSQL" />
          <ListItem icon={SiRedis} text="Redis" />
          <MySQL />
          <Tauri />
        </ul>
      </Content>
    </>
  );
}

export default Home;

function ProjectCard({
  name,
  href,
  description,
  tech,
}: {
  name: string;
  href: string;
  description: string;
  tech: string[];
}) {
  const isExternal = href.startsWith("http");
  const LinkComponent = isExternal ? "a" : Link;
  return (
    <LinkComponent
      href={href}
      className="group flex flex-col gap-2 border border-gray-800 rounded-lg px-4 py-3 hover:border-green-500 transition-colors"
    >
      <span className="text-green-400 group-hover:underline font-medium text-lg">
        {name}
      </span>
      <span className="text-gray-400 text-sm">{description}</span>
      <div className="flex gap-2 flex-wrap">
        {tech.map((t) => (
          <span
            key={t}
            className="text-xs px-2 py-0.5 rounded-full border border-gray-700 text-gray-300"
          >
            {t}
          </span>
        ))}
      </div>
    </LinkComponent>
  );
}

const Tauri = () => (
  <li className="flex space-x-2 items-center">
    <span>
      <Image
        width={32}
        height={32}
        src="/tauri.png"
        alt="Tauri"
        className="h-8 w-8 select-none"
      />
    </span>
    <span>Tauri</span>
  </li>
);

const MySQL = () => (
  <li className="flex space-x-2 items-center">
    <span>
      <Image
        width={32}
        height={32}
        src="/MySQL.png"
        alt="MySQL"
        className="h-8 w-8 select-none"
      />
    </span>
    <span>MySQL</span>
  </li>
);
