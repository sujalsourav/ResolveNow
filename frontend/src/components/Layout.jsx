import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../api/axios';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/notifications/unread-count').then((r) => setUnreadCount(r.data.count)).catch(() => { });
    const t = setInterval(() => {
      api.get('/notifications/unread-count').then((r) => setUnreadCount(r.data.count)).catch(() => { });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <Navbar expand="md" className="border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <span style={{ marginRight: '6px' }}>⚡</span>ResolveNow
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="nav" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px' }}>
            <span style={{ display: 'block', width: '18px', height: '2px', background: '#94a3b8', margin: '4px 0' }} />
            <span style={{ display: 'block', width: '18px', height: '2px', background: '#94a3b8', margin: '4px 0' }} />
            <span style={{ display: 'block', width: '18px', height: '2px', background: '#94a3b8', margin: '4px 0' }} />
          </Navbar.Toggle>
          <Navbar.Collapse id="nav">
            <Nav className="me-auto gap-1">
              <Nav.Link as={Link} to="/" className={isActive('/') ? 'active' : ''}>
                Dashboard
              </Nav.Link>

              {user?.role === 'admin' ? (
                <Nav.Link as={Link} to="/admin/notify" className={isActive('/admin/notify') ? 'active' : ''}>
                  📢 Broadcast
                </Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/submit" className={isActive('/submit') ? 'active' : ''}>
                  + Submit Complaint
                </Nav.Link>
              )}

              {(user?.role === 'admin' || user?.role === 'agent') ? (
                <Nav.Link as={Link} to="/feedback" className={isActive('/feedback') ? 'active' : ''}>
                  💬 Feedback
                </Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/my-complaints" className={isActive('/my-complaints') ? 'active' : ''}>
                  My Complaints
                </Nav.Link>
              )}

              {(user?.role === 'admin' || user?.role === 'agent') && (
                <Nav.Link as={Link} to="/agent" className={isActive('/agent') ? 'active' : ''}>
                  📋 Assigned
                </Nav.Link>
              )}

              {user?.role === 'admin' && (
                <Nav.Link as={Link} to="/admin" className={isActive('/admin') ? 'active' : ''}>
                  🛡 Admin
                </Nav.Link>
              )}
            </Nav>

            <Nav className="align-items-center gap-2">
              {/* Notifications bell */}
              <Nav.Link
                as={Link}
                to="/notifications"
                className={`position-relative ${isActive('/notifications') ? 'active' : ''}`}
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <span style={{ fontSize: '1.1rem' }}>🔔</span>
                {unreadCount > 0 && (
                  <span
                    className="position-absolute notif-badge"
                    style={{
                      top: '2px',
                      right: '0px',
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '99px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      padding: '0 4px',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Nav.Link>

              {/* User dropdown */}
              <Dropdown align="end" as={Nav.Item}>
                <Dropdown.Toggle
                  as="button"
                  style={{
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '99px',
                    padding: '0.35rem 0.9rem',
                    color: '#818cf8',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  >
                    {user?.fullName?.charAt(0)?.toUpperCase()}
                  </span>
                  {user?.fullName?.split(' ')[0]}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as="span" style={{ cursor: 'default' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user?.email}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
                      {user?.role}
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    className="text-danger"
                    onClick={() => { logout(); navigate('/login'); }}
                  >
                    Sign out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
}

export default Layout;
