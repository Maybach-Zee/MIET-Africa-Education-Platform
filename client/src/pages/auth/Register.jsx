// Register.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import MapPicker from '../../components/MapPicker';

// ── Icons ──────────────────────────────────────────────────────────────────
const IconMail = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const IconSchool = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconMap = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10 10a3 3 0 1 0 4 4"/>
    <path d="M2 2l20 20"/>
    <path d="M6.7 6.7A10.6 10.6 0 0 0 2 12s3 7 10 7a10.7 10.7 0 0 0 5.3-1.4"/>
    <path d="M9.9 4.2A11.9 11.9 0 0 1 12 4c7 0 10 8 10 8a16.8 16.8 0 0 1-3.2 4.2"/>
  </svg>
);

// ── CSS ────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap');

*,
*::before,
*::after{
  box-sizing:border-box;
  margin:0;
  padding:0;
}

html,
body{
  overscroll-behavior:none;
  overflow-x:hidden;
  font-family:'DM Sans',sans-serif;
  background:#f5f7fb;
}

:root{
  --primary:#8884d8;
  --secondary:#82ca9d;
  --accent:#0088FE;
  --light:#ffffff;
  --bg:#f5f7fb;
  --dark:#1e293b;
  --muted:#64748b;
  --border:#dbe4f0;
  --danger:#dc2626;
  --r:16px;
}

.reg-shell{
  min-height:100vh;
  display:grid;
  grid-template-columns:420px 1fr;
}

.reg-left{
  position:relative;
  overflow:hidden;
  padding:4rem 3rem;
  display:flex;
  flex-direction:column;
  justify-content:space-between;

  background:linear-gradient(
    180deg,
    #8884d8 0%,
    #6f6ad9 45%,
    #82ca9d 100%
  );
}

.reg-left::before{
  content:'';
  position:absolute;
  width:420px;
  height:420px;
  border-radius:50%;
  background:rgba(255,255,255,.08);
  top:-160px;
  right:-120px;
}

.reg-left::after{
  content:'';
  position:absolute;
  width:320px;
  height:320px;
  border-radius:50%;
  background:rgba(255,255,255,.05);
  bottom:-120px;
  left:-120px;
}

.rl-content{
  position:relative;
  z-index:2;
}

.rl-logo{
  font-size:2rem;
  font-weight:700;
  color:white;
  margin-bottom:4rem;
}

.rl-sublogo{
  margin-top:.4rem;
  font-size:.9rem;
  opacity:.85;
}

.rl-title{
  font-size:3rem;
  line-height:1.1;
  font-weight:700;
  color:white;
  letter-spacing:-2px;
}

.rl-title span{
  color:#dff7e7;
}

.rl-body{
  margin-top:1.4rem;
  line-height:1.8;
  color:rgba(255,255,255,.92);
  font-size:.95rem;
}

.rl-steps{
  margin-top:3rem;
  display:flex;
  flex-direction:column;
  gap:1rem;
}

.rl-step{
  background:rgba(255,255,255,.1);
  border:1px solid rgba(255,255,255,.12);
  backdrop-filter:blur(10px);
  padding:1rem 1.1rem;
  border-radius:18px;
}

.rl-step h4{
  color:white;
  margin-bottom:.4rem;
}

.rl-step p{
  color:rgba(255,255,255,.8);
  font-size:.88rem;
  line-height:1.6;
}

.rl-footer{
  position:relative;
  z-index:2;
  color:rgba(255,255,255,.78);
  font-size:.82rem;
}

.reg-right{
  background:#f5f7fb;
  padding:4rem;
  display:flex;
  justify-content:center;
}

.reg-form-wrap{
  width:100%;
  max-width:720px;

  background:white;
  border-radius:30px;
  padding:2.7rem;

  box-shadow:0 10px 40px rgba(15,23,42,.08);
}

.rf-heading{
  font-size:2.5rem;
  color:var(--dark);
  font-weight:700;
  margin-bottom:.5rem;
}

.rf-sub{
  color:var(--muted);
  line-height:1.7;
  margin-bottom:2rem;
}

.rf-fields{
  display:flex;
  flex-direction:column;
  gap:1rem;
}

.rf-row{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:1rem;
}

.rf-field{
  display:flex;
  flex-direction:column;
  gap:.45rem;
}

.rf-label{
  font-size:.82rem;
  font-weight:600;
  color:var(--dark);
}

.rf-input-wrap{
  position:relative;
}

.rf-icon{
  position:absolute;
  left:1rem;
  top:50%;
  transform:translateY(-50%);
  color:var(--primary);
}

.rf-input{
  width:100%;
  height:54px;
  border-radius:16px;
  border:1.5px solid #dbe4f0;
  padding:0 1rem 0 3rem;
  font-size:.92rem;
  outline:none;
  transition:.2s ease;
  background:white;
}

.rf-input:focus{
  border-color:#8884d8;
  box-shadow:0 0 0 4px rgba(136,132,216,.15);
}

.rf-map{
  margin-top:1rem;
  border-radius:20px;
  overflow:hidden;
}

.rf-btn{
  margin-top:1rem;
  width:100%;
  height:58px;
  border:none;
  border-radius:18px;

  background:linear-gradient(
    135deg,
    #8884d8,
    #82ca9d
  );

  color:white;
  font-size:.95rem;
  font-weight:700;
  cursor:pointer;

  display:flex;
  align-items:center;
  justify-content:center;
  gap:.6rem;

  transition:.25s ease;
}

.rf-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 10px 24px rgba(136,132,216,.25);
}

.eye-btn{
  position:absolute;
  right:1rem;
  top:50%;
  transform:translateY(-50%);
  border:none;
  background:none;
  cursor:pointer;
  color:#8884d8;
  display:flex;
  align-items:center;
  justify-content:center;
}

.eye-btn:hover{
  color:#6f6ad9;
}

.rf-error{
  background:#fee2e2;
  color:#dc2626;
  padding:.9rem 1rem;
  border-radius:14px;
  margin-bottom:1rem;
  font-size:.88rem;
}

.rf-switch{
  margin-top:2rem;
  text-align:center;
  color:var(--muted);
}

.rf-switch button{
  background:none;
  border:none;
  color:var(--primary);
  font-weight:700;
  cursor:pointer;
}

@media(max-width:980px){

  .reg-shell{
    grid-template-columns:1fr;
  }

  .reg-left{
    display:none;
  }

  .reg-right{
    padding:1.5rem;
  }

  .reg-form-wrap{
    padding:2rem;
  }

  .rf-row{
    grid-template-columns:1fr;
  }
}
`;

// ── Component ──────────────────────────────────────────────────────────────
const Register = () => {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [locations, setLocations] = useState({ provinces: [] });
  const [citiesForProvince, setCitiesForProvince] = useState([]);

  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name:'',
    email:'',
    password:'',
    centre_name:'',
    province_id:'',
    city:'',
    gps_latitude:'',
    gps_longitude:'',
    enrolled_learners:''
  });

  useEffect(() => {
    api.get('/provinces')
      .then(res => setProvinces(res.data))
      .catch(() => {});

    api.get('/locations')
      .then(res => setLocations(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleProvinceChange = (e) => {

    const provinceId = e.target.value;
    const name =
      e.target.options[e.target.selectedIndex].text;

    setForm(prev => ({
      ...prev,
      province_id: provinceId,
      city: ''
    }));

    const province =
      locations.provinces.find(
        p => p.name === name
      );

    setCitiesForProvince(
      province ? province.cities : []
    );
  };

  const handleMapChange = ({ lat, lng }) => {
    setForm(prev => ({
      ...prev,
      gps_latitude: lat,
      gps_longitude: lng
    }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    try {

      await api.post('/auth/register', form);

      toast.success(
        'Registration submitted successfully!'
      );

      navigate('/login');

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    }
  };

  return (
    <>
      <style>{css}</style>

      <div className="reg-shell">

        {/* LEFT SIDE */}
        <div className="reg-left">

          <div className="rl-content">

            <div className="rl-logo">
              MIET Africa
              <div className="rl-sublogo">
                Education Transformation Platform
              </div>
            </div>

            <h1 className="rl-title">
              Join the
              <span> education network</span>
            </h1>

            <p className="rl-body">
              Register your school and gain access to
              literacy tools, digital resources,
              teacher development programmes, and
              real-time impact reporting.
            </p>

            <div className="rl-steps">

              <div className="rl-step">
                <h4>1. Submit School Details</h4>
                <p>
                  Complete your school profile and
                  location information.
                </p>
              </div>

              <div className="rl-step">
                <h4>2. Await Verification</h4>
                <p>
                  MIET Africa administrators review
                  and verify your application.
                </p>
              </div>

              <div className="rl-step">
                <h4>3. Access The Platform</h4>
                <p>
                  Start managing teachers, resources,
                  assessments, and programmes.
                </p>
              </div>

            </div>

          </div>

          <div className="rl-footer">
            © 2026 MIET Africa · POPIA Compliant
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="reg-right">

          <div className="reg-form-wrap">

            <h2 className="rf-heading">
              Register Your School
            </h2>

            <p className="rf-sub">
              Complete the registration form below to
              join the MIET Africa platform.
            </p>

            {error && (
              <div className="rf-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="rf-fields">

                <div className="rf-row">

                  <div className="rf-field">
                    <label className="rf-label">
                      Full Name
                    </label>

                    <div className="rf-input-wrap">
                      <span className="rf-icon">
                        <IconUser />
                      </span>

                      <input
                        className="rf-input"
                        name="full_name"
                        placeholder="Jane Dlamini"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="rf-field">
                    <label className="rf-label">
                      Email Address
                    </label>

                    <div className="rf-input-wrap">
                      <span className="rf-icon">
                        <IconMail />
                      </span>

                      <input
                        className="rf-input"
                        type="email"
                        name="email"
                        placeholder="you@school.org.za"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                </div>

                <div className="rf-row">

                <div className="rf-field">

<label className="rf-label">
  Password
</label>

<div className="rf-input-wrap">

  <span className="rf-icon">
    <IconLock />
  </span>

  <input
    className="rf-input"
    type={showPassword ? 'text' : 'password'}
    name="password"
    placeholder="Create password"
    value={form.password}
    onChange={handleChange}
    required
    style={{ paddingRight: '3rem' }}
  />

  <button
    type="button"
    className="eye-btn"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <IconEyeOff /> : <IconEye />}
  </button>

</div>

</div>

                  <div className="rf-field">
                    <label className="rf-label">
                      School Name
                    </label>

                    <div className="rf-input-wrap">
                      <span className="rf-icon">
                        <IconSchool />
                      </span>

                      <input
                        className="rf-input"
                        name="centre_name"
                        placeholder="School Name"
                        value={form.centre_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                </div>

                <div className="rf-row">

                  <div className="rf-field">
                    <label className="rf-label">
                      Province
                    </label>

                    <select
                      className="rf-input"
                      name="province_id"
                      value={form.province_id}
                      onChange={handleProvinceChange}
                      required
                    >
                      <option value="">
                        Select Province
                      </option>

                      {provinces.map((p) => (
                        <option
                          key={p.province_id}
                          value={p.province_id}
                        >
                          {p.province_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rf-field">
                    <label className="rf-label">
                      City
                    </label>

                    <select
                      className="rf-input"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select City
                      </option>

                      {citiesForProvince.map((c) => (
                        <option
                          key={c.name}
                          value={c.name}
                        >
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="rf-field">
                  <label className="rf-label">
                    Enrolled Learners
                  </label>

                  <input
                    className="rf-input"
                    type="number"
                    name="enrolled_learners"
                    placeholder="e.g 450"
                    value={form.enrolled_learners}
                    onChange={handleChange}
                  />
                </div>

                <div className="rf-field">

                  <label className="rf-label">
                    School Location
                  </label>

                  <div className="rf-map">
                    <MapPicker
                      lat={form.gps_latitude}
                      lng={form.gps_longitude}
                      onChange={handleMapChange}
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  className="rf-btn"
                >
                  Submit Registration
                  <IconArrow />
                </button>

              </div>

            </form>

            <div className="rf-switch">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default Register;