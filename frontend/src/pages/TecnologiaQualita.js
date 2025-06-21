import React from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../components/common/PageHeader';
import './TecnologiaQualita.css';

// URL di immagini da Unsplash per la sezione tecnologia
const headerBgUrl = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
const trainingImgUrl = "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

const TecnologiaQualita = () => {
  return (
    <>
      {/* Page Header */}
      <PageHeader 
        title="Tecnologia e Qualità" 
        backgroundImage={headerBgUrl} 
      />

      {/* Intro Section */}
      <section className="intro-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="section-header">
                <h2>Innovazione e Eccellenza</h2>
                <p className="lead">
                  In CSV, l'innovazione tecnologica e gli elevati standard qualitativi sono i pilastri fondamentali del nostro approccio al lavoro.
                </p>
                <p>
                  Investiamo costantemente in tecnologie all'avanguardia e metodologie innovative per garantire risultati eccellenti in ogni progetto. La nostra dedizione alla qualità si riflette in ogni fase del processo costruttivo, dalla progettazione alla consegna finale.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <div className="section-header">
                <h2>Le Nostre Tecnologie</h2>
                <p>
                  Utilizziamo le più avanzate tecnologie disponibili nel settore delle costruzioni per garantire efficienza, precisione e sostenibilità.
                </p>
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={4} md={6} className="mb-4">
              <Card className="tech-card">
                <div className="tech-icon">
                  <FontAwesomeIcon icon={['fas', 'cube']} />
                </div>
                <Card.Body>
                  <Card.Title>BIM (Building Information Modeling)</Card.Title>
                  <Card.Text>
                    Utilizziamo la tecnologia BIM per creare modelli digitali dettagliati degli edifici, consentendo una migliore pianificazione, progettazione e gestione dei progetti di costruzione.
                  </Card.Text>
                  <div className="tech-features">
                    <Badge bg="primary">Progettazione 3D</Badge>
                    <Badge bg="primary">Collaborazione in tempo reale</Badge>
                    <Badge bg="primary">Analisi dei costi</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <Card className="tech-card">
                <div className="tech-icon">
                  <FontAwesomeIcon icon={['fas', 'leaf']} />
                </div>
                <Card.Body>
                  <Card.Title>Tecnologie Sostenibili</Card.Title>
                  <Card.Text>
                    Adottiamo soluzioni eco-sostenibili per ridurre l'impatto ambientale dei nostri progetti, utilizzando materiali a basso impatto e sistemi energetici efficienti.
                  </Card.Text>
                  <div className="tech-features">
                    <Badge bg="success">Materiali eco-compatibili</Badge>
                    <Badge bg="success">Sistemi di recupero acqua</Badge>
                    <Badge bg="success">Energia rinnovabile</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <Card className="tech-card">
                <div className="tech-icon">
                  <FontAwesomeIcon icon={['fas', 'robot']} />
                </div>
                <Card.Body>
                  <Card.Title>Automazione e Robotica</Card.Title>
                  <Card.Text>
                    Implementiamo sistemi automatizzati e robotici per aumentare la precisione e la velocità di esecuzione, riducendo i tempi di costruzione e migliorando la sicurezza sul cantiere.
                  </Card.Text>
                  <div className="tech-features">
                    <Badge bg="info">Droni per ispezioni</Badge>
                    <Badge bg="info">Sistemi di prefabbricazione</Badge>
                    <Badge bg="info">Macchinari automatizzati</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <Card className="tech-card">
                <div className="tech-icon">
                  <FontAwesomeIcon icon={['fas', 'vr-cardboard']} />
                </div>
                <Card.Body>
                  <Card.Title>Realtà Virtuale e Aumentata</Card.Title>
                  <Card.Text>
                    Utilizziamo tecnologie VR e AR per visualizzare i progetti prima della costruzione, consentendo ai clienti di esplorare virtualmente gli spazi e apportare modifiche in fase di progettazione.
                  </Card.Text>
                  <div className="tech-features">
                    <Badge bg="warning">Tour virtuali</Badge>
                    <Badge bg="warning">Simulazioni realistiche</Badge>
                    <Badge bg="warning">Progettazione interattiva</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <Card className="tech-card">
                <div className="tech-icon">
                  <FontAwesomeIcon icon={['fas', 'chart-line']} />
                </div>
                <Card.Body>
                  <Card.Title>Analisi Dati e IoT</Card.Title>
                  <Card.Text>
                    Implementiamo sensori IoT e sistemi di analisi dati per monitorare le prestazioni degli edifici, ottimizzare i consumi energetici e prevenire problemi di manutenzione.
                  </Card.Text>
                  <div className="tech-features">
                    <Badge bg="danger">Monitoraggio in tempo reale</Badge>
                    <Badge bg="danger">Manutenzione predittiva</Badge>
                    <Badge bg="danger">Ottimizzazione energetica</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <Card className="tech-card">
                <div className="tech-icon">
                  <FontAwesomeIcon icon={['fas', 'shield-alt']} />
                </div>
                <Card.Body>
                  <Card.Title>Sicurezza Avanzata</Card.Title>
                  <Card.Text>
                    Utilizziamo tecnologie avanzate per garantire la massima sicurezza nei cantieri e negli edifici completati, con sistemi di monitoraggio e protezione all'avanguardia.
                  </Card.Text>
                  <div className="tech-features">
                    <Badge bg="secondary">Sistemi anti-intrusione</Badge>
                    <Badge bg="secondary">Monitoraggio strutturale</Badge>
                    <Badge bg="secondary">Protezione sismica</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quality Standards Section */}
      <section className="quality-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <div className="section-header">
                <h2>I Nostri Standard di Qualità</h2>
                <p>
                  La qualità è al centro di ogni nostro progetto. Seguiamo rigorosi standard e processi di controllo per garantire l'eccellenza in ogni fase del lavoro.
                </p>
              </div>
            </Col>
          </Row>

          <Row className="align-items-center mb-5">
            <Col lg={6}>
              <div className="quality-content">
                <h3>Certificazioni e Conformità</h3>
                <p>
                  CSV opera nel pieno rispetto delle normative nazionali e internazionali, con certificazioni che attestano la nostra dedizione alla qualità e alla sicurezza.
                </p>
                <ul className="quality-list">
                  <li>
                    <FontAwesomeIcon icon={['fas', 'certificate']} className="list-icon" />
                    <span>ISO 9001:2015 - Sistema di Gestione della Qualità</span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={['fas', 'certificate']} className="list-icon" />
                    <span>ISO 14001:2015 - Sistema di Gestione Ambientale</span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={['fas', 'certificate']} className="list-icon" />
                    <span>ISO 45001:2018 - Sistema di Gestione della Sicurezza</span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={['fas', 'certificate']} className="list-icon" />
                    <span>SOA - Attestazione di qualificazione all'esecuzione di lavori pubblici</span>
                  </li>
                </ul>
              </div>
            </Col>
            <Col lg={6}>
              <div className="quality-image">
                <img src="../assets/images/technology/certifications.jpg" alt="Certificazioni CSV" className="img-fluid rounded shadow" />
              </div>
            </Col>
          </Row>

          <Row className="align-items-center mb-5 flex-lg-row-reverse">
            <Col lg={6}>
              <div className="quality-content">
                <h3>Controllo Qualità</h3>
                <p>
                  Il nostro processo di controllo qualità è rigoroso e sistematico, con verifiche in ogni fase del progetto per garantire che tutti gli standard siano rispettati.
                </p>
                <div className="quality-metrics">
                  <div className="metric-item">
                    <div className="d-flex justify-content-between">
                      <span>Conformità ai requisiti del cliente</span>
                      <span>98%</span>
                    </div>
                    <ProgressBar variant="success" now={98} className="mb-3" />
                  </div>
                  <div className="metric-item">
                    <div className="d-flex justify-content-between">
                      <span>Rispetto delle tempistiche</span>
                      <span>95%</span>
                    </div>
                    <ProgressBar variant="success" now={95} className="mb-3" />
                  </div>
                  <div className="metric-item">
                    <div className="d-flex justify-content-between">
                      <span>Qualità dei materiali</span>
                      <span>99%</span>
                    </div>
                    <ProgressBar variant="success" now={99} className="mb-3" />
                  </div>
                  <div className="metric-item">
                    <div className="d-flex justify-content-between">
                      <span>Sicurezza sul lavoro</span>
                      <span>100%</span>
                    </div>
                    <ProgressBar variant="success" now={100} />
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="quality-image">
                <img src="../assets/images/technology/quality-control.jpg" alt="Controllo Qualità CSV" className="img-fluid rounded shadow" />
              </div>
            </Col>
          </Row>

          <Row className="align-items-center">
            <Col lg={6}>
              <div className="quality-content">
                <h3>Formazione e Aggiornamento</h3>
                <p>
                  Investiamo costantemente nella formazione del nostro personale per garantire che le competenze e le conoscenze siano sempre aggiornate alle ultime innovazioni del settore.
                </p>
                <ul className="quality-list">
                  <li>
                    <FontAwesomeIcon icon={['fas', 'user-graduate']} className="list-icon" />
                    <span>Programmi di formazione continua per tutti i dipendenti</span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={['fas', 'book']} className="list-icon" />
                    <span>Partecipazione a convegni e fiere di settore</span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={['fas', 'handshake']} className="list-icon" />
                    <span>Collaborazioni con università e centri di ricerca</span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={['fas', 'globe']} className="list-icon" />
                    <span>Aggiornamento costante sulle normative nazionali e internazionali</span>
                  </li>
                </ul>
              </div>
            </Col>
            <Col lg={6}>
              <div className="quality-image">
                <img src={trainingImgUrl} alt="Formazione CSV" className="img-fluid rounded shadow" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Innovation Process */}
      <section className="innovation-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <div className="section-header">
                <h2>Il Nostro Processo di Innovazione</h2>
                <p>
                  L'innovazione è un processo continuo che guida ogni aspetto del nostro lavoro. Ecco come integriamo le nuove tecnologie e metodologie nei nostri progetti.
                </p>
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={3} md={6} className="mb-4">
              <div className="process-card">
                <div className="process-icon">
                  <span>1</span>
                </div>
                <h4>Ricerca</h4>
                <p>Esploriamo costantemente le ultime innovazioni nel settore delle costruzioni e dell'edilizia sostenibile.</p>
              </div>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <div className="process-card">
                <div className="process-icon">
                  <span>2</span>
                </div>
                <h4>Valutazione</h4>
                <p>Analizziamo attentamente ogni nuova tecnologia per determinarne l'efficacia e l'applicabilità ai nostri progetti.</p>
              </div>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <div className="process-card">
                <div className="process-icon">
                  <span>3</span>
                </div>
                <h4>Implementazione</h4>
                <p>Integriamo le tecnologie selezionate nei nostri processi, formando il personale per un utilizzo ottimale.</p>
              </div>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <div className="process-card">
                <div className="process-icon">
                  <span>4</span>
                </div>
                <h4>Miglioramento</h4>
                <p>Monitoriamo e ottimizziamo continuamente l'uso delle tecnologie per garantire i migliori risultati possibili.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <div className="cta-content">
                <h2>Scopri l'Eccellenza Tecnologica</h2>
                <p>Vuoi saperne di più su come le nostre tecnologie e i nostri standard di qualità possono fare la differenza nel tuo progetto? Contattaci per una consulenza personalizzata.</p>
                <Link to="/contatti" className="btn btn-primary btn-lg mt-4">Richiedi Informazioni</Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default TecnologiaQualita;
