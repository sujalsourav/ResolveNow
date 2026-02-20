import { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function SendNotification() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await api.post('/notifications/global', { title, message });
            toast.success(res.data.message);
            setTitle('');
            setMessage('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <h1 className="mb-4 text-white">Send Broadcast Notification</h1>
            <Card>
                <Card.Body>
                    <Form onSubmit={handleSend}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Notification Title"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Message</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Message to all users and agents..."
                                required
                            />
                        </Form.Group>
                        <Button type="submit" variant="primary" disabled={sending}>
                            {sending ? 'Sending...' : 'Send Broadcast'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
}
