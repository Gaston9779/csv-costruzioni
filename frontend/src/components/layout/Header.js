import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';
import Logo from '../../assets/images/logo/logopapa.png'
const Header = () => {
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <header>
      <Navbar
        expand="lg"
        fixed="top"
        className={scrolled ? 'scrolled' : ''}
      >
        <Container style={{maxWidth:'none', paddingLeft:50, paddingRight:50}}>
          <Navbar.Brand as={Link} to="/">
            <img width={300} alt='logo' src={Logo} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/" end>
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/chi-siamo">
                Chi Siamo
              </Nav.Link>
              <NavDropdown style={{ marginTop: -8 }} title={
                <span className="dropdown-toggle nav-link">
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
