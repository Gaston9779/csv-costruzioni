import React from 'react';
import { Container, Row, Col, Button, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../components/common/PageHeader';
import './ChiSiamo.css';

// Immagini Unsplash per sostituire quelle mancanti
const aboutMainImageUrl = "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
const historyImageUrl = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
const teamMember1Url = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80";
const teamMember2Url = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80";
const teamMember3Url = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80";
const teamMember4Url = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80";

const ChiSiamo = () => {
  // Dati per i valori aziendali
  const valoriAziendali = [
    {
      id: 1,
      icon: 'medal',
      title: 'Qualità',
      description: 'Utilizziamo solo materiali di prima scelta e tecniche costruttive all\'avanguardia per garantire risultati eccellenti.'
    },
    {
      id: 2,
      icon: 'handshake',
      title: 'Affidabilità',
      description: 'Rispettiamo sempre gli impegni presi, garantendo il completamento dei progetti nei tempi e nei costi stabiliti.'
    },
    {
      id: 3,
      icon: 'leaf',
      title: 'Sostenibilità',
      description: 'Adottiamo soluzioni eco-sostenibili per ridurre l\'impatto ambientale delle nostre costruzioni e garantire efficienza energetica.'
    },
    {
      id: 4,
      icon: 'users',
      title: 'Collaborazione',
      description: 'Lavoriamo a stretto contatto con i nostri clienti, ascoltando le loro esigenze e trasformandole in realtà.'
    }
  ];

  // Dati per le competenze
  const competenze = [
    { id: 1, name: 'Edilizia Residenziale', percentage: 95 },
    { id: 2, name: 'Edilizia Commerciale', percentage: 90 },
    { id: 3, name: 'Edilizia Direzionale', percentage: 85 },
    { id: 4, name: 'Edilizia Produttiva', percentage: 88 },
    { id: 5, name: 'Efficienza Energetica', percentage: 92 }
  ];

  // Dati per il team
  const teamMembers = [
    {
      id: 1,
      name: 'Graziano Viola',
      position: 'CEO & Fondatore',
      image: teamMember1Url,
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        facebook: 'https://facebook.com'
      }
    },
    {
      id: 2,
      name: 'Riccardo Viola',
      position: 'Direttore Tecnico',
      image: teamMember2Url,
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        facebook: 'https://facebook.com'
      }
    },
    {
      id: 3,
      name: 'Paolo Rossi',
      position: 'Responsabile Progetti',
      image: teamMember3Url,
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        facebook: 'https://facebook.com'
      }
    },
    {
      id: 4,
      name: 'Giulia Verdi',
      position: 'Architetto Senior',
      image: teamMember4Url,
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        facebook: 'https://facebook.com'
      }
    }
  ];

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Chi Siamo"
        backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />

      {/* About Main Section */}
      <section style={{ marginTop: 100 }} className="about-main-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <div className="about-main-image">
                <img src={aboutMainImageUrl} alt="CSV Sede" className="img-fluid" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="about-main-content">
                <div style={{ marginBottom: 0 }} className="section-header text-start">
                  <h2>CSV</h2>
                </div>
                <p className="lead">
                  Da oltre 30 anni realizziamo costruzioni di alta qualità, mettendo al centro le esigenze del cliente e il rispetto per l'ambiente.
                </p>
                <p>
                  Soddisfare il cliente è il nostro obiettivo principale e ci dà la ragione di esistere. Costruiamo case in muratura di alta qualità e offriamo ai nostri clienti assistenza e consulenza completa. Il nostro impegno è il risparmio di energia e il rispetto per l'ambiente. Per questo motivo, per la realizzazione delle nostre costruzioni, puntiamo sulla qualità.
                </p>
                <p>
                  Operiamo nei settori residenziale, commerciale, direzionale e produttivo, garantendo sempre la massima professionalità e attenzione ai dettagli.
                </p>
                <Button as={Link} to="/contatti" variant="primary" className="mt-1">Contattaci</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <Container>
          <div className="section-header">
            <h2>I Nostri Valori</h2>
            <p>Principi che guidano ogni nostro progetto</p>
          </div>
          <Row>
            {valoriAziendali.map(valore => (
              <Col md={6} lg={3} key={valore.id} className="mb-4">
                <div className="value-card">
                  <div className="value-icon">
                    <FontAwesomeIcon icon={['fas', valore.icon]} />
                  </div>
                  <h3>{valore.title}</h3>
                  <p>{valore.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* History Section */}
      <section className="history-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="order-lg-2 mb-5 mb-lg-0">
              <div className="history-image">
                <img src={historyImageUrl} alt="Storia di CSV" className="img-fluid" />
              </div>
            </Col>
            <Col lg={6} className="order-lg-1">
              <div className="history-content">
                <div className="section-header text-start">
                  <h2>La Nostra Storia</h2>
                </div>
                <p className="lead">
                  Un percorso di crescita e innovazione nel settore delle costruzioni.
                </p>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h4>1964</h4>
                      <p>Nasce nel 1964 dalla grande forza di volontà del fondatore Viola Pio ,
                        affiancato dalla moglie Zontini Adelia, che hanno sempre saputo
                        interpretare in anticipo l&#39;evoluzione del mercato immobiliare coinvolgendo
                        e trasmettendo lo stesso entusiasmo ai propri collaboratori, i quali hanno
                        contribuito in modo significativo alla crescita dell&#39;azienda.</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h4>1987</h4>
                      <p>I figli Graziano e Gianluca proseguono con l’attività.</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h4>2000</h4>
                      <p>CsV nasce per costruire edifici a basso consumo energetico.</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h4>Oggi</h4>
                      <p>CSV è un'azienda leader che opera in tutta Italia con progetti in ambito residenziale, commerciale, direzionale e produttivo.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Skills Section */}
      <section className="skills-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={5} className="mb-5 mb-lg-0">
              <div className="skills-content">
                <div className="section-header text-start">
                  <h2>Le Nostre Competenze</h2>
                </div>
                <p>
                  Grazie alla nostra esperienza pluridecennale e al continuo aggiornamento professionale, abbiamo sviluppato competenze specialistiche in diversi ambiti del settore edile. Il nostro team di professionisti è in grado di affrontare progetti di ogni complessità, garantendo sempre risultati eccellenti e massima efficienza energetica.
                </p>
                <Button as={Link} to="/progetti" variant="primary" className="mt-4">Visualizza i Nostri Progetti</Button>
              </div>
            </Col>
            <Col lg={7}>
              <div className="skills-bars">
                {competenze.map(skill => (
                  <div className="skill-item" key={skill.id}>
                    <div className="skill-info">
                      <h5>{skill.name}</h5>
                      <span>{skill.percentage}%</span>
                    </div>
                    <ProgressBar now={skill.percentage} variant="warning" />
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <Container>
          <div className="section-header">
            <h2>Il Nostro Team</h2>
            <p>Professionisti qualificati che rendono possibile ogni progetto</p>
          </div>
          <Row>
            {teamMembers.map(member => (
              <Col md={6} lg={3} key={member.id} className="mb-4">
                <div className="team-card">
                  <div className="team-image">
                    <img src={member.image} alt={member.name} className="img-fluid" />
                    <div className="team-social">
                      <a href={member.social.facebook} target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={['fab', 'facebook-f']} />
                      </a>
                      <a href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={['fab', 'twitter']} />
                      </a>
                      <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={['fab', 'linkedin-in']} />
                      </a>
                    </div>
                  </div>
                  <div className="team-info">
                    <h4>{member.name}</h4>
                    <p>{member.position}</p>
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
              <div className="cta-content">
                <h2>Vuoi Lavorare con Noi?</h2>
                <p>Siamo sempre alla ricerca di talenti da aggiungere al nostro team. Inviaci il tuo curriculum e scopri le opportunità disponibili.</p>
                <Button as={Link} to="/contatti" variant="primary" size="lg" className="mt-4">Contattaci</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default ChiSiamo;
