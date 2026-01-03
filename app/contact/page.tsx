import Content from "@components/content";
import styles from "@styles/contact.module.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Alexander Ng | Contact",
  description: "How to contact me",
};

export default function Contact() {
  return (
    <Content>
      {/* make the button small */}
      You can contact me at{" "}
      <a href="mailto:him@alexng.dev" className={styles.link}>
        him@alexng.dev
      </a>
      <br />
      {/* center a div horizontally */}
      <div className="flex justify-center">
        <Link className={styles.link} href="/">
          Go home
        </Link>
      </div>
    </Content>
  );
}
