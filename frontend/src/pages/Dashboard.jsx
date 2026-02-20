import { Link } from 'react-router-dom';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <h1 className="mb-4">Welcome, {user?.fullName}</h1>
      <Row>
        {user?.role !== 'admin' && (
          <Col md={6} lg={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title className="text-white">Register a complaint</Card.Title>
                <Card.Text className="text-white">
                  Report an issue with a product or service. Add details and attachments.
                </Card.Text>
                <Button as={Link} to="/submit" variant="primary">Register Complaint</Button>
              </Card.Body>
            </Card>
          </Col>
        )}
        {user?.role === 'admin' && (
          <Col md={6} lg={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title className="text-white">📢 Broadcast</Card.Title>
                <Card.Text className="text-white">
                  Send announcements and notifications to all users and agents instantly.
                </Card.Text>
                <Button as={Link} to="/admin/notify" variant="primary">Go to Broadcast</Button>
              </Card.Body>
            </Card>
          </Col>
        )}
        {user?.role !== 'admin' && (
          <Col md={6} lg={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title className="text-white">My complaints</Card.Title>
                <Card.Text className="text-white">
                  Track status and chat with the assigned agent.
                </Card.Text>
                <Button as={Link} to="/my-complaints" variant="outline-primary">View My Complaints</Button>
              </Card.Body>
            </Card>
          </Col>
        )}
        {user?.role === 'admin' && (
          <Col md={6} lg={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title className="text-white">💬 Feedback</Card.Title>
                <Card.Text className="text-white">
                  View all user ratings, suggestions, and feedback across complaints.
                </Card.Text>
                <Button as={Link} to="/feedback" variant="outline-primary">View Feedback</Button>
              </Card.Body>
            </Card>
          </Col>
        )}
        {(user?.role === 'agent' || user?.role === 'admin') && (
          <Col md={6} lg={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title className="text-white">Assigned to me</Card.Title>
                <Card.Text className="text-white">
                  Complaints assigned to you. Update status and reply to users.
                </Card.Text>
                <Button as={Link} to="/agent" variant="outline-primary">Assigned Complaints</Button>
              </Card.Body>
            </Card>
          </Col>
        )}
        {user?.role === 'admin' && (
          <Col md={6} lg={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title className="text-white">Admin</Card.Title>
                <Card.Text className="text-white">
                  Manage agents, assign complaints, and view statistics.
                </Card.Text>
                <Button as={Link} to="/admin" variant="outline-primary">Admin Dashboard</Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </>
  );
}
