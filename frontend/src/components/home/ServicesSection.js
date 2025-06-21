import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShoppingCart, faBuilding, faIndustry, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './ServicesSection.css';

const ServicesSection = () => {
  // Dati per i servizi
  const services = [
    {
      id: 1,
      icon: faHome,
      title: 'Residenziale',
      slug: 'residenziale',
      description: 'Costruzione e ristrutturazione di edifici residenziali, case unifamiliari e condomini.',
      link: '/servizi/residenziale'
    },
    {
      id: 2,
      icon: faShoppingCart,
      title: 'Commerciale',
      slug: 'commerciale',
      description: 'Realizzazione di negozi, centri commerciali e strutture per il retail.',
      link: '/servizi/commerciale'
    },
    {
      id: 3,
      icon: faBuilding,
      title: 'Direzionale',
      slug: 'direzionale',
      description: 'Costruzione di uffici, sedi aziendali e spazi di lavoro moderni.',
      link: '/servizi/direzionale'
    },
    {
      id: 4,
      icon: faIndustry,
      title: 'Produttivo',
      slug: 'produttivo',
      description: 'Edificazione di capannoni industriali, magazzini e strutture produttive.',
      link: '/servizi/produttivo'
    }
  ];

  return (
    <section className="services-section">
      <Container>
        <div className="section-header text-center">
          <h2>I Nostri Servizi</h2>
          <p>Offriamo una gamma completa di servizi di costruzione per soddisfare ogni esigenza</p>
        </div>
        <Row className="service-cards">
          {services.map(service => (
            <Col md={6} lg={3} key={service.id} className="mb-4">
              <div className="service-card animate-on-scroll">
                <div className="service-icon">
                  <FontAwesomeIcon icon={service.icon} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={service.link} className="service-link">
                  Scopri di più <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default ServicesSection;
