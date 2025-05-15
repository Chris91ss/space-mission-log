import React from "react";
import Head from "next/head";
import OfflineBanner from "./OfflineBanner";
import useOnlineStatus from "../hooks/useOnlineStatus";
import useOfflineSync from "../hooks/useOfflineSync";
import styles from "../components/Layout.module.css";

export default function Layout({ children }) {
  // Initialize offline sync (its effect runs internally)
  useOfflineSync();
  const online = useOnlineStatus();

  return (
    <div className={styles.container}>
      <Head>
        <title>Space Mission Log</title>
      </Head>
      {/* Only show the offline banner when NOT online */}
      {!online && (
        <OfflineBanner message="You are offline or the server is unreachable. Changes will be synced when back online." />
      )}
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
