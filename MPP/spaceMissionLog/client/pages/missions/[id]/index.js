// client/pages/missions/[id]/delete.js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import styles from "../../../styles/FormPage.module.css";
import { API_URL } from "../../../config";

export default function DeleteMissionPage() {
  const router = useRouter();
  const { id } = router.query;
  const [mission, setMission] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/api/missions/${id}`)
        .then((res) => res.json())
        .then((data) => setMission(data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/api/missions/${id}`, {
        method: "DELETE"
      });
      if (res.status === 204) {
        router.push("/missions");
      } else {
        alert("Failed to delete mission.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting mission.");
    }
  };

  if (!mission)
    return (
      <Layout>
        <div className={styles.container}>Loading...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1>Delete Confirmation</h1>
          <p>
            Are you sure you want to delete this mission: <strong>{mission.name}</strong>?
          </p>
          <div className={styles.buttonContainer}>
            <button onClick={handleDelete} className={styles.formButton}>Confirm</button>
            <button onClick={() => router.push("/missions")} className={styles.formButton}>Cancel</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
