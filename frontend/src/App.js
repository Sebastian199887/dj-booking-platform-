import React, { useState, useEffect } from 'react';

const API_BASE = 'https://dj-booking-platform-uour.onrender.com';

function App() {
  const [activeTab, setActiveTab] = useState('book');
  const [clientEmail, setClientEmail] = useState(localStorage.getItem('clientEmail') || '');
  const [isDjLoggedIn, setIsDjLoggedIn] = useState(localStorage.getItem('djLoggedIn') === 'true');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          eventType,
          eventDate,
          notes
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Booking request submitted successfully! Your account has been created.');
        localStorage.setItem('clientEmail', email);
        setClientEmail(email);
        setFullName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setEventDate('');
        setNotes('');
      } else {
        setMessage(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setMessage('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClientLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/clients/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clientLoginEmail, password: clientLoginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('clientEmail', clientLoginEmail);
        setClientEmail(clientLoginEmail);
        fetchMyBookings(clientLoginEmail);
        setMessage('Logged in successfully!');
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setMessage('Server connection error');
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
      if (res.ok) {
        localStorage.setItem('djLoggedIn', 'true');
        setIsDjLoggedIn(true);
        fetchAllBookings();
        setMessage('DJ Logged in successfully!');
      } else {
        setMessage(data.error || 'DJ Login failed');
      }
    } catch (err) {
      setMessage('Server connection error');
    }
  };

  const bookingItemStyle = {
    backgroundColor: '#0f0c1b',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
    border: '1px solid #2a2438'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', color: '#fff', backgroundColor: '#13101f', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>DJ Booking Platform</h1>
        <p>Book your next unforgettable event</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
        <button 
          onClick={() => setActiveTab('book')} 
          style={{ padding: '10px 20px', backgroundColor: activeTab === 'book' ? '#6246ea' : '#2a2438', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Request Performance
        </button>
        <button 
          onClick={() => setActiveTab('client')} 
          style={{ padding: '10px 20px', backgroundColor: activeTab === 'client' ? '#6246ea' : '#2a2438', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Client Portal
        </button>
        <button 
          onClick={() => setActiveTab('dj')} 
          style={{ padding: '10px 20px', backgroundColor: activeTab === 'dj' ? '#6246ea' : '#2a2438', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          DJ Admin
        </button>
      </div>

      {message && <p style={{ padding: '10px', backgroundColor: '#2a2438', borderRadius: '4px', textAlign: 'center', marginBottom: '20px' }}>{message}</p>}

      {activeTab === 'book' && (
        <div style={bookingItemStyle}>
          <h2>Request Performance & Create Account</h2>
          <p>Submit your event request below. Setting a password creates your account so you can track and manage your application.</p>

          <form onSubmit={handleBookingSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>FULL NAME</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2a2438', backgroundColor: '#1d1730', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2a2438', backgroundColor: '#1d1730', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>PHONE NUMBER</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                placeholder="Enter your phone number"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2a2438', backgroundColor: '#1d1730', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>CREATE PORTAL PASSWORD</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2a2438', backgroundColor: '#1d1730', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>EVENT TYPE</label>
              <select 
                value={eventType} 
                onChange={(e) => setEventType(e.target.value)} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2a2438', backgroundColor: '#1d1730', color: '#fff' }}
              >
                <option value="Wedding">Wedding</option>
                <option value="Corporate">Corporate</option>
                <option value="Club">Club</option>
                <option value="Private Party">Private Party</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>EVENT DATE</label>
              <input 
                type="date" 
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2a2438', backgroundColor: '#1d1730', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>SPECIAL REQUESTS / NOTES</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                rows="3"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2a2438', backgroundColor: '#1d1730', color: '#fff' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#6246ea', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {loading ? 'Submitting...' : 'Create Account & Submit Request'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'client' && (
        <div style={bookingItemStyle}>
          <h2>Client Portal</h2>
          {!clientEmail ? (
            <form onSubmit={handleClientLogin}>
              <p>Log in with your email and portal password to view your requests.</p>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>EMAIL</label>
                <input 
                  type="email" 
                  value={clientLoginEmail} 
                  onChange={(e) => setClientLoginEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2a2438', backgroundColor: '#1d1730', color: '#fff' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>PASSWORD</label>
                <input 
                  type="password" 
                  value={clientLoginPassword} 
                  onChange={(e) => setClientLoginPassword(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2a2438', backgroundColor: '#1d1730', color: '#fff' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#6246ea', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Log In
              </button>
            </form>
          ) : (
            <div>
              <p>Logged in as: <strong>{clientEmail}</strong></p>
              <button 
                onClick={() => { localStorage.removeItem('clientEmail'); setClientEmail(''); }}
                style={{ padding: '8px 15px', backgroundColor: '#2a2438', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
              >
                Log Out
              </button>
              <h3>Your Bookings</h3>
              {myBookings.length === 0 ? (
                <p>No bookings found.</p>
              ) : (
                myBookings.map((b) => (
                  <div key={b.id} style={{ backgroundColor: '#1d1730', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                    <p><strong>Event:</strong> {b.event_type} on {b.event_date}</p>
                    <p><strong>Status:</strong> {b.status}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'dj' && (
        <div style={bookingItemStyle}>
          <h2>DJ Admin Panel</h2>
          {!isDjLoggedIn ? (
            <form onSubmit={handleDjLogin}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>DJ EMAIL</label>
                <input 
                  type="email" 
                  value={djEmail} 
                  onChange={(e) => setDjEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2a2438', backgroundColor: '#1d1730', color: '#fff' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>PASSWORD</label>
                <input 
                  type="password" 
                  value={djPassword} 
                  onChange={(e) => setDjPassword(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #2a2438', backgroundColor: '#1d1730', color: '#fff' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#6246ea', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                DJ Log In
              </button>
            </form>
          ) : (
            <div>
              <button 
                onClick={() => { localStorage.removeItem('djLoggedIn'); setIsDjLoggedIn(false); }}
                style={{ padding: '8px 15px', backgroundColor: '#2a2438', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
              >
                Log Out Admin
              </button>
              <h3>All Client Bookings</h3>
              {allBookings.length === 0 ? (
                <p>No client requests yet.</p>
              ) : (
                allBookings.map((b) => (
                  <div key={b.id} style={{ backgroundColor: '#1d1730', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>
                    <p><strong>Name:</strong> {b.full_name}</p>
                    <p><strong>Email:</strong> {b.email}</p>
                    <p><strong>Phone:</strong> {b.phone || 'N/A'}</p>
                    <p><strong>Event:</strong> {b.event_type} on {b.event_date}</p>
                    <p><strong>Status:</strong> {b.status}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Creator Credit Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', marginTop: '40px', color: '#888', borderTop: '1px solid #2a2438' }}>
        <p>DJ Booking Platform &copy; 2026 | Created by Sebastian Hart Claude</p>
      </footer>
    </div>
  );
}

export default App;
