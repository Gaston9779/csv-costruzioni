import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs, Spinner, Image, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendar, faBuilding, faTags, faClock, faEuroSign, faBed, faBath, faRulerCombined } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const API_URL = 'https://csv-backend-yg2x.onrender.com';

const ProgettoDettaglio = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('descrizione');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/projects/public/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setProject(data.project);
          console.log('Progetto caricato:', data.project);
        } else {
          setError('Progetto non trovato');
        }
      } catch (err) {
        console.error('Errore caricamento progetto:', err);
        setError('Errore di connessione. Riprova più tardi.');
      } finally {
        setLoading(false);
        // Scorrimento in alto della pagina
        window.scrollTo(0, 0);
      }
    };

    fetchProject();
  }, [id]);

  // Formatta la data in stile italiano
  const formatDate = (dateString) => {
    if (!dateString) return 'Non specificata';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completato': return 'success';
      case 'In corso': return 'primary';
      case 'In pausa': return 'warning';
      case 'Pianificato': return 'info';
      default: return 'secondary';
    }
  };

  // Fallback image in case of loading error
  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=";
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" role="status" className="my-5">
            <span className="visually-hidden">Caricamento...</span>
          </Spinner>
          <p>Caricamento progetto in corso...</p>
        </Container>
        <Footer />
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Header />
        <Container className="py-5">
          <div className="alert alert-danger">
            {error || 'Progetto non trovato'}
          </div>
          <Link to="/progetti" className="btn btn-primary">Torna ai Progetti</Link>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="project-detail-hero" 
           style={{
             backgroundImage: project.images && project.images.length > 0 
               ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${API_URL}/uploads/${project.images[0].filename})`
               : 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(/images/placeholder.jpg)',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             padding: '80px 0',
             color: 'white',
             marginBottom: '30px',
             marginTop:120
           }}>
        <Container>
          <h1>{project.title}</h1>
          <div className="d-flex flex-wrap align-items-center mt-3">
            <Badge bg={getStatusColor(project.status)} className="me-2 mb-2">{project.status}</Badge>
            {project.location && (
              <div className="me-3 mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" /> {project.location}
              </div>
            )}
            <div className="me-3 mb-2">
              <FontAwesomeIcon icon={faBuilding} className="me-1" /> {project.category}
            </div>
            {project.projectType && (
              <div className="me-3 mb-2">
                <FontAwesomeIcon icon={faTags} className="me-1" /> {project.projectType}
              </div>
            )}
            {project.budget && (
              <div className="me-3 mb-2">
                <FontAwesomeIcon icon={faEuroSign} className="me-1" /> Budget: €{parseInt(project.budget).toLocaleString('it-IT')}
              </div>
            )}
            {project.startDate && (
              <div className="me-3 mb-2">
                <FontAwesomeIcon icon={faCalendar} className="me-1" /> {formatDate(project.startDate)}
                {project.endDate && <> - {formatDate(project.endDate)}</>}
              </div>
            )}
          </div>
        </Container>
      </div>

      <Container className="pb-5">
        <Row>
          <Col lg={8}>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
              fill
            >
              <Tab eventKey="descrizione" title="Descrizione">
                <div className="p-4 bg-white rounded shadow-sm">
                  <div className="mb-4">
                    {project.description ? (
                      <p style={{whiteSpace: 'pre-line'}}>{project.description}</p>
                    ) : (
                      <p className="text-muted">Nessuna descrizione disponibile</p>
                    )}
                  </div>
                </div>
              </Tab>
              
              <Tab eventKey="immagini" title="Galleria">
                <div className="p-4 bg-white rounded shadow-sm">
                  {project.images && project.images.length > 0 ? (
                    <Row xs={1} md={2} lg={3} className="g-4">
                      {project.images.map((image, index) => (
                        <Col key={index}>
                          <Card className="h-100">
                            <Card.Img 
                              variant="top" 
                              src={`${API_URL}/uploads/${image.filename}`}
                              onError={handleImageError}
                              style={{ height: '200px', objectFit: 'cover' }}
                            />
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <p className="text-muted">Nessuna immagine disponibile</p>
                  )}
                </div>
              </Tab>
              
              {project.projectType === 'Multiproprietà' && project.apartments && project.apartments.length > 0 && (
                <Tab eventKey="appartamenti" title={`Appartamenti (${project.apartments.length})`}>
                  <div className="p-4 bg-white rounded shadow-sm">
                    <h4 className="mb-4">Unità disponibili</h4>
                    <Row xs={1} md={2} lg={3} className="g-4">
                      {project.apartments.map((apartment, index) => (
                        <Col key={index}>
                          <Card className="h-100 apartment-card border-0 shadow-sm">
                            {apartment.images && apartment.images.length > 0 ? (
                              <div className="position-relative">
                                <Card.Img 
                                  variant="top" 
                                  src={`${API_URL}/uploads/${apartment.images[0].filename}`} 
                                  onError={handleImageError}
                                  style={{ height: '220px', objectFit: 'cover' }}
                                  className="rounded-top"
                                />
                                <Badge 
                                  bg={apartment.status === 'Disponibile' ? 'success' : apartment.status === 'Venduto' ? 'danger' : 'warning'} 
                                  className="position-absolute top-0 end-0 m-2"
                                >
                                  {apartment.status}
                                </Badge>
                              </div>
                            ) : (
                              <div className="placeholder-image rounded-top" style={{height: '220px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d'}}>
                                <span>Nessuna immagine</span>
                              </div>
                            )}
                            <Card.Body>
                              <Card.Title className="fs-5 fw-bold mb-3">{apartment.title}</Card.Title>
                              
                              {apartment.description && (
                                <Card.Text className="text-muted mb-3 small">
                                  {apartment.description.length > 100 
                                    ? `${apartment.description.substring(0, 100)}...` 
                                    : apartment.description}
                                </Card.Text>
                              )}
                              
                              <div className="apartment-features">
                                <div className="d-flex flex-wrap gap-3 mb-3">
                                  {apartment.squareMeters && (
                                    <div className="feature-item">
                                      <FontAwesomeIcon icon={faRulerCombined} className="me-1 text-primary" /> 
                                      <span>{apartment.squareMeters} m²</span>
                                    </div>
                                  )}
                                  {apartment.bedrooms !== undefined && (
                                    <div className="feature-item">
                                      <FontAwesomeIcon icon={faBed} className="me-1 text-primary" /> 
                                      <span>{apartment.bedrooms}</span>
                                    </div>
                                  )}
                                  {apartment.bathrooms !== undefined && (
                                    <div className="feature-item">
                                      <FontAwesomeIcon icon={faBath} className="me-1 text-primary" /> 
                                      <span>{apartment.bathrooms}</span>
                                    </div>
                                  )}
                                  {apartment.floor !== undefined && (
                                    <div className="feature-item">
                                      <FontAwesomeIcon icon={faBuilding} className="me-1 text-primary" /> 
                                      <span>Piano {apartment.floor}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {apartment.budget > 0 && (
                                <div className="price-tag mt-3 pt-2 border-top">
                                  <FontAwesomeIcon icon={faEuroSign} className="me-1" />
                                  <span className="fw-bold">{apartment.budget.toLocaleString('it-IT')} €</span>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Tab>
              )}
              
              <Tab eventKey="dettagli" title="Info">
                <div className="p-4 bg-white rounded shadow-sm">
                  <Table striped bordered hover>
                    <tbody>
                      <tr>
                        <td width="30%"><strong>Categoria</strong></td>
                        <td>{project.category}</td>
                      </tr>
                      {project.projectType && (
                        <tr>
                          <td><strong>Tipo Progetto</strong></td>
                          <td>{project.projectType}</td>
                        </tr>
                      )}
                      <tr>
                        <td><strong>Stato</strong></td>
                        <td><Badge bg={getStatusColor(project.status)}>{project.status}</Badge></td>
                      </tr>
                      <tr>
                        <td><strong>Location</strong></td>
                        <td>{project.location || 'Non specificata'}</td>
                      </tr>
                      <tr>
                        <td><strong>Data Inizio</strong></td>
                        <td>{formatDate(project.startDate)}</td>
                      </tr>
                      <tr>
                        <td><strong>Data Fine</strong></td>
                        <td>{formatDate(project.endDate)}</td>
                      </tr>
                      <tr>
                        <td><strong>Budget</strong></td>
                        <td>{project.budget ? `€${parseInt(project.budget).toLocaleString('it-IT')}` : 'Non specificato'}</td>
                      </tr>
                      {project.projectType === 'Multiproprietà' && (
                        <tr>
                          <td><strong>Unità Abitative</strong></td>
                          <td>{project.apartments ? project.apartments.length : 0}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Tab>
            </Tabs>
          </Col>
          
          <Col style={{zIndex:0}} lg={4}>
            <div className="sticky-top" style={{top: '100px'}}>
              {/* Informazioni di contatto */}
              <Card className="mb-4 shadow-sm">
                <Card.Header as="h5">Contattaci per questo progetto</Card.Header>
                <Card.Body>
                  <Card.Text>
                    Sei interessato a questo progetto? Contattaci per maggiori informazioni.
                  </Card.Text>
                  <Button variant="primary" href="/contatti" className="w-100">Richiedi Informazioni</Button>
                </Card.Body>
              </Card>
              
              {/* Immagine principale per mobile view */}
              <div className="d-lg-none mb-4">
                {project.images && project.images.length > 0 ? (
                  <Image 
                    src={`${API_URL}/uploads/${project.images[0].filename}`}
                    className="img-fluid rounded shadow-sm"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="placeholder-image rounded shadow-sm" style={{height: '200px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span className="text-muted">Nessuna immagine disponibile</span>
                  </div>
                )}
              </div>
              
              {/* Altri progetti correlati */}
              <Card className="shadow-sm">
                <Card.Header as="h5">Progetti Correlati</Card.Header>
                <Card.Body>
                  <Card.Text>
                    Scopri altri progetti nella categoria <strong>{project.category}</strong>.
                  </Card.Text>
                  <Button variant="outline-primary" href="/progetti" className="w-100">Vedi Tutti i Progetti</Button>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
      
      <style jsx="true">{`
        .project-detail-hero {
          position: relative;
          text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
        }
        
        .apartment-card {
          transition: transform 0.2s;
        }
        
        .apartment-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}</style>
    </>
  );
};

export default ProgettoDettaglio;
