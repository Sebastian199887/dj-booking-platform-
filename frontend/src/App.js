import React, { useState, useEffect } from 'react';

const API_BASE = 'https://dj-booking-platform-uour.onrender.com';

function App() {
  const [activeTab, setActiveTab] = useState('book');
  const [clientEmail, setClientEmail] = useState(localStorage.getItem('clientEmail') || '');
  const [isDjLoggedIn, setIsDjLoggedIn] = useState(localStorage.getItem('djLoggedIn') === 'true');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [clientLoginEmail, setClientLoginEmail] = useState('');
  const [clientLoginPassword, setClientLoginPassword] = useState('');
  const [myBookings, setMyBookings] = useState([]);

  const [djEmail, setDjEmail] = useState('');
  const [djPassword, setDjPassword] = useState('');
  const [allBookings, setAllBookings] = useState([]);

  const fetchMyBookings = async (targetEmail) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/my-requests?email=${encodeURIComponent(targetEmail)}`);
      const data = await res.json();
      if (Array.isArray(data)) setMyBookings(data);
    } catch (err) {
      console.error("Error loading client bookings:", err);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dj/bookings`);
      const data = await res.json();
      if (Array.isArray(data)) setAllBookings(data);
    } catch (err) {
      console.error("Error loading DJ bookings:", err);
    }
  };

  useEffect(() => {
    if (clientEmail) fetchMyBookings(clientEmail);
    if (isDjLoggedIn) fetchAllBookings();
  }, [clientEmail, isDjLoggedIn]);

  const handleRegisterAndBook = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/bookings/register-and-book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: fullName,
          client_email: email,
          password: password,
          event_type: eventType,
          event_date: eventDate,
          notes: notes
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Booking submitted & Account created successfully!");
        localStorage.setItem('clientEmail', data.email);
        setClientEmail(data.email);
        fetchMyBookings(data.email);
        setActiveTab('client');
        setFullName('');
        setEmail('');
        setPassword('');
        setNotes('');
      } else {
        alert(data.error || "Failed to submit booking.");
      }
    } catch (err) {
      alert("Error reaching backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleClientLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/client/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clientLoginEmail, password: clientLoginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('clientEmail', data.email);
        setClientEmail(data.email);
        fetchMyBookings(data.email);
      } else {
        alert(data.error || "Invalid credentials");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const handleDjLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/dj/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: djEmail, password: djPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('djLoggedIn', 'true');
        setIsDjLoggedIn(true);
        fetchAllBookings();
      } else {
        alert(data.error || "Invalid credentials");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/api/dj/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchAllBookings();
      if (clientEmail) fetchMyBookings(clientEmail);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Delete this booking request?")) return;
    try {
      await fetch(`${API_BASE}/api/bookings/${id}`, { method: 'DELETE' });
      fetchAllBookings();
      if (clientEmail) fetchMyBookings(clientEmail);
    } catch (err) {
      alert("Failed to delete booking");
    }
  };

  return (
    <div style={{ backgroundColor: '#0f0c1b', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #2a2438', paddingBottom: '15px' }}>
        <h1 style={{ color: '#e040fb', margin: 0 }}>DJ Console</h1>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => setActiveTab('book')} style={tabBtn(activeTab === 'book')}>Book Event</button>
          <button onClick={() => setActiveTab('client')} style={tabBtn(activeTab === 'client')}>Client Portal</button>
          <button onClick={() => setActiveTab('dj')} style={tabBtn(activeTab === 'dj')}>DJ Studio</button>
        </nav>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        {activeTab === 'book' && (
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>Request Performance & Create Account</h2>
            <p style={{ color: '#aaa' }}>Submit your event request below. Setting a password creates your account so you can track and manage your application.</p>
            <form onSubmit={handleRegisterAndBook} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>EMAIL ADDRESS</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>CREATE PORTAL PASSWORD</label>
                  <input required type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>EVENT TYPE</label>
                  <select value={eventType} onChange={e => setEventType(e.target.value)} style={inputStyle}>
                    <option value="Wedding">Wedding</option>
                    <option value="Corporate">Corporate Event</option>
                    <option value="Club/Party">Club / Private Party</option>
                    <option value="Festival">Festival</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>EVENT DATE</label>
                  <input required type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>SPECIAL REQUESTS / NOTES</label>
                <textarea rows="4" value={notes} onChange={e => setNotes(e.target.value)} style={inputStyle}></textarea>
              </div>
              <button disabled={loading} type="submit" style={submitBtn}>
                {loading ? 'Creating Account & Booking...' : 'Create Account & Submit Request'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'client' && (
          <div style={cardStyle}>
            {!clientEmail ? (
              <div>
                <h2>Client Portal Login</h2>
                <form onSubmit={handleClientLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input placeholder="Email" required type="email" value={clientLoginEmail} onChange={e => setClientLoginEmail(e.target.value)} style={inputStyle} />
                  <input placeholder="Password" required type="password" value={clientLoginPassword} onChange={e => setClientLoginPassword(e.target.value)} style={inputStyle} />
                  <button type="submit" style={submitBtn}>Log In</button>
                </form>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Your Booking Requests ({clientEmail})</h2>
                  <button onClick={() => { localStorage.removeItem('clientEmail'); setClientEmail(''); }} style={dangerBtn}>Logout</button>
                </div>
                {myBookings.length === 0 ? <p>No bookings found.</p> : myBookings.map(b => (
                  <div key={b.id} style={bookingItemStyle}>
                    <h3>{b.event_type} - {b.event_date}</h3>
                    <p>Status: <strong style={{ color: b.status === 'accepted' ? '#00e676' : b.status === 'declined' ? '#ff5252' : '#ffab00' }}>{b.status.toUpperCase()}</strong></p>
                    <p>Notes: {b.notes || 'None'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dj' && (
          <div style={cardStyle}>
            {!isDjLoggedIn ? (
              <div>
                <h2>DJ Studio Login</h2>
                <form onSubmit={handleDjLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input placeholder="DJ Email (admin@dj.com)" required type="email" value={djEmail} onChange={e => setDjEmail(e.target.value)} style={inputStyle} />
                  <input placeholder="Password (admin123)" required type="password" value={djPassword} onChange={e => setDjPassword(e.target.value)} style={inputStyle} />
                  <button type="submit" style={submitBtn}>Access Studio</button>
                </form>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Manager Dashboard</h2>
                  <button onClick={() => { localStorage.removeItem('djLoggedIn'); setIsDjLoggedIn(false); }} style={dangerBtn}>Logout DJ</button>
                </div>
                {allBookings.length === 0 ? <p>No client requests submitted yet.</p> : allBookings.map(b => (
                  <div key={b.id} style={bookingItemStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h3>{b.client_name} ({b.client_email})</h3>
                      <span>Status: <strong>{b.status.toUpperCase()}</strong></span>
                    </div>
                    <p><strong>Event:</strong> {b.event_type} on {b.event_date}</p>
                    <p><strong>Notes:</strong> {b.notes || 'None'}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button onClick={() => handleUpdateStatus(b.id, 'accepted')} style={successBtn}>Accept</button>
                      <button onClick={() => handleUpdateStatus(b.id, 'declined')} style={warningBtn}>Decline</button>
                      <button onClick={() => handleDeleteBooking(b.id)} style={dangerBtn}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const tabBtn = (active) => ({
  background: active ? '#e040fb' : 'transparent',
  color: '#fff',
  border: '1px solid #e040fb',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer'
});

const cardStyle = {
  backgroundColor: '#18142a',
  padding: '25px',
  borderRadius: '12px',
  border: '1px solid #2a2438'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: '#aaa',
  marginBottom: '5px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#0f0c1b',
  border: '1px solid #2a2438',
  borderRadius: '6px',
  color: '#fff',
  boxSizing: 'border-box'
};

const submitBtn = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#e040fb',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const dangerBtn = { background: '#ff5252', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' };
const successBtn = { background: '#00e676', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' };
const warningBtn = { background: '#ffab00', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' };

const bookingItemStyle = {
  backgroundColor: '#0f0c1b',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '15px',
  border: '1px solid #2a2438'
};

<footer style={{ textAlign: 'center', padding: '20px', marginTop: '40px', color: '#666', borderTop: '1px solid #eaeaea' }}>
  <p>DJ Booking Platform &copy; 2026 | Created by Sebastian Hart Claude</p>
</footer>


export default App;
