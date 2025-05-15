// client/pages/missions/index.js
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import MissionsCharts from "../../components/MissionsCharts";
import styles from "../../styles/MissionList.module.css";
import paginationStyles from "../../styles/Pagination.module.css";
import { faker } from "@faker-js/faker";
import io from "socket.io-client";
import { API_URL } from "../../config";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import useOfflineSync from "../../hooks/useOfflineSync";

export default function MissionsListPage() {
  const online = useOnlineStatus();
  const { queueOperation } = useOfflineSync();

  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("name");
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const loaderRef = useRef(null);

  // New: Functions to start and stop backend updates
  const handleStartUpdates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/generation/start`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      alert(data.status);
    } catch (err) {
      console.error(err);
      alert("Failed to start updates");
    }
  };

  const handleStopUpdates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/generation/stop`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      alert(data.status);
    } catch (err) {
      console.error(err);
      alert("Failed to stop updates");
    }
  };

  // Fetch missions from the API.
  // If the browser is offline, immediately load the cached missions.
  const fetchMissions = useCallback(async () => {
    if (!navigator.onLine) {
      // Offline: load cached missions if available.
      const cached = localStorage.getItem("missions");
      if (cached) {
        setMissions(JSON.parse(cached));
      }
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/missions`);
      // If response is not OK, throw an error.
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      setMissions(data.missions);
      localStorage.setItem("missions", JSON.stringify(data.missions));
      setLoading(false);
    } catch (err) {
      console.error("Fetch missions failed:", err);
      const cached = localStorage.getItem("missions");
      if (cached) {
        setMissions(JSON.parse(cached));
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Make sure this runs only in the browser.
    if (typeof window !== "undefined") {
      fetchMissions();
    }
  }, [fetchMissions]);

  // Optional: Listen for storage events to update missions state if localStorage changes in another tab.
  useEffect(() => {
    const handleStorageChange = () => {
      const cached = localStorage.getItem("missions");
      if (cached) {
        setMissions(JSON.parse(cached));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Socket.io connection for real-time updates.
  useEffect(() => {
    if (!online) return;
    const socket = io(API_URL);
    socket.on("missionUpdate", (update) => {
      if (update.newMission) {
        setMissions((prev) => {
          const newMissions = [update.newMission, ...prev];
          localStorage.setItem("missions", JSON.stringify(newMissions));
          return newMissions;
        });
      }
    });
    return () => socket.disconnect();
  }, [online]);

  // Filtering logic.
  const filteredMissions = missions.filter((mission) => {
    let valueToCheck = "";
    if (filterType === "name") valueToCheck = mission.name;
    else if (filterType === "status") valueToCheck = mission.status;
    else if (filterType === "destination") valueToCheck = mission.destination;
    return valueToCheck.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Budget and Launch Date Statistics.
  const budgets = filteredMissions
    .map((m) => m.budget)
    .filter((b) => typeof b === "number");
  let maxBudget = null,
    minBudget = null,
    avgBudget = null;
  if (budgets.length > 0) {
    maxBudget = Math.max(...budgets);
    minBudget = Math.min(...budgets);
    avgBudget = budgets.reduce((sum, val) => sum + val, 0) / budgets.length;
  }
  let lowerThreshold = null,
    upperThreshold = null;
  if (budgets.length > 0) {
    const sortedBudgets = [...budgets].sort((a, b) => a - b);
    lowerThreshold = sortedBudgets[Math.floor(sortedBudgets.length / 3)];
    upperThreshold = sortedBudgets[Math.floor((2 * sortedBudgets.length) / 3)];
  }
  const getBudgetColor = (budget) => {
    if (budget === undefined || lowerThreshold === null || upperThreshold === null)
      return "inherit";
    if (budget < lowerThreshold) return "#a3e635";
    if (budget < upperThreshold) return "#facc15";
    return "#f87171";
  };

  const launchDates = filteredMissions
    .map((m) => new Date(m.launchDate))
    .filter((d) => !isNaN(d));
  let earliestLaunchDate = null,
    latestLaunchDate = null;
  if (launchDates.length > 0) {
    earliestLaunchDate = new Date(Math.min(...launchDates));
    latestLaunchDate = new Date(Math.max(...launchDates));
  }

  // Infinite scrolling via sliding window.
  const effectivePageSizeVal =
    pageSize === "all" ? filteredMissions.length : Number(pageSize);
  const paginatedMissions = filteredMissions.slice(0, currentPage * effectivePageSizeVal);
  const totalPages =
    effectivePageSizeVal === 0 ? 1 : Math.ceil(filteredMissions.length / effectivePageSizeVal);

  const handlePageSizeChange = (e) => {
    setPageSize(e.target.value);
    setCurrentPage(1);
  };

  // Set up IntersectionObserver to load more missions.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [currentPage, totalPages]);

  // Manual generation (for testing/demonstration).
  const generateFakeMission = () => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const statuses = ["Ongoing", "Completed", "Failed"];
    const types = ["Exploration", "Deployment", "Resupply"];
    const destinations = [
      "Earth Orbit",
      "Moon",
      "Mars",
      "Jupiter",
      "Saturn",
      "Venus",
      "Mercury",
    ];
    return {
      id,
      name: faker.lorem.words(2),
      status: faker.helpers.arrayElement(statuses),
      type: faker.helpers.arrayElement(types),
      destination: faker.helpers.arrayElement(destinations),
      launchDate: faker.date.future(1).toISOString().split("T")[0],
      budget: faker.number.int({ min: 100000, max: 10000000 }),
      crewMembers: faker.helpers.arrayElements(
        ["Alice", "Bob", "Charlie", "David", "Eve"],
        faker.number.int({ min: 1, max: 3 })
      ),
    };
  };

  const handleGenerate = () => {
    const fakeMission = generateFakeMission();
    setMissions((prev) => {
      const newMissions = [fakeMission, ...prev];
      localStorage.setItem("missions", JSON.stringify(newMissions));
      return newMissions;
    });
  };

  // Inline deletion with offline support.
  const handleDelete = async (missionId) => {
    if (!confirm("Are you sure you want to delete this mission?")) return;
    if (online) {
      try {
        const res = await fetch(`${API_URL}/api/missions/${missionId}`, { 
          method: "DELETE",
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (res.status === 204 || res.status === 200) {
          setMissions((prev) => {
            const updated = prev.filter((m) => m.id !== missionId);
            localStorage.setItem("missions", JSON.stringify(updated));
            return updated;
          });
        } else {
          const error = await res.json();
          console.error('Delete failed:', error);
          alert(error.message || "Failed to delete mission.");
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert("Failed to delete mission. Please try again.");
      }
    } else {
      if (!confirm("You are offline. Delete this mission locally and sync later?")) return;
      setMissions((prev) => {
        const updated = prev.filter((m) => m.id !== missionId);
        localStorage.setItem("missions", JSON.stringify(updated));
        return updated;
      });
      queueOperation(`/api/missions/${missionId}`, { method: "DELETE" });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <div className={styles.container}>
        <h1>List &amp; Filter Missions</h1>

        {/* Statistics Summary */}
        {(budgets.length > 0 || launchDates.length > 0) && (
          <div className={styles.statistics}>
            {budgets.length > 0 && (
              <>
                <p style={{ color: "#f87171" }}>Most Expensive Mission: ${maxBudget}</p>
                <p style={{ color: "#facc15" }}>Average Budget: ${avgBudget.toFixed(2)}</p>
                <p style={{ color: "#a3e635" }}>Least Expensive Mission: ${minBudget}</p>
              </>
            )}
            {launchDates.length > 0 && (
              <>
                <p style={{ color: "#80bfff" }}>
                  Earliest Launch Date: {earliestLaunchDate.toISOString().split("T")[0]}
                </p>
                <p style={{ color: "#b366ff" }}>
                  Latest Launch Date: {latestLaunchDate.toISOString().split("T")[0]}
                </p>
              </>
            )}
          </div>
        )}

        {/* Filtering Controls */}
        <div className={styles.filterContainer}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="name">Filter by Name</option>
            <option value="status">Filter by Status</option>
            <option value="destination">Filter by Destination</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <Link href="/missions/create">
            <button className={styles.addButton}>Add Mission</button>
          </Link>
          <button onClick={handleGenerate} className={styles.generateButton}>
            Generate Fake Mission
          </button>
          <button onClick={handleStartUpdates} className={styles.generateButton}>
            Start Updates
          </button>
          <button onClick={handleStopUpdates} className={styles.generateButton}>
            Stop Updates
          </button>
        </div>

        {/* Missions Table */}
        <table className={styles.missionsTable}>
          <thead>
            <tr>
              <th>Mission Name</th>
              <th>Status</th>
              <th>Launch Date</th>
              <th>Destination</th>
              <th>Budget</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMissions.map((mission) => (
              <tr key={mission.id}>
                <td>{mission.name}</td>
                <td>{mission.status}</td>
                <td
                  style={{
                    backgroundColor:
                      earliestLaunchDate &&
                      new Date(mission.launchDate).getTime() === earliestLaunchDate.getTime()
                        ? "#80bfff"
                        : latestLaunchDate &&
                          new Date(mission.launchDate).getTime() === latestLaunchDate.getTime()
                        ? "#b366ff"
                        : "inherit",
                  }}
                >
                  {mission.launchDate}
                </td>
                <td>{mission.destination}</td>
                <td style={{ backgroundColor: getBudgetColor(mission.budget) }}>
                  {mission.budget !== undefined ? `$${mission.budget}` : "N/A"}
                </td>
                <td>
                  <Link href={`/missions/${mission.id}/edit`}>
                    <button className={styles.tableButton}>Edit</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(mission.id)}
                    className={styles.tableButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Infinite Scroll Loader */}
        <div ref={loaderRef} className={paginationStyles.loader}>
          {currentPage < totalPages && <p>Loading more missions...</p>}
        </div>

        {/* Items Per Page Dropdown */}
        <div className={styles.pageSizeContainer}>
          <div className={styles.pageSizeDropdown}>
            <select className={styles.pageSizeSelect} value={pageSize} onChange={handlePageSizeChange}>
              <option value="10">10 items per page</option>
              <option value="20">20 items per page</option>
              <option value="30">30 items per page</option>
              <option value="all">All items</option>
            </select>
          </div>
        </div>

        {/* Charts Section */}
        <div className={styles.chartsContainer}>
          <MissionsCharts missions={filteredMissions} />
        </div>
      </div>
    </Layout>
  );
}
