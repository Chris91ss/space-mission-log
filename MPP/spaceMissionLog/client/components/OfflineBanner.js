// client/components/OfflineBanner.js
import React from "react";
import styles from "../styles/OfflineBanner.module.css";

export default function OfflineBanner({ message }) {
  return <div className={styles.banner}>{message}</div>;
}
