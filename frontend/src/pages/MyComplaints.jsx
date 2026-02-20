import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import api from '../api/axios';

const statusClass = (s) => `badge-status-${s}`;

export default function MyComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get('/complaints/my')
            .then((r) => setComplaints(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-muted py-4 text-center">Loading your complaints…</p>;

    return (
        <>
            <h1 className="mb-4 text-white">My Complaints</h1>

            {complaints.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <p className="text-muted mb-3">You haven't submitted any complaints yet.</p>
                        <Button as={Link} to="/submit" variant="primary">
                            Register a Complaint
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <span>Your complaints ({complaints.length})</span>
                        <Button as={Link} to="/submit" size="sm" variant="primary">
                            + New Complaint
                        </Button>
                    </Card.Header>
                    <Card.Body style={{ padding: 0 }}>
                        <Table responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>Submitted</th>
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
                                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {c.title}
                                        </td>
                                        <td className="text-muted small">{c.category}</td>
                                        <td>
                                            <Badge
                                                bg={
                                                    { urgent: 'danger', high: 'warning', medium: 'info', low: 'secondary' }[c.priority] ||
                                                    'secondary'
                                                }
                                                style={{ fontSize: '0.7rem' }}
                                            >
                                                {c.priority}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge className={statusClass(c.status)}>{c.status}</Badge>
                                        </td>
                                        <td className="text-muted small">{c.assignedTo?.fullName || '—'}</td>
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
