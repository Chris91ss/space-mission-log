import React, { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import styles from "../../styles/FormPage.module.css";
import { API_URL } from "../../config";
import useOfflineSync from "../../hooks/useOfflineSync";

export default function CreateMissionPage() {
  const router = useRouter();
  const { queueOperation } = useOfflineSync();
  const [missionData, setMissionData] = useState({
    name: "",
    status: "",
    type: "",
    destination: "",
    launchDate: "",
    budget: "",
    crewMembers: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setMissionData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let tempErrors = {};
    const name = missionData.name.trim();
    if (!name || name.length < 3) {
      tempErrors.name = "Mission Name must be at least 3 characters long";
    } else if (!/^[\w\s\-,.!?]+$/.test(name)) {
      tempErrors.name = "Mission Name contains invalid characters";
    }
    if (!missionData.status) tempErrors.status = "Status is required";
    if (!missionData.type) tempErrors.type = "Mission Type is required";
    if (!missionData.destination) tempErrors.destination = "Destination is required";
    if (!missionData.launchDate) tempErrors.launchDate = "Launch Date is required";
    if (missionData.budget === "") {
      tempErrors.budget = "Budget is required";
    } else if (isNaN(missionData.budget)) {
      tempErrors.budget = "Budget must be a valid number";
    } else if (Number(missionData.budget) < 0) {
      tempErrors.budget = "Budget must be a positive number";
    }
    if (missionData.crewMembers.trim()) {
      const members = missionData.crewMembers.split(",").map((m) => m.trim());
      for (let m of members) {
        if (m.length < 2) {
          tempErrors.crewMembers = "Each crew member name must be at least 2 characters long";
          break;
        }
        if (!/^[a-zA-Z\s\-']+$/.test(m)) {
          tempErrors.crewMembers = "Crew member names can only contain letters, spaces, hyphens, and apostrophes";
          break;
        }
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const newMission = {
      ...missionData,
      budget: Number(missionData.budget),
      crewMembers: missionData.crewMembers
        ? missionData.crewMembers.split(",").map((m) => m.trim())
        : []
    };

    try {
      const res = await fetch(`${API_URL}/api/missions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMission)
      });
      if (!res.ok) throw new Error("Server error");
      router.push("/missions");
    } catch (error) {
      alert("Server is down. Your operation will be synced once back online.");
      queueOperation("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMission)
      });
      router.push("/missions");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1>Add Mission</h1>
          <form onSubmit={handleSubmit}>
            {/* Render form fields with data-testid where needed */}
            <div>
              <label>Mission Name</label>
              <input type="text" name="name" value={missionData.name} onChange={handleChange} required className={errors.name ? styles.invalid : ""} />
              {errors.name && <p data-testid="error-name" className={styles.errorMessage}>{errors.name}</p>}
            </div>
            <div>
              <label>Status</label>
              <select name="status" value={missionData.status} onChange={handleChange} required className={errors.status ? styles.invalid : ""}>
                <option value="">Choose a status</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
              {errors.status && <p data-testid="error-status" className={styles.errorMessage}>{errors.status}</p>}
            </div>
            <div>
              <label>Mission Type</label>
              <select name="type" value={missionData.type} onChange={handleChange} required className={errors.type ? styles.invalid : ""}>
                <option value="">Choose a mission type</option>
                <option value="Exploration">Exploration</option>
                <option value="Deployment">Deployment</option>
                <option value="Resupply">Resupply</option>
              </select>
              {errors.type && <p data-testid="error-type" className={styles.errorMessage}>{errors.type}</p>}
            </div>
            <div>
              <label>Destination</label>
              <select name="destination" value={missionData.destination} onChange={handleChange} required className={errors.destination ? styles.invalid : ""}>
                <option value="">Choose a destination</option>
                <option value="Earth Orbit">Earth Orbit</option>
                <option value="Moon">Moon</option>
                <option value="Mars">Mars</option>
                <option value="Jupiter">Jupiter</option>
                <option value="Saturn">Saturn</option>
                <option value="Venus">Venus</option>
                <option value="Mercury">Mercury</option>
                <option value="Viltrum">Viltrum</option>
              </select>
              {errors.destination && <p data-testid="error-destination" className={styles.errorMessage}>{errors.destination}</p>}
            </div>
            <div>
              <label>Launch Date</label>
              <input type="date" name="launchDate" value={missionData.launchDate} onChange={handleChange} required className={errors.launchDate ? styles.invalid : ""} />
              {errors.launchDate && <p data-testid="error-launchDate" className={styles.errorMessage}>{errors.launchDate}</p>}
            </div>
            <div>
              <label>Budget</label>
              <input type="number" name="budget" value={missionData.budget} onChange={handleChange} required min="0" step="0.01" onKeyDown={(e) => { if (e.key === "-" || e.key === "+") e.preventDefault(); }} className={errors.budget ? styles.invalid : ""} />
              {errors.budget && <p data-testid="error-budget" className={styles.errorMessage}>{errors.budget}</p>}
            </div>
            <div>
              <label>Crew Members</label>
              <input type="text" name="crewMembers" value={missionData.crewMembers} onChange={handleChange} placeholder="Comma-separated names" className={errors.crewMembers ? styles.invalid : ""} />
              {errors.crewMembers && <p data-testid="error-crewMembers" className={styles.errorMessage}>{errors.crewMembers}</p>}
            </div>
            <div className={styles.buttonContainer}>
              <button type="submit" className={styles.formButton}>Add Mission</button>
              <button type="button" onClick={() => router.push("/missions")} className={styles.formButton}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
