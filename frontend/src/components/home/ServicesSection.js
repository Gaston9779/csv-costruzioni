import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShoppingCart, faBuilding, faIndustry, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './ServicesSection.css';

const ServicesSection = () => {
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dati per i servizi
  const services = [
    {
      id: 1,
      icon: faHome,
      title: 'Residenziale',
      slug: 'residenziale',
      description: 'Costruzione e ristrutturazione di edifici residenziali, case unifamiliari e condomini.',
      link: '/servizi/residenziale'
    },
    {
      id: 2,
      icon: faShoppingCart,
      title: 'Commerciale',
      slug: 'commerciale',
      description: 'Realizzazione di negozi, centri commerciali e strutture per il retail.',
      link: '/servizi/commerciale'
    },
    {
      id: 3,
      icon: faBuilding,
      title: 'Direzionale',
      slug: 'direzionale',
      description: 'Costruzione di uffici, sedi aziendali e spazi di lavoro moderni.',
      link: '/servizi/direzionale'
    },
    {
      id: 4,
      icon: faIndustry,
      title: 'Produttivo',
      slug: 'produttivo',
      description: 'Edificazione di capannoni industriali, magazzini e strutture produttive.',
      link: '/servizi/produttivo'
    }
  ];

  // Fetch di tutti i progetti pubblici e poi filtro per categoria
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Utilizziamo l'API esistente per recuperare tutti i progetti pubblici
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/projects/public`);
        const data = await response.json();
        
        if (data.success) {
          setAllProjects(data.projects);
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

  // Funzione per ottenere progetti correlati per una categoria specifica
  const getRelatedProjects = (category, limit = 1) => {
    if (!allProjects || allProjects.length === 0) return [];
    
    // Filtra i progetti per categoria (case insensitive)
    return allProjects
      .filter(project => 
        project.category && 
        project.category.toLowerCase() === category.toLowerCase()
      )
      .slice(0, limit);
  };

  return (
    <section className="services-section">
      <Container>
        <div className="section-header text-center">
          <h2>I Nostri Servizi</h2>
          <p>Offriamo una gamma completa di servizi di costruzione per soddisfare ogni esigenza</p>
        </div>
        <Row className="service-cards">
          {services.map(service => (
            <Col md={6} lg={3} key={service.id} className="mb-4">
              <div className="service-card animate-on-scroll">
                <div className="service-icon">
                  <FontAwesomeIcon icon={service.icon} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={service.link} className="service-link">
                  Scopri di più <FontAwesomeIcon icon={faArrowRight} />
                </Link>
                
                {/* Progetti correlati per questa categoria */}
                {!loading && !error && (
                  <>
                    {getRelatedProjects(service.slug).length > 0 ? (
                      <div className="related-project-preview mt-4">
                        <h5 className="related-project-title">Progetto Correlato</h5>
                        {getRelatedProjects(service.slug).map(project => (
                          <Card key={project._id} className="related-project-card">
                            <div className="related-project-image">
                              {project.images && project.images.length > 0 ? (
                                <Card.Img 
                                  variant="top" 
                                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${project.images[0].filename}`} 
                                  alt={project.title} 
                                />
                              ) : (
                                <Card.Img 
                                  variant="top" 
                                  src="https://via.placeholder.com/300x200?text=Immagine+non+disponibile" 
                                  alt={project.title} 
                                />
                              )}
                            </div>
                            <Card.Body className="p-2">
                              <Card.Title className="h6 mb-0">{project.title}</Card.Title>
                              <Link to={`/progetti/${project._id}`} className="stretched-link"></Link>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="no-related-projects mt-4">
                        <p className="small text-muted">Nessun progetto correlato disponibile</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default ServicesSection;
