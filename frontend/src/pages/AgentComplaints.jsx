import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Badge, Button, Form } from 'react-bootstrap';
import api from '../api/axios';
import toast from 'react-hot-toast';

const statusClass = (s) => `badge-status-${s}`;
const STATUSES = ['submitted', 'assigned', 'in_progress', 'resolved', 'closed'];

export default function AgentComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchComplaints = () => {
        setLoading(true);
        api
            .get('/complaints/list?limit=100')
            .then((r) => setComplaints(r.data.complaints || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const updateStatus = async (complaintId, status) => {
        setUpdatingId(complaintId);
        try {
            await api.put(`/complaints/${complaintId}/status`, { status });
            toast.success('Status updated');
            fetchComplaints();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return <p className="text-muted py-4 text-center">Loading assigned complaints…</p>;

    return (
        <>
            <h1 className="mb-4 text-white">Assigned Complaints</h1>

            {complaints.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <p className="text-muted mb-0">No complaints assigned to you yet.</p>
                    </Card.Body>
                </Card>
            ) : (
                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <span>Assigned to you ({complaints.length})</span>
                    </Card.Header>
                    <Card.Body style={{ padding: 0 }}>
                        <Table responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>User</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Update Status</th>
                                    <th>Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((c) => (
                                    <tr key={c._id}>
                                        <td>
                                            <span
                                                style={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.78rem',
                                                    color: '#6366f1',
                                                    background: 'rgba(99,102,241,0.1)',
                                                    borderRadius: '4px',
                                                    padding: '2px 6px',
                                                }}
                                            >
                                                {c.complaintId}
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                maxWidth: '180px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {c.title}
                                        </td>
                                        <td className="text-muted small">{c.user?.fullName || '—'}</td>
                                        <td className="text-muted small">{c.category}</td>
                                        <td>
                                            <Badge
                                                bg={
                                                    { urgent: 'danger', high: 'warning', medium: 'info', low: 'secondary' }[
                                                    c.priority
                                                    ] || 'secondary'
                                                }
                                                style={{ fontSize: '0.7rem' }}
                                            >
                                                {c.priority}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge className={statusClass(c.status)}>{c.status}</Badge>
                                        </td>
                                        <td>
                                            {c.status !== 'closed' && (
                                                <Form.Select
                                                    size="sm"
                                                    style={{ width: 'auto', minWidth: '130px' }}
                                                    value={c.status}
                                                    disabled={updatingId === c._id}
                                                    onChange={(e) => updateStatus(c._id, e.target.value)}
                                                >
                                                    {STATUSES.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            )}
                                        </td>
                                        <td className="text-muted small">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <Button
                                                as={Link}
                                                to={`/complaint/${c._id}`}
                                                size="sm"
                                                variant="outline-primary"
                                            >
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}
        </>
    );
}
