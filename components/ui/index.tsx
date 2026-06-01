import type React from "react";
import { forwardRef } from "react";
import styles from "./ui.module.css";

export const NavButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`${styles.navButton} ${className || ""}`}
      {...props}
    />
  );
});

NavButton.displayName = "NavButton";
