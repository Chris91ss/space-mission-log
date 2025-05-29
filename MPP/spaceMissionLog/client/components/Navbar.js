// client/components/Navbar.js
import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { useRouter } from 'next/router';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Update user state on login/register/logout (storage change or route change)
  useEffect(() => {
    function syncUser() {
      const u = localStorage.getItem('user');
      setUser(u ? JSON.parse(u) : null);
    }
    syncUser();
    window.addEventListener('storage', syncUser);
    // Also update on route change (for same-tab login/register)
    router.events?.on('routeChangeComplete', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      router.events?.off('routeChangeComplete', syncUser);
    };
  }, [router]);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">Space Mission Log</Link>
      </div>
      <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
        <ul className={styles.navLinks}>
          <li>
            <Link href="/missions">Missions</Link>
          </li>
          <li>
            <Link href="/missions/create">Add Mission</Link>
          </li>
          <li>
            <Link href="/upload">Upload Video</Link>
          </li>
          {user && user.role === 'admin' && (
            <li>
              <Link href="/admin">Admin Dashboard</Link>
            </li>
          )}
          {user && (
            <li>
              <Link href="/settings">Settings</Link>
            </li>
          )}
        </ul>
      </div>
      <div className={styles.authLinks}>
        {user ? (
          <>
            <span style={{ marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span role="img" aria-label="user" style={{ fontSize: '1.5rem' }}>👤</span>
              {user.username}
            </span>
            <button onClick={logout} className={styles.formButton} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className={styles.formButton} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '1rem' }}>Login</Link>
            <Link href="/register" className={styles.formButton} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
