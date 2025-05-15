// client/services/offlineSync.js
export function getPendingMissions() {
    return JSON.parse(localStorage.getItem('pendingMissions')) || [];
  }
  
  export function addPendingMission(operation) {
    const pending = getPendingMissions();
    pending.push(operation);
    localStorage.setItem('pendingMissions', JSON.stringify(pending));
  }
  
  export async function syncPendingMissions(API_URL) {
    const pending = getPendingMissions();
    if (pending.length === 0) return;
    for (const op of pending) {
      try {
        await fetch(`${API_URL}/api/missions`, {
          method: op.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(op.data)
        });
      } catch (err) {
        console.error("Sync failed, will retry later", err);
        return;
      }
    }
    localStorage.removeItem('pendingMissions');
  }
  