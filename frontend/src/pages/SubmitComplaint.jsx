import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Badge } from 'react-bootstrap';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['product', 'service', 'billing', 'delivery', 'technical', 'other'];
const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  { value: 'medium', label: 'Medium', color: '#22d3ee', bg: 'rgba(6,182,212,0.12)' },
  { value: 'high', label: 'High', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)' },
  { value: 'urgent', label: 'Urgent', color: '#f87171', bg: 'rgba(239,68,68,0.12)' },
];

const CAT_ICONS = { product: '📦', service: '🛠', billing: '💳', delivery: '🚚', technical: '💻', other: '📋' };

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'other', priority: 'medium',
    address: '', contactPhone: '', purchaseDate: '',
  });
  const [files, setFiles] = useState([]);
  const [step, setStep] = useState(1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      files.forEach((f) => fd.append('attachments', f));
      const res = await api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Complaint submitted successfully!');
      navigate(`/complaint/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.9rem',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', color: '#f1f5f9', fontSize: '0.9rem',
    outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem',
  };

  const handleFocus = (e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)'; };
  const handleBlur = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; };

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
          Submit a Complaint
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Fill in the details below and we'll assign an agent to resolve your issue.
        </p>
      </div>

      <Row>
        <Col lg={8}>
          <form onSubmit={handleSubmit}>
            {/* Card 1 — Basic Info */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <span style={stepBadge}>1</span> Basic Information
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={labelStyle}>Title <span style={{ color: '#f87171' }}>*</span></label>
                  <input
                    name="title" value={form.title} onChange={handleChange}
                    placeholder="Brief title of the issue"
                    required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Description <span style={{ color: '#f87171' }}>*</span></label>
                  <textarea
                    name="description" value={form.description} onChange={handleChange}
                    placeholder="Describe the issue in detail — what happened, when, and what you expected..."
                    required rows={5}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={handleFocus} onBlur={handleBlur}
                  />
                </div>
              </div>
            </div>

            {/* Card 2 — Category & Priority */}
            <div style={{ ...cardStyle, marginTop: '1rem' }}>
              <div style={cardHeaderStyle}>
                <span style={stepBadge}>2</span> Category & Priority
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Category pills */}
                <div>
                  <label style={labelStyle}>Category</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c} type="button"
                        onClick={() => setForm({ ...form, category: c })}
                        style={{
                          padding: '0.4rem 0.9rem',
                          borderRadius: '99px',
                          border: form.category === c ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          background: form.category === c ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                          color: form.category === c ? '#818cf8' : '#64748b',
                          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.2s', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', gap: '5px',
                        }}
                      >
                        <span>{CAT_ICONS[c]}</span> {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority pills */}
                <div>
                  <label style={labelStyle}>Priority</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.value} type="button"
                        onClick={() => setForm({ ...form, priority: p.value })}
                        style={{
                          padding: '0.4rem 1rem',
                          borderRadius: '99px',
                          border: form.priority === p.value ? `1px solid ${p.color}55` : '1px solid rgba(255,255,255,0.08)',
                          background: form.priority === p.value ? p.bg : 'rgba(255,255,255,0.04)',
                          color: form.priority === p.value ? p.color : '#64748b',
                          fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.2s', fontFamily: 'inherit',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 — Contact Details */}
            <div style={{ ...cardStyle, marginTop: '1rem' }}>
              <div style={cardHeaderStyle}>
                <span style={stepBadge}>3</span> Contact Details <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.8rem' }}>(optional)</span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <Row>
                  <Col md={6} className="mb-3">
                    <label style={labelStyle}>Address</label>
                    <input
                      name="address" value={form.address} onChange={handleChange}
                      placeholder="Your address"
                      style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <label style={labelStyle}>Phone number</label>
                    <input
                      name="contactPhone" value={form.contactPhone} onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                    />
                  </Col>
                  <Col md={6}>
                    <label style={labelStyle}>Purchase date</label>
                    <input
                      type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange}
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                      onFocus={handleFocus} onBlur={handleBlur}
                    />
                  </Col>
                </Row>
              </div>
            </div>

            {/* Card 4 — Attachments */}
            <div style={{ ...cardStyle, marginTop: '1rem' }}>
              <div style={cardHeaderStyle}>
                <span style={stepBadge}>4</span> Attachments <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.8rem' }}>(optional)</span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <label
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', padding: '2rem',
                    border: '2px dashed rgba(99,102,241,0.25)', borderRadius: '12px',
                    background: 'rgba(99,102,241,0.04)', cursor: 'pointer',
                    transition: 'all 0.2s', color: '#64748b',
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>📎</span>
                  <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>
                    {files.length > 0 ? `${files.length} file(s) selected` : 'Click to upload files'}
                  </span>
                  <span style={{ fontSize: '0.78rem' }}>Images, PDF, DOC — up to 5 files</span>
                  <input
                    type="file" multiple accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    style={{ display: 'none' }}
                  />
                </label>
                {files.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {files.map((f, i) => (
                      <span key={i} style={{
                        padding: '0.3rem 0.7rem', borderRadius: '99px', fontSize: '0.78rem',
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                        color: '#818cf8', fontWeight: 500,
                      }}>
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                type="submit" disabled={loading}
                style={{
                  padding: '0.8rem 2rem',
                  background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Submitting...' : '🚀 Submit Complaint'}
              </button>
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                We'll assign an agent within 24 hours
              </span>
            </div>
          </form>
        </Col>

        {/* Sidebar tips */}
        <Col lg={4}>
          <div style={{ ...cardStyle, position: 'sticky', top: '80px' }}>
            <div style={cardHeaderStyle}>💡 Tips for faster resolution</div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: '📝', tip: 'Be specific', desc: 'Include dates, order numbers, and exact error messages.' },
                { icon: '📸', tip: 'Add screenshots', desc: 'Visual evidence helps agents resolve issues faster.' },
                { icon: '📞', tip: 'Add contact info', desc: 'Agents may need to reach you directly.' },
                { icon: '⚡', tip: 'Set correct priority', desc: 'Urgent issues get assigned first.' },
              ].map((t) => (
                <div key={t.tip} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '2px' }}>{t.tip}</div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5 }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
}

const cardStyle = {
  background: 'rgba(18, 22, 34, 0.85)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  backdropFilter: 'blur(12px)',
  overflow: 'hidden',
};

const cardHeaderStyle = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  fontWeight: 700,
  fontSize: '0.9rem',
  color: '#e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  background: 'rgba(255,255,255,0.02)',
};

const stepBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '22px',
  borderRadius: '6px',
  background: 'rgba(99,102,241,0.2)',
  border: '1px solid rgba(99,102,241,0.35)',
  color: '#818cf8',
  fontSize: '0.7rem',
  fontWeight: 800,
};
