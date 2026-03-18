import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function DentistList() {
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Base API URL (from Vercel env)
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        // ✅ FIXED: use backend URL
        const response = await axios.get(`${API}/api/dentists`);
        setDentists(response.data);
      } catch (error) {
        console.error('Error fetching dentists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDentists();
  }, [API]);

  const renderSkeleton = () => (
    <div className="container">
      <div className="hero">
        <div className="skeleton" style={{ width: 140, height: 24, margin: '0 auto 20px', borderRadius: 20 }} />
        <div className="skeleton" style={{ width: '60%', height: 40, margin: '0 auto 12px' }} />
        <div className="skeleton" style={{ width: '40%', height: 16, margin: '0 auto' }} />
      </div>
      <div className="dentist-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton-card">
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '70%', height: 14, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '45%', height: 10 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: 120, height: 22, borderRadius: 20, marginBottom: 14 }} />
            <div className="skeleton" style={{ width: '90%', height: 12, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: '75%', height: 12, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: '80%', height: 12, marginBottom: 18 }} />
            <div className="skeleton" style={{ height: 40, borderRadius: 10 }} />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return renderSkeleton();

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-badge">✨ Trusted by 10,000+ patients</div>
        <h1>
          Book Your Next <em>Dental Visit</em>
        </h1>
        <p>Find top-rated dental professionals and schedule your appointment in seconds.</p>
      </div>

      <div className="dentist-grid">
        {dentists.map((dentist, index) => (
          <div
            key={dentist._id}
            className="dentist-card"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="dentist-card-header">
              <div className="dentist-avatar">
                <img src={dentist.photo} alt={dentist.name} />
              </div>
              <div>
                <div className="dentist-name">{dentist.name}</div>
                <div className="dentist-qualification">{dentist.qualification}</div>
              </div>
            </div>

            <div className="experience-badge">
              ⭐ {dentist.experience} yrs experience
            </div>

            <div className="dentist-info">
              <div className="dentist-info-row">
                <span className="info-icon">🏥</span>
                <span>{dentist.clinic_name}</span>
              </div>
              <div className="dentist-info-row">
                <span className="info-icon">📍</span>
                <span>{dentist.address}</span>
              </div>
              <div className="dentist-info-row">
                <span className="info-icon">🌍</span>
                <span>{dentist.location}</span>
              </div>
            </div>

            <Link
              to={`/book/${dentist._id}`}
              className="btn btn-primary"
            >
              Book Appointment →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DentistList;