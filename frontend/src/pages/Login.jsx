import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'user', label: 'User', icon: '👤', desc: 'Submit & track complaints' },
  { value: 'agent', label: 'Agent', icon: '🎧', desc: 'Handle assigned complaints' },
  { value: 'admin', label: 'Admin', icon: '🛡', desc: 'Full system access' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, role);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left panel — branding */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>⚡ ResolveNow</div>
          <h1 style={styles.heroTitle}>
            Complaints resolved,<br />
            <span style={styles.heroAccent}>faster than ever.</span>
          </h1>
          <p style={styles.heroSub}>
            A modern platform connecting users, agents, and admins for seamless complaint resolution.
          </p>
          <div style={styles.featureList}>
            {['Real-time chat & updates', 'Smart agent assignment', 'Analytics & reporting', 'Instant notifications'].map((f) => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureDot} />
                {f}
              </div>
            ))}
          </div>
        </div>
        {/* Decorative orbs */}
        <div style={{ ...styles.orb, width: 300, height: 300, top: '-80px', left: '-80px', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }} />
        <div style={{ ...styles.orb, width: 200, height: 200, bottom: '60px', right: '-40px', background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)' }} />
      </div>

      {/* Right panel — form */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={styles.formTitle}>Sign in</h2>
            <p style={styles.formSub}>Welcome back — choose your role to continue</p>
          </div>

          {/* Role selector */}
          <div style={styles.roleGrid}>
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                style={{
                  ...styles.roleBtn,
                  ...(role === r.value ? styles.roleBtnActive : {}),
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{r.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{r.label}</span>
                <span style={{ fontSize: '0.7rem', color: role === r.value ? '#a5b4fc' : '#64748b' }}>{r.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(255,255,255,0.07)', boxShadow: 'none' })}
              />
            </div>

            <div>
              <label style={styles.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: '2.8rem' }}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(255,255,255,0.07)', boxShadow: 'none' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={styles.eyeBtn}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={styles.spinner} /> Signing in...
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <p style={styles.signupText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.signupLink}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
  },
  left: {
    flex: 1,
    background: 'linear-gradient(145deg, #0c0f1e 0%, #111827 100%)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
  },
  leftInner: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '420px',
  },
  logo: {
    fontSize: '1.1rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '2.5rem',
    letterSpacing: '-0.02em',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 4vw, 2.8rem)',
    fontWeight: 800,
    color: '#f1f5f9',
    lineHeight: 1.2,
    letterSpacing: '-0.04em',
    marginBottom: '1rem',
  },
  heroAccent: {
    background: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    color: '#64748b',
    fontSize: '1rem',
    lineHeight: 1.7,
    marginBottom: '2rem',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  featureDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    flexShrink: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#080b12',
  },
  formCard: {
    width: '100%',
    maxWidth: '420px',
  },
  formTitle: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#f1f5f9',
    letterSpacing: '-0.04em',
    marginBottom: '0.4rem',
  },
  formSub: {
    color: '#64748b',
    fontSize: '0.9rem',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.6rem',
    marginBottom: '1.5rem',
  },
  roleBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '0.75rem 0.5rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    cursor: 'pointer',
    color: '#94a3b8',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  roleBtnActive: {
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.4)',
    color: '#c7d2fe',
    boxShadow: '0 0 20px rgba(99,102,241,0.15)',
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '0.4rem',
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.9rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  inputFocus: {
    borderColor: '#6366f1',
    boxShadow: '0 0 0 3px rgba(99,102,241,0.2)',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0',
    lineHeight: 1,
  },
  submitBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
    fontFamily: 'inherit',
    marginTop: '0.5rem',
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  signupText: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#64748b',
    fontSize: '0.875rem',
  },
  signupLink: {
    color: '#818cf8',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
