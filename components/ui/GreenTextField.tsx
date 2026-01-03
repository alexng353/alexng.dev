"use client";
import type React from "react";
import { forwardRef, useId, useState } from "react";
import styles from "./ui.module.css";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GreenTextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const id = useId();

    return (
      <div className={styles.textFieldWrapper}>
        {label && (
          <label
            htmlFor={id}
            className={
              focused ? styles.textFieldLabelFocused : styles.textFieldLabel
            }
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`${styles.textFieldInput} ${className || ""}`}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </div>
    );
  },
);

GreenTextField.displayName = "GreenTextField";
