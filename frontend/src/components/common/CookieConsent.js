import React, { useState, useEffect } from 'react';
import { Modal, Button, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite, faTimes } from '@fortawesome/free-solid-svg-icons';
import './CookieConsent.css';

const CookieConsent = () => {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Controlla se l'utente ha già accettato i cookie
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Mostra il banner dopo un breve ritardo per migliorare l'esperienza utente
      const timer = setTimeout(() => {
        setShow(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Salva il consenso nei cookie per un anno
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    setShow(false);
  };

  const handleDecline = () => {
    // Salva solo i cookie essenziali
    localStorage.setItem('cookieConsent', 'essential');
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    setShow(false);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (!show) return null;

  return (
    <>
      <div className="cookie-banner">
        <Container>
          <Row className="align-items-center">
            <Col xs={12} md={8}>
              <div className="cookie-content">
                <div className="cookie-icon">
                  <FontAwesomeIcon icon={faCookieBite} />
                </div>
                <div className="cookie-text">
                  <h5>Utilizziamo i cookie</h5>
                  <p>
                    Questo sito utilizza cookie tecnici e di profilazione per migliorare la tua esperienza di navigazione. 
                    Continuando a navigare acconsenti all'utilizzo dei cookie.
                  </p>
                </div>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="cookie-actions">
                <Button variant="link" onClick={toggleDetails} className="details-link">
                  Dettagli
                </Button>
                <Button variant="outline-secondary" onClick={handleDecline} className="mx-2">
                  Solo essenziali
                </Button>
                <Button variant="primary" onClick={handleAccept}>
                  Accetta tutti
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal 
        show={showDetails} 
        onHide={toggleDetails}
        size="lg"
        centered
        className="cookie-details-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Informativa sui Cookie</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Cosa sono i cookie?</h5>
          <p>
            I cookie sono piccoli file di testo che i siti visitati dagli utenti inviano ai loro terminali, 
            dove vengono memorizzati per essere poi ritrasmessi agli stessi siti in occasione di visite successive. 
            I cookie sono utilizzati per diverse finalità, hanno caratteristiche diverse, e possono essere utilizzati 
            sia dal titolare del sito che si sta visitando, sia da terze parti.
          </p>

          <h5>Tipologie di cookie utilizzati</h5>
          
          <h6>Cookie tecnici essenziali</h6>
          <p>
            Questi cookie sono necessari per il corretto funzionamento del sito e non possono essere disattivati. 
            Solitamente vengono impostati solo in risposta ad azioni da te effettuate che costituiscono una richiesta 
            di servizi, come l'impostazione delle preferenze di privacy, l'accesso o la compilazione di moduli. 
            Puoi impostare il tuo browser per bloccare o avere avvisi riguardo questi cookie, ma alcune parti del 
            sito potrebbero non funzionare correttamente.
          </p>

          <h6>Cookie analitici</h6>
          <p>
            Questi cookie ci permettono di contare le visite e le fonti di traffico in modo da poter misurare e 
            migliorare le prestazioni del nostro sito. Ci aiutano a sapere quali sono le pagine più e meno popolari 
            e vedere come i visitatori si muovono nel sito. Tutte le informazioni raccolte da questi cookie sono 
            aggregate e quindi anonime.
          </p>

          <h6>Cookie di marketing</h6>
          <p>
            Questi cookie possono essere impostati tramite il nostro sito dai nostri partner pubblicitari. 
            Possono essere utilizzati da queste aziende per costruire un profilo dei tuoi interessi e mostrarti 
            annunci pertinenti su altri siti. Non memorizzano direttamente informazioni personali, ma sono basati 
            sull'identificazione univoca del tuo browser e dispositivo internet.
          </p>

          <h5>Come gestire i cookie</h5>
          <p>
            Puoi accettare o rifiutare i cookie attraverso il nostro banner dei cookie. Inoltre, puoi modificare 
            le impostazioni del tuo browser per bloccare o eliminare i cookie. Tieni presente che bloccare alcuni 
            tipi di cookie potrebbe influire sulla tua esperienza sul sito e sui servizi che siamo in grado di offrire.
          </p>

          <h5>Titolare del trattamento</h5>
          <p>
            CSV Costruzioni S.r.l.<br />
            Via Roma, 123<br />
            00100 Roma (RM)<br />
            Email: privacy@csvcostruzioni.it
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleDetails}>
            Chiudi
          </Button>
          <Button variant="outline-secondary" onClick={handleDecline}>
            Solo essenziali
          </Button>
          <Button variant="primary" onClick={handleAccept}>
            Accetta tutti
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CookieConsent;
