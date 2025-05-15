// client/components/Notification.js
import React from 'react';

export default function Notification({ message, type = 'info' }) {
  const styles = {
    padding: '0.5rem',
    margin: '0.5rem 0',
    color: type === 'error' ? 'white' : 'black',
    backgroundColor: type === 'error' ? 'red' : '#ffecb3',
    textAlign: 'center'
  };
  return <div style={styles} data-testid="notification">{message}</div>;
}
