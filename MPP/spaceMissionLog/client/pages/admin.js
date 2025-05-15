import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/FormPage.module.css';
import { API_URL } from '../config';

export default function AdminDashboard() {
  const [monitored, setMonitored] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', userId: '', reason: '' });
  const [formMsg, setFormMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchMonitored();
    // eslint-disable-next-line
  }, [router]);

  function fetchMonitored() {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/users/monitored`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMonitored(data);
        else setError(data.error || 'Failed to fetch');
      });
  }

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddMonitored = async e => {
    e.preventDefault();
    setFormMsg('');
    setError('');
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/users/monitored`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      setFormMsg('User added to monitored list!');
      setForm({ username: '', userId: '', reason: '' });
      fetchMonitored();
    } else {
      setError(data.error || 'Failed to add user');
    }
  };

  return (
    <div className={styles.formPage}>
      <h2>Monitored Users</h2>
      <form onSubmit={handleAddMonitored} style={{ marginBottom: 24 }}>
        <div className={styles.buttonContainer} style={{ flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleFormChange}
            className={styles.inputField}
            style={{ minWidth: 120 }}
          />
          <span>or</span>
          <input
            type="number"
            name="userId"
            placeholder="User ID"
            value={form.userId}
            onChange={handleFormChange}
            className={styles.inputField}
            style={{ minWidth: 80 }}
          />
          <input
            type="text"
            name="reason"
            placeholder="Reason (optional)"
            value={form.reason}
            onChange={handleFormChange}
            className={styles.inputField}
            style={{ minWidth: 180 }}
          />
          <button type="submit" className={styles.formButton}>Add to Monitored</button>
        </div>
        {formMsg && <div className={styles.successMessage}>{formMsg}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}
      </form>
      <ul>
        {monitored.map(u => (
          <li key={u.id}>
            {u.User ? (
              <>
                Username: <strong>{u.User.username}</strong> ({u.User.role})
              </>
            ) : (
              <>User ID: {u.userId}</>
            )}
            {" | Reason: "}{u.reason} | Time: {new Date(u.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
} 