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

function Home() {
  return (
    <>
      <SnowBanner />
      <Content>
        <HeadIcons />
        <p>Hey there, I&apos;m</p>
        <h1 className="text-4xl tracking-wide">Alexander Ng</h1>
        <div className="flex flex-col gap-4">
          <p className="pt-3">
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
        <div className="mt-4">
          You can check out my{" "}
          <span className="text-green-400 hover:underline">
            <Link href="/projects">projects</Link>
          </span>
          {", "}
          <span className="text-green-400 hover:underline">
            <Link href="https://github.com/alexng353">Github</Link>
          </span>
          {", "}
          and{" "}
          <Link href="/open-source" className="text-green-400 hover:underline">
            open source
          </Link>
          , where you can see what I&apos;m currently working on.
        </div>

        <br className="select-none" />

        <h1 className="text-3xl">Technologies</h1>
        <br className="select-none" />
        <ul
          className={`grid grid-cols-2 gap-y-6 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 ${styles.robotoMono}`}
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
