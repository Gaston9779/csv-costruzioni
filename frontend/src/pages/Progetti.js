import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendarAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../components/common/PageHeader';
import './Progetti.css';

const Progetti = () => {
  // Stato per i progetti e filtri
  const [projects, setProjects] = useState([]);
  const [filtroAttivo, setFiltroAttivo] = useState('tutti');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dei progetti dall'API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/projects/public');
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

  useEffect(() => {
    console.log(progettiFiltered, 'proj')
  },[progettiFiltered]);

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
                  <Card className="project-card h-100">
                    <div className="project-image" onClick={()=>{console.log(project.images[0].filename)}}>
                      {project.images && project.images.length > 0 ? (
                        <Card.Img 
                          variant="top" 
                          src={`http://localhost:5000/uploads/${project.images[0].filename}`} 
                          alt={project.title} 
                        />
                      ) : (
                        <Card.Img 
                          variant="top" 
                          src="https://via.placeholder.com/300x200?text=Immagine+non+disponibile" 
                          alt={project.title} 
                        />
                      )}
                      <div className="project-overlay">
                        <Link to={`/progetti/${project._id}`} className="btn btn-light">
                          Vedi Dettagli
                        </Link>
                      </div>
                      <div className="project-category">{project.category || 'Altro'}</div>
                    </div>
                    <Card.Body>
                      <Card.Title>{project.title}</Card.Title>
                      <Card.Text>
                        {project.description && project.description.length > 100 
                          ? project.description.substring(0, 100) + '...' 
                          : project.description}
                      </Card.Text>
                      <div className="project-meta">
                        {project.location && (
                          <div className="meta-item">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            <span>{project.location}</span>
                          </div>
                        )}
                        {project.year && (
                          <div className="meta-item">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>{project.year}</span>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <Link to={`/progetti/${project._id}`} className="btn btn-outline-primary btn-block">
                        Scopri di più
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
