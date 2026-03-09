import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface RaceTrack {
  id?: number;
  name: string;
  location: string;
  laps: number;
  base_lap_time: number;
}

const App: React.FC = () => {
  const [tracks, setTracks] = useState<RaceTrack[]>([]);
  const [formData, setFormData] = useState<RaceTrack>({
    name: '',
    location: '',
    laps: 0,
    base_lap_time: 0
  });

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const res = await axios.get<RaceTrack[]>('http://localhost:8080/tracks');
      setTracks(res.data);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    try {
      await axios.post('http://localhost:8080/tracks', formData);
      setFormData({ name: '', location: '', laps: 0, base_lap_time: 0 }); // Reset
      fetchTracks(); // Refresh list
    } catch (err) {
      alert("Check if Go Backend is running!");
    }
  };

  const deleteTrack = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/tracks/${id}`);
      fetchTracks();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🏁 PIT WALL <span style={{color: '#fff'}}>STRATEGY</span></h1>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Register New Circuit</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input 
              style={styles.input} 
              placeholder="Track Name (e.g. Monza)" 
              value={formData.name} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})} 
            />
            <input 
              style={styles.input} 
              placeholder="Location" 
              value={formData.location} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, location: e.target.value})} 
            />
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Laps" 
              value={formData.laps || ''} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, laps: parseInt(e.target.value) || 0})} 
            />
            <input 
              style={styles.input} 
              type="number" 
              step="0.1" 
              placeholder="Base Time (sec)" 
              value={formData.base_lap_time || ''} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, base_lap_time: parseFloat(e.target.value) || 0})} 
            />
            <button type="submit" style={styles.addButton}>ADD TO CALENDAR</button>
          </form>
        </section>

        <section>
          <h3 style={styles.cardTitle}>Season Schedule</h3>
          <div style={styles.grid}>
            {tracks.length === 0 && <p style={{color: '#666'}}>No tracks registered yet...</p>}
            {tracks.map((track) => (
              <div key={track.id} style={styles.trackCard}>
                <div>
                  <h4 style={{margin: '0 0 5px 0', fontSize: '1.2rem'}}>{track.name}</h4>
                  <p style={{margin: 0, color: '#e10600', fontSize: '0.8rem', fontWeight: 'bold'}}>{track.location.toUpperCase()}</p>
                  <p style={{marginTop: '10px', fontSize: '0.9rem', color: '#ccc'}}>
                    {track.laps} Laps | {track.base_lap_time}s pace
                  </p>
                </div>
                <button 
                  onClick={() => deleteTrack(track.id!)} 
                  style={styles.deleteButton}
                >
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#15151e',
    color: '#fff',
    minHeight: '100vh',
    fontFamily: '"Titillium Web", sans-serif',
  },
  header: {
    backgroundColor: '#000',
    padding: '20px 40px',
    borderBottom: '4px solid #e10600',
  },
  title: {
    margin: 0,
    color: '#e10600',
    letterSpacing: '2px',
    fontSize: '1.5rem',
  },
  main: {
    padding: '40px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#1f1f27',
    padding: '25px',
    borderRadius: '10px',
    marginBottom: '40px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  },
  cardTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    borderLeft: '4px solid #e10600',
    paddingLeft: '15px',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  input: {
    backgroundColor: '#2b2b36',
    border: '1px solid #38383f',
    color: '#fff',
    padding: '12px',
    borderRadius: '5px',
    outline: 'none',
  },
  addButton: {
    backgroundColor: '#e10600',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  trackCard: {
    backgroundColor: '#1f1f27',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #333',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    color: '#ff4d4d',
    border: '1px solid #ff4d4d',
    padding: '4px 8px',
    fontSize: '0.7rem',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default App;