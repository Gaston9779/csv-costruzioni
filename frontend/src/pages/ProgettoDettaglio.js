import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../components/common/PageHeader';
import './ProgettoDettaglio.css';

const ProgettoDettaglio = () => {
  const { slug } = useParams();
  const [progetto, setProgetto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progettiCorrelati, setProgettiCorrelati] = useState([]);

  // Database dei progetti (in un'app reale questo verrebbe da un'API o CMS)
  const progetti = [
    {
      id: 1,
      title: 'Villa Moderna a Milano',
      slug: 'villa-moderna-milano',
      categoria: 'residenziale',
      anno: '2022',
      cliente: 'Famiglia Rossi',
      location: 'Milano, Italia',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      descrizioneBreve: 'Villa moderna con design minimalista e soluzioni energetiche all\'avanguardia.',
      descrizioneCompleta: 'Questa villa moderna situata in una zona residenziale di Milano rappresenta un perfetto esempio di architettura contemporanea. Il progetto ha richiesto particolare attenzione all\'efficienza energetica e alla sostenibilità, con l\'installazione di pannelli solari, sistemi di recupero dell\'acqua piovana e materiali eco-sostenibili. Gli interni sono caratterizzati da ampi spazi aperti, grandi vetrate che massimizzano la luce naturale e un design minimalista che enfatizza la funzionalità senza sacrificare l\'estetica.',
      caratteristiche: [
        'Superficie: 350 mq',
        'Classe energetica: A4',
        'Giardino privato di 500 mq',
        'Piscina a sfioro',
        'Domotica integrata',
        'Sistema di riscaldamento a pavimento',
        'Impianto fotovoltaico da 6 kW'
      ],
      sfide: 'La principale sfida di questo progetto è stata l\'integrazione di tecnologie sostenibili in un design architettonico moderno e minimalista, mantenendo al contempo un elevato livello di comfort abitativo. La conformazione del terreno ha richiesto soluzioni ingegneristiche innovative per massimizzare l\'esposizione solare e la vista panoramica.',
      soluzioni: 'Abbiamo adottato un approccio integrato, collaborando strettamente con esperti di efficienza energetica fin dalle prime fasi di progettazione. La struttura è stata orientata per massimizzare l\'esposizione solare, con ampie vetrate a sud protette da sistemi di ombreggiatura automatizzati. I materiali sono stati selezionati per le loro proprietà isolanti e la loro sostenibilità ambientale.'
    },
    {
      id: 2,
      title: 'Complesso Residenziale Roma',
      slug: 'complesso-residenziale-roma',
      categoria: 'residenziale',
      anno: '2021',
      cliente: 'Immobiliare Aurora',
      location: 'Roma, Italia',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1460317442991-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1503174971373-b6d6ba609f9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      descrizioneBreve: 'Complesso di 30 appartamenti con aree comuni e giardini pensili.',
      descrizioneCompleta: 'Il complesso residenziale situato nella periferia di Roma è composto da 30 unità abitative di varie metrature, dal monolocale all\'appartamento con quattro camere. Il progetto si distingue per l\'attenzione agli spazi comuni, con un ampio giardino centrale, aree gioco per bambini e una zona fitness condivisa. Particolare attenzione è stata dedicata alla sostenibilità, con l\'implementazione di sistemi di raccolta dell\'acqua piovana, pannelli solari e materiali a basso impatto ambientale.',
      caratteristiche: [
        'Superficie totale: 5.000 mq',
        '30 unità abitative di diverse metrature',
        'Classe energetica: A',
        'Giardino comune di 1.000 mq',
        'Area fitness condivisa',
        'Parcheggio sotterraneo',
        'Sistemi di sicurezza integrati'
      ],
      sfide: 'La sfida principale è stata quella di creare un complesso residenziale che offrisse privacy e comfort ai residenti, mantenendo al contempo un forte senso di comunità. Inoltre, il progetto doveva rispettare rigorosi standard di efficienza energetica e sostenibilità ambientale.',
      soluzioni: 'Abbiamo progettato il complesso attorno a un giardino centrale che funge da cuore della comunità, con percorsi pedonali che collegano le diverse aree comuni. Ogni appartamento è stato progettato per massimizzare la privacy e l\'esposizione solare, con balconi e terrazze che si affacciano sugli spazi verdi. L\'utilizzo di materiali fonoassorbenti ha garantito un elevato comfort acustico.'
    },
    {
      id: 3,
      title: 'Uffici Direzionali Milano',
      slug: 'uffici-direzionali-milano',
      categoria: 'commerciale',
      anno: '2023',
      cliente: 'Tech Solutions SpA',
      location: 'Milano, Italia',
      image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1577760258779-dbb63a35d8cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      descrizioneBreve: 'Uffici direzionali con design innovativo e tecnologie avanzate.',
      descrizioneCompleta: 'Il progetto di uffici direzionali per Tech Solutions SpA a Milano rappresenta un esempio di come l\'innovazione e la tecnologia possano essere integrate in un ambiente di lavoro. Il design degli spazi è stato pensato per favorire la collaborazione e la creatività, con aree comuni e spazi di lavoro flessibili. La struttura è stata progettata per massimizzare l\'esposizione solare e la vista panoramica sulla città.',
      caratteristiche: [
        'Superficie: 2.500 mq',
        '3 piani di uffici',
        'Sala riunioni con tecnologie avanzate',
        'Aree comuni e spazi di lavoro flessibili',
        'Sistema di riscaldamento e raffreddamento a pavimento',
        'Impianto fotovoltaico da 10 kW'
      ],
      sfide: 'La principale sfida di questo progetto è stata quella di creare un ambiente di lavoro innovativo e tecnologicamente avanzato, mantenendo al contempo un elevato livello di comfort e sostenibilità.',
      soluzioni: 'Abbiamo adottato un approccio integrato, collaborando strettamente con gli esperti di tecnologia e sostenibilità. La struttura è stata progettata per massimizzare l\'esposizione solare e la vista panoramica, con ampie vetrate e un sistema di ombreggiatura automatizzato. I materiali sono stati selezionati per le loro proprietà isolanti e la loro sostenibilità ambientale.'
    },
    {
      id: 4,
      title: 'Capannone Produttivo Torino',
      slug: 'capannone-Produttivo-torino',
      categoria: 'Produttivo',
      anno: '2020',
      cliente: 'Industrial Manufacturing srl',
      location: 'Torino, Italia',
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1471039497385-b6d6ba609f9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      descrizioneBreve: 'Capannone Produttivo con superficie di 10.000 mq.',
      descrizioneCompleta: 'Il capannone Produttivo per Industrial Manufacturing srl a Torino rappresenta un esempio di come la tecnologia e l\'innovazione possano essere integrate in un ambiente Produttivo. La struttura è stata progettata per massimizzare l\'efficienza e la produttività, con aree di lavoro flessibili e un sistema di gestione della produzione avanzato.',
      caratteristiche: [
        'Superficie: 10.000 mq',
        'Altezza: 10 metri',
        'Sistema di riscaldamento e raffreddamento a pavimento',
        'Impianto fotovoltaico da 20 kW',
        'Sistema di gestione della produzione avanzato',
        'Aree di lavoro flessibili'
      ],
      sfide: 'La principale sfida di questo progetto è stata quella di creare un ambiente Produttivo efficiente e produttivo, mantenendo al contempo un elevato livello di comfort e sostenibilità.',
      soluzioni: 'Abbiamo adottato un approccio integrato, collaborando strettamente con gli esperti di tecnologia e sostenibilità. La struttura è stata progettata per massimizzare l\'esposizione solare e la vista panoramica, con ampie vetrate e un sistema di ombreggiatura automatizzato. I materiali sono stati selezionati per le loro proprietà isolanti e la loro sostenibilità ambientale.'
    },
    {
      id: 5,
      title: 'Ristrutturazione Palazzo Storico',
      slug: 'ristrutturazione-palazzo-storico',
      categoria: 'ristrutturazione',
      anno: '2019',
      cliente: 'Fondazione Cultura Italia',
      location: 'Firenze, Italia',
      image: 'https://images.unsplash.com/photo-1574359411659-8be10a358a53?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1542621334-a254cf47733d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1581360645548-6709220633e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      descrizioneBreve: 'Ristrutturazione di un palazzo storico del XVIII secolo.',
      descrizioneCompleta: 'Il progetto di ristrutturazione del palazzo storico per Fondazione Cultura Italia a Firenze rappresenta un esempio di come la conservazione e il restauro possano essere integrati in un progetto di ristrutturazione. La struttura è stata progettata per massimizzare la conservazione degli elementi storici, con un sistema di restauro avanzato e un approccio sostenibile.',
      caratteristiche: [
        'Superficie: 5.000 mq',
        'Altezza: 15 metri',
        'Sistema di riscaldamento e raffreddamento a pavimento',
        'Impianto fotovoltaico da 10 kW',
        'Sistema di gestione della produzione avanzato',
        'Aree di lavoro flessibili'
      ],
      sfide: 'La principale sfida di questo progetto è stata quella di creare un ambiente storico e culturale, mantenendo al contempo un elevato livello di comfort e sostenibilità.',
      soluzioni: 'Abbiamo adottato un approccio integrato, collaborando strettamente con gli esperti di conservazione e restauro. La struttura è stata progettata per massimizzare la conservazione degli elementi storici, con un sistema di restauro avanzato e un approccio sostenibile.'
    }
  ];

  useEffect(() => {
    // Simuliamo il caricamento dei dati da un'API
    setLoading(true);
    
    // Trova il progetto corrispondente allo slug nell'URL
    const progettoTrovato = progetti.find(p => p.slug === slug);
    
    if (progettoTrovato) {
      setProgetto(progettoTrovato);
      
      // Trova progetti correlati (stessa categoria, ma non lo stesso progetto)
      const correlati = progetti
        .filter(p => p.categoria === progettoTrovato.categoria && p.id !== progettoTrovato.id)
        .slice(0, 3); // Prendi solo i primi 3 progetti correlati
        console.log(correlati, progettoTrovato,'trov')
      setProgettiCorrelati(correlati);
    }
    
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
        <p className="mt-3">Caricamento del progetto...</p>
      </Container>
    );
  }

  if (!progetto) {
    return (
      <Container className="py-5 text-center">
        <h2>Progetto non trovato</h2>
        <p>Il progetto che stai cercando non esiste o è stato rimosso.</p>
        <Link to="/progetti" className="btn btn-primary mt-3">Torna ai Progetti</Link>
      </Container>
    );
  }

  return (
    <>
      {/* Page Header */}
      <PageHeader 
        title={progetto.title} 
        backgroundImage={progetto.image} 
      />

      {/* Project Overview */}
      <section className="project-overview">
        <Container>
          <Row>
            <Col lg={8}>
              <div className="project-gallery">
                <div className="main-image">
                  <img src={progetto.image} alt={progetto.title} className="img-fluid" />
                  <div className="project-category">{progetto.categoria}</div>
                </div>
                <Row className="gallery-thumbnails mt-4">
                  {progetto.galleryImages && progetto.galleryImages.map((img, index) => (
                    <Col md={4} key={index} className="mb-4">
                      <div className="thumbnail">
                        <img src={img} alt={`${progetto.title} - Immagine ${index + 1}`} className="img-fluid" />
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>
            <Col lg={4}>
              <div className="project-info">
                <h2>Informazioni Progetto</h2>
                <div className="info-item">
                  <h3>Cliente</h3>
                  <p>{progetto.cliente}</p>
                </div>
                <div className="info-item">
                  <h3>Località</h3>
                  <p>{progetto.location}</p>
                </div>
                <div className="info-item">
                  <h3>Anno</h3>
                  <p>{progetto.anno}</p>
                </div>
                <div className="info-item">
                  <h3>Categoria</h3>
                  <p>
                    <Badge bg="primary">{progetto.categoria}</Badge>
                  </p>
                </div>
                <div className="cta-buttons mt-4">
                  <Link to="/contatti" className="btn btn-primary w-100 mb-3">
                    Richiedi Informazioni
                  </Link>
                  <Button variant="outline-primary" className="w-100">
                    <FontAwesomeIcon icon={['fas', 'download']} className="me-2" />
                    Scarica Brochure
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Project Description */}
      <section className="project-description">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="description-content">
                <h2>Descrizione del Progetto</h2>
                <p className="lead">{progetto.descrizioneBreve}</p>
                <p>{progetto.descrizioneCompleta}</p>
              </div>
            </Col>
          </Row>

          <Row className="mt-5">
            <Col lg={6}>
              <div className="project-features">
                <h3>Caratteristiche</h3>
                <ul className="features-list">
                  {progetto.caratteristiche && progetto.caratteristiche.map((feature, index) => (
                    <li key={index}>
                      <FontAwesomeIcon icon={['fas', 'check-circle']} className="feature-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
            <Col lg={6}>
              <div className="project-challenges">
                <h3>Sfide e Soluzioni</h3>
                <div className="challenge-item">
                  <h4>Le Sfide</h4>
                  <p>{progetto.sfide}</p>
                </div>
                <div className="challenge-item">
                  <h4>Le Nostre Soluzioni</h4>
                  <p>{progetto.soluzioni}</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Related Projects */}
      {progettiCorrelati.length > 0 && (
        <section className="related-projects">
          <Container>
            <div className="section-header text-center">
              <h2>Progetti Correlati</h2>
              <p>Esplora altri progetti simili realizzati da CSV</p>
            </div>
            <Row>
              {progettiCorrelati.map((progetto) => (
                <Col lg={4} md={6} key={progetto.id} className="mb-4">
                  <Card className="project-card h-100">
                    <div className="project-image">
                      <Card.Img variant="top" src={progetto.image} alt={progetto.title} />
                      <div className="project-overlay">
                        <Link to={`/progetti/${progetto.slug}`} className="btn btn-light">
                          Vedi Dettagli
                        </Link>
                      </div>
                      <div className="project-category">{progetto.categoria}</div>
                    </div>
                    <Card.Body>
                      <Card.Title>{progetto.title}</Card.Title>
                      <Card.Text>{progetto.descrizioneBreve}</Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <Link to={`/progetti/${progetto.slug}`} className="btn btn-outline-primary btn-block">
                        Scopri di più
                      </Link>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <div className="cta-content">
                <h2>Hai un Progetto in Mente?</h2>
                <p>Contattaci per una consulenza gratuita e senza impegno. Il nostro team è pronto ad ascoltare le tue esigenze e a trovare la soluzione più adatta.</p>
                <div className="cta-buttons">
                  <Link to="/contatti" className="btn btn-primary btn-lg me-3">Richiedi Preventivo</Link>
                  <Link to="/servizi" className="btn btn-outline-light btn-lg">Esplora i Servizi</Link>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default ProgettoDettaglio;
