import Content from "@components/content";
import { Headers } from "@components/headers";
import { NavLink } from "@components/reuse";
import Footer from "@components/share/footer";
import Navbar from "@components/share/navbar";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { RiArrowUpSFill } from "react-icons/ri";

export default function TypescriptGenerator({ ips }: { ips: string[] }) {
  return (
    <>
      <Headers
        title="Alexander Ng | Cloudflare IP Range Grabber"
        description="A very simple tool to grab the Cloudflare IP range from the Cloudflare website and parse it into a nginx compatible format."
        image="https://cdn.alexng.dev/assets/ayo.icu/{season}/projects/cf-ips.png"
        imageAlt="Cloudflare IP Range Grabber"
      />

      <Navbar />
      <Content>
        <div className="flex justify-center ">
          <Typography variant="h4" component="h4">
            Cloudflare IP Range Grabber
          </Typography>
        </div>
        <Typography variant="body1" component="p">
          Not gonna lie I don&apos;t really know why I ever made this. You can
          still download it from github if you want, or you can just copy and
          paste it from here.
          <pre className="bg-gray-800 text-white p-2 rounded-md">
            {ips.map((ip) => `set_real_ip_from ${ip};\n`)}
          </pre>
          <br />
          <br />
          <NavLink href="https://github.com/alexng353/cf-ips">
            Source Code
          </NavLink>
          <NavLink href="https://github.com/alexng353/cf-ips/releases/tag/v1.0.0">
            Download
          </NavLink>
          <NavLink href="https://github.com/alexng353/not-a-tutorial/blob/main/nginx/Get%20IPs%20from%20Cloudflare.md">
            Get Real IP from Cloudflare
          </NavLink>
        </Typography>
        <Accordion>
          <AccordionSummary expandIcon={<RiArrowUpSFill />}>
            <Typography variant="h6" component="h6">
              Features
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" component="p">
              - Generate the thing you need to put in your nginx config with 1
              command
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Image src="/projects/cf-ips/demo.png" alt="demo" />
        {/* not to self: write some documentation and clean up the codebase */}
        {/* <Accordion>
          <AccordionSummary expandIcon={<RiArrowUpSFill />}>
            <Typography variant="h6" component="h6">
              Customize
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" component="p">
              Very easily customize the project by editing the corresponding file in main.rs
            </Typography>
          </AccordionDetails>
        </Accordion>
         */}
      </Content>
      <Footer />
    </>
  );
}

const getIps = async () => {
  const response = await fetch("https://www.cloudflare.com/ips-v4");
  const ips = await response.text();
  const response2 = await fetch("https://www.cloudflare.com/ips-v6");
  const ips2 = await response2.text();
  return [...ips.split("\n"), ...ips2.split("\n")];
};

export async function getStaticProps() {
  const ips = await getIps();
  return {
    props: {
      ips,
    },
    revalidate: 60 * 60 * 24,
  };
}
