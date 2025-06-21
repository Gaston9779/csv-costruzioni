import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faShieldAlt, faFileAlt, faDownload, faClipboardList, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../components/common/PageHeader';
import AdminDashboard from './admin/AdminDashboard';
import './AreaClienti.css';

const AreaClienti = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Nuovi stati per dati reali
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [dataLoading, setDataLoading] = useState({
    projects: false,
    documents: false,
    invoices: false
  });

  // Controlla se c'è un token salvato all'avvio
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);

        // Verifica validità token con il backend
        verifyToken(token);
      } catch (error) {
        console.error('Errore nel parsing dei dati utente:', error);
        handleLogout();
      }
    }
  }, []);

  // Carica i dati del cliente quando è loggato
  useEffect(() => {
    if (isLoggedIn && user?.role === 'client') {
      fetchClientProjects();
      fetchClientDocuments();
      // Per ora non abbiamo API per le fatture, quindi inizializziamo con un array vuoto
      setInvoices([]);
    }
  }, [isLoggedIn, user]);

  // Verifica validità token
  const verifyToken = async (token) => {
    try {
      const response = await fetch('https://csv-backend-yg2x.onrender.com/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Token non valido, logout
        handleLogout();
      }
    } catch (error) {
      console.error('Errore nella verifica del token:', error);
    }
  };

  // Recupera i progetti del cliente
  const fetchClientProjects = async () => {
    setDataLoading(prev => ({ ...prev, projects: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://csv-backend-yg2x.onrender.com/api/client/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
      } else {
        console.error('Errore nel recupero progetti:', data.message);
      }
    } catch (error) {
      console.error('Errore durante il caricamento dei progetti:', error);
    } finally {
      setDataLoading(prev => ({ ...prev, projects: false }));
    }
  };

  // Recupera i documenti del cliente
  const fetchClientDocuments = async () => {
    setDataLoading(prev => ({ ...prev, documents: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://csv-backend-yg2x.onrender.com/api/client/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setDocuments(data.documents);
      } else {
        console.error('Errore nel recupero documenti:', data.message);
      }
    } catch (error) {
      console.error('Errore durante il caricamento dei documenti:', error);
    } finally {
      setDataLoading(prev => ({ ...prev, documents: false }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await fetch('https://csv-backend-yg2x.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Salva token e dati utente
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        setUser(data.user);
        setIsLoggedIn(true);
        setLoginError('');
      } else {
        setLoginError(data.message || 'Credenziali non valide');
      }
    } catch (error) {
      console.error('Errore durante il login:', error);

      // Messaggio di errore più specifico
      if (error.message && error.message.includes('Failed to fetch')) {
        setLoginError('Impossibile raggiungere il server. Verifica che il server backend sia in esecuzione.');
      } else {
        setLoginError('Errore di connessione. Riprova più tardi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');

    setIsLoggedIn(false);
    setUser(null);
    setEmail('');
    setPassword('');
    setRememberMe(false);
  };

  const advanceStatus = ((status) => {
    if (status === 'In corso') {
      return '50';
    } else if (status === 'Completato') {
      return '100';
    } else {
      return '0';
    }
  })



  // Se l'utente è admin, mostra la dashboard admin
  if (isLoggedIn && user?.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // Se l'utente è loggato e non è admin, mostra l'area clienti normale
  if (isLoggedIn && user?.role === 'client') {
    return (
      <div className="area-clienti">
        <PageHeader
          title="Area Clienti"
          subtitle={`Benvenuto, ${user.name}`}
        />

        <Container className="py-5">
          <Row className="mb-4">
            <Col xs={12} className="d-flex justify-content-between align-items-center">
              <h2 className="section-title">Il tuo account</h2>
              <Button variant="outline-primary" onClick={handleLogout}>
                Logout
              </Button>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Profilo
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p><strong>Nome:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Ruolo:</strong> {user.role === 'client' ? 'Cliente'  : 'Admin'}</p>
                
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8} className="mb-4">
              <Card className="h-100">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                    I tuoi progetti
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Nome Progetto</th>
                          <th>Stato</th>
                          <th>Avanzamento</th>
                          <th>Data Aggiornamento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map(project => (
                          <tr key={project.id}>
                            <td>{project.title}</td>
                            <td>
                              <span className={`badge ${project.status === 'Completato' ? 'bg-success' : project.status === 'In corso' ? 'bg-primary' : 'bg-warning'}`}>
                                {project.status}
                              </span>
                            </td>
                            <td>
                              <div className="progress" style={{ height: '8px' }}>
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{ width: `${advanceStatus(project.status)}%` }}
                                  aria-valuenow={project.progress}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                            </td>
                            <td>{project.updatedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {dataLoading.projects && (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Caricamento in corso...</span>
                      </Spinner>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6} className="mb-4">
              <Card className="h-100">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                    Documenti
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Nome File</th>
                          <th>Dimensione</th>
                          <th>Data</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map(doc => (
                          <tr key={doc.id}>
                            <td>{doc.title}</td>
                            <td>{doc.fileSize}</td>
                            <td>{doc.uploadedAt}</td>
                            <td>
                              <a download target="_blank"
                                rel="noopener noreferrer" style={{ zIndex: 100 }} href={doc.fileName} >
                                <FontAwesomeIcon icon={faDownload} />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {dataLoading.documents && (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Caricamento in corso...</span>
                      </Spinner>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} className="mb-4">
              <Card className="h-100">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                    Fatture
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Numero</th>
                          <th>Importo</th>
                          <th>Data</th>
                          <th>Stato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map(invoice => (
                          <tr key={invoice.id}>
                            <td>{invoice.number}</td>
                            <td>{invoice.amount}</td>
                            <td>{invoice.date}</td>
                            <td>
                              <span className={`badge ${invoice.paid ? 'bg-success' : 'bg-danger'}`}>
                                {invoice.paid ? 'Pagata' : 'Da pagare'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {dataLoading.invoices && (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Caricamento in corso...</span>
                      </Spinner>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Form di login (utente non loggato)
  return (
    <div className="area-clienti">
      <PageHeader
        title="Accesso Clienti"
        subtitle="Accedi alla tua area riservata per visualizzare progetti, documenti e fatture"
      />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            {loginError && (
              <Alert variant="danger" className="mb-4">
                {loginError}
              </Alert>
            )}

            <Card className="login-card">
              <Card.Body className="p-4">
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@costruzioniviola.it"
                        required
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        required
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      label="Ricordami"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Accesso in corso...
                      </>
                    ) : (
                      'ACCEDI'
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <Link to="/password-dimenticata" className="text-decoration-none">
                    Password dimenticata?
                  </Link>
                </div>

                <div className="text-center mt-3">
                  Non hai un account? <Link to="/contatti" className="text-decoration-none">Contattaci</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AreaClienti;
