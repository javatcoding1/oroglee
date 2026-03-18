import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function BookAppointment() {
  const { dentistId } = useParams();
  const navigate = useNavigate();
  const [dentist, setDentist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [globalError, setGlobalError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    patient_name: '',
    email: '',
    age: '',
    gender: '',
    appointment_date: '',
  });
  const API = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchDentist = async () => {
      try {
        const response = await axios.get(`${API}/api/dentists/${dentistId}`);
        setDentist(response.data);
      } catch (error) {
        console.error('Error fetching dentist:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDentist();
  }, [dentistId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const errors = {};
    if (formData.patient_name.trim().length < 2) errors.patient_name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email address';
    if (!formData.age || formData.age < 1 || formData.age > 120) errors.age = 'Please enter a valid age';
    if (!formData.gender) errors.gender = 'Please select a gender';
    if (!formData.appointment_date) errors.appointment_date = 'Please select a date';
    else if (new Date(formData.appointment_date) < new Date(today)) errors.appointment_date = 'Date cannot be in the past';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/api/appointments`, {
        ...formData,
        age: parseInt(formData.age),
        dentist_id: dentistId,
        dentist_name: dentist.name,
        clinic_name: dentist.clinic_name,
      });
      setSuccess(response.data);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setGlobalError(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="container form-page">
        <div className="form-card">
          <div className="form-card-header">
            <div className="skeleton" style={{ width: 180, height: 22, margin: '0 auto 8px' }} />
            <div className="skeleton" style={{ width: 220, height: 14, margin: '0 auto' }} />
          </div>
          <div className="form-card-body">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 40 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    const formattedDate = new Date(formData.appointment_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="container form-page">
        <div className="form-card">
          <div className="success-state">
            <div className="success-check">✓</div>
            <h2>Appointment Confirmed</h2>
            <p>Your dental appointment has been booked successfully.</p>
            <p className="email-note">
              Confirmation sent to <strong>{formData.email}</strong>
            </p>

            <div className="success-details-card">
              <div className="success-detail-row">
                <span className="detail-label">Dentist</span>
                <span className="detail-value">{dentist.name}</span>
              </div>
              <div className="success-detail-row">
                <span className="detail-label">Clinic</span>
                <span className="detail-value">{dentist.clinic_name}</span>
              </div>
              <div className="success-detail-row">
                <span className="detail-label">Date</span>
                <span className="detail-value">{formattedDate}</span>
              </div>
              <div className="success-detail-row">
                <span className="detail-label">Patient</span>
                <span className="detail-value">{formData.patient_name}</span>
              </div>
            </div>

            {success.email_preview && (
              <div>
                <a
                  href={success.email_preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="email-preview-link"
                >
                  📬 View email preview →
                </a>
              </div>
            )}

            <div className="success-actions">
              <Link to="/" className="btn btn-secondary">
                ← Back to Dentists
              </Link>
              <button
                className="btn btn-primary"
                style={{ width: 'auto' }}
                onClick={() => {
                  setSuccess(null);
                  setFormData({ patient_name: '', email: '', age: '', gender: '', appointment_date: '' });
                }}
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container form-page">
      <Link to="/" className="back-link">
        ← Back to dentists
      </Link>

      <div className="form-card">
        <div className="form-card-header">
          <h2>Book Appointment</h2>
          <p>Fill in your details to schedule a visit</p>
        </div>

        <div className="form-card-body">
          {globalError && (
            <div className="auth-error" style={{ marginBottom: '20px' }}>
              ⚠️ {globalError}
            </div>
          )}

          {dentist && (
            <div className="form-dentist-preview">
              <img src={dentist.photo} alt={dentist.name} />
              <div className="preview-info">
                <h4>{dentist.name}</h4>
                <p>{dentist.clinic_name} · {dentist.location}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="patient_name">Full Name</label>
              <input
                className={`form-input ${formErrors.patient_name ? 'is-invalid' : ''}`}
                type="text"
                id="patient_name"
                name="patient_name"
                placeholder="Enter your full name"
                value={formData.patient_name}
                onChange={handleChange}
              />
              {formErrors.patient_name && <div className="form-error-text">⚠️ {formErrors.patient_name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                className={`form-input ${formErrors.email ? 'is-invalid' : ''}`}
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email && <div className="form-error-text">⚠️ {formErrors.email}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="age">Age</label>
                <input
                  className={`form-input ${formErrors.age ? 'is-invalid' : ''}`}
                  type="number"
                  id="age"
                  name="age"
                  placeholder="e.g. 28"
                  value={formData.age}
                  onChange={handleChange}
                />
                {formErrors.age && <div className="form-error-text">⚠️ {formErrors.age}</div>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gender">Gender</label>
                <select
                  className={`form-select ${formErrors.gender ? 'is-invalid' : ''}`}
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.gender && <div className="form-error-text">⚠️ {formErrors.gender}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="appointment_date">Preferred Date</label>
              <input
                className={`form-input ${formErrors.appointment_date ? 'is-invalid' : ''}`}
                type="date"
                id="appointment_date"
                name="appointment_date"
                min={today}
                value={formData.appointment_date}
                onChange={handleChange}
              />
              {formErrors.appointment_date && <div className="form-error-text">⚠️ {formErrors.appointment_date}</div>}
            </div>
          </form>
        </div>

        <div className="form-footer">
          <button
            type="submit"
            className="btn btn-primary"
            id="submit-appointment"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Booking…' : 'Confirm Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;
