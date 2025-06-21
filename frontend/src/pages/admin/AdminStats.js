import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faProjectDiagram,
    faCheckCircle,
    faClock,
    faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

const AdminStats = () => {
    const [stats, setStats] = useState({
        clients: 0,
        projects: 0,
        activeProjects: 0,
        recentProjects: [],
        recentClients: []
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch basic statistics
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
            
            // Fetch recent projects
            const recentProjectsResponse = await fetch('https://csv-backend-yg2x.onrender.com/api/admin/projects?limit=5&sort=updatedAt', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Fetch recent clients
            const recentClientsResponse = await fetch('https://csv-backend-yg2x.onrender.com/api/admin/clients?limit=5&sort=createdAt', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (clientsResponse.ok && projectsResponse.ok && recentProjectsResponse.ok && recentClientsResponse.ok) {
                const clientsData = await clientsResponse.json();
                const projectsData = await projectsResponse.json();
                const recentProjectsData = await recentProjectsResponse.json();
                const recentClientsData = await recentClientsResponse.json();
                
                setStats({
                    clients: clientsData.stats?.total || 0,
                    projects: projectsData.stats?.total || 0,
                    activeProjects: projectsData.stats?.active || 0,
                    recentProjects: recentProjectsData.projects || [],
                    recentClients: recentClientsData.localClients || []
                });
            } else {
                setError("Errore nel caricamento dei dati");
            }
        } catch (error) {
            console.error('Errore nel caricamento statistiche:', error);
            setError("Errore nella comunicazione con il server");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center p-5">Caricamento dati in corso...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div className="admin-stats">
            <h2 className="mb-4">Dashboard amministrazione</h2>

            {/* Statistiche principali */}
            <Row className="mb-4">
                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex align-items-center">
                            <div className="stat-icon me-3">
                                <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary" />
                            </div>
                            <div>
                                <h6 className="text-muted mb-1">Clienti totali</h6>
                                <h3 className="mb-0">{stats.clients}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex align-items-center">
                            <div className="stat-icon me-3">
                                <FontAwesomeIcon icon={faProjectDiagram} size="2x" className="text-success" />
                            </div>
                            <div>
                                <h6 className="text-muted mb-1">Progetti totali</h6>
                                <h3 className="mb-0">{stats.projects}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="d-flex align-items-center">
                            <div className="stat-icon me-3">
                                <FontAwesomeIcon icon={faClock} size="2x" className="text-warning" />
                            </div>
                            <div>
                                <h6 className="text-muted mb-1">Progetti in corso</h6>
                                <h3 className="mb-0">{stats.activeProjects}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Tabella progetti recenti */}
            <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-white">
                    <h5 className="mb-0">Progetti recenti</h5>
                </Card.Header>
                <Card.Body>
                    {stats.recentProjects && stats.recentProjects.length > 0 ? (
                        <Table responsive hover className="mb-0">
                            <thead>
                                <tr>
                                    <th>Titolo</th>
                                    <th>Cliente</th>
                                    <th>Stato</th>
                                    <th>Data aggiornamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentProjects.map((project, idx) => (
                                    <tr key={project._id || idx}>
                                        <td>{project.title}</td>
                                        <td>{project.client?.name || 'N/A'}</td>
                                        <td>
                                            <span className={`badge ${project.status === 'Completato' ? 'bg-success' :
                                                    project.status === 'In corso' ? 'bg-primary' :
                                                        project.status === 'In attesa' ? 'bg-warning' :
                                                            'bg-secondary'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td>{new Date(project.updatedAt).toLocaleDateString('it-IT')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert variant="info">
                            Nessun progetto recente da visualizzare.
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            {/* Tabella clienti recenti */}
            <Card className="shadow-sm">
                <Card.Header className="bg-white">
                    <h5 className="mb-0">Clienti recenti</h5>
                </Card.Header>
                <Card.Body>
                    {stats.recentClients && stats.recentClients.length > 0 ? (
                        <Table responsive hover className="mb-0">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Progetti</th>
                                    <th>Data registrazione</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentClients.map((client, idx) => (
                                    <tr key={client._id || idx}>
                                        <td>{client.name}</td>
                                        <td>{client.email}</td>
                                        <td>{client.projectCount || 0}</td>
                                        <td>{new Date(client.created_at || client.createdAt).toLocaleDateString('it-IT')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert variant="info">
                            Nessun cliente recente da visualizzare.
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default AdminStats;
