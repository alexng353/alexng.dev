import Content from "@components/content";
import { Headers } from "@components/headers";
import { HeadIcons } from "@components/home/head-icons";
import { ListItem } from "@components/list-item";
import Footer from "@components/share/footer";
import Navbar from "@components/share/navbar";
import { useSnow } from "@hooks/use-snow";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { AiOutlineClose } from "react-icons/ai";
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
import { useIsClient, useLocalStorage } from "usehooks-ts";

function Home() {
  return (
    <>
      <Headers
        title="Alexander Ng | portfolio"
        description="A portfolio of some web dev named alex"
        image="https://cdn.alexng.dev/assets/ayo.icu/{season}/home.png"
        imageAlt="Home page of alexng353's portfolio"
      />

      <SnowBanner />

      <Navbar />
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
          </span>{" "}
          and{" "}
          <span className="text-green-400 hover:underline">
            <Link href="https://github.com/alexng353">Github</Link>
          </span>
          , where you can see what I&apos;m currently working on.
        </div>

        <br className="select-none" />

        <h1 className="text-3xl">Technologies</h1>
        <br className="select-none" />
        <ul className="grid grid-cols-2 gap-y-6 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
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
        </ul>
        <br className="select-none" />
        <br className="select-none" />
        <ul className="grid grid-cols-2 gap-y-6 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          <ListItem icon={SiDocker} text="Docker" />
          <ListItem icon={SiMongodb} text="MongoDB" />
          <ListItem icon={SiPostgresql} text="PostgreSQL" />
          <ListItem icon={SiRedis} text="Redis" />
          <MySQL />
          <Tauri />
        </ul>
      </Content>
      <Footer />
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

const SnowBanner = () => {
  const snow = useSnow();
  const dateFmt = useMemo(
    () =>
      new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "numeric",
      }),
    [],
  );
  const [showBanner, setShowBanner] = useLocalStorage(`snow-${dateFmt}`, true);
  const client = useIsClient();

  if (!client) return;
  if (!snow) return;
  if (!showBanner) return;

  return (
    <div className="flex flex-row w-full justify-center bg-green-500">
      <a
        href="https://embed.im/snow/"
        className="text-white text-center hover:underline px-4 py-2"
      >
        snow effect from embed.im/snow
      </a>

      <button
        type="button"
        onClick={() => setShowBanner(false)}
        className="text-white text-center hover:underline px-4 py-2"
      >
        <AiOutlineClose className="hover:scale-125" />
      </button>
    </div>
  );
};
