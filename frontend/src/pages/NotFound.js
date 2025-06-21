import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <Container className="py-5 text-center">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="error-content">
              <div className="error-code">404</div>
              <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
              <h1 className="error-title">Pagina Non Trovata</h1>
              <p className="error-message">
                La pagina che stai cercando potrebbe essere stata rimossa, ha 
                cambiato nome o è temporaneamente non disponibile.
              </p>
              
              <div className="action-buttons mt-4">
                <Link to="/" className="btn btn-primary me-2">
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  Torna alla Home
                </Link>
                <Link to="/contatti" className="btn btn-outline-primary">
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Contattaci
                </Link>
              </div>
              
              <div className="suggested-links mt-5">
                <h5>Potresti essere interessato a:</h5>
                <ul className="list-unstyled">
                  <li><Link to="/servizi">I nostri servizi</Link></li>
                  <li><Link to="/progetti">Portfolio progetti</Link></li>
                  <li><Link to="/tecnologia-qualita">Tecnologia e qualità</Link></li>
                  <li><Link to="/contatti">Contatti</Link></li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFound;
