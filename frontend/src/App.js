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

  // Additional states for bookings list, DJ login, etc. can go here

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

      {activeTab === 'book' && (
        <div style={bookingItemStyle}>
          <h2>Request Performance & Create Account</h2>
          <p>Submit your event request below. Setting a password creates your account so you can track and manage your application.</p>
          
          {message && <p style={{ padding: '10px', backgroundColor: '#2a2438', borderRadius: '4px' }}>{message}</p>}

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

      {/* Footer with Creator Credit */}
      <footer style={{ textAlign: 'center', padding: '20px', marginTop: '40px', color: '#888', borderTop: '1px solid #2a2438' }}>
        <p>DJ Booking Platform &copy; 2026 | Created by Sebastian Hart Claude</p>
      </footer>
    </div>
  );
}

export default App;
