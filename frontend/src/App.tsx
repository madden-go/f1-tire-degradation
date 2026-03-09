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
  const [selectedCompound, setSelectedCompound] = useState<string>("Soft");
  const [strategy, setStrategy] = useState<any>(null);
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
      setFormData({ name: '', location: '', laps: 0, base_lap_time: 0 });
      fetchTracks();
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

  const getStrategy = async (trackId: number) => {
    try {
      const res = await axios.get(`http://localhost:8080/tracks/${trackId}/strategy?compound=${selectedCompound}`);
      setStrategy(res.data);
    } catch (err) {
      alert("Make sure you chose a valid tire!");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🏁 PIT WALL <span style={{color: '#fff'}}>STRATEGY</span></h1>
      </header>

      <main style={styles.main}>
        {/* REGISTER SECTION */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Register New Circuit</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input style={styles.input} placeholder="Track Name" value={formData.name} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})} />
            <input style={styles.input} placeholder="Location" value={formData.location} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, location: e.target.value})} />
            <input style={styles.input} type="number" placeholder="Laps" value={formData.laps || ''} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, laps: parseInt(e.target.value) || 0})} />
            <input style={styles.input} type="number" step="0.1" placeholder="Base Time" value={formData.base_lap_time || ''} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, base_lap_time: parseFloat(e.target.value) || 0})} />
            <button type="submit" style={styles.addButton}>ADD TO CALENDAR</button>
          </form>
        </section>

        {/* PREDICTOR SECTION */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Strategy Predictor</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {['Soft', 'Medium', 'Hard'].map(compound => (
              <button 
                key={compound}
                onClick={() => setSelectedCompound(compound)}
                style={{
                  ...styles.compoundButton,
                  backgroundColor: selectedCompound === compound ? '#e10600' : '#333',
                  borderColor: compound === 'Soft' ? '#ff1801' : compound === 'Medium' ? '#ffd200' : '#fff'
                }}
              >
                {compound.toUpperCase()}
              </button>
            ))}
          </div>

          {strategy ? (
            <div>
              <h4 style={{color: '#e10600', margin: '0'}}>{strategy.track} - {strategy.compound}</h4>
              <div style={styles.lapGrid}>
                {strategy.strategy.map((lap: any) => (
                  <div key={lap.lap} style={styles.lapCard}>
                    <span style={{color: '#888', fontSize: '0.7rem'}}>L{lap.lap}</span>
                    <span style={{fontWeight: 'bold'}}>{lap.time.toFixed(3)}s</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{color: '#666'}}>Select "View Strategy" on a track below...</p>
          )}
        </section>

        {/* SCHEDULE SECTION */}
        <section>
          <h3 style={styles.cardTitle}>Season Schedule</h3>
          <div style={styles.grid}>
            {tracks.map((track) => (
              <div key={track.id} style={styles.trackCard}>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{margin: '0 0 5px 0'}}>{track.name}</h4>
                  <p style={{margin: 0, color: '#e10600', fontSize: '0.8rem', fontWeight: 'bold'}}>{track.location.toUpperCase()}</p>
                  <p style={{marginTop: '10px', fontSize: '0.8rem', color: '#ccc'}}>{track.laps} Laps | {track.base_lap_time}s pace</p>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => getStrategy(track.id!)} style={styles.strategyButton}>STRATEGY</button>
                  <button onClick={() => deleteTrack(track.id!)} style={styles.deleteButton}>REMOVE</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { backgroundColor: '#15151e', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' },
  header: { backgroundColor: '#000', padding: '15px 40px', borderBottom: '4px solid #e10600' },
  title: { margin: 0, color: '#e10600', fontSize: '1.2rem', letterSpacing: '1px' },
  main: { padding: '30px', maxWidth: '900px', margin: '0 auto' },
  card: { backgroundColor: '#1f1f27', padding: '20px', borderRadius: '8px', marginBottom: '30px' },
  cardTitle: { margin: '0 0 15px 0', fontSize: '1rem', textTransform: 'uppercase', borderLeft: '4px solid #e10600', paddingLeft: '12px' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' },
  input: { backgroundColor: '#2b2b36', border: '1px solid #38383f', color: '#fff', padding: '10px', borderRadius: '4px' },
  addButton: { backgroundColor: '#e10600', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' },
  trackCard: { backgroundColor: '#1f1f27', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #e10600', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  deleteButton: { backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px', cursor: 'pointer' },
  compoundButton: { padding: '8px 16px', border: '2px solid', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
  strategyButton: { backgroundColor: '#fff', color: '#000', border: 'none', padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  lapGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '15px' },
  lapCard: { backgroundColor: '#2b2b36', padding: '8px', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center' }
};

export default App;