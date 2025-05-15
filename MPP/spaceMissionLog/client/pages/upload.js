// client/pages/missions/upload.js
import React, { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/FormPage.module.css";
import { API_URL } from "../config";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setUploadStatus("Upload successful!");
      } else {
        setUploadStatus("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("Error during upload.");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1>Upload Video</h1>
          <form onSubmit={handleUpload}>
            <div>
              <label>File</label>
              <input type="file" accept="video/*" onChange={handleFileChange} />
            </div>
            <div className={styles.buttonContainer}>
              <button type="submit" className={styles.formButton}>
                Upload
              </button>
              <button
                type="button"
                onClick={() => router.push("/missions")}
                className={styles.formButton}
              >
                Cancel
              </button>
            </div>
            {uploadStatus && <p>{uploadStatus}</p>}
          </form>
        </div>
      </div>
    </Layout>
  );
}
