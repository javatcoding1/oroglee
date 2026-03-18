import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function DentistList() {
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [location, setLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const response = await axios.get(`${API}/api/dentists`);
        setDentists(response.data);
      } catch (error) {
        console.error('Error fetching dentists:', error);
        setError('Failed to load dentists. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDentists();
  }, [API]);

  // Derive filter options
  const specialities = [...new Set(dentists.map(d => d.qualification.split('-')[1]?.trim() || d.qualification))].filter(Boolean);
  const locations = [...new Set(dentists.map(d => d.location))].filter(Boolean);

  const filteredDentists = dentists.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.clinic_name.toLowerCase().includes(search.toLowerCase());
    const matchSpeciality = speciality ? d.qualification.includes(speciality) : true;
    const matchLocation = location ? d.location === location : true;
    return matchSearch && matchSpeciality && matchLocation;
  });

  const totalPages = Math.ceil(filteredDentists.length / itemsPerPage);
  const currentDentists = filteredDentists.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, speciality, location]);

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

  if (error) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ position: 'relative' }}>
      <div className="bg-glow" />
      <div className="hero">
        <div className="hero-badge">✨ Trusted by 10,000+ patients</div>
        <h1>
          Book Your Next <em>Dental Visit</em>
        </h1>
        <p>Find top-rated dental professionals and schedule your appointment in seconds.</p>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label className="form-label">Search</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search name or clinic..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="filter-group">
          <label className="form-label">Speciality</label>
          <select className="form-select" value={speciality} onChange={e => setSpeciality(e.target.value)}>
            <option value="">All Specialities</option>
            {specialities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="form-label">Location</label>
          <select className="form-select" value={location} onChange={e => setLocation(e.target.value)}>
            <option value="">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="dentist-grid">
        {currentDentists.map((dentist, index) => (
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

      {filteredDentists.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h2>No Dentists Found</h2>
          <p>Try adjusting your search or filters to find a match.</p>
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setSpeciality(''); setLocation(''); }}>Clear Filters</button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn" 
            disabled={currentPage === 1} 
            onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0); }}
          >
            &lt;
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1} 
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0); }}
            >
              {i + 1}
            </button>
          ))}

          <button 
            className="page-btn" 
            disabled={currentPage === totalPages} 
            onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0); }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}

export default DentistList;