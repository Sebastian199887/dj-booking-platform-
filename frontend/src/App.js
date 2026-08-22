import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || "";

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0a0a0c', color: '#e2e8f0', fontFamily: 'sans-serif', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  wrapper: { maxWidth: '800px', width: '100%', flex: 1 },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  nav: { display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' },
  button: { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#27272a', color: '#fff', cursor: 'pointer', fontWeight: '600' },
  activeBtn: { background: 'linear-gradient(135deg, #a855f7, #ec4899)' },
  card: { background: '#18181b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #27272a', marginBottom: '1rem' },
  input: { width: '100%', padding: '0.75rem', margin: '0.5rem 0 1rem', borderRadius: '6px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', boxSizing: 'border-box' },
  footer: { textAlign: 'center', padding: '2rem 0', marginTop: '3rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748b', fontSize: '0.875rem' }
};

export default function App() {
  const [tab, setTab] = useState('book');
  
  const [form, setForm] = useState({ client_name: '', client_email: '', event_type: 'Wedding', event_date: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const [lookupEmail, setLookupEmail] = useState('');
  const [myBookings, setMyBookings] = useState([]);

  const [isDjLoggedIn, setIsDjLoggedIn] = useState(false);
  const [djCreds, setDjCreds] = useState({ email: '', password: '' });
  const [allBookings, setAllBookings] = useState([]);

  const submitBooking = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setSubmitted(true);
  };

  const fetchMyBookings = async () => {
    const res = await fetch(`${API_BASE}/api/bookings/my-requests?email=${lookupEmail}`);
    const data = await res.json();
    setMyBookings(data);
  };

  const djLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/api/dj/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(djCreds)
    });
    if (res.ok) {
      setIsDjLoggedIn(true);
      loadDjBookings();
    } else {
      alert("Invalid DJ Login");
    }
  };

  const loadDjBookings = async () => {
    const res = await fetch(`${API_BASE}/api/dj/bookings`);
    const data = await res.json();
    setAllBookings(data);
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/dj/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadDjBookings();
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <h1 style={styles.title}>DJ Booking Platform</h1>
        </header>

        <div style={styles.nav}>
          <button style={{...styles.button, ...(tab === 'book' ? styles.activeBtn : {})}} onClick={() => setTab('book')}>Book DJ</button>
          <button style={{...styles.button, ...(tab === 'lookup' ? styles.activeBtn : {})}} onClick={() => setTab('lookup')}>My Requests</button>
          <button style={{...styles.button, ...(tab === 'dj' ? styles.activeBtn : {})}} onClick={() => setTab('dj')}>DJ Portal</button>
        </div>

        {tab === 'book' && (
          <div style={styles.card}>
            <h2>Request a DJ Booking</h2>
            {submitted ? (
              <p style={{ color: '#4ade80' }}>Your booking request has been submitted! You can track its status anytime in the "My Requests" tab.</p>
            ) : (
              <form onSubmit={submitBooking}>
                <label>Your Name</label>
                <input style={styles.input} required value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} />
                
                <label>Your Email</label>
                <input style={styles.input} type="email" required value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} />
                
                <label>Event Type</label>
                <input style={styles.input} value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} />

                <label>Event Date</label>
                <input style={styles.input} type="date" required value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />

                <label>Special Requests / Notes</label>
                <textarea style={{...styles.input, height: '80px'}} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />

                <button type="submit" style={{...styles.button, ...styles.activeBtn, width: '100%'}}>Submit Booking Request</button>
              </form>
            )}
          </div>
        )}

        {tab === 'lookup' && (
          <div style={styles.card}>
            <h2>Check Your Booking Status</h2>
            <input style={styles.input} placeholder="Enter your email" value={lookupEmail} onChange={e => setLookupEmail(e.target.value)} />
            <button style={{...styles.button, ...styles.activeBtn, width: '100%'}} onClick={fetchMyBookings}>Find My Requests</button>

            {myBookings.map(b => (
              <div key={b.id} style={{ borderTop: '1px solid #3f3f46', marginTop: '1rem', paddingTop: '1rem' }}>
                <p><strong>Event:</strong> {b.event_type} on {b.event_date?.split('T')[0]}</p>
                <p><strong>Status:</strong> <span style={{ color: b.status === 'accepted' ? '#4ade80' : b.status === 'declined' ? '#f87171' : '#facc15' }}>{b.status.toUpperCase()}</span></p>
              </div>
            ))}
          </div>
        )}

        {tab === 'dj' && (
          <div>
            {!isDjLoggedIn ? (
              <div style={styles.card}>
                <h2>DJ Dashboard Login</h2>
                <form onSubmit={djLogin}>
                  <input style={styles.input} placeholder="DJ Email" value={djCreds.email} onChange={e => setDjCreds({...djCreds, email: e.target.value})} />
                  <input style={styles.input} type="password" placeholder="Password" value={djCreds.password} onChange={e => setDjCreds({...djCreds, password: e.target.value})} />
                  <button type="submit" style={{...styles.button, ...styles.activeBtn, width: '100%'}}>Login</button>
                </form>
              </div>
            ) : (
              <div>
                <h2>All Client Booking Requests</h2>
                {allBookings.map(b => (
                  <div key={b.id} style={styles.card}>
                    <h3>{b.event_type} - {b.client_name}</h3>
                    <p><strong>Email:</strong> {b.client_email}</p>
                    <p><strong>Date:</strong> {b.event_date?.split('T')[0]}</p>
                    <p><strong>Notes:</strong> {b.notes}</p>
                    <p><strong>Status:</strong> {b.status}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button style={{...styles.button, background: '#16a34a'}} onClick={() => updateStatus(b.id, 'accepted')}>Accept</button>
                      <button style={{...styles.button, background: '#dc2626'}} onClick={() => updateStatus(b.id, 'declined')}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={styles.footer}>
        Made by Sebastian Hart & Claude
      </footer>
    </div>
  );
}
