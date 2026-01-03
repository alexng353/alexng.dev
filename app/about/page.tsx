import Content from "@components/content";
import { Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alexander Ng | About",
  description: "About me",
};

export default function About() {
  return (
    <Content>
      <div className="text-center">
        <h4 className="text-3xl flex items-center gap-2">
          Made with <Heart className="text-pink-500" /> by Alex
        </h4>
        <p>using Next.js and TailwindCSS.</p>
      </div>
    </Content>
  );
}
