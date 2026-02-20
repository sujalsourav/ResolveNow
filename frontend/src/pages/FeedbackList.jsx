import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Badge, Button, Row, Col } from 'react-bootstrap';
import api from '../api/axios';

const statusClass = (s) => `badge-status-${s}`;

const StarRating = ({ rating }) => {
    return (
        <span>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    style={{ color: star <= rating ? '#ffc107' : '#6c757d', fontSize: '1.1rem' }}
                >
                    ★
                </span>
            ))}
        </span>
    );
};

export default function FeedbackList() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, avgRating: 0, ratingCounts: {} });

    useEffect(() => {
        api
            .get('/complaints/list?limit=200')
            .then((r) => {
                const all = r.data.complaints || [];
                // Only complaints that have feedback
                const withFeedback = all.filter((c) => c.feedback?.rating);
                setComplaints(withFeedback);

                // Compute stats
                if (withFeedback.length > 0) {
                    const total = withFeedback.length;
                    const avgRating =
                        withFeedback.reduce((sum, c) => sum + (c.feedback?.rating || 0), 0) / total;
                    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                    withFeedback.forEach((c) => {
                        const r = c.feedback?.rating;
                        if (r) ratingCounts[r] = (ratingCounts[r] || 0) + 1;
                    });
                    setStats({ total, avgRating, ratingCounts });
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-white">Loading...</p>;

    return (
        <>
            <h1 className="mb-4 text-white">User Feedback & Suggestions</h1>

            {/* Summary Cards */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="small text-muted">Total Feedback</Card.Title>
                            <h3>{stats.total}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="small text-muted">Average Rating</Card.Title>
                            <h3>{stats.avgRating ? stats.avgRating.toFixed(1) : '—'} / 5</h3>
                            {stats.avgRating > 0 && <StarRating rating={Math.round(stats.avgRating)} />}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="small text-muted">Rating Breakdown</Card.Title>
                            <div className="small">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star} className="d-flex align-items-center gap-2 mb-1">
                                        <span style={{ width: '20px' }}>{star}★</span>
                                        <div
                                            className="bg-warning"
                                            style={{
                                                height: '8px',
                                                width: `${stats.total ? ((stats.ratingCounts[star] || 0) / stats.total) * 100 : 0}%`,
                                                minWidth: '4px',
                                                borderRadius: '4px',
                                                transition: 'width 0.3s',
                                            }}
                                        />
                                        <span className="text-muted">{stats.ratingCounts[star] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Feedback Table */}
            <Card>
                <Card.Header>All Feedback & Suggestions</Card.Header>
                <Card.Body>
                    {complaints.length === 0 ? (
                        <p className="text-muted mb-0">No feedback submitted yet.</p>
                    ) : (
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Complaint ID</th>
                                    <th>Title</th>
                                    <th>User</th>
                                    <th>Agent</th>
                                    <th>Rating</th>
                                    <th>Comment / Suggestion</th>
                                    <th>Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((c) => (
                                    <tr key={c._id}>
                                        <td>
                                            <span className="text-muted small">{c.complaintId}</span>
                                        </td>
                                        <td>{c.title}</td>
                                        <td>{c.user?.fullName || '—'}</td>
                                        <td>{c.assignedTo?.fullName || '—'}</td>
                                        <td>
                                            <StarRating rating={c.feedback?.rating || 0} />
                                        </td>
                                        <td>
                                            {c.feedback?.comment ? (
                                                <span className="text-light">{c.feedback.comment}</span>
                                            ) : (
                                                <span className="text-muted fst-italic">No comment</span>
                                            )}
                                        </td>
                                        <td className="text-muted small">
                                            {c.feedback?.submittedAt
                                                ? new Date(c.feedback.submittedAt).toLocaleDateString()
                                                : '—'}
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
                    )}
                </Card.Body>
            </Card>
        </>
    );
}
