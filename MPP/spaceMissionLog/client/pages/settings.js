import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/FormPage.module.css';
import { API_URL } from '../config';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setTwoFactorEnabled(userData.twoFactorEnabled);
  }, [router]);

  const handleSetup2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/2fa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSetupData(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to setup 2FA');
    }
  };

  const handleVerify2FA = async () => {
    try {
      const authToken = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/2fa/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('2FA enabled successfully');
        setTwoFactorEnabled(true);
        setSetupData(null);
        setToken('');
        // Update user in localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        userData.twoFactorEnabled = true;
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to verify 2FA');
    }
  };

  const handleDisable2FA = async () => {
    try {
      const authToken = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('2FA disabled successfully');
        setTwoFactorEnabled(false);
        setToken('');
        // Update user in localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        userData.twoFactorEnabled = false;
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to disable 2FA');
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 style={{ textAlign: 'center', fontFamily: 'League Spartan, sans-serif', marginBottom: '1.5rem' }}>
          Account Settings
        </h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3>Two-Factor Authentication</h3>
          {!twoFactorEnabled ? (
            <>
              {!setupData ? (
                <button onClick={handleSetup2FA} className={styles.formButton}>
                  Enable 2FA
                </button>
              ) : (
                <div>
                  <p>Scan this QR code with your authenticator app:</p>
                  <img src={setupData.qrCode} alt="2FA QR Code" style={{ margin: '1rem 0' }} />
                  <p>Or enter this code manually: {setupData.secret}</p>
                  <div style={{ marginTop: '1rem' }}>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Enter 6-digit code"
                      style={{ marginRight: '1rem' }}
                    />
                    <button onClick={handleVerify2FA} className={styles.formButton}>
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <p>2FA is enabled</p>
              <div style={{ marginTop: '1rem' }}>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter 6-digit code"
                  style={{ marginRight: '1rem' }}
                />
                <button onClick={handleDisable2FA} className={styles.formButton}>
                  Disable 2FA
                </button>
              </div>
            </div>
          )}
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
      </div>
    </div>
  );
} 