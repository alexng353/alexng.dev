import type React from "react";
import { forwardRef } from "react";
import styles from "./ui.module.css";

export * from "./GreenTextField";

export const GreenButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`${styles.greenButton} ${className || ""}`}
      {...props}
    />
  );
});

GreenButton.displayName = "GreenButton";

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

export const GrayButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`${styles.grayButton} ${className || ""}`}
      {...props}
    />
  );
});

GrayButton.displayName = "GrayButton";

export const MenuButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`${styles.menuButton} ${className || ""}`}
      {...props}
    />
  );
});

MenuButton.displayName = "MenuButton";
