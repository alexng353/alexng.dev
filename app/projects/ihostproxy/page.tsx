import Content from "@components/content";
import { NavLink } from "@components/reuse";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alexander Ng | ihostproxy",
  description:
    "A more complete self-hosted SOCKS5 proxy in Go with a web UI for credential management.",
};

export default function IHostProxy() {
  return (
    <Content>
      <div className="flex justify-center">
        <h1 className="text-3xl">ihostproxy</h1>
      </div>
      <p className="mt-4">
        ihostproxy is a more complete self-hosted SOCKS5 proxy written in Go. It
        includes a web UI for managing credentials and offers features like IP
        whitelisting and FQDN support. The project is containerized with Docker
        for easy deployment.
      </p>
      <h2 className="text-2xl mt-4">Features</h2>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Self-hosted SOCKS5 proxy server</li>
        <li>Web UI for credential management</li>
        <li>IP whitelist support</li>
        <li>FQDN support</li>
        <li>Docker support with multiple Dockerfile variants</li>
        <li>Persistent data storage</li>
      </ul>
      <h2 className="text-2xl mt-4">Quick Start</h2>
      <pre className="bg-gray-800 text-white p-2 rounded-md my-2 overflow-x-auto">
        {`docker run -d \\
  -p 1080:1080 \\
  -p 8080:8080 \\
  -v ihostproxy:/data \\
  -e USERNAME=admin \\
  -e PASSWORD=password \\
  ghcr.io/alexng353/ihostproxy:latest`}
      </pre>
      <div className="my-4">
        <NavLink href="https://github.com/alexng353/ihostproxy">
          Source Code
        </NavLink>
      </div>
    </Content>
  );
}
