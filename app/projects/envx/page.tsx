import Content from "@components/content";
import { NavLink } from "@components/reuse";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Alexander Ng | Envx",
  description:
    "The simplest and most secure way to share and synchronize environment variables.",
};

export default function Envx() {
  return (
    <Content>
      <div className="flex justify-center">
        <h1 className="text-3xl">Envx</h1>
      </div>
      <p className="mt-4">
        Envx is a CLI tool I wrote that allows you to securely share and
        synchronize environment variables between you and your team. It uses
        RSA-4096 encryption to encrypt environment variables for each team
        member, decrypting them client-side on request. The server only stores
        public keys and UUIDs - your secrets never leave your machine
        unencrypted.
      </p>
      <h2 className="text-2xl mt-4">Features</h2>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>
          <strong>End-to-end encryption</strong> - RSA-4096 encryption for all
          secrets
        </li>
        <li>
          <strong>Team collaboration</strong> - Easily add members to your
          projects
        </li>
        <li>
          <strong>Multiple output formats</strong> - JSON, key-value, or
          pretty-printed table
        </li>
        <li>
          <strong>Shell spawning</strong> - Launch a shell with environment
          variables set
        </li>
        <li>
          <strong>Offline access</strong> - Cached files in ~/.config/envx
        </li>
        <li>
          <strong>Password manager integration</strong> - Support for primary
          key password commands (e.g., 1Password)
        </li>
      </ul>
      <h2 className="text-2xl mt-4">Installation</h2>
      <pre className="bg-gray-800 text-white p-2 rounded-md my-2">
        curl -fsSL https://get.envx.sh | sh
      </pre>
      <p className="text-gray-400">
        Windows users can download the binary directly from the releases page.
      </p>
      <div className="my-4 flex gap-2 flex-wrap">
        <NavLink href="https://github.com/envx-project/cli">
          Source Code
        </NavLink>
        <NavLink href="https://github.com/envx-project/cli/releases/latest">
          Download
        </NavLink>
      </div>
      <div className="w-full grid place-items-center pt-4">
        <span className="text-red-400 bg-gray-900 rounded-lg px-2 py-1 mb-4">
          <pre>envx --help</pre>
        </span>
        <Image
          src="/projects/envx/envx.png"
          alt="envx CLI help output"
          width={1788}
          height={1424}
        />
      </div>
    </Content>
  );
}
