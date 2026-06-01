import Link from "next/link";
import type React from "react";
import { NavButton } from "./ui";

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link href={href}>
    <NavButton>{children}</NavButton>
  </Link>
);

export { NavLink };
