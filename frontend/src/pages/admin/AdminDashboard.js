import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Tab, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faProjectDiagram, 
  faFileAlt, 
  faChartBar,
  faPlus,
  faCog,
  faSignOutAlt,
  faFilePdf,
  faFileImage
} from '@fortawesome/free-solid-svg-icons';
import AdminClients from './AdminClients';
import AdminProjects from './AdminProjects';
import AdminStats from './AdminStats';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    clients: 0,
    projects: 0,
    documents: 0,
    activeProjects: 0,
    documentsStats: {
      total: 0,
      pdf: 0,
      images: 0,
      other: 0
    },
    recentActivities: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    // Quando si attiva la tab clients, aggiorniamo i clienti
    if (activeTab === 'clients') {
      console.log('Tab clients attivata, aggiornamento dati...');
      // Se esiste una funzione di refresh per i client, la chiamiamo
      if (window.AdminClientsRefresh && window.AdminClientsRefresh.fetchClients) {
        window.AdminClientsRefresh.fetchClients();
      }
    } 
    // Quando si attiva la tab projects, aggiorniamo i progetti
    else if (activeTab === 'projects') {
      console.log('Tab projects attivata, aggiornamento dati...');
      // Utilizziamo la funzione di refresh per i progetti se disponibile
      if (window.AdminProjectsRefresh && window.AdminProjectsRefresh.fetchProjects) {
        window.AdminProjectsRefresh.fetchProjects();
        window.AdminProjectsRefresh.fetchClients(); // Carica anche i client per il dropdown
      }
    }
    // Per la dashboard e le statistiche, ricarichiamo i dati
    else if (activeTab === 'dashboard' || activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const clientsResponse = await fetch('https://csv-backend-yg2x.onrender.com/api/admin/clients/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const projectsResponse = await fetch('https://csv-backend-yg2x.onrender.com/api/admin/projects/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Recupera i progetti più recenti per le attività
      const recentProjectsResponse = await fetch('https://csv-backend-yg2x.onrender.com/api/admin/projects?limit=5&sort=updatedAt', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Recupera i documenti più recenti e le statistiche sui documenti
      const documentsResponse = await fetch('https://csv-backend-yg2x.onrender.com/api/admin/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (clientsResponse.ok && projectsResponse.ok && recentProjectsResponse.ok && documentsResponse.ok) {
        const clientsData = await clientsResponse.json();
        const projectsData = await projectsResponse.json();
        const recentProjectsData = await recentProjectsResponse.json();
        const documentsData = await documentsResponse.json();
        
        // Calcola le statistiche sui tipi di documenti
        const documentsStats = {
          total: documentsData.documents?.length || 0,
          pdf: documentsData.documents?.filter(doc => doc.fileType.includes('pdf')).length || 0,
          images: documentsData.documents?.filter(doc => doc.fileType.includes('image')).length || 0,
          other: documentsData.documents?.filter(doc => !doc.fileType.includes('pdf') && !doc.fileType.includes('image')).length || 0
        };
        
        // Creazione array di attività recenti
        const recentActivities = [];
        
        // Aggiungi progetti recenti alle attività
        if (recentProjectsData.projects && recentProjectsData.projects.length > 0) {
          recentProjectsData.projects.forEach(project => {
            recentActivities.push({
              type: 'project',
              title: `Progetto '${project.title}' ${project.updatedAt > project.createdAt ? 'aggiornato' : 'creato'}`,
              date: project.updatedAt || project.createdAt,
              status: project.status,
              entity: project
            });
          });
        }
        
        // Aggiungi documenti recenti alle attività
        if (documentsData.documents && documentsData.documents.length > 0) {
          documentsData.documents.slice(0, 3).forEach(doc => {
            recentActivities.push({
              type: 'document',
              title: `Documento '${doc.title}' caricato`,
              date: doc.uploadedAt,
              clientName: doc.clientName,
              entity: doc
            });
          });
        }
        
        // Ordina per data (più recente prima)
        recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setStats({
          clients: clientsData.stats?.total || 0,
          projects: projectsData.stats?.total || 0,
          documents: documentsData.documents?.length || 0,
          activeProjects: projectsData.stats?.active || 0,
          documentsStats,
          recentActivities: recentActivities.slice(0, 5) // Limita a 5 attività
        });
      }
    } catch (error) {
      console.error('Errore nel caricamento statistiche:', error);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card className="stat-card h-100">
      <Card.Body className="d-flex align-items-center">
        <div className={`stat-icon bg-${color}`}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="stat-content">
          <h3 className="stat-value">{value}</h3>
          <p className="stat-title">{title}</p>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div style={{marginTop:120}} className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <Container fluid>
          <Row className="align-items-center">
            <Col>
              <h1 className="admin-title">Dashboard Amministratore</h1>
              <p className="admin-subtitle">Benvenuto, {user?.name}</p>
            </Col>
            <Col xs="auto">
              <Button variant="outline-light" onClick={onLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Logout
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container fluid className="admin-content">
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Row>
            {/* Sidebar */}
            <Col md={3} lg={2} className="admin-sidebar">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="dashboard">
                    <FontAwesomeIcon icon={faChartBar} className="me-2" />
                    Dashboard
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="clients">
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Gestione Clienti
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="projects">
                    <FontAwesomeIcon icon={faProjectDiagram} className="me-2" />
                    Gestione Progetti
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="stats">
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                    Statistiche
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>

            {/* Main Content */}
            <Col md={9} lg={10} className="admin-main">
              <Tab.Content>
                {/* Dashboard Overview */}
                <Tab.Pane eventKey="dashboard">
                  <Row className="mb-4">
                    <Col md={3}>
                      <StatCard
                        title="Clienti Totali"
                        value={stats.clients}
                        icon={faUsers}
                        color="primary"
                      />
                    </Col>
                    <Col md={3}>
                      <StatCard
                        title="Progetti Totali"
                        value={stats.projects}
                        icon={faProjectDiagram}
                        color="success"
                      />
                    </Col>
                    <Col md={3}>
                      <StatCard
                        title="Progetti Attivi"
                        value={stats.activeProjects}
                        icon={faCog}
                        color="warning"
                      />
                    </Col>
                    <Col md={3}>
                      <StatCard
                        title="Documenti"
                        value={stats.documents}
                        icon={faFileAlt}
                        color="info"
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-4">
                      <Card>
                        <Card.Header>
                          <h5>Azioni Rapide</h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="d-grid gap-2">
                            <Button 
                              variant="primary" 
                              onClick={() => setActiveTab('clients')}
                            >
                              <FontAwesomeIcon icon={faPlus} className="me-2" />
                              Nuovo Cliente
                            </Button>
                            <Button 
                              variant="success" 
                              onClick={() => setActiveTab('projects')}
                            >
                              <FontAwesomeIcon icon={faPlus} className="me-2" />
                              Nuovo Progetto
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6} className="mb-4">
                      <Card>
                        <Card.Header>
                          <h5>Attività Recenti</h5>
                        </Card.Header>
                        <Card.Body>
                          {stats.recentActivities && stats.recentActivities.length > 0 ? (
                            <ul className="list-group list-group-flush">
                              {stats.recentActivities.map((activity, idx) => (
                                <li key={idx} className="list-group-item px-0">
                                  <div className="d-flex justify-content-between">
                                    <div>
                                      <strong>{activity.title}</strong>
                                      {activity.type === 'project' && (
                                        <span className={`ms-2 badge ${
                                          activity.status === 'Completato' ? 'bg-success' :
                                          activity.status === 'In corso' ? 'bg-primary' : 
                                          'bg-secondary'
                                        }`}>
                                          {activity.status}
                                        </span>
                                      )}
                                      {activity.type === 'document' && (
                                        <span className="ms-2 text-muted">
                                          per {activity.clientName}
                                        </span>
                                      )}
                                    </div>
                                    <small className="text-muted">
                                      {new Date(activity.date).toLocaleDateString('it-IT')}
                                    </small>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted">
                              Nessuna attività recente da visualizzare.
                            </p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Grafico Distribuzione Documenti */}
                  <Row>
                    <Col md={12} className="mb-4">
                      <Card>
                        <Card.Header>
                          <h5>Distribuzione Documenti</h5>
                        </Card.Header>
                        <Card.Body>
                          {stats.documentsStats && (
                            <>
                              <div className="d-flex justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                  <FontAwesomeIcon icon={faFilePdf} className="text-danger me-2" />
                                  <span>PDF</span>
                                </div>
                                <span>{stats.documentsStats.pdf} ({stats.documents > 0 ? Math.round((stats.documentsStats.pdf / stats.documents) * 100) : 0}%)</span>
                              </div>
                              <ProgressBar 
                                variant="danger" 
                                now={stats.documents > 0 ? (stats.documentsStats.pdf / stats.documents) * 100 : 0} 
                                className="mb-3" 
                              />

                              <div className="d-flex justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                  <FontAwesomeIcon icon={faFileImage} className="text-primary me-2" />
                                  <span>Immagini (JPG, PNG)</span>
                                </div>
                                <span>{stats.documentsStats.images} ({stats.documents > 0 ? Math.round((stats.documentsStats.images / stats.documents) * 100) : 0}%)</span>
                              </div>
                              <ProgressBar 
                                variant="primary" 
                                now={stats.documents > 0 ? (stats.documentsStats.images / stats.documents) * 100 : 0} 
                                className="mb-3" 
                              />

                              <div className="d-flex justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                  <FontAwesomeIcon icon={faFileAlt} className="text-secondary me-2" />
                                  <span>Altri formati</span>
                                </div>
                                <span>{stats.documentsStats.other} ({stats.documents > 0 ? Math.round((stats.documentsStats.other / stats.documents) * 100) : 0}%)</span>
                              </div>
                              <ProgressBar 
                                variant="secondary" 
                                now={stats.documents > 0 ? (stats.documentsStats.other / stats.documents) * 100 : 0} 
                              />
                            </>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* Gestione Clienti */}
                <Tab.Pane eventKey="clients">
                  <AdminClients onStatsUpdate={fetchStats} />
                </Tab.Pane>

                {/* Gestione Progetti */}
                <Tab.Pane eventKey="projects">
                  <AdminProjects onStatsUpdate={fetchStats} />
                </Tab.Pane>

                {/* Statistiche */}
                <Tab.Pane eventKey="stats">
                  <AdminStats />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </div>
  );
};

export default AdminDashboard;
