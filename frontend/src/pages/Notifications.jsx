import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, ListGroup, Button } from 'react-bootstrap';
import api from '../api/axios';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then((r) => setNotifications(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markRead = (id) => {
    api.put(`/notifications/${id}/read`).then(() => {
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    }).catch(() => {});
  };

  const markAllRead = () => {
    api.put('/notifications/read-all').then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }).catch(() => {});
  };

  if (loading) return <p className="text-muted">Loading...</p>;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline-primary" size="sm" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>
      <Card>
        <Card.Body className="p-0">
          {notifications.length === 0 ? (
            <p className="text-muted p-4 mb-0">No notifications yet.</p>
          ) : (
            <ListGroup variant="flush">
              {notifications.map((n) => (
                <ListGroup.Item
                  key={n._id}
                  className={n.read ? '' : 'bg-dark bg-opacity-25'}
                  as={Link}
                  to={n.complaint?._id ? `/complaint/${n.complaint._id}` : '#'}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  onClick={() => !n.read && markRead(n._id)}
                >
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{n.title}</strong>
                      <p className="mb-0 small text-muted">{n.message}</p>
                      {n.complaint && (
                        <span className="badge bg-secondary">{n.complaint.complaintId}</span>
                      )}
                    </div>
                    <small className="text-muted">{new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
