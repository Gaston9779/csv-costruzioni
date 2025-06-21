import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../components/common/PageHeader';
import './ServizioDettaglio.css';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ServizioDettaglio = () => {
  const { tipo } = useParams();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recupera tutti i progetti pubblici e filtra per categoria
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Recupera tutti i progetti pubblici
        const response = await fetch(`${API_URL}/api/projects/public`);
        const data = await response.json();
        
        if (data.success) {
          // Filtra i progetti per categoria
          const filteredProjects = data.projects.filter(project => 
            project.category && project.category.toLowerCase() === tipo.toLowerCase()
          );
          setProjects(filteredProjects);
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
  }, [tipo]);

  // Database dei servizi aggiornato per i 4 servizi richiesti
  const serviziDatabase = {
    'residenziale': {
      id: 1,
      title: 'Edilizia Residenziale',
      slug: 'residenziale',
      icon: 'home',
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      description: 'Costruzione e ristrutturazione di edifici residenziali, case unifamiliari e condomini con particolare attenzione alla qualità e sostenibilità.',
      longDescription: [
        'La nostra esperienza nel settore dell\'edilizia residenziale ci permette di realizzare abitazioni che combinano estetica, funzionalità e sostenibilità. Ogni progetto viene sviluppato in stretta collaborazione con il cliente, per garantire che ogni dettaglio rispecchi le sue esigenze e preferenze.',
        'Utilizziamo materiali di alta qualità e tecniche costruttive all\'avanguardia per creare spazi abitativi confortevoli, efficienti dal punto di vista energetico e duraturi nel tempo. Il nostro approccio integrato alla progettazione e costruzione ci consente di gestire ogni fase del processo, dalla pianificazione iniziale alla consegna finale.'
      ],
      features: [
        'Progettazione personalizzata',
        'Materiali di alta qualità',
        'Efficienza energetica',
        'Finiture di pregio',
        'Costruzione nuove abitazioni',
        'Ristrutturazioni complete',
        'Ampliamenti e sopraelevazioni',
        'Certificazioni energetiche'
      ],
      process: [
        { step: 1, title: 'Consultazione', description: 'Incontro iniziale per comprendere le esigenze e preferenze del cliente.' },
        { step: 2, title: 'Progettazione', description: 'Sviluppo del progetto architettonico e delle specifiche tecniche.' },
        { step: 3, title: 'Preventivo', description: 'Elaborazione di un preventivo dettagliato con tempistiche e costi.' },
        { step: 4, title: 'Costruzione', description: 'Realizzazione del progetto con supervisione costante.' },
        { step: 5, title: 'Consegna', description: 'Verifica finale e consegna dell\'immobile al cliente.' }
      ]
    },
    'commerciale': {
      id: 2,
      title: 'Edilizia Commerciale',
      slug: 'commerciale',
      icon: 'building',
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      description: 'Realizzazione di spazi commerciali moderni e funzionali, progettati per massimizzare l\'efficienza e l\'attrattività per i clienti.',
      longDescription: [
        'Progettiamo e costruiamo spazi commerciali che combinano funzionalità, estetica e innovazione. I nostri progetti sono pensati per ottimizzare i flussi di lavoro, migliorare l\'esperienza dei clienti e riflettere l\'identità del brand.',
        'Che si tratti di un piccolo negozio o di un grande centro commerciale, il nostro team si impegna a creare ambienti che attraggano clienti e aumentino le opportunità di business. Ci occupiamo di ogni aspetto, dalla progettazione architettonica agli impianti elettrici e meccanici, fino alle finiture interne ed esterne.'
      ],
      features: [
        'Design innovativo',
        'Ottimizzazione degli spazi',
        'Soluzioni eco-sostenibili',
        'Impiantistica avanzata',
        'Negozi e showroom',
        'Centri commerciali',
        'Uffici vendita',
        'Spazi espositivi'
      ],
      process: [
        { step: 1, title: 'Analisi', description: 'Studio del brand e delle esigenze commerciali specifiche.' },
        { step: 2, title: 'Progettazione', description: 'Sviluppo di un concept che ottimizzi l\'esperienza cliente.' },
        { step: 3, title: 'Pianificazione', description: 'Definizione di budget, tempistiche e requisiti normativi.' },
        { step: 4, title: 'Costruzione', description: 'Realizzazione degli interventi con minimizzazione delle interruzioni.' },
        { step: 5, title: 'Consegna', description: 'Completamento e verifica di conformità agli standard.' }
      ]
    },
    'direzionale': {
      id: 3,
      title: 'Edilizia Direzionale',
      slug: 'direzionale',
      icon: 'city',
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      description: 'Costruzione di uffici e spazi di lavoro innovativi, pensati per il benessere dei dipendenti e l\'efficienza operativa.',
      longDescription: [
        'Gli ambienti di lavoro moderni richiedono spazi che favoriscano la collaborazione, la creatività e il benessere. La nostra esperienza nella progettazione e costruzione di edifici direzionali ci permette di creare uffici funzionali, flessibili e ispiranti.',
        'Integriamo le più recenti tecnologie e le migliori pratiche di design per migliorare l\'efficienza energetica, ottimizzare l\'acustica, la qualità dell\'aria e l\'illuminazione, creando spazi di lavoro che aumentano la produttività e il benessere del personale.'
      ],
      features: [
        'Spazi flessibili e modulari',
        'Soluzioni acustiche avanzate',
        'Efficienza energetica',
        'Innovazione tecnologica',
        'Uffici open space',
        'Sale riunioni',
        'Spazi di co-working',
        'Aree relax'
      ],
      process: [
        { step: 1, title: 'Analisi', description: 'Valutazione delle esigenze operative e della cultura aziendale.' },
        { step: 2, title: 'Progettazione', description: 'Sviluppo di layout e soluzioni che ottimizzano il flusso di lavoro.' },
        { step: 3, title: 'Tecnologia', description: 'Integrazione di sistemi intelligenti e infrastrutture IT.' },
        { step: 4, title: 'Costruzione', description: 'Realizzazione con attenzione alla qualità e ai dettagli.' },
        { step: 5, title: 'Consegna', description: 'Collaudo finale e ottimizzazione dei sistemi.' }
      ]
    },
    'produttivo': {
      id: 4,
      title: 'Edilizia Produttiva',
      slug: 'produttivo',
      icon: 'warehouse',
      image: "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      description: 'Edificazione di strutture industriali e produttive con focus su sicurezza, efficienza energetica e ottimizzazione degli spazi.',
      longDescription: [
        'La nostra esperienza nella costruzione di edifici industriali e produttivi ci permette di offrire soluzioni su misura per ogni settore. Realizziamo strutture ottimizzate per i processi produttivi, rispettando le normative di sicurezza e ambientali.',
        'Dall\'analisi delle esigenze operative alla consegna finale, gestiamo ogni fase del progetto con attenzione ai dettagli e alla qualità costruttiva. Le nostre soluzioni mirano ad aumentare l\'efficienza operativa, ridurre i costi energetici e migliorare le condizioni di lavoro.'
      ],
      features: [
        'Strutture ad alta resistenza',
        'Efficienza energetica',
        'Sicurezza e conformità',
        'Soluzioni personalizzate',
        'Capannoni industriali',
        'Magazzini logistici',
        'Impianti produttivi',
        'Aree di stoccaggio'
      ],
      process: [
        { step: 1, title: 'Analisi', description: 'Studio dei processi produttivi e delle esigenze logistiche.' },
        { step: 2, title: 'Progettazione', description: 'Sviluppo di soluzioni strutturali ottimizzate.' },
        { step: 3, title: 'Normative', description: 'Verifica di conformità a standard di sicurezza e ambientali.' },
        { step: 4, title: 'Costruzione', description: 'Edificazione con materiali e tecniche di qualità.' },
        { step: 5, title: 'Consegna', description: 'Collaudo degli impianti e verifica funzionale.' }
      ]
    }
  };

  const servizio = serviziDatabase[tipo];
  
  if (!servizio) {
    return (
      <Container className="my-5 text-center">
        <h2>Servizio non trovato</h2>
        <p>Il servizio richiesto non è disponibile.</p>
        <Button as={Link} to="/servizi">Torna ai Servizi</Button>
      </Container>
    );
  }

  return (
    <>
      {/* Utilizzo del componente PageHeader comune */}
      <PageHeader 
        title={servizio.title} 
        backgroundImage={servizio.image}
      />

      {/* Service Detail Section */}
      <section className="service-detail-section py-5">
        <Container>
          <Row>
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="service-image">
                <img src={servizio.image} alt={servizio.title} className="img-fluid rounded" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="service-content">
                <h2>{servizio.title}</h2>
                <p className="lead">{servizio.description}</p>
                {servizio.longDescription.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                <div className="service-features-grid">
                  {servizio.features.map((feature, index) => (
                    <div key={index} className="service-feature-item">
                      {feature}
                    </div>
                  ))}
                </div>
                <Link to="/contatti" className="btn btn-primary mt-3">
                  Richiedi Preventivo
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <Container>
          <div className="section-header text-center">
            <h2>Il Nostro Processo</h2>
            <p>Come lavoriamo per realizzare il tuo progetto</p>
          </div>
          <div className="process-timeline">
            {servizio.process.map((step) => (
              <div key={step.step} className="process-step" data-step={step.step}>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Related Projects */}
      <section className="related-projects">
        <Container>
          <div className="section-header text-center">
            <h2>Progetti Correlati</h2>
            <p>Alcuni dei nostri lavori in questo settore</p>
          </div>
          
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Caricamento progetti...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="text-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {error}
            </Alert>
          ) : projects.length === 0 ? (
            <Alert variant="info" className="text-center">
              Nessun progetto disponibile per questa categoria al momento.
            </Alert>
          ) : (
            <Row>
              {projects.slice(0, 3).map((project) => (
                <Col md={4} key={project._id} className="mb-4">
                  <Card className="project-card">
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
                        <Link to={`/progetti/${project._id}`} className="btn btn-light">
                          Vedi Dettagli
                        </Link>
                      </div>
                    </div>
                    <Card.Body>
                      <Card.Title>{project.title}</Card.Title>
                      <Card.Text className="small text-muted">
                        {project.location || project.status}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          
          <div className="text-center mt-4">
            <Link to="/progetti" className="btn btn-outline-primary">
              Vedi Tutti i Progetti
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <div className="cta-content">
                <h2>Pronto a Realizzare il Tuo Progetto?</h2>
                <p>Contattaci oggi stesso per una consulenza gratuita. Il nostro team è pronto ad ascoltare le tue esigenze e a trovare la soluzione più adatta al tuo progetto.</p>
                <div className="cta-buttons">
                  <Link to="/contatti" className="btn btn-primary btn-lg me-3">
                    Contattaci
                  </Link>
                  <Button variant="outline-light" size="lg" href="tel:+390123456789">
                    <FontAwesomeIcon icon={faPhone} className="me-2" /> Chiama Ora
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default ServizioDettaglio;
