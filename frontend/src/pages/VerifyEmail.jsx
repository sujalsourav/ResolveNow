import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, Container, Button } from 'react-bootstrap';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('missing');
      return;
    }
    api
      .post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        toast.success('Email verified successfully');
      })
      .catch(() => setStatus('error'));
  }, [searchParams]);

  return (
    <Container className="py-5">
      <Card className="shadow mx-auto" style={{ maxWidth: 400 }}>
        <Card.Body className="p-4 text-center">
          {status === 'verifying' && <p>Verifying your email...</p>}
          {status === 'success' && (
            <>
              <p className="text-success">Your email has been verified.</p>
              <Button as={Link} to="/" variant="primary">Go to Dashboard</Button>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-danger">Invalid or expired verification link.</p>
              <Button as={Link} to="/" variant="outline-primary">Go to Dashboard</Button>
            </>
          )}
          {status === 'missing' && (
            <>
              <p className="text-muted">No verification token provided.</p>
              <Button as={Link} to="/" variant="outline-primary">Go to Dashboard</Button>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
