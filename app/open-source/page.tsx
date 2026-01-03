import Content from "@components/content";
import { default as _Link } from "next/link";

const Link = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <_Link href={href} className="text-green-400 hover:underline">
      {children}
    </_Link>
  );
};
const contribs = [
  {
    name: "rpgp",
    url: "https://github.com/rpgp/rpgp",
  },
  {
    name: "The Railway CLI",
    url: "https://github.com/railwayapp/cli",
  },
  {
    name: "Mastra",
    url: "https://github.com/mastra-ai/mastra",
  },
];
function Contribs() {
  const _contribs: React.ReactNode[] = [];
  for (const [index, contrib] of contribs.entries()) {
    if (index === contribs.length - 1) {
      _contribs.push(" and ");
    }
    _contribs.push(
      <Link key={contrib.name} href={contrib.url}>
        {contrib.name}
      </Link>,
    );
    if (index < contribs.length - 2) {
      _contribs.push(", ");
    }
  }
  return _contribs;
}

export default function OpenSource() {
  return (
    <Content>
      <div className="flex justify-center">
        <h1 className="text-3xl">Open Source</h1>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          I had my first contributions to open source merged in late 2024, and
          so far, I've contributed to <Contribs />. I plan to continue
          contributing to rpgp, and I'm looking forwards to contributing to the
          next open source project I find problems with.
        </p>
        <p>
          I'm actually thinking about making a blog post about my experiences
          with open source, but to be honest, my biggest piece of advice would
          be to use open source software until you start having problems with
          it. Then, fix those problems. If it really boils down to just this, I
          don't think it's worth bothering with a blog post.
        </p>
        <p>
          Outside of other people's open source projects, I also often write my
          own tools, scripts and other small projects, "abusing" my abilities as
          a developer to make my life easier. You can find some of these
          examples on my <Link href="/projects">projects</Link> page, or my{" "}
          <Link href="https://github.com/alexng353">Github</Link> page.
        </p>
      </div>
    </Content>
  );
}
