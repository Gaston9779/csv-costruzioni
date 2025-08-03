import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs, Spinner, Image, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendar, faBuilding, faTags, faClock, faEuroSign, faBed, faBath, faRulerCombined, faCamera } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { API_URL } from '../config';



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

  // Gestisce errore di caricamento immagine senza causare loop
  const handleImageError = (e) => {
    e.target.onerror = null; // Previene loop infiniti
    // Usa un'immagine placeholder incorporata invece di richieste HTTP
    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=";
  };

  // Funzione helper per ottenere l'URL dell'immagine
  const getImageUrl = (image) => {
    // Se l'immagine non esiste
    if (!image) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=";
    }
    
    // Se è un oggetto con url
    if (image.url) {
      return `${API_URL}${image.url}`;
    }
    
    // Se è un oggetto con filename
    if (image.filename) {
      // Determina il path corretto in base al tipo di immagine
      const path = image.filename.startsWith('apartment') ? '/uploads/apartments/' : '/uploads/projects/';
      return `${API_URL}${path}${image.filename}`;
    }
    
    // Se è solo un ID (caso problematico)
    if (image._id) {
      // NON generare URL basati solo sull'ID per evitare richieste inutili
      // Usa un'immagine placeholder incorporata invece di richieste HTTP
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=";
    }
    
    // Fallback finale (immagine SVG incorporata)
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=";
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
               ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${getImageUrl(project.images[0])})`
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
          <Col lg={12}>
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
                              src={getImageUrl(image)}
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
                    <div className="apartments-horizontal-list">
                      {project.apartments.map((apartment, index) => (
                        <Card key={index} className="apartment-horizontal-card mb-4 border-0 shadow-sm overflow-hidden">
                          <Row className="g-0 h-100">
                            {/* Sezione Immagine */}
                            <Col md={4} className="position-relative">
                              {apartment.images && apartment.images.length > 0 ? (
                                <div className="apartment-image-container h-100 position-relative">
                                  <Image 
                                    src={getImageUrl(apartment.images[0])} 
                                    onError={handleImageError}
                                    className="apartment-main-image w-100 h-100"
                                    style={{ objectFit: 'cover', minHeight: '250px' }}
                                  />
                                  <Badge 
                                    bg={apartment.status === 'Disponibile' ? 'success' : apartment.status === 'Venduto' ? 'danger' : 'warning'} 
                                    className="position-absolute top-0 end-0 m-3 px-3 py-2"
                                    style={{ fontSize: '0.85rem' }}
                                  >
                                    {apartment.status}
                                  </Badge>
                                  {apartment.images.length > 1 && (
                                    <div className="position-absolute bottom-0 start-0 m-3">
                                      <Badge bg="dark" className="opacity-75">
                                        <FontAwesomeIcon icon={faCamera} className="me-1" />
                                        {apartment.images.length} foto
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="apartment-placeholder d-flex align-items-center justify-content-center h-100 bg-light text-muted" style={{minHeight: '250px'}}>
                                  <div className="text-center">
                                    <FontAwesomeIcon icon={faBuilding} size="2x" className="mb-2 opacity-50" />
                                    <div>Nessuna immagine</div>
                                  </div>
                                </div>
                              )}
                            </Col>
                            
                            {/* Sezione Contenuto */}
                            <Col md={8}>
                              <Card.Body className="h-100 d-flex flex-column p-4">
                                {/* Header con titolo e prezzo */}
                                <div className="apartment-header mb-3">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="apartment-title mb-0 fw-bold text-primary">{apartment.title}</h5>
                                    {apartment.budget > 0 && (
                                      <div className="apartment-price text-end">
                                        <div className="price-amount h5 mb-0 fw-bold text-success">
                                          €{apartment.budget.toLocaleString('it-IT')}
                                        </div>
                                        <small className="text-muted">Prezzo richiesto</small>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {apartment.description && (
                                    <p className="apartment-description text-muted mb-0 small">
                                      {apartment.description.length > 150 
                                        ? `${apartment.description.substring(0, 150)}...` 
                                        : apartment.description}
                                    </p>
                                  )}
                                </div>
                                
                                {/* Caratteristiche principali */}
                                <div className="apartment-features mb-3 flex-grow-1">
                                  <Row className="g-3">
                                    {apartment.squareMeters && (
                                      <Col xs={6} sm={3}>
                                        <div className="feature-card text-center p-3 bg-light rounded">
                                          <FontAwesomeIcon icon={faRulerCombined} className="text-primary mb-2" size="lg" />
                                          <div className="fw-bold">{apartment.squareMeters} m²</div>
                                          <small className="text-muted">Superficie</small>
                                        </div>
                                      </Col>
                                    )}
                                    {apartment.bedrooms !== undefined && (
                                      <Col xs={6} sm={3}>
                                        <div className="feature-card text-center p-3 bg-light rounded">
                                          <FontAwesomeIcon icon={faBed} className="text-primary mb-2" size="lg" />
                                          <div className="fw-bold">{apartment.bedrooms}</div>
                                          <small className="text-muted">Camere</small>
                                        </div>
                                      </Col>
                                    )}
                                    {apartment.bathrooms !== undefined && (
                                      <Col xs={6} sm={3}>
                                        <div className="feature-card text-center p-3 bg-light rounded">
                                          <FontAwesomeIcon icon={faBath} className="text-primary mb-2" size="lg" />
                                          <div className="fw-bold">{apartment.bathrooms}</div>
                                          <small className="text-muted">Bagni</small>
                                        </div>
                                      </Col>
                                    )}
                                    {apartment.floor !== undefined && (
                                      <Col xs={6} sm={3}>
                                        <div className="feature-card text-center p-3 bg-light rounded">
                                          <FontAwesomeIcon icon={faBuilding} className="text-primary mb-2" size="lg" />
                                          <div className="fw-bold">Piano {apartment.floor}</div>
                                          <small className="text-muted">Livello</small>
                                        </div>
                                      </Col>
                                    )}
                                  </Row>
                                </div>
                                
                                {/* Footer con azioni */}
                                <div className="apartment-footer pt-3 border-top">
                                  <Row className="align-items-center">
                                    <Col>
                                      <div className="d-flex gap-2 flex-wrap">
                                        {apartment.images && apartment.images.length > 1 && (
                                          <Button variant="outline-primary" size="sm">
                                            <FontAwesomeIcon icon={faCamera} className="me-1" />
                                            Vedi Galleria
                                          </Button>
                                        )}
                                        <Button variant="primary" size="sm">
                                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                          Maggiori Info
                                        </Button>
                                      </div>
                                    </Col>
                                    <Col xs="auto">
                                      <small className="text-muted">
                                        Appartamento #{index + 1}
                                      </small>
                                    </Col>
                                  </Row>
                                </div>
                              </Card.Body>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
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
        </Row>
      </Container>
      
      <style jsx="true">{`
        .project-detail-hero {
          position: relative;
          text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
        }
        
        .apartment-horizontal-card {
          transition: all 0.3s ease;
          border-radius: 12px !important;
        }
        
        .apartment-horizontal-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15) !important;
        }
        
        .apartment-image-container {
          border-radius: 12px 0 0 12px;
          overflow: hidden;
        }
        
        .apartment-main-image {
          transition: transform 0.3s ease;
        }
        
        .apartment-horizontal-card:hover .apartment-main-image {
          transform: scale(1.05);
        }
        
        .feature-card {
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        
        .feature-card:hover {
          background-color: #f8f9fa !important;
          border-color: #dee2e6;
          transform: translateY(-2px);
        }
        
        .apartment-title {
          font-size: 1.4rem;
          color: #2c3e50;
        }
        
        .price-amount {
          color: #28a745 !important;
          font-size: 1.3rem;
        }
        
        .apartments-horizontal-list {
          max-height: 80vh;
          overflow-y: auto;
          padding-right: 10px;
        }
        
        .apartments-horizontal-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .apartments-horizontal-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .apartments-horizontal-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .apartments-horizontal-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        @media (max-width: 768px) {
          .apartment-horizontal-card .row {
            flex-direction: column;
          }
          
          .apartment-image-container {
            border-radius: 12px 12px 0 0;
            min-height: 200px !important;
          }
          
          .feature-card {
            margin-bottom: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default ProgettoDettaglio;
