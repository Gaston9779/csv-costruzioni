import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faPlus, faCalendarAlt, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import ServicesSection from '../components/home/ServicesSection';
import CookieConsent from '../components/common/CookieConsent';
import './Home.css';

// Immagini Unsplash per sostituire quelle mancanti
const heroImageUrl = "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
const aboutImageUrl = "https://images.unsplash.com/photo-1558442074-3c19857bc1dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
const testimonial1Url = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80";
const testimonial2Url = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80";
const testimonial3Url = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80";

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Home = () => {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Funzione per animare gli elementi quando entrano nel viewport
  useEffect(() => {
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
          element.classList.add('animated');
        }
      });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    // Trigger once on load
    animateOnScroll();
    
    return () => {
      window.removeEventListener('scroll', animateOnScroll);
    };
  }, []);

  // Fetch dei progetti più recenti
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/projects/public?limit=3`);
        const data = await response.json();
        
        if (data.success) {
          setFeaturedProjects(data.projects);
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

  // Dati per le testimonianze
  const testimonials = [
    {
      id: 1,
      name: 'Marco Rossi',
      position: 'Proprietario Immobiliare',
      text: 'CSV ha realizzato la mia casa dei sogni con grande professionalità e attenzione ai dettagli. Consiglio vivamente i loro servizi.',
      image: testimonial1Url
    },
    {
      id: 2,
      name: 'Laura Bianchi',
      position: 'CEO Retail Company',
      text: 'Abbiamo affidato a CSV la costruzione del nostro nuovo punto vendita. Il risultato ha superato le nostre aspettative in termini di qualità e tempistiche.',
      image: testimonial2Url
    },
    {
      id: 3,
      name: 'Alessandro Verdi',
      position: 'Direttore Generale',
      text: 'La nostra nuova sede aziendale realizzata da CSV è funzionale, moderna e rispetta tutti gli standard di efficienza energetica che avevamo richiesto.',
      image: testimonial3Url
    }
  ];

  return (
    <>
      {/* Cookie Consent Banner */}
      <CookieConsent />
      
      {/* Hero Section - Redesigned */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <Container fluid className="hero-container">
          <Row style={{paddingLeft:50, paddingRight:50}} className="align-items-center">
            <Col lg={6} className="hero-content">
              <div className="animate-on-scroll">
                <h1>Costruiamo il Futuro</h1>
                <p className="lead">
                  Da oltre 30 anni realizziamo progetti edilizi di qualità, combinando innovazione, sostenibilità e attenzione ai dettagli.
                </p>
                <div className="hero-buttons">
                  <Button as={Link} to="/progetti" variant="primary" size="lg" className="me-3">
                    I Nostri Progetti
                  </Button>
                  <Button as={Link} to="/contatti" variant="outline-light" size="lg">
                    Contattaci
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6} className="hero-image-container d-none d-lg-block">
              <div className="hero-image-wrapper animate-on-scroll">
                <img src={heroImageUrl} alt="CSV Costruzioni" className="hero-image" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section - New */}
      <section className="features-section">
        <Container>
          <Row>
            <Col md={3} className="feature-item animate-on-scroll">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h3>30+</h3>
              <p>Anni di Esperienza</p>
            </Col>
            <Col md={3} className="feature-item animate-on-scroll">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h3>250+</h3>
              <p>Progetti Completati</p>
            </Col>
            <Col md={3} className="feature-item animate-on-scroll">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h3>100%</h3>
              <p>Clienti Soddisfatti</p>
            </Col>
            <Col md={3} className="feature-item animate-on-scroll">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h3>50+</h3>
              <p>Professionisti</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* About Section - Redesigned */}
      <section className="about-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <div className="about-image-container animate-on-scroll">
                <img src={aboutImageUrl} alt="Chi Siamo" className="about-image" />
                <div className="about-experience">
                  <span className="years">30+</span>
                  <span className="text">Anni di Esperienza</span>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="about-content animate-on-scroll">
                <div className="section-header text-start">
                  <h2>Chi Siamo</h2>
                </div>
                <p className="lead">
                  CSV è un'azienda leader nel settore delle costruzioni, con una lunga tradizione di eccellenza e innovazione.
                </p>
                <p>
                  Fondata nel 1990, la nostra azienda si è affermata come un punto di riferimento nel settore edilizio, grazie alla qualità delle nostre costruzioni e alla professionalità del nostro team.
                </p>
                <div className="about-features">
                  <div className="feature">
                    <FontAwesomeIcon icon={faCheckCircle} className="feature-check" />
                    <span>Progetti personalizzati su misura</span>
                  </div>
                  <div className="feature">
                    <FontAwesomeIcon icon={faCheckCircle} className="feature-check" />
                    <span>Materiali di alta qualità e sostenibili</span>
                  </div>
                  <div className="feature">
                    <FontAwesomeIcon icon={faCheckCircle} className="feature-check" />
                    <span>Team di professionisti qualificati</span>
                  </div>
                  <div className="feature">
                    <FontAwesomeIcon icon={faCheckCircle} className="feature-check" />
                    <span>Rispetto dei tempi e dei budget</span>
                  </div>
                </div>
                <Button as={Link} to="/chi-siamo" variant="primary" className="mt-4">Scopri di Più</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Section - Component */}
      <ServicesSection />

      {/* Projects Section - Dynamic */}
      <section className="projects-section">
        <Container>
          <div className="section-header">
            <h2>Progetti in Evidenza</h2>
            <p>I nostri lavori più recenti e significativi</p>
          </div>
          <Row>
            {loading ? (
              <Col xs={12} className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Caricamento...</span>
                </div>
                <p className="mt-3">Caricamento progetti...</p>
              </Col>
            ) : error ? (
              <Col xs={12} className="text-center py-5">
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              </Col>
            ) : featuredProjects.length === 0 ? (
              <Col xs={12} className="text-center py-5">
                <p>Nessun progetto disponibile al momento.</p>
              </Col>
            ) : (
              featuredProjects.map(project => (
                <Col md={4} key={project._id} className="mb-4">
                  <Card className="project-card animate-on-scroll">
                    <div className="project-image">
                      {project.images && project.images.length > 0 ? (
                        <Card.Img 
                          variant="top" 
                          src={`${API_URL}/uploads/${project.images[0].filename}`} 
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
                        <Link to={`/progetti/${project._id}`} className="project-link">
                          <FontAwesomeIcon icon={faPlus} />
                        </Link>
                      </div>
                    </div>
                    <Card.Body>
                      <div className="project-category">{project.category || 'Altro'}</div>
                      <Card.Title>{project.title}</Card.Title>
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
                      <Link to={`/progetti/${project._id}`} className="btn btn-outline-primary mt-3">
                        Scopri di più
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
          <div className="text-center mt-5">
            <Button as={Link} to="/progetti" variant="outline-primary">Visualizza Tutti i Progetti</Button>
          </div>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <Container>
          <div className="section-header">
            <h2>Cosa Dicono i Nostri Clienti</h2>
            <p>Le testimonianze di chi ha scelto CSV per i propri progetti</p>
          </div>
          <Row>
            {testimonials.map(testimonial => (
              <Col md={4} key={testimonial.id} className="mb-4">
                <div className="testimonial-card animate-on-scroll">
                  <div className="testimonial-content">
                    <p>"{testimonial.text}"</p>
                  </div>
                  <div className="testimonial-author">
                    <img src={testimonial.image} alt={testimonial.name} className="testimonial-avatar" />
                    <div className="testimonial-info">
                      <h4>{testimonial.name}</h4>
                      <p>{testimonial.position}</p>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <div className="cta-content animate-on-scroll">
                <h2>Pronti a Iniziare il Tuo Progetto?</h2>
                <p>Contattaci oggi stesso per una consulenza gratuita e scopri come possiamo trasformare le tue idee in realtà</p>
                <Button as={Link} to="/contatti" variant="primary" size="lg" className="mt-4">Richiedi un Preventivo</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;
