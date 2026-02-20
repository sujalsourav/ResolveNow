import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Table, Badge, Form, Button, Modal, Tab, Tabs, ProgressBar, InputGroup } from 'react-bootstrap';
import api from '../api/axios';
import toast from 'react-hot-toast';

const statusClass = (s) => `badge-status-${s}`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({ status: '', page: 1 });
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ fullName: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(null);

  // Complaint Box state
  const [allComplaints, setAllComplaints] = useState([]);
  const [boxLoading, setBoxLoading] = useState(false);
  const [boxSearch, setBoxSearch] = useState('');
  const [boxStatusFilter, setBoxStatusFilter] = useState('');
  const [expandedComplaint, setExpandedComplaint] = useState(null);

  useEffect(() => {
    api.get('/users/stats').then((r) => setStats(r.data)).catch(() => { });
    api.get('/users/agents').then((r) => setAgents(r.data)).catch(() => { });
    api.get('/users/all').then((r) => setUsers(r.data)).catch(() => { });
    api.get('/analytics').then((r) => setAnalytics(r.data)).catch(() => { });
    // Load complaint box (all complaints)
    setBoxLoading(true);
    api.get('/complaints/list?limit=500').then((r) => setAllComplaints(r.data.complaints || [])).catch(() => { }).finally(() => setBoxLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    params.set('page', filter.page);
    params.set('limit', '10');
    api.get(`/complaints/list?${params}`).then((r) => setComplaints(r.data.complaints || [])).catch(() => { });
  }, [filter]);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/users/agents', newAgent);
      toast.success('Agent created');
      setNewAgent({ fullName: '', email: '', password: '' });
      setShowAgentModal(false);
      api.get('/users/agents').then((r) => setAgents(r.data)).catch(() => { });
      api.get('/users/stats').then((r) => setStats(r.data)).catch(() => { });
      api.get('/users/all').then((r) => setUsers(r.data)).catch(() => { });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create agent');
    } finally {
      setCreating(false);
    }
  };

  const assignToAgent = async (complaintId, agentId) => {
    setAssigning(complaintId);
    try {
      await api.put(`/complaints/${complaintId}/assign`, { agentId });
      toast.success('Complaint assigned');
      setFilter((f) => ({ ...f }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assign failed');
    } finally {
      setAssigning(null);
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return '0h';
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

  const priorityColor = (p) => ({ urgent: 'danger', high: 'warning', medium: 'info', low: 'secondary' }[p] || 'secondary');

  const filteredBoxComplaints = allComplaints.filter((c) => {
    const matchStatus = !boxStatusFilter || c.status === boxStatusFilter;
    const q = boxSearch.toLowerCase();
    const matchSearch = !q ||
      c.title?.toLowerCase().includes(q) ||
      c.complaintId?.toLowerCase().includes(q) ||
      c.user?.fullName?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <>
      <h1 className="mb-4 text-white">Admin Dashboard</h1>

      <Tabs defaultActiveKey="analytics" className="mb-3">
        <Tab eventKey="analytics" title="Analytics & Reporting">
          {analytics && (
            <>
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="stat-card-primary slide-up" style={{ animationDelay: '0ms' }}>
                    <Card.Body>
                      <Card.Title className="small text-muted">Total Complaints</Card.Title>
                      <h3 style={{ background: 'linear-gradient(135deg, #818cf8, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{analytics.totalComplaints}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="stat-card-success slide-up" style={{ animationDelay: '60ms' }}>
                    <Card.Body>
                      <Card.Title className="small text-muted">Resolved Ratio</Card.Title>
                      <h3 style={{ color: '#34d399' }}>{analytics.resolvedPercentage.toFixed(1)}%</h3>
                      <ProgressBar now={analytics.resolvedPercentage} variant="success" style={{ height: '5px' }} />
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="stat-card-warning slide-up" style={{ animationDelay: '120ms' }}>
                    <Card.Body>
                      <Card.Title className="small text-muted">Pending Ratio</Card.Title>
                      <h3 style={{ color: '#fbbf24' }}>{analytics.pendingPercentage.toFixed(1)}%</h3>
                      <ProgressBar now={analytics.pendingPercentage} variant="warning" style={{ height: '5px' }} />
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="stat-card-info slide-up" style={{ animationDelay: '180ms' }}>
                    <Card.Body>
                      <Card.Title className="small text-muted">Avg Resolution Time</Card.Title>
                      <h3 style={{ color: '#22d3ee' }}>{formatDuration(analytics.avgResolutionTime)}</h3>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>Agent Performance</Card.Header>
                    <Card.Body>
                      <Table responsive size="sm">
                        <thead>
                          <tr>
                            <th className='text-blue-500'>Agent</th>
                            <th>Assigned</th>
                            <th>Resolved</th>
                            <th>Avg Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.agentPerformance.map((a, idx) => (
                            <tr key={idx}>
                              <td className='text-red-500'>{a.agentName}</td>
                              <td>{a.totalAssigned}</td>
                              <td>{a.resolvedCount}</td>
                              <td>{formatDuration(a.avgResolutionTime)}</td>
                            </tr>
                          ))}
                          {analytics.agentPerformance.length === 0 && (
                            <tr><td colSpan="4" className="text-center text-white">No data</td></tr>
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>Monthly Trends (Last 6 Months)</Card.Header>
                    <Card.Body>
                      <div className="d-flex align-items-end justify-content-between h-100 pb-2">
                        {analytics.monthlyTrends.map((t, idx) => (
                          <div key={idx} className="text-center" style={{ width: '15%' }}>
                            <div className="bg-primary mx-auto mb-2" style={{ height: `${Math.min(t.count * 10, 150)}px`, width: '20px', borderRadius: '4px' }} title={`Complaints: ${t.count}`}></div>
                            <div className="small text-muted">{t._id.month}/{t._id.year}</div>
                          </div>
                        ))}
                        {analytics.monthlyTrends.length === 0 && (
                          <div className="w-100 text-center text-muted align-self-center">No trend data available</div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Tab>

        <Tab eventKey="complaints" title="Complaints Management">
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>All complaints</span>
              <div className="d-flex gap-2 align-items-center">
                <Form.Select
                  style={{ width: 'auto' }}
                  value={filter.status}
                  onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value, page: 1 }))}
                >
                  <option value="">All statuses</option>
                  <option value="submitted">submitted</option>
                  <option value="assigned">assigned</option>
                  <option value="in_progress">in_progress</option>
                  <option value="resolved">resolved</option>
                  <option value="closed">closed</option>
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Assigned to</th>
                    <th>Assign</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c._id}>
                      <td>{c.complaintId}</td>
                      <td>{c.title}</td>
                      <td>{c.user?.fullName}</td>
                      <td><Badge className={statusClass(c.status)}>{c.status}</Badge></td>
                      <td>{c.assignedTo?.fullName || '—'}</td>
                      <td>
                        {c.status !== 'closed' && (
                          <Form.Select
                            size="sm"
                            style={{ width: 'auto' }}
                            disabled={assigning === c._id}
                            value={c.assignedTo?._id || ''}
                            onChange={(e) => {
                              const agentId = e.target.value;
                              if (agentId) assignToAgent(c._id, agentId);
                            }}
                          >
                            <option value="">{c.assignedTo ? 'Change agent' : 'Select agent'}</option>
                            {agents.map((a) => (
                              <option key={a._id} value={a._id}>{a.fullName}</option>
                            ))}
                          </Form.Select>
                        )}
                      </td>
                      <td>
                        <Button as={Link} to={`/complaint/${c._id}`} size="sm" variant="outline-primary">View</Button>
                      </td>
                    </tr>
                  ))}
                  {complaints.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">No complaints found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="users" title="User Management">
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>All Users & Agents</span>
              <Button variant="outline-primary" size="sm" onClick={() => setShowAgentModal(true)}>Add Agent</Button>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>
                        <Badge bg={u.role === 'admin' ? 'danger' : u.role === 'agent' ? 'info' : 'secondary'}>
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        {u.role === 'agent' ? (
                          u.isApproved ? <Badge bg="success">Approved</Badge> : <Badge bg="warning">Pending</Badge>
                        ) : '—'}
                      </td>
                      <td>
                        {u.isVerified ? <Badge bg="success">Yes</Badge> : <Badge bg="secondary">No</Badge>}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No users found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* ─── Complaint Box ─── */}
        <Tab eventKey="complaintBox" title="📥 Complaint Box">
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span style={{ fontWeight: 600 }}>All Complaints — Users &amp; Agents</span>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <InputGroup size="sm" style={{ width: '220px' }}>
                  <InputGroup.Text style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(99,102,241,0.3)', color: '#94a3b8' }}>🔍</InputGroup.Text>
                  <Form.Control
                    placeholder="Search by title, ID, user…"
                    value={boxSearch}
                    onChange={(e) => setBoxSearch(e.target.value)}
                    style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}
                  />
                </InputGroup>
                <Form.Select
                  size="sm"
                  style={{ width: 'auto' }}
                  value={boxStatusFilter}
                  onChange={(e) => setBoxStatusFilter(e.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Form.Select>
                <Badge bg="secondary" style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
                  {filteredBoxComplaints.length} complaint{filteredBoxComplaints.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body style={{ padding: 0 }}>
              {boxLoading ? (
                <div className="text-center py-5 text-muted">Loading complaints…</div>
              ) : filteredBoxComplaints.length === 0 ? (
                <div className="text-center py-5 text-muted">No complaints found.</div>
              ) : (
                <div style={{ maxHeight: '620px', overflowY: 'auto' }}>
                  {filteredBoxComplaints.map((c) => (
                    <div
                      key={c._id}
                      style={{
                        borderBottom: '1px solid rgba(99,102,241,0.12)',
                        padding: '14px 20px',
                        transition: 'background 0.2s',
                        cursor: 'pointer',
                        background: expandedComplaint === c._id ? 'rgba(99,102,241,0.07)' : 'transparent',
                      }}
                      onMouseEnter={(e) => { if (expandedComplaint !== c._id) e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                      onMouseLeave={(e) => { if (expandedComplaint !== c._id) e.currentTarget.style.background = 'transparent'; }}
                      onClick={() => setExpandedComplaint(expandedComplaint === c._id ? null : c._id)}
                    >
                      {/* Header row */}
                      <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6366f1', background: 'rgba(99,102,241,0.1)', borderRadius: '4px', padding: '2px 6px' }}>{c.complaintId}</span>
                          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{c.title}</span>
                          <Badge className={`badge-status-${c.status}`}>{c.status}</Badge>
                          <Badge bg={priorityColor(c.priority)} style={{ fontSize: '0.7rem' }}>{c.priority}</Badge>
                          {c.category && <Badge bg="dark" style={{ fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.1)' }}>{c.category}</Badge>}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            as={Link}
                            to={`/complaint/${c._id}`}
                            size="sm"
                            variant="outline-primary"
                            style={{ fontSize: '0.75rem', padding: '2px 10px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </Button>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                            {expandedComplaint === c._id ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="d-flex align-items-center gap-3 mt-1 flex-wrap" style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        <span>👤 <strong style={{ color: '#cbd5e1' }}>{c.user?.fullName || 'Unknown'}</strong></span>
                        {c.assignedTo && <span>🔧 Agent: <strong style={{ color: '#cbd5e1' }}>{c.assignedTo.fullName}</strong></span>}
                        <span>📅 {new Date(c.createdAt).toLocaleDateString()}</span>
                        {c.suggestions?.length > 0 && (
                          <span style={{ color: '#818cf8' }}>💬 {c.suggestions.length} note{c.suggestions.length !== 1 ? 's' : ''}</span>
                        )}
                        {c.feedback?.rating && (
                          <span style={{ color: '#fbbf24' }}>{'★'.repeat(c.feedback.rating)}{'☆'.repeat(5 - c.feedback.rating)}</span>
                        )}
                      </div>

                      {/* Expanded details */}
                      {expandedComplaint === c._id && (
                        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed rgba(99,102,241,0.2)' }}>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '10px' }}>
                            <strong style={{ color: '#cbd5e1' }}>Description:</strong> {c.description}
                          </p>
                          {c.resolution && (
                            <p style={{ color: '#34d399', fontSize: '0.85rem', marginBottom: '10px' }}>
                              <strong>Resolution:</strong> {c.resolution}
                            </p>
                          )}

                          {/* Internal Notes/Suggestions */}
                          {c.suggestions?.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Internal Notes</div>
                              {c.suggestions.map((s, i) => (
                                <div key={i} style={{
                                  background: 'rgba(99,102,241,0.08)',
                                  border: '1px solid rgba(99,102,241,0.15)',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  marginBottom: '6px',
                                  fontSize: '0.82rem',
                                }}>
                                  <div className="d-flex justify-content-between">
                                    <span style={{ color: '#818cf8', fontWeight: 600 }}>
                                      {s.fromRole ? s.fromRole.toUpperCase() : 'UNKNOWN'}{s.from?.fullName ? ` — ${s.from.fullName}` : ''}
                                    </span>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{new Date(s.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div style={{ color: '#cbd5e1', marginTop: '4px' }}>{s.text}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Feedback */}
                          {c.feedback?.rating && (
                            <div style={{ marginTop: '10px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.82rem' }}>
                              <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '4px' }}>User Feedback</div>
                              <div style={{ color: '#fbbf24' }}>{'★'.repeat(c.feedback.rating)}{'☆'.repeat(5 - c.feedback.rating)} ({c.feedback.rating}/5)</div>
                              {c.feedback.comment && <div style={{ color: '#e2e8f0', marginTop: '4px' }}>{c.feedback.comment}</div>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

      </Tabs>

      <Modal show={showAgentModal} onHide={() => setShowAgentModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add agent</Modal.Title></Modal.Header>
        <Form onSubmit={handleCreateAgent}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Full name</Form.Label>
              <Form.Control
                value={newAgent.fullName}
                onChange={(e) => setNewAgent((a) => ({ ...a, fullName: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newAgent.email}
                onChange={(e) => setNewAgent((a) => ({ ...a, email: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={newAgent.password}
                onChange={(e) => setNewAgent((a) => ({ ...a, password: e.target.value }))}
                minLength={6}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAgentModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={creating}>{creating ? 'Creating...' : 'Create agent'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
