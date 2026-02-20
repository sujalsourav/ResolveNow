import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Form, Row, Col, ListGroup } from 'react-bootstrap';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';

const statusClass = (s) => `badge-status-${s}`;
const STATUSES = ['submitted', 'assigned', 'in_progress', 'resolved', 'closed'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const { socket, connected } = useSocket(token);

  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [suggestionText, setSuggestionText] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setResolutionText(complaint?.resolution || '');
  }, [complaint?.resolution]);

  const isAgentOrAdmin = user?.role === 'agent' || user?.role === 'admin';
  const canUpdateStatus = isAgentOrAdmin && complaint?.assignedTo?._id === user?._id || user?.role === 'admin';

  useEffect(() => {
    api.get(`/complaints/${id}`).then((r) => {
      setComplaint(r.data);
      setSuggestions(r.data.suggestions || []);
    }).catch(() => navigate('/')).finally(() => setLoading(false));
    api.get(`/messages/${id}`).then((r) => setMessages(r.data)).catch(() => { });
  }, [id, navigate]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_complaint', id);
    return () => socket.emit('leave_complaint', id);
  }, [socket, id]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on('message', onMessage);
    return () => socket.off('message', onMessage);
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      if (socket && connected) {
        socket.emit('send_message', { complaintId: id, text: newMessage.trim() });
        setNewMessage('');
      } else {
        const res = await api.post(`/messages/${id}`, { text: newMessage.trim() });
        setMessages((prev) => [...prev, res.data]);
        setNewMessage('');
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status, resolution) => {
    try {
      const res = await api.put(`/complaints/${id}/status`, { status, resolution });
      setComplaint(res.data);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await api.post(`/complaints/${id}/feedback`, { rating: feedbackRating, comment: feedbackComment });
      setComplaint((c) => ({ ...c, feedback: { rating: feedbackRating, comment: feedbackComment, submittedAt: new Date() } }));
      toast.success('Thank you for your feedback');
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const submitSuggestion = async (e) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    setSubmittingSuggestion(true);
    try {
      const res = await api.post(`/complaints/${id}/suggestion`, { text: suggestionText });
      setSuggestions((prev) => [...prev, res.data.suggestion]);
      setSuggestionText('');
      toast.success('Suggestion sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send suggestion');
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  if (loading || !complaint) return <p className="text-muted">Loading...</p>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">{complaint.complaintId} – {complaint.title}</h1>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Row>
        <Col lg={6}>
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="text-white">Details</span>
              <Badge className={statusClass(complaint.status)}>{complaint.status}</Badge>
            </Card.Header>
            <Card.Body>
              <p className="text-white"><strong>Category:</strong> {complaint.category} &nbsp; <strong>Priority:</strong> {complaint.priority}</p>
              <p className="text-white">{complaint.description}</p>
              {complaint.address && <p className="text-white"><strong>Address:</strong> {complaint.address}</p>}
              {complaint.contactPhone && <p className="text-white"><strong>Phone:</strong> {complaint.contactPhone}</p>}
              {complaint.assignedTo && <p className="text-white"><strong>Assigned to:</strong> {complaint.assignedTo.fullName}</p>}
              {complaint.resolution && <p className="text-white"><strong>Resolution:</strong> {complaint.resolution}</p>}
              {complaint.attachments?.length > 0 && (
                <p>
                  <strong className="text-white">Attachments:</strong>{' '}
                  {complaint.attachments.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noreferrer" className="me-2">{a.name}</a>
                  ))}
                </p>
              )}
            </Card.Body>
          </Card>

          {canUpdateStatus && (
            <Card className="mb-3">
              <Card.Header>Update status</Card.Header>
              <Card.Body>
                <Form.Group className="mb-2">
                  <Form.Select
                    value={complaint.status}
                    onChange={(e) => updateStatus(e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Resolution note (optional)"
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    onBlur={() => {
                      if (resolutionText !== (complaint.resolution || '')) updateStatus(complaint.status, resolutionText);
                    }}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          )}

          {(complaint.status === 'resolved' || complaint.status === 'closed') && complaint.user?._id === user?._id && !complaint.feedback?.submittedAt && (
            <Card className="mb-3">
              <Card.Header>Submit feedback</Card.Header>
              <Card.Body>
                <Form onSubmit={submitFeedback}>
                  <Form.Group className="mb-2">
                    <Form.Label>Rating (1–5)</Form.Label>
                    <Form.Select value={feedbackRating} onChange={(e) => setFeedbackRating(Number(e.target.value))}>
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n === 0 ? 'Select' : n}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Comment (optional)"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" size="sm" disabled={submittingFeedback}>Submit feedback</Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* Suggestion Box — visible to user (owner), agent (assigned), and admin */}
          {(complaint.user?._id === user?._id || isAgentOrAdmin) && (
            <Card className="mb-3">
              <Card.Header>
                💡 Suggestion Box
                <small className="text-muted ms-2">
                  {user?.role === 'user' ? '(sent to your assigned agent & admin)' : '(sent to admin only)'}
                </small>
              </Card.Header>
              <Card.Body>
                {/* Previous suggestions */}
                {suggestions.length > 0 && (
                  <div className="mb-3">
                    {suggestions.map((s, i) => (
                      <div key={i} className="mb-2 p-2 rounded" style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #0d6efd' }}>
                        <small className="text-muted">
                          <strong>{s.fromRole?.toUpperCase()}</strong> · {new Date(s.createdAt).toLocaleString()}
                        </small>
                        <p className="mb-0 mt-1 text-white">{s.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <Form onSubmit={submitSuggestion}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Write your suggestion here..."
                      value={suggestionText}
                      onChange={(e) => setSuggestionText(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="outline-info" size="sm" disabled={submittingSuggestion}>
                    {submittingSuggestion ? 'Sending...' : 'Send Suggestion'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center text-white">
              <span className="text-white">Chat {!connected && '(using HTTP fallback)'}</span>
            </Card.Header>
            <Card.Body className="p-0 text-white">
              <ListGroup variant="flush" style={{ maxHeight: 400, overflowY: 'auto' }}>
                {messages.map((m) => (
                  <ListGroup.Item key={m._id} className={`chat-message ${m.sender?._id === user?._id ? 'own' : 'other'} mb-2 mx-2`}>
                    <small className="d-block text-white">{m.sender?.fullName}</small>
                    <span className="text-white">{m.text}</span>
                  </ListGroup.Item>
                ))}
                <div ref={messagesEndRef} />
              </ListGroup>
              <Form onSubmit={sendMessage} className="p-2 border-top text-white">
                <Form.Group className="d-flex gap-2 text-white">
                  <Form.Control
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
                  />
                  <Button type="submit" variant="primary" disabled={sending}>Send</Button>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
