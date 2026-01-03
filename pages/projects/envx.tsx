import Content from "@components/content";
import { Headers } from "@components/headers";
import { NavLink } from "@components/reuse";
import Navbar from "@components/share/navbar";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { RiArrowUpSFill } from "react-icons/ri";
import Image from "next/image";

export default function Envx() {
  return (
    <>
      <Head>
        <Headers
          title="Alexander Ng | Envx"
          description="The simplest and most secure way to share and synchronize environment variables."
          image="https://cdn.alexng.dev/assets/ayo.icu/{season}/projects/envx.png"
          imageAlt="Envx"
        />
      </Head>
      <Navbar />
      <Content>
        <div className="flex justify-center">
          <Typography variant="h4" component="h4">
            Envx
          </Typography>
        </div>
        <Typography variant="body1" component="p">
          Envx is a tool I wrote that allows you to share and synchronize
          environment variables between you and your team. It uses RSA4096
          encryption to encrypt the environment variables for each member of the
          team, and decrypts them on the client side on request. The server
          stores all of the public keys, along with a UUID, and not much else.
          <br />
          <div className="my-2">
            <NavLink href="https://github.com/envx-project/cli">
              Source Code
            </NavLink>
            <NavLink href="https://github.com/envx-project/cli/releases/latest">
              Download
            </NavLink>
          </div>
          You can also install it with the following command:
          <pre className="bg-gray-800 text-white p-2 rounded-md">
            curl -fsSL https://get.envx.sh | sh
          </pre>
        </Typography>
        <Accordion>
          <AccordionSummary expandIcon={<RiArrowUpSFill />}>
            <Typography variant="h6" component="h6">
              Features
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" component="p">
              - Share environment variables with your team
              <br /> - Print environment variables on the client side in JSON,
              key-vaulue format or as a pretty-printed table
              <br /> - Add members to your team easily
              <br /> - Spawn a shell with the environment variables set
              <br /> - Offline access via files cached in .config/envx
            </Typography>
          </AccordionDetails>
        </Accordion>
        <div className="w-full grid place-items-center pt-4">
          <span className="text-red-400 bg-gray-900 rounded-lg px-2 py-1 mb-4">
            <pre>envx --help</pre>
          </span>
          <Image
            src="/projects/envx/envx.png"
            alt="demo"
            width={1788}
            height={1424}
          />
        </div>
      </Content>
    </>
  );
}
