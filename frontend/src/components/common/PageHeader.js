import React from 'react';
import { Container } from 'react-bootstrap';
import './PageHeader.css';

const PageHeader = ({ title, backgroundImage }) => {
  const headerStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`
  } : {};

  return (
    <section className="page-header" style={headerStyle}>
      <div className="overlay"></div>
      <Container>
        <div className="page-header-content">
          <h1>{title}</h1>
        </div>
      </Container>
    </section>
  );
};

export default PageHeader;
