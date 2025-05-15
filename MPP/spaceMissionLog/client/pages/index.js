// client/pages/index.js (LandingPage)
import React from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import styles from "../styles/Landing.module.css";

export default function LandingPage() {
  return (
    <Layout>
      <div className={styles.landingContainer}>
        <div className={styles.videoBackground}>
          <video
            data-testid="landing-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={styles.video}
          >
            <source src="/rocket_motion.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className={styles.overlay}>
          <h1 className={styles.title}>Space Mission Log System</h1>
          <p className={styles.subtitle}>Track every mission detail in one place</p>
          <Link href="/missions">
            <button className={styles.enterButton}>Enter</button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
