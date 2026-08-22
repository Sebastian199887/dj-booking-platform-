import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0c',
    color: '#e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center'
  },
  wrapper: {
    maxWidth: '900px',
    width: '100%'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.025em'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    margin: 0
  },
  footer: {
    textAlign: "center",
    padding: "2rem 0",
    marginTop: "3rem",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#64748b",
    fontSize: "0.875rem"
  },
  nav: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    marginBottom: '2.5rem',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '0.5rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  navButton: (active) => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: active ? '#a855f7' : 'transparent',
    color: active ? '#ffffff' : '#94a3b8',
    boxShadow: active ? '0 4px 12px rgba(168, 85, 247, 0.3)' : 'none'
  }),
  card: {
    background: 'rgba(23, 23, 23, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    color: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem'
  },
  fullWidth: {
    gridColumn: '1 / -1'
  },
  input: {
    width: '100%',
    padding: '0.85rem 1rem',
    backgroundColor: '#17171c',
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '0.85rem 1rem',
    backgroundColor: '#17171c',
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
    minHeight: '90px',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '0.4rem'
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    marginTop: '1rem',
    backgroundColor: '#ec4899',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)'
  },
  successBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
    color: '#4ade80'
  },
  codeBox: {
    display: 'inline-block',
    backgroundColor: '#09090b',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '1.5rem',
    letterSpacing: '0.1em',
    color: '#a855f7',
    margin: '1rem 0',
    border: '1px dashed #a855f7'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    marginTop: '1rem'
  },
  th: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #27272a',
    color: '#a1a1aa',
    fontSize: '0.85rem',
    textTransform: 'uppercase'
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #18181b',
    color: '#e4e4e7',
    fontSize: '0.95rem'
  }
};

function App() {
  const [tab, setTab] = useState('book');

  // Booking Form State
  const [formData, setFormData] = useState({
    client_name: '', client_email: '', event_date: '',
    start_time: '', end_time: '', event_location: '',
    event_description: '', must_play_songs: '', dont_play_songs: '',
    terms_accepted: false
  });
  const [createdToken, setCreatedToken] = useState('');

  // Lookup State
  const [lookupToken, setLookupToken] = useState('');
  const [reservation, setReservation] = useState(null);

  // Admin Auth & Setup State
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mustSetup, setMustSetup] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adminBookings, setAdminBookings] = useState([]);

  // Public Calendar State
  const [publicEvents, setPublicEvents] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/bookings/public-calendar`)
      .then(res => res.json())
      .then(data => { if (data.status === 'success') setPublicEvents(data.data); })
      .catch(err => console.error("Error loading public schedule:", err));
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCreatedToken(data.access_token);
      } else {
        alert(data.message || 'Error submitting booking.');
      }
    } catch (err) {
      alert('Network error connecting to backend.');
    }
  };

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/bookings/my-reservation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: lookupToken })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setReservation(data.data);
      } else {
        alert(data.message || 'Invalid Access Token');
      }
    } catch (err) {
      alert('Error fetching reservation details.');
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_username: adminUser, admin_password: adminPass })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setIsLoggedIn(true);
        setAdminBookings(data.data || []);
        if (data.mustSetupCredentials) {
          setMustSetup(true);
        }
      } else {
        alert(data.message || 'Access Denied');
      }
    } catch (err) {
      alert('Admin authentication failed.');
    }
  };

  const handleCredentialsSetup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/update-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: adminPass,
          new_username: newUsername,
          new_password: newPassword
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Credentials set! Please log in with your new username and password.');
        setMustSetup(false);
        setIsLoggedIn(false);
        setAdminUser(newUsername);
        setAdminPass('');
        setNewUsername('');
        setNewPassword('');
      } else {
        alert(data.message || 'Error setting credentials');
      }
    } catch (err) {
      alert('Network error updating credentials');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.title}>AUDIO // RESERVE</h1>
          <p style={styles.subtitle}>Exclusive DJ Performance & Event Booking Portal</p>
        </header>

        {/* Tab Navigation */}
        <nav style={styles.nav}>
          <button style={styles.navButton(tab === 'book')} onClick={() => setTab('book')}>Book Performance</button>
          <button style={styles.navButton(tab === 'lookup')} onClick={() => setTab('lookup')}>Client Portal</button>
          <button style={styles.navButton(tab === 'admin')} onClick={() => setTab('admin')}>Admin Console</button>
        </nav>

        {/* TAB 1: BOOKING FORM */}
        {tab === 'book' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Request Event Booking</h2>
              {createdToken ? (
                <div style={styles.successBadge}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>Reservation Initialized</h3>
                  <p style={{ color: '#94a3b8', margin: 0 }}>Save your private access credentials to manage track requests:</p>
                  <div style={styles.codeBox}>{createdToken}</div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit}>
                  <div style={styles.formGrid}>
                    <div>
                      <label style={styles.label}>Full Name</label>
                      <input style={styles.input} type="text" placeholder="John Doe" required value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} />
                    </div>
                    <div>
                      <label style={styles.label}>Email Address</label>
                      <input style={styles.input} type="email" placeholder="john@example.com" required value={formData.client_email} onChange={e => setFormData({ ...formData, client_email: e.target.value })} />
                    </div>
                    <div>
                      <label style={styles.label}>Event Date</label>
                      <input style={styles.input} type="date" required value={formData.event_date} onChange={e => setFormData({ ...formData, event_date: e.target.value })} />
                    </div>
                    <div>
                      <label style={styles.label}>Location / Venue</label>
                      <input style={styles.input} type="text" placeholder="Grand Ballroom, NYC" required value={formData.event_location} onChange={e => setFormData({ ...formData, event_location: e.target.value })} />
                    </div>
                    <div>
                      <label style={styles.label}>Start Time</label>
                      <input style={styles.input} type="time" required value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                    </div>
                    <div>
                      <label style={styles.label}>End Time</label>
                      <input style={styles.input} type="time" required value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
                    </div>
                    <div style={styles.fullWidth}>
                      <label style={styles.label}>Event Description</label>
                      <textarea style={styles.textarea} placeholder="Describe the vibe, guest count, audio gear setup..." value={formData.event_description} onChange={e => setFormData({ ...formData, event_description: e.target.value })} />
                    </div>
                    <div>
                      <label style={styles.label}>Must Play Tracklist</label>
                      <textarea style={styles.textarea} placeholder="Artist - Song Title (one per line)" value={formData.must_play_songs} onChange={e => setFormData({ ...formData, must_play_songs: e.target.value })} />
                    </div>
                    <div>
                      <label style={styles.label}>Do Not Play Tracklist</label>
                      <textarea style={styles.textarea} placeholder="Banned genres or specific tracks" value={formData.dont_play_songs} onChange={e => setFormData({ ...formData, dont_play_songs: e.target.value })} />
                    </div>
                    <div style={{ ...styles.fullWidth, marginTop: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input type="checkbox" required checked={formData.terms_accepted} onChange={e => setFormData({ ...formData, terms_accepted: e.target.checked })} />
                        I accept performance terms, sound limits, and cancellation policies.
                      </label>
                    </div>
                  </div>
                  <button style={styles.submitBtn} type="submit">Submit Performance Request</button>
                </form>
              )}
            </div>

            {/* Calendar Slots */}
            <div style={styles.card}>
              <h3 style={{ ...styles.sectionTitle, fontSize: '1rem', margin: 0 }}>Existing Booked Slots</h3>
              <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {publicEvents.length === 0 ? (
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No booked dates on record.</span>
                ) : (
                  publicEvents.map((evt, idx) => (
                    <span key={idx} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
                      📅 {evt.event_date.split('T')[0]} ({evt.start_time.slice(0, 5)} - {evt.end_time.slice(0, 5)})
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLIENT LOOKUP */}
        {tab === 'lookup' && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Client Portal</h2>
            <form onSubmit={handleLookupSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input style={styles.input} type="text" placeholder="Access Code (e.g. DJ-A1B2C3)" required value={lookupToken} onChange={e => setLookupToken(e.target.value)} />
              <button style={{ ...styles.submitBtn, width: 'auto', marginTop: 0, padding: '0 1.5rem' }} type="submit">Verify</button>
            </form>

            {reservation && (
              <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ color: '#f8fafc', marginTop: 0 }}>Booking Summary</h3>
                <p style={{ color: '#94a3b8', margin: '0.4rem 0' }}><strong>Client:</strong> {reservation.client_name}</p>
                <p style={{ color: '#94a3b8', margin: '0.4rem 0' }}><strong>Date & Time:</strong> {reservation.event_date.split('T')[0]} @ {reservation.start_time} - {reservation.end_time}</p>
                <p style={{ color: '#94a3b8', margin: '0.4rem 0' }}><strong>Location:</strong> {reservation.event_location}</p>
                <div style={{ marginTop: '1rem', borderTop: '1px solid #27272a', paddingTop: '1rem' }}>
                  <p style={{ color: '#a855f7', fontWeight: '600', margin: '0 0 0.2rem 0' }}>Must Play List:</p>
                  <p style={{ color: '#e4e4e7', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{reservation.must_play_songs || 'None'}</p>
                  <p style={{ color: '#ec4899', fontWeight: '600', margin: '0 0 0.2rem 0' }}>Do Not Play List:</p>
                  <p style={{ color: '#e4e4e7', fontSize: '0.9rem', margin: 0 }}>{reservation.dont_play_songs || 'None'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADMIN WORKSPACE */}
        {tab === 'admin' && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Admin Console</h2>

            {!isLoggedIn ? (
              /* LOGIN / INITIAL ENTRY FORM */
              <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ color: '#94a3b8', marginTop: 0 }}>First time setup: Leave blank and click enter. Standard setup: enter your credentials.</p>
                <input style={styles.input} type="text" placeholder="Username (Leave blank for initial setup)" value={adminUser} onChange={e => setAdminUser(e.target.value)} />
                <input style={styles.input} type="password" placeholder="Password (Leave blank for initial setup)" value={adminPass} onChange={e => setAdminPass(e.target.value)} />
                <button style={{ ...styles.submitBtn, backgroundColor: '#a855f7' }} type="submit">Enter Console</button>
              </form>
            ) : mustSetup ? (
              /* SETUP CREDENTIALS FORM */
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ color: '#a855f7', marginTop: 0 }}>🔐 First-Time Security Setup</h3>
                <p style={{ color: '#94a3b8' }}>Create your custom administrator username and password to secure this portal before accessing the dashboard.</p>
                <form onSubmit={handleCredentialsSetup} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input style={styles.input} type="text" placeholder="Create Admin Username" required value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                  <input style={styles.input} type="password" placeholder="Create Admin Password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <button style={{ ...styles.submitBtn, backgroundColor: '#a855f7' }} type="submit">Save Credentials & Finish Setup</button>
                </form>
              </div>
            ) : (
              /* DASHBOARD DATA TABLE */
              <div>
                <p style={{ color: '#4ade80', marginBottom: '1rem' }}>✓ Authenticated as <strong>{adminUser}</strong></p>
                {adminBookings.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Code</th>
                          <th style={styles.th}>Client</th>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Time</th>
                          <th style={styles.th}>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminBookings.map((b) => (
                          <tr key={b.id}>
                            <td style={styles.td}><code style={{ color: '#a855f7' }}>{b.access_token}</code></td>
                            <td style={styles.td}>{b.client_name}<br/><span style={{ color: '#64748b', fontSize: '0.8rem' }}>{b.client_email}</span></td>
                            <td style={styles.td}>{b.event_date.split('T')[0]}</td>
                            <td style={styles.td}>{b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}</td>
                            <td style={styles.td}>{b.event_location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8' }}>No bookings found in database.</p>
                )}
              </div>
            )}
          </div>
        )}

      </div>
      <footer style={styles.footer}>Made by Sebastian Hart & Claude</footer>
</div>
  );
}

export default App;
