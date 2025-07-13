import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './Header.css';
import Logo from '../../assets/images/logo/logopapa.png'

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  // Gestione dello scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll to top quando cambia la pagina
  useEffect(() => {
    window.scrollTo(0, 0);
    setExpanded(false);
  }, [location.pathname]);

  // Chiudi il menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      const navbar = document.getElementById('basic-navbar-nav');
      const toggle = document.querySelector('.navbar-toggler');
      
      if (expanded && navbar && !navbar.contains(event.target) && !toggle.contains(event.target)) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  return (
    <header>
      <Navbar
        expand="lg"
        fixed="top"
        className={scrolled ? 'scrolled' : ''}
        expanded={expanded}
        onToggle={(expanded) => setExpanded(expanded)}
      >
        <Container className="header-container">
          <Navbar.Brand as={Link} to="/">
            <img width={300} alt='logo' src={Logo} className="logo-img" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggler" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/" end>
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/chi-siamo">
                Chi Siamo
              </Nav.Link>
              <NavDropdown title={
                <span style={{marginTop:-8}} className="dropdown-toggle nav-link">
                  Servizi
                </span>
              } id="servizi-dropdown">
                <NavDropdown.Item as={NavLink} to="/servizi/residenziale">
                  Residenziale
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/servizi/commerciale">
                  Commerciale
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/servizi/direzionale">
                  Direzionale
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/servizi/produttivo">
                  Produttivo
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={NavLink} to="/progetti">
                Progetti
              </Nav.Link>
              <Nav.Link as={NavLink} to="/tecnologia-qualita">
                Tecnologia e Qualità
              </Nav.Link>
              <Nav.Link as={NavLink} to="/contatti">
                Contatti
              </Nav.Link>
              <Nav.Link as={NavLink} to="/area-clienti" className="login-btn">
                Area Clienti
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
