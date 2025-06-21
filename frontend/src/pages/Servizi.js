import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faHome, faCity, faWarehouse, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../components/common/PageHeader';
import './Servizi.css';

const Servizi = () => {
  // Stato per i progetti
  const [projectsByCategory, setProjectsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch dei progetti dal backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://csv-backend-yg2x.onrender.com/api/projects/public');
        const data = await response.json();
        
        if (data.success) {
          // Raggruppa i progetti per categoria
          const groupedProjects = data.projects.reduce((acc, project) => {
            const category = project.category || 'Altro';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(project);
            return acc;
          }, {});
          
          setProjectsByCategory(groupedProjects);
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

  // Dati per i servizi (manteniamo la struttura ma useremo progetti reali)
  const servizi = [
    {
      id: 1,
      icon: faHome,
      title: 'Residenziale',
      description: 'Costruzione e ristrutturazione di edifici residenziali, case unifamiliari e condomini con particolare attenzione alla qualità e sostenibilità.',
      features: [
        'Costruzione nuove abitazioni',
        'Ristrutturazioni complete',
        'Ampliamenti e sopraelevazioni',
        'Certificazioni energetiche'
      ],
      link: '/servizi/residenziale',
      category: 'Residenziale' // Per collegare ai progetti reali
    },
    {
      id: 2,
      icon: faBuilding,
      title: 'Commerciale',
      description: 'Realizzazione di spazi commerciali moderni e funzionali, progettati per massimizzare l\'efficienza e l\'attrattività per i clienti.',
      features: [
        'Negozi e showroom',
        'Centri commerciali',
        'Uffici vendita',
        'Spazi espositivi'
      ],
      link: '/servizi/commerciale',
      category: 'Commerciale' // Per collegare ai progetti reali
    },
    {
      id: 3,
      icon: faCity,
      title: 'Direzionale',
      description: 'Costruzione di uffici e spazi di lavoro innovativi, pensati per il benessere dei dipendenti e l\'efficienza operativa.',
      features: [
        'Uffici open space',
        'Sale riunioni',
        'Spazi di co-working',
        'Aree relax'
      ],
      link: '/servizi/direzionale',
      category: 'Direzionale' // Per collegare ai progetti reali
    },
    {
      id: 4,
      icon: faWarehouse,
      title: 'Produttivo',
      description: 'Edificazione di strutture industriali e produttive con focus su sicurezza, efficienza energetica e ottimizzazione degli spazi.',
      features: [
        'Capannoni industriali',
        'Magazzini logistici',
        'Impianti produttivi',
        'Aree di stoccaggio'
      ],
      link: '/servizi/produttivo',
      category: 'Produttivo' // Per collegare ai progetti reali
    }
  ];

  // Dati per le caratteristiche distintive
  const features = [
    {
      id: 1,
      title: 'Qualità Costruttiva',
      description: 'Utilizziamo solo materiali di prima qualità e tecniche costruttive all\'avanguardia per garantire risultati eccellenti e duraturi.'
    },
    {
      id: 2,
      title: 'Team Specializzato',
      description: 'Il nostro team di professionisti altamente qualificati assicura competenza e precisione in ogni fase del progetto.'
    },
    {
      id: 3,
      title: 'Tempi Certi',
      description: 'Rispettiamo rigorosamente le tempistiche concordate, garantendo consegne puntuali e senza sorprese.'
    }
  ];

  return (
    <div className="servizi-page">
      {/* Utilizzo del componente PageHeader comune */}
      <PageHeader 
        title="I Nostri Servizi" 
        backgroundImage="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />

      {/* Sezione introduttiva */}
      <section className="services-intro">
        <Container>
          <div className="section-header">
            <h2>Servizi di Eccellenza nel Settore Edile</h2>
            <p>Offriamo soluzioni complete e personalizzate per ogni tipo di progetto costruttivo</p>
          </div>
          <Row>
            <Col lg={12}>
              <p>
                La nostra azienda vanta un'esperienza pluriennale nel settore delle costruzioni, con competenze specifiche in ambito residenziale, commerciale, direzionale e produttivo. Mettiamo a disposizione dei nostri clienti un team di professionisti altamente qualificati, in grado di seguire ogni progetto dalla fase di pianificazione fino alla consegna finale, garantendo risultati eccellenti e duraturi.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Sezione con i servizi */}
      <section className="services-list">
        <Container>
          <div className="section-header">
            <h2>I Nostri Servizi</h2>
            <p>Scopri la nostra gamma completa di servizi per il settore delle costruzioni</p>
          </div>
          
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Caricamento in corso...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {error}
            </div>
          ) : (
            <Row>
              {servizi.map(servizio => (
                <Col md={6} key={servizio.id} className="mb-4">
                  <Card className="service-card">
                    <Card.Body>
                      <div className="service-header">
                        <FontAwesomeIcon icon={servizio.icon} className="service-icon" />
                        <h3 className="service-title">{servizio.title}</h3>
                      </div>
                      <p className="service-description">{servizio.description}</p>
                      <div className="service-features-grid">
                        {servizio.features.map((feature, index) => (
                          <div key={index} className="service-feature-item">
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      {/* Progetti correlati a questo servizio (se disponibili) */}
                      {projectsByCategory[servizio.category] && projectsByCategory[servizio.category].length > 0 && (
                        <div className="mt-3">
                          <small className="text-muted">
                            {projectsByCategory[servizio.category].length} progett{projectsByCategory[servizio.category].length === 1 ? 'o' : 'i'} in questa categoria
                          </small>
                        </div>
                      )}
                      
                      <Button as={Link} to={servizio.link} variant="primary" className="mt-2">
                        Scopri di più
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* Sezione perché sceglierci */}
      <section className="why-choose-us">
        <Container>
          <div className="section-header">
            <h2>Perché Scegliere Noi</h2>
            <p>Caratteristiche che ci distinguono nel settore delle costruzioni</p>
          </div>
          <Row>
            {features.map(feature => (
              <Col md={4} key={feature.id} className="mb-4">
                <div className="feature-box">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Sezione CTA */}
      <section className="cta-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="cta-content">
                <h2>Pronti a Iniziare il Tuo Progetto?</h2>
                <p>Contattaci oggi stesso per una consulenza gratuita e scopri come possiamo trasformare le tue idee in realtà.</p>
                <Button as={Link} to="/contatti" variant="primary" size="lg">
                  Richiedi un Preventivo
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Servizi;
