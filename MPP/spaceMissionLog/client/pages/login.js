import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/FormPage.module.css';
import { API_URL } from '../config';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const res = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, token })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess(true);
      setTimeout(() => router.push('/'), 1000);
    } else {
      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
      } else {
        setError(data.error || 'Login failed');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 style={{ textAlign: 'center', fontFamily: 'League Spartan, sans-serif', marginBottom: '1.5rem' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          {!requiresTwoFactor ? (
            <>
              <div>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="token">Enter 2FA Code</label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={e => setToken(e.target.value)}
                required
                placeholder="Enter 6-digit code"
              />
            </div>
          )}
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>Login successful! Redirecting...</div>}
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.formButton} disabled={success}>
              {requiresTwoFactor ? 'Verify' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 