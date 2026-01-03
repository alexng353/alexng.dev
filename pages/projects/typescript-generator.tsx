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

export default function TypescriptGenerator() {
  return (
    <>
      <Headers
        title="Alexander Ng | Typescript Generator"
        description="A barebones typescript project generator written in rust."
        image="https://cdn.alexng.dev/assets/ayo.icu/{season}/projects/typescript-generator.png"
        imageAlt="Typescript Generator"
      />

      <Navbar />
      <Content>
        <div className="flex justify-center ">
          <Typography variant="h4" component="h4">
            Typescript Generator
          </Typography>
        </div>
        <Typography variant="body1" component="p">
          A barebones typescript project generator written in rust. This project
          was written to help me learn rust, so the code isn&apos;t super great.
          <br />
          <br />
          <NavLink href="https://github.com/alexng353/typescript-generator">
            Source Code
          </NavLink>
          <NavLink href="https://github.com/alexng353/typescript-generator/releases/tag/v1.0.0-release">
            Download
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
              - Generate a typescript project with a single command
              <br />- Lightweight at 1.3 MB (windows)
              <br />- Auto install dependencies
              <br />- Auto generate MIT license
              <br />- Auto generate README.md
              <br />- Auto generate package.json, tsconfig.json and nodemon.json
              <br />- Includes customizable logger
              <br />- Run your project with npm run dev
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Image
          src="/projects/typescript-generator/demo.png"
          alt="demo"
          width={1602}
          height={1744}
        />
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
