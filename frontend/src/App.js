import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || "";

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  wrapper: { maxWidth: '1000px', width: '100%', flex: 1 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #27272a', paddingBottom: '1rem' },
  brand: { fontSize: '1.75rem', fontWeight: '800', background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  nav: { display: 'flex', gap: '0.5rem', background: '#18181b', padding: '0.25rem', borderRadius: '10px', border: '1px solid #27272a' },
  navBtn: { padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' },
  activeNavBtn: { background: '#27272a', color: '#fff' },
  
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  metricCard: { background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' },
  metricValue: { fontSize: '2rem', fontWeight: '800', margin: '0.25rem 0' },
  metricLabel: { fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' },

  card: { background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' },
  input: { width: '100%', padding: '0.75rem 1rem', margin: '0.5rem 0 1.25rem', borderRadius: '8px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', boxSizing: 'border-box', fontSize: '0.95rem' },
  btnPrimary: { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', cursor: 'pointer', fontWeight: '700', width: '100%', fontSize: '0.95rem' },
  
  badge: (status = 'pending') => ({
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    display: 'inline-block',
    background: status === 'accepted' ? 'rgba(34, 197, 94, 0.15)' : status === 'declined' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
    color: status === 'accepted' ? '#4ade80' : status === 'declined' ? '#f87171' : '#facc15',
    border: `1px solid ${status === 'accepted' ? '#16a34a' : status === 'declined' ? '#dc2626' : '#ca8a04'}`
  })
};

export default function App() {
  const [tab, setTab] = useState('book');
  
  const [form, setForm] = useState({ client_name: '', client_email: '', event_type: 'Wedding', event_date: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const [lookupEmail, setLookupEmail] = useState('');
  const [myBookings, setMyBookings] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [isDjLoggedIn, setIsDjLoggedIn] = useState(false);
  const [djCreds, setDjCreds] = useState({ email: '', password: '' });
  const [allBookings, setAllBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setSubmitted(true);
    } catch (err) {
      alert("Error submitting request");
    }
  };

  const fetchMyBookings = async (e) => {
    if (e) e.preventDefault();
    if (!lookupEmail) return;
    try {
      const res = await fetch(`${API_BASE}/api/bookings/my-requests?email=${encodeURIComponent(lookupEmail)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMyBookings(data);
      } else {
        setMyBookings([]);
      }
    } catch (err) {
      setMyBookings([]);
    } finally {
      setHasSearched(true);
    }
  };

  const djLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/dj/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(djCreds)
      });
      if (res.ok) {
        setIsDjLoggedIn(true);
        loadDjBookings();
      } else {
        alert("Invalid DJ Credentials");
      }
    } catch (err) {
      alert("Server error during login");
    }
  };

  const loadDjBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dj/bookings`);
      const data = await res.json();
      if (Array.isArray(data)) setAllBookings(data);
    } catch (err) {
      setAllBookings([]);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/api/dj/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadDjBookings();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredBookings = Array.isArray(allBookings)
    ? allBookings.filter(b => filterStatus === 'all' ? true : b.status === filterStatus)
    : [];

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        <header style={styles.header}>
          <div style={styles.brand}>DJ Console</div>
          <nav style={styles.nav}>
            <button style={{...styles.navBtn, ...(tab === 'book' ? styles.activeNavBtn : {})}} onClick={() => setTab('book')}>Book Event</button>
            <button style={{...styles.navBtn, ...(tab === 'lookup' ? styles.activeNavBtn : {})}} onClick={() => setTab('lookup')}>Client Portal</button>
            <button style={{...styles.navBtn, ...(tab === 'dj' ? styles.activeNavBtn : {})}} onClick={() => setTab('dj')}>DJ Studio</button>
          </nav>
        </header>

        {/* 1. PUBLIC BOOKING FORM */}
        {tab === 'book' && (
          <div style={styles.card}>
            <h2 style={{ marginTop: 0 }}>Request a DJ Performance</h2>
            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>Fill out your event details below to reserve your date.</p>
            
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3>Request Received!</h3>
                <p style={{ color: '#a1a1aa' }}>Your request is pending review. Check status anytime in the Client Portal using <strong>{form.client_email}</strong>.</p>
                <button style={{...styles.btnPrimary, width: 'auto', marginTop: '1rem'}} onClick={() => { setSubmitted(false); setTab('lookup'); setLookupEmail(form.client_email); }}>Go to Client Portal</button>
              </div>
            ) : (
              <form onSubmit={submitBooking}>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>FULL NAME</label>
                <input style={styles.input} required value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} placeholder="e.g. Alex Morgan" />
                
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>EMAIL ADDRESS</label>
                <input style={styles.input} type="email" required value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} placeholder="alex@example.com" />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>EVENT TYPE</label>
                    <input style={styles.input} value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} placeholder="Wedding, Birthday, Club" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>EVENT DATE</label>
                    <input style={styles.input} type="date" required value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />
                  </div>
                </div>

                <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>SPECIAL REQUESTS / NOTES</label>
                <textarea style={{...styles.input, height: '90px', resize: 'vertical'}} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Genre preferences, equipment needs, venue details..." />

                <button type="submit" style={styles.btnPrimary}>Submit Booking Request</button>
              </form>
            )}
          </div>
        )}

        {/* 2. CLIENT DASHBOARD */}
        {tab === 'lookup' && (
          <div>
            <div style={styles.card}>
              <h2 style={{ marginTop: 0 }}>Client Dashboard</h2>
              <form onSubmit={fetchMyBookings} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input style={{...styles.input, margin: 0}} type="email" required placeholder="Enter your booking email" value={lookupEmail} onChange={e => setLookupEmail(e.target.value)} />
                <button type="submit" style={{...styles.btnPrimary, width: 'auto', whiteSpace: 'nowrap'}}>Search Requests</button>
              </form>
            </div>

            {hasSearched && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#a1a1aa' }}>Your Booking Requests ({myBookings.length})</h3>
                {myBookings.length === 0 ? (
                  <div style={styles.card}><p style={{ color: '#a1a1aa', margin: 0 }}>No bookings found for this email address.</p></div>
                ) : (
                  myBookings.map(b => (
                    <div key={b.id} style={styles.card}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.25rem 0' }}>{b.event_type}</h3>
                          <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Requested for {b.event_date ? String(b.event_date).split('T')[0] : 'N/A'}</span>
                        </div>
                        <span style={styles.badge(b.status)}>{b.status || 'pending'}</span>
                      </div>

                      <div style={{ background: '#27272a', height: '6px', borderRadius: '3px', margin: '1.5rem 0', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: b.status === 'accepted' ? '100%' : b.status === 'declined' ? '100%' : '50%',
                          background: b.status === 'accepted' ? '#22c55e' : b.status === 'declined' ? '#ef4444' : '#eab308',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>

                      {b.notes && <p style={{ fontSize: '0.9rem', color: '#d4d4d8', background: '#09090b', padding: '0.75rem', borderRadius: '6px', border: '1px solid #27272a', margin: 0 }}>"{b.notes}"</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. DJ COMMAND CENTER */}
        {tab === 'dj' && (
          <div>
            {!isDjLoggedIn ? (
              <div style={{...styles.card, maxWidth: '400px', margin: '4rem auto 0'}}>
                <h2 style={{ textAlign: 'center', marginTop: 0 }}>DJ Portal Login</h2>
                <form onSubmit={djLogin}>
                  <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>EMAIL</label>
                  <input style={styles.input} type="email" value={djCreds.email} onChange={e => setDjCreds({...djCreds, email: e.target.value})} placeholder="admin@dj.com" />
                  
                  <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>PASSWORD</label>
                  <input style={styles.input} type="password" value={djCreds.password} onChange={e => setDjCreds({...djCreds, password: e.target.value})} placeholder="••••••••" />
                  
                  <button type="submit" style={styles.btnPrimary}>Access Command Center</button>
                </form>
              </div>
            ) : (
              <div>
                <div style={styles.metricsGrid}>
                  <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>Total Requests</div>
                    <div style={styles.metricValue}>{allBookings.length}</div>
                  </div>
                  <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>Pending Review</div>
                    <div style={{...styles.metricValue, color: '#facc15'}}>{allBookings.filter(b => b.status === 'pending').length}</div>
                  </div>
                  <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>Confirmed Gigs</div>
                    <div style={{...styles.metricValue, color: '#4ade80'}}>{allBookings.filter(b => b.status === 'accepted').length}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={styles.nav}>
                    {['all', 'pending', 'accepted', 'declined'].map(s => (
                      <button key={s} style={{...styles.navBtn, ...(filterStatus === s ? styles.activeNavBtn : {}), textTransform: 'capitalize'}} onClick={() => setFilterStatus(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <button style={{...styles.navBtn, background: '#27272a', color: '#fff'}} onClick={() => setIsDjLoggedIn(false)}>Sign Out</button>
                </div>

                {filteredBookings.length === 0 ? (
                  <div style={styles.card}><p style={{ color: '#a1a1aa', margin: 0 }}>No bookings match this filter.</p></div>
                ) : (
                  filteredBookings.map(b => (
                    <div key={b.id} style={styles.card}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <h3 style={{ margin: 0 }}>{b.client_name}</h3>
                            <span style={styles.badge(b.status)}>{b.status}</span>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>
                            {b.event_type} • <span style={{ color: '#ec4899' }}>{b.event_date ? String(b.event_date).split('T')[0] : 'N/A'}</span> • {b.client_email}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {b.status !== 'accepted' && (
                            <button style={{...styles.navBtn, background: '#16a34a', color: '#fff'}} onClick={() => updateStatus(b.id, 'accepted')}>Accept</button>
                          )}
                          {b.status !== 'declined' && (
                            <button style={{...styles.navBtn, background: '#dc2626', color: '#fff'}} onClick={() => updateStatus(b.id, 'declined')}>Decline</button>
                          )}
                        </div>
                      </div>

                      {b.notes && (
                        <div style={{ marginTop: '1rem', background: '#09090b', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #27272a', fontSize: '0.9rem', color: '#a1a1aa' }}>
                          <strong style={{ color: '#d4d4d8' }}>Notes:</strong> {b.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
