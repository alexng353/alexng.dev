import Link from "next/link";
import type React from "react";
import { NavButton } from "./ui";

function InlineHref({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return <Link href={href}>{children}</Link>;
}

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

function Tech({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex">{children}</div>;
}

export { InlineHref, NavLink, Tech };
