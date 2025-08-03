import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendarAlt, faExclamationTriangle, faEye, faCamera, faArrowRight, faBuilding, faBed, faBath, faRulerCombined } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../components/common/PageHeader';
import './Progetti.css';
import { API_URL } from '../config';


const Progetti = () => {
  // Stato per i progetti e filtri
  const [projects, setProjects] = useState([]);
  const [filtroAttivo, setFiltroAttivo] = useState('tutti');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback per errori di caricamento immagini senza causare loop
  const handleImageError = (e) => {
    e.target.onerror = null; // Previene loop infiniti
    // Usa un'immagine SVG base64 incorporata
    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=";
  };

  // Ottiene l'URL dell'immagine senza causare errori o loop
  const getProjectImageUrl = (project) => {
    // Se il progetto non ha immagini
    if (!project || !project.images || project.images.length === 0) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=";
    }
    
    const image = project.images[0];
    
    // Se l'immagine è una stringa (solo filename)
    if (typeof image === 'string') {
      return `${API_URL}/uploads/projects/${image}`;
    }
    
    // Se l'immagine ha un URL
    if (image.url) {
      return `${API_URL}${image.url}`;
    }
    
    // Se l'immagine ha un filename
    if (image.filename) {
      return `${API_URL}/uploads/${image.filename}`;
    }
    
    // Se l'immagine ha solo ID (problema)
    if (image._id) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=";
    }
    
    // Fallback finale
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=";
  };

  // Fetch dei progetti dall'API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/projects/public`);
        const data = await response.json();
        
        if (data.success) {
          setProjects(data.projects);
        } else {
          setError('Errore nel caricamento dei progetti');
        }
      } catch (error) {
        console.error('Errore durante il recupero dei progetti:', error);
        setError('Errore di connessione. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Filtra i progetti in base alla categoria selezionata
  const progettiFiltered = projects.filter(project => {
    if (filtroAttivo === 'tutti') return true;
    
    // Converte la categoria del progetto in minuscolo per il confronto
    const projectCategory = project.category ? project.category.toLowerCase() : '';
    
    // Mapping delle categorie API con quelle dell'UI
    const categoryMap = {
      'residenziale': ['residenziale', 'residential'],
      'commerciale': ['commerciale', 'commercial'],
      'Direzionale': ['Direzionale', 'public'],
      'Produttivo': ['Produttivo', 'produttivo', 'industrial', 'productive'],

    };
    
    // Verifica se la categoria del progetto corrisponde a una delle categorie mappate
    return categoryMap[filtroAttivo]?.some(cat => 
      projectCategory.toLowerCase().includes(cat.toLowerCase())
    );
  });



  return (
    <>
      {/* Page Header */}
      <PageHeader 
        title="I Nostri Progetti" 
        backgroundImage="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />

      {/* Intro Section */}
      <section className="projects-intro">
        <Container>
          <div className="section-header">
            <h2>Progetti Realizzati</h2>
            <p>Esplora la nostra galleria di progetti completati in diversi settori</p>
          </div>
          <p className="intro-text">
            La nostra azienda ha realizzato numerosi progetti di successo in ambito residenziale, commerciale e Produttivo. 
            Ogni progetto è stato sviluppato con attenzione ai dettagli, utilizzo di materiali di qualità e rispetto delle 
            tempistiche concordate, garantendo sempre la piena soddisfazione dei nostri clienti.
          </p>

          {/* Project Category Filter */}
          <div className="filter-buttons text-center">
            <Button 
              variant={filtroAttivo === 'tutti' ? 'primary' : 'outline-primary'} 
              onClick={() => setFiltroAttivo('tutti')}
              className="mx-2 mb-3"
            >
              Tutti i Progetti
            </Button>
            <Button 
              variant={filtroAttivo === 'residenziale' ? 'primary' : 'outline-primary'} 
              onClick={() => setFiltroAttivo('residenziale')}
              className="mx-2 mb-3"
            >
              Residenziale
            </Button>
            <Button 
              variant={filtroAttivo === 'commerciale' ? 'primary' : 'outline-primary'} 
              onClick={() => setFiltroAttivo('commerciale')}
              className="mx-2 mb-3"
            >
              Commerciale
            </Button>
            <Button 
              variant={filtroAttivo === 'Produttivo' ? 'primary' : 'outline-primary'} 
              onClick={() => setFiltroAttivo('Produttivo')}
              className="mx-2 mb-3"
            >
              Produttivo
            </Button>
            <Button 
              variant={filtroAttivo === 'Direzionale' ? 'primary' : 'outline-primary'} 
              onClick={() => setFiltroAttivo('Direzionale')}
              className="mx-2 mb-3"
            >
              Direzionale
            </Button>
          </div>
        </Container>
      </section>

      {/* Projects Grid */}
      <section className="projects-grid">
        <Container>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Caricamento progetti in corso...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {error}
            </div>
          ) : (
            <Row>
              {progettiFiltered.map((project) => (
                <Col lg={4} md={6} key={project._id} className="mb-4">
                  <Card className="hotel-style-project-card h-100 border-0">
                    {/* Image Section with Enhanced Design */}
                    <div className="project-image-wrapper position-relative">
                      <div className="project-image-frame">
                        <Card.Img 
                          variant="top" 
                          src={getProjectImageUrl(project)} 
                          alt={project.title} 
                          onError={handleImageError}
                          className="project-hero-image"
                        />
                        
                        {/* Dynamic Gradient Overlay */}
                        <div className="project-dynamic-overlay"></div>
                        
                        {/* Floating Category Badge */}
                        <div className="floating-category-badge">
                          <div className="category-pill">
                            <FontAwesomeIcon icon={faBuilding} className="category-icon" />
                            <span className="category-text">{project.category || 'Altro'}</span>
                          </div>
                        </div>
                        
                        {/* Project Type Badge */}
                        {project.projectType && (
                          <div className="floating-type-badge">
                            <div className="type-pill multipropriety">
                              <span>{project.projectType}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Premium Hover Overlay */}
                        <div className="premium-hover-overlay">
                          <div className="hover-content">
                            <div className="hover-icon-wrapper">
                              <FontAwesomeIcon icon={faEye} className="hover-icon" />
                            </div>
                            <h6 className="hover-title">Visualizza Progetto</h6>
                            <p className="hover-subtitle">Scopri tutti i dettagli</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <Card.Body className="hotel-card-body">
                      {/* Title and Location */}
                      <div className="hotel-header">
                        <h5 className="hotel-project-title">{project.title}</h5>
                        {project.location && (
                          <p className="hotel-location">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                            {project.location}
                          </p>
                        )}
                      </div>
                      
                      {/* Price Section */}
                      <div className="hotel-price-section">
                        {project.projectType === 'Multiproprietà' ? (
                          <div className="multipropriety-info">
                            <div className="price-row">
                              <span className="price-label">Valore Totale</span>
                              <span className="price-value">
                                {project.budget > 0 
                                  ? `€${parseInt(project.budget).toLocaleString('it-IT')}` 
                                  : 'Su richiesta'
                                }
                              </span>
                            </div>
                            <div className="apartments-count">
                              <FontAwesomeIcon icon={faBuilding} className="apartments-icon" />
                              <span>{project.apartments ? project.apartments.length : 0} appartamenti disponibili</span>
                            </div>
                          </div>
                        ) : (
                          // Progetto Singolo - Mostra prezzo progetto
                          (
                            <div className="single-apartment-info">
                              <div className="price-row">
                                <span className="price-label">Valore totale</span>
                                <span className="price-value">
                                  {(() => {
                                     if (!project) return 'Su richiesta';
                                     
                                     const apartment = project.apartments?.[0];
                                     const apartmentBudget = apartment?.budget;
                                     const projectBudget = project.budget;
                                     
                                     if (apartmentBudget && apartmentBudget > 0) {
                                       return `€${parseInt(apartmentBudget).toLocaleString('it-IT')}`;
                                     } else if (projectBudget && projectBudget > 0) {
                                       return `€${parseInt(projectBudget).toLocaleString('it-IT')}`;
                                     } else {
                                       return 'Su richiesta';
                                     }
                                   })()
                                   }
                                </span>
                              </div>
                              
                              <div className="apartments-count">
                                <FontAwesomeIcon icon={faBuilding} className="apartments-icon" />
                                <span>1 appartamento disponibile</span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                      
                      {/* Description */}
                      {project.description && (
                        <p className="hotel-description">
                          {project.description.length > 60 
                            ? project.description.substring(0, 60) + '...' 
                            : project.description}
                        </p>
                      )}
                      
                      {/* Meta Info Row */}
                      <div className="hotel-meta-row">
                        {project.startDate && (
                          <div className="hotel-meta-item">
                            <FontAwesomeIcon icon={faCalendarAlt} className="meta-icon" />
                            <span className="meta-value">{new Date(project.startDate).getFullYear()}</span>
                          </div>
                        )}
                        
                        {project.images && project.images.length > 0 && (
                          <div className="hotel-meta-item">
                            <FontAwesomeIcon icon={faCamera} className="meta-icon" />
                            <span className="meta-value">{project.images.length} foto</span>
                            <p className="photo-desc-text">{project.images[0].description}</p>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                    
                    {/* Action Footer */}
                    <Card.Footer className="hotel-card-footer">
                      <Link 
                        to={`/progetti/${project._id}`} 
                        className="hotel-view-button"
                      >
                        <span>Visualizza Progetto</span>
                        <FontAwesomeIcon icon={faArrowRight} className="button-arrow" />
                      </Link>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Messaggio se non ci sono progetti nella categoria selezionata */}
          {!loading && !error && progettiFiltered.length === 0 && (
            <div className="text-center py-5">
              <h3>Nessun progetto trovato in questa categoria</h3>
              <p>Prova a selezionare un'altra categoria o visualizza tutti i progetti.</p>
              <Button 
                variant="primary" 
                onClick={() => setFiltroAttivo('tutti')}
                className="mt-3"
              >
                Visualizza tutti i progetti
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <div className="cta-content">
                <h2>Hai un Progetto in Mente?</h2>
                <p>Contattaci per una consulenza gratuita e senza impegno. Il nostro team è pronto ad ascoltare le tue esigenze e a trovare la soluzione più adatta.</p>
                <Link to="/contatti" className="btn btn-primary btn-lg mt-4">Richiedi Preventivo</Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Progetti;
