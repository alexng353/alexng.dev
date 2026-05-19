import Content from "@components/content";
import { NavLink } from "@components/reuse";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alexander Ng | rv",
  description:
    "A toy text editor written in Rust with vim motions, tiling windows, and fully customizable keybinds.",
};

export default function Rv() {
  return (
    <Content>
      <div className="flex justify-center">
        <h1 className="text-3xl">rv</h1>
      </div>
      <p className="mt-4 text-center italic text-gray-400">
        In an era of AI slop, it must be rare to find human slop, no?
      </p>
      <p className="mt-4">
        rv is a toy text editor written in Rust. It&apos;s 100% hand-written
        code with flicker-free rendering, basic vim motions, vim-style commands,
        tiling editor windows, and fully customizable keybinds via a TOML
        config.
      </p>
      <h2 className="text-2xl mt-4">Features</h2>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>100% hand written code</li>
        <li>100% flicker-free rendering</li>
        <li>
          Basic vim motions (h, j, k, l, w, b, e, W, B, E, &amp;, ^, 0, a, A)
        </li>
        <li>Vim-style commands (:dostuff)</li>
        <li>Tiling editor windows</li>
        <li>Fully customizable keybinds via keymap and config file</li>
      </ul>
      <h2 className="text-2xl mt-4">Roadmap</h2>
      <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
        <li>Advanced vim motions</li>
        <li>Chords</li>
        <li>Typed scripting language</li>
        <li>Full unicode support</li>
      </ul>
      <div className="my-4">
        <NavLink href="https://github.com/alexng353/rv">Source Code</NavLink>
      </div>
    </Content>
  );
}
