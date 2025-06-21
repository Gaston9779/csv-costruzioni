import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faPhoneAlt, faEnvelope, faDirections } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../components/common/PageHeader';
import './Contatti.css';

const Contatti = () => {
  // Stati per il form
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefono: '',
    oggetto: '',
    messaggio: '',
    privacy: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Gestione cambiamento input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Gestione invio form
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } else {
      // Qui andrebbe l'invio effettivo del form a un backend
      console.log('Form in2to:', formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      // Reset del form
      setFormData({
        nome: '',
        email: '',
        telefono: '',
        oggetto: '',
        messaggio: '',
        privacy: false
      });
      setValidated(false);
      return;
    }
    
    setValidated(true);
  };

  return (
    <>
      {/* Page Header */}
      <PageHeader 
        title="Contatti" 
        backgroundImage="https://images.unsplash.com/photo-1560264280-88b68371db39?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
      />

      {/* Contact Info Section */}
      <section className="contact-info-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <div className="section-header">
                <h2>Come Contattarci</h2>
                <p className="lead">
                  Siamo sempre disponibili per rispondere alle tue domande e discutere del tuo prossimo progetto.
                </p>
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={4} md={6} className="mb-4">
              <div className="contact-card">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <h3>Sede Principale</h3>
                <p>Via della Zarga, 42<br />38015 Lavis, Trento<br />Italia</p>
                <a href="https://maps.google.com/?q=46.144508999729936, 11.09425082732318" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                  <FontAwesomeIcon icon={faDirections} className="me-2" />
                  Indicazioni
                </a>
              </div>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <div className="contact-card">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={faPhoneAlt} />
                </div>
                <h3>Telefono</h3>
                <p>Ufficio: +39 0461 246541<br />Fax: +39 0461 246541</p>
                <a href="tel:+390461246541" className="btn btn-outline-primary btn-sm">
                  <FontAwesomeIcon icon={faPhone} className="me-2" />
                  Chiama Ora
                </a>
              </div>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <div className="contact-card">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <h3>Email</h3>
                <p>Info: csv@costruzioneviola.it<br />Preventivi: preventivi@costruzioneviola.it<br />Supporto: supporto@costruzioneviola.it</p>
                <a href="mailto:csv@costruzioneviola.it" className="btn btn-outline-primary btn-sm">
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                  Invia Email
                </a>
              </div>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col lg={4} md={6} className="mb-4">
              <div className="contact-card">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={['fas', 'clock']} />
                </div>
                <h3>Orari di Apertura</h3>
                <ul className="hours-list">
                  <li>
                    <span>Lunedì - Venerdì:</span>
                    <span>8:30 - 18:00</span>
                  </li>
                  
                  <li>
                    <span>Sabato-Domenica:</span>
                    <span>Chiuso</span>
                  </li>
                </ul>
              </div>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <div className="contact-card">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={['fas', 'building']} />
                </div>
                <h3>Ufficio Tecnico</h3>
                <p>Via della Zarga, 42<br />38015 Lavis, Trento<br />Italia</p>
                <p>Tel: +39 02 9876543<br />Email: tecnico@costruzioneviola.it</p>
              </div>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <div className="contact-card">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={['fas', 'users']} />
                </div>
                <h3>Social Media</h3>
                <div className="social-links">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FontAwesomeIcon icon={['fab', 'facebook-f']} />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FontAwesomeIcon icon={['fab', 'twitter']} />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FontAwesomeIcon icon={['fab', 'instagram']} />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FontAwesomeIcon icon={['fab', 'linkedin-in']} />
                  </a>
                </div>
                <p className="mt-3">Seguici sui social per rimanere aggiornato sulle nostre ultime novità e progetti.</p>
              </div>
            </Col>
          </Row>

          {/* Mappa */}
          <Row className="mt-5">
            <Col lg={12}>
              <div className="contact-map">
                <h3 className="text-center mb-4">La Nostra Sede</h3>
                <div className="map-container">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2766.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4782769d0b5f3c15%3A0x3a0d6f4c5d5b9e3a!2sVia%20della%20Zarga%2C%2042%2C%2038015%20Lavis%20TN!5e0!3m2!1sit!2sit!4v1622824292951!5m2!1sit!2sit" 
                    width="100%" 
                    height="450" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy"
                    title="Mappa sede CSV">
                  </iframe>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <div className="section-header">
                <h2>Inviaci un Messaggio</h2>
                <p>
                  Compila il modulo sottostante per inviarci una richiesta di informazioni. Ti risponderemo nel più breve tempo possibile.
                </p>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={8}>
              {showSuccess && (
                <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
                  <Alert.Heading>Messaggio inviato con successo!</Alert.Heading>
                  <p>
                    Grazie per averci contattato. Un membro del nostro team ti risponderà al più presto.
                  </p>
                </Alert>
              )}

              {showError && (
                <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
                  <Alert.Heading>Errore nell'invio del messaggio</Alert.Heading>
                  <p>
                    Si prega di verificare che tutti i campi siano stati compilati correttamente.
                  </p>
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit} className="contact-form">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="formNome">
                      <Form.Label>Nome e Cognome *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                        placeholder="Inserisci il tuo nome e cognome"
                      />
                      <Form.Control.Feedback type="invalid">
                        Per favore inserisci il tuo nome e cognome.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="formEmail">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Inserisci la tua email"
                      />
                      <Form.Control.Feedback type="invalid">
                        Per favore inserisci un indirizzo email valido.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="formTelefono">
                      <Form.Label>Telefono</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="Inserisci il tuo numero di telefono"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="formOggetto">
                      <Form.Label>Oggetto *</Form.Label>
                      <Form.Control
                        type="text"
                        name="oggetto"
                        value={formData.oggetto}
                        onChange={handleInputChange}
                        required
                        placeholder="Oggetto del messaggio"
                      />
                      <Form.Control.Feedback type="invalid">
                        Per favore inserisci l'oggetto del messaggio.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4" controlId="formMessaggio">
                  <Form.Label>Messaggio *</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="messaggio"
                    value={formData.messaggio}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    placeholder="Scrivi qui il tuo messaggio"
                  />
                  <Form.Control.Feedback type="invalid">
                    Per favore inserisci il tuo messaggio.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPrivacy">
                  <Form.Check
                    type="checkbox"
                    name="privacy"
                    checked={formData.privacy}
                    onChange={handleInputChange}
                    required
                    label={
                      <span>
                        Ho letto e accetto la <Link to="/privacy-policy">Privacy Policy</Link> *
                      </span>
                    }
                    feedback="Devi accettare la privacy policy per continuare."
                    feedbackType="invalid"
                  />
                </Form.Group>

                <div className="text-center">
                  <Button variant="primary" type="submit" size="lg">
                    <FontAwesomeIcon icon={faDirections} className="me-2" />
                    Invia Messaggio
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <div className="section-header">
                <h2>Domande Frequenti</h2>
                <p>
                  Ecco alcune delle domande più frequenti che riceviamo. Se non trovi la risposta che stai cercando, non esitare a contattarci direttamente.
                </p>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingOne">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                      Quali sono i tempi medi di realizzazione di un progetto?
                    </button>
                  </h2>
                  <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      I tempi di realizzazione variano in base alla complessità e alle dimensioni del progetto. Per una ristrutturazione di un appartamento standard, i tempi medi sono di 2-3 mesi. Per progetti più complessi come edifici commerciali o industriali, i tempi possono variare da 6 mesi a 2 anni. Durante il preventivo, forniamo sempre una stima dettagliata dei tempi necessari per completare il lavoro.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingTwo">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                      Come viene calcolato il preventivo per un progetto?
                    </button>
                  </h2>
                  <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Il preventivo viene calcolato considerando diversi fattori: materiali necessari, manodopera, tempi di realizzazione, complessità del progetto e specifiche tecniche richieste. Effettuiamo sempre un sopralluogo gratuito per valutare con precisione tutti gli aspetti del lavoro. Il preventivo che forniamo è dettagliato e trasparente, senza costi nascosti.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingThree">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                      Offrite garanzie sui lavori eseguiti?
                    </button>
                  </h2>
                  <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Sì, tutti i nostri lavori sono coperti da garanzie come previsto dalla legge. Offriamo una garanzia di 10 anni sulle opere strutturali e di 2 anni su tutti gli altri interventi. Inoltre, utilizziamo solo materiali certificati e di qualità che dispongono delle proprie garanzie del produttore. La nostra azienda è assicurata per responsabilità civile per garantire la massima tranquillità ai nostri clienti.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingFour">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                      Gestite anche le pratiche burocratiche e i permessi?
                    </button>
                  </h2>
                  <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Sì, offriamo un servizio completo che include la gestione di tutte le pratiche burocratiche e l'ottenimento dei permessi necessari. Il nostro team di professionisti si occupa di preparare e presentare tutta la documentazione richiesta agli enti competenti, seguendo l'iter fino all'approvazione. Questo servizio è incluso nei nostri progetti chiavi in mano, ma può essere richiesto anche separatamente.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingFive">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                      È possibile visitare cantieri o progetti completati?
                    </button>
                  </h2>
                  <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Certamente! Organizziamo regolarmente visite ai nostri cantieri in corso e ai progetti completati, previo appuntamento. Questo permette ai potenziali clienti di vedere direttamente la qualità del nostro lavoro e di parlare con il nostro team sul campo. Inoltre, nella sezione Progetti del nostro sito web, è possibile visualizzare il portfolio completo dei nostri lavori con foto e descrizioni dettagliate.
                    </div>
                  </div>
                </div>
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
                <h2>Pronto a Realizzare il Tuo Progetto?</h2>
                <p>Siamo qui per trasformare le tue idee in realtà. Contattaci oggi stesso per una consulenza gratuita e senza impegno.</p>
                <div className="cta-buttons mt-4">
                  <a href="tel:+390461246541" className="btn btn-primary btn-lg me-3 mb-3 mb-md-0">
                    <FontAwesomeIcon icon={faPhone} className="me-2" />
                    Chiama Ora
                  </a>
                  <a href="mailto:csv@costruzioneviola.it" className="btn btn-outline-light btn-lg">
                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                    Invia Email
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Contatti;
