import Content from "@components/content";
import { NavLink } from "@components/reuse";

import type { Metadata } from "next";

const getIps = async () => {
  const [v4, v6] = await Promise.all([
    fetch("https://www.cloudflare.com/ips-v4").then((res) => res.text()),
    fetch("https://www.cloudflare.com/ips-v6").then((res) => res.text()),
  ]);
  return [...v4.split("\n"), ...v6.split("\n")];
};

export const metadata: Metadata = {
  title: "Alexander Ng | Cloudflare IP Range Grabber",
  description:
    "A very simple tool to grab the Cloudflare IP range from the Cloudflare website and parse it into a nginx compatible format.",
};

export default async function CfIps() {
  const ips = await getIps();

  return (
    <Content>
      <div className="flex justify-center ">
        <h1 className="text-3xl">
          Cloudflare IP Range Grabber (Convenience Wrapper for nginx)
        </h1>
      </div>
      <pre className="bg-gray-800 text-white p-2 rounded-md my-2">
        {ips.map((ip) => `set_real_ip_from ${ip};\n`)}
      </pre>
      <NavLink href="https://github.com/alexng353/not-a-tutorial/blob/main/nginx/Get%20IPs%20from%20Cloudflare.md">
        "How to" Get Real IP from Cloudflare
      </NavLink>
    </Content>
  );
}
