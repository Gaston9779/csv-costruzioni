import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <div className="footer-info">
              <h2 className="text-white mb-3">CSV</h2>
              <p>
                CSV u00e8 un'azienda edile specializzata nella realizzazione di edifici residenziali, 
                commerciali, direzionali e produttivi di alta qualitu00e0.
              </p>
              <div className="social-links">
                <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={['fab', 'facebook-f']} />
                </a>
                <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={['fab', 'instagram']} />
                </a>
                <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={['fab', 'linkedin-in']} />
                </a>
              </div>
            </div>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <div className="footer-links">
              <h3>Link Rapidi</h3>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/chi-siamo">Chi Siamo</Link></li>
                <li><Link to="/servizi/residenziale">Servizi</Link></li>
                <li><Link to="/progetti">Progetti</Link></li>
                <li><Link to="/tecnologia-qualita">Tecnologia e Qualitu00e0</Link></li>
                <li><Link to="/contatti">Contatti</Link></li>
                <li><Link to="/area-clienti">Area Clienti</Link></li>
              </ul>
            </div>
          </Col>
          <Col md={4}>
            <div className="footer-contact">
              <h3>Contatti</h3>
              <p>
                <FontAwesomeIcon icon={['fas', 'map-marker-alt']} />
                <span>Via della Zarga 42, 3801, Lavis TN</span>
              </p>
              <p>
                <FontAwesomeIcon icon={['fas', 'phone']} />
                <span>+39 06 1234567</span>
              </p>
              <p>
                <FontAwesomeIcon icon={['fas', 'envelope']} />
                <a href="mailto:csv@costruzioniviola.it">csv@costruzioniviola.it</a>
              </p>
              <div className="footer-map">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2969.654248770785!2d12.493265!3d41.902782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDU0JzEwLjAiTiAxMsKwMjknMzUuOCJF!5e0!3m2!1sit!2sit!4v1622731105720!5m2!1sit!2sit" 
                  width="100%" 
                  height="150" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy"
                  title="Mappa sede CSV"
                />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <div className="footer-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <p className="copyright">u00a9 {new Date().getFullYear()} CSV. Tutti i diritti riservati.</p>
            </Col>
            <Col md={6} className="text-md-end">
              <p className="privacy-links">
                <Link to="/privacy-policy">Privacy Policy</Link> | 
                <Link to="/cookie-policy">Cookie Policy</Link>
              </p>
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Back to Top Button */}
      <div 
        className="back-to-top" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ opacity: window.scrollY > 300 ? 1 : 0 }}
      >
        <FontAwesomeIcon icon={['fas', 'arrow-up']} />
      </div>
    </footer>
  );
};

export default Footer;
