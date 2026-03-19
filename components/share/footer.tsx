import styles from "@styles/bar.module.css";

export default function Footer() {
  return (
    <div
      style={{ width: "100%" }}
      className={styles.footer}
    >
      <div className="container mx-auto pt-4 pb-4 text-center text-gray-400">
        © Alexander Ng. All rights reserved.
      </div>
    </div>
  );
}
