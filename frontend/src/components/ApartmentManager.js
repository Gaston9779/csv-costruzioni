import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, Accordion, Badge, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faBuilding, faBed, faBath, faRulerCombined, faEuroSign } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../config';

/**
 * Componente per la gestione degli appartamenti nei progetti multiproprietà.
 * Questo componente è responsabile per l'aggiunta, modifica ed eliminazione degli appartamenti.
 * 
 * @param {Object} props - Le proprietà del componente
 * @param {Array} props.apartments - Array di oggetti appartamento
 * @param {Function} props.onChange - Callback chiamata quando gli appartamenti cambiano
 * @param {Boolean} props.readOnly - Se true, il componente sarà in modalità sola lettura
 */
const ApartmentManager = ({ apartments = [], onChange, readOnly = false }) => {
  console.log('ApartmentManager received apartments:', apartments);
  
  // Aggiungi un nuovo appartamento
  const handleAddApartment = () => {
    if (readOnly) return;
    
    const newApartment = {
      title: `Appartamento ${apartments.length + 1}`,
      description: '',
      squareMeters: '',
      floor: '',
      bedrooms: '',
      bathrooms: '',
      budget: '',
      status: 'In corso', // Cambiato da 'Disponibile' a 'In corso' per rispettare l'enum del backend
      images: [],
      newImages: [] // Array per tenere traccia delle nuove immagini
    };
    
    onChange([...apartments, newApartment]);
  };
  
  // Rimuovi un appartamento esistente
  const handleRemoveApartment = (index) => {
    if (readOnly) return;
    
    const updatedApartments = [...apartments];
    updatedApartments.splice(index, 1);
    onChange(updatedApartments);
  };
  
  // Aggiorna i dati di un appartamento
  const handleApartmentChange = (index, field, value) => {
    if (readOnly) return;
    
    const updatedApartments = [...apartments];
    updatedApartments[index] = {
      ...updatedApartments[index],
      [field]: value
    };
    onChange(updatedApartments);
  };
  
  // Rimuovi un'immagine dall'appartamento
  const handleRemoveImage = (apartmentIndex, imageIndex) => {
    if (readOnly) return;
    
    const updatedApartments = [...apartments];
    const apartment = updatedApartments[apartmentIndex];
    
    // Verifica se le immagini sono nel campo images o newImages
    if (apartment.newImages && imageIndex < apartment.newImages.length) {
      // Se è un'immagine nuova, revoca l'oggetto URL
      const image = apartment.newImages[imageIndex];
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
      // Rimuovi l'immagine dall'array delle nuove immagini
      apartment.newImages.splice(imageIndex, 1);
    } else {
      // Se è un'immagine esistente, calcola l'indice corretto
      const existingImageIndex = apartment.newImages ? imageIndex - apartment.newImages.length : imageIndex;
      if (apartment.images && existingImageIndex >= 0 && existingImageIndex < apartment.images.length) {
        // Contrassegna l'immagine per l'eliminazione sul server aggiungendo un campo deleted
        if (!apartment.imagesToDelete) {
          apartment.imagesToDelete = [];
        }
        apartment.imagesToDelete.push(apartment.images[existingImageIndex]._id);
        // Rimuovi l'immagine dall'array
        apartment.images.splice(existingImageIndex, 1);
      }
    }
    
    onChange(updatedApartments);
  };
  
  // Funzione per ottenere il colore del badge in base allo stato
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Disponibile': return 'success';
      case 'Venduto': return 'danger';
      case 'Riservato': return 'warning';
      default: return 'primary';
    }
  };
  
  return (
    <div className="apartment-manager">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faBuilding} className="me-2" />
          Gestione Appartamenti
        </h5>
        {!readOnly && (
          <Button 
            variant="success" 
            size="sm"
            onClick={handleAddApartment}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Aggiungi Appartamento
          </Button>
        )}
      </div>
      
      {apartments.length === 0 ? (
        <Alert variant="info">
          Nessun appartamento presente. 
          {!readOnly && " Clicca su 'Aggiungi Appartamento' per iniziare."}
        </Alert>
      ) : (
        <Accordion defaultActiveKey={readOnly ? null : "0"}>
          {apartments.map((apartment, index) => (
            <Accordion.Item key={index} eventKey={index.toString()}>
              <Accordion.Header>
                <div className="d-flex justify-content-between w-100 me-3">
                  <div>
                    <FontAwesomeIcon icon={faBuilding} className="me-2" />
                    {apartment.title || `Appartamento ${index + 1}`}
                  </div>
                  <div>
                    {apartment.status && (
                      <Badge bg={apartment.status === 'Disponibile' ? 'success' : apartment.status === 'Venduto' ? 'danger' : 'warning'} className="me-2">
                        {apartment.status}
                      </Badge>
                    )}
                    {apartment.squareMeters && (
                      <Badge bg="info" className="me-2">
                        <FontAwesomeIcon icon={faRulerCombined} className="me-1" />
                        {apartment.squareMeters} m²
                      </Badge>
                    )}
                    {apartment.bedrooms && (
                      <Badge bg="primary" className="me-2">
                        <FontAwesomeIcon icon={faBed} className="me-1" />
                        {apartment.bedrooms}
                      </Badge>
                    )}
                    {apartment.bathrooms && (
                      <Badge bg="secondary" className="me-2">
                        <FontAwesomeIcon icon={faBath} className="me-1" />
                        {apartment.bathrooms}
                      </Badge>
                    )}
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                {readOnly ? (
                  <ApartmentDetails apartment={apartment} />
                ) : (
                  <ApartmentForm 
                    apartment={apartment} 
                    onChange={(field, value) => handleApartmentChange(index, field, value)} 
                    onRemove={() => handleRemoveApartment(index)}
                    onRemoveImage={(imageIndex) => handleRemoveImage(index, imageIndex)}
                  />
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
      
      {!readOnly && (
        <Button 
          variant="outline-primary" 
          className="mt-3" 
          onClick={handleAddApartment}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Aggiungi Appartamento
        </Button>
      )}
    </div>
  );
};

// Sub-componente per la visualizzazione dei dettagli di un appartamento in modalità sola lettura
const ApartmentDetails = ({ apartment }) => {
  return (
    <div className="apartment-details">
      <Row>
        <Col md={6}>
          <p><strong>Titolo:</strong> {apartment.title}</p>
          <p><strong>Status:</strong> <Badge bg={apartment.status === 'Disponibile' ? 'success' : apartment.status === 'Venduto' ? 'danger' : 'warning'}>{apartment.status}</Badge></p>
          <p><strong>Piano:</strong> {apartment.floor || 'Non specificato'}</p>
        </Col>
        <Col md={6}>
          <p><strong>Superficie:</strong> {apartment.squareMeters ? `${apartment.squareMeters} m²` : 'Non specificata'}</p>
          <p><strong>Camere:</strong> {apartment.bedrooms || 'Non specificato'}</p>
          <p><strong>Bagni:</strong> {apartment.bathrooms || 'Non specificato'}</p>
        </Col>
      </Row>
      <p><strong>Prezzo:</strong> {apartment.budget ? `€${parseInt(apartment.budget).toLocaleString('it-IT')}` : 'Non specificato'}</p>
      <div className="mt-3">
        <strong>Descrizione:</strong>
        <p className="mt-2">{apartment.description || 'Nessuna descrizione disponibile'}</p>
      </div>
    </div>
  );
};

// Sub-componente per il form di modifica di un appartamento
const ApartmentForm = ({ apartment, onChange, onRemove, onRemoveImage }) => {
  
  // Gestisce il caricamento delle immagini
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Validazione dimensione file (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      const oversizedFiles = files.filter(f => f.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        alert(`Alcuni file superano i 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      // Creiamo direttamente gli oggetti newImages con i file binari effettivi
      const newImages = files.map(file => ({
        file: file, // Questo è il file binario reale
        preview: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size,
        description: ''
      }));
      
      console.log(`${files.length} immagini appartamento caricate per upload`);
      
      // Aggiungiamo le nuove immagini all'array newImages dell'appartamento
      const currentNewImages = apartment.newImages || [];
      onChange('newImages', [...currentNewImages, ...newImages]);
    }
  };
  
  // Rimuove un'immagine dall'array
  const handleRemoveImage = (index) => {
    onRemoveImage(index);
  };

  return (
    <div className="apartment-form">
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Titolo</Form.Label>
            <Form.Control
              type="text"
              value={apartment.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="Inserisci il titolo dell'appartamento"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Stato</Form.Label>
            <Form.Select
              value={apartment.status || 'In corso'}
              onChange={(e) => onChange('status', e.target.value)}
            >
              <option value="In corso">In corso</option>
              <option value="Completato">Completato</option>
              <option value="In pausa">In pausa</option>
              <option value="Pianificato">Pianificato</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Metri Quadri</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={apartment.squareMeters || ''}
              onChange={(e) => onChange('squareMeters', e.target.value)}
              placeholder="m²"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Piano</Form.Label>
            <Form.Control
              type="number"
              value={apartment.floor || ''}
              onChange={(e) => onChange('floor', e.target.value)}
              placeholder="Piano"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Camere da letto</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={apartment.bedrooms || ''}
              onChange={(e) => onChange('bedrooms', e.target.value)}
              placeholder="Camere"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Bagni</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={apartment.bathrooms || ''}
              onChange={(e) => onChange('bathrooms', e.target.value)}
              placeholder="Bagni"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className="mb-3">
        <Form.Label>Prezzo (€)</Form.Label>
        <Form.Control
          type="number"
          min="0"
          value={apartment.budget || ''}
          onChange={(e) => onChange('budget', e.target.value)}
          placeholder="Inserisci il prezzo dell'appartamento"
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Descrizione</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={apartment.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Descrivi l'appartamento..."
        />
      </Form.Group>
      
      {/* Sezione per il caricamento delle immagini */}
      <Form.Group className="mb-3">
        <Form.Label>Immagini Appartamento</Form.Label>
        <Form.Control
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          onChange={handleImageUpload}
        />
        <Form.Text className="text-muted">
          Supporta tutti i formati inclusi HEIC/HEIF da iPhone (max 10MB)
        </Form.Text>
        
        {/* Mostra le nuove immagini caricate */}
        {apartment.newImages && apartment.newImages.length > 0 && (
          <div className="apartment-images mt-3">
            <h6>Nuove immagini:</h6>
            <Row>
              {apartment.newImages.map((image, idx) => (
                <Col key={`new_${idx}`} xs={6} md={4} lg={3} className="mb-3">
                  <div className="image-preview-container">
                    <img 
                      src={image.preview} 
                      alt={`Anteprima ${idx + 1}`}
                      className="img-thumbnail"
                    />
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                  {/* Campo per aggiungere una descrizione all'immagine */}
                  <Form.Group className="mt-1 mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Descrizione immagine"
                      size="sm"
                      value={image.description || ''}
                      onChange={(e) => {
                        // Aggiorna la descrizione dell'immagine
                        const updatedImages = [...apartment.newImages];
                        updatedImages[idx] = {
                          ...updatedImages[idx],
                          description: e.target.value
                        };
                        onChange('newImages', updatedImages);
                      }}
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>
          </div>
        )}
        
        {/* Mostra le immagini esistenti */}
        {apartment.images && apartment.images.length > 0 && (
          <div className="apartment-images mt-3">
            <h6>Immagini esistenti:</h6>
            <Row>
              {apartment.images.map((image, idx) => (
                <Col key={`existing_${idx}`} xs={6} md={4} lg={3} className="mb-3">
                  <div className="image-preview-container">
                    <img 
                      src={`${API_URL}${image.url}`} 
                      alt={`Immagine ${idx + 1}`}
                      className="img-thumbnail"
                    />
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(apartment.newImages ? apartment.newImages.length + idx : idx)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Form.Group>
      
      <div className="d-flex justify-content-end">
        <Button 
          variant="danger" 
          size="sm"
          onClick={onRemove}
        >
          <FontAwesomeIcon icon={faTrash} className="me-2" />
          Rimuovi Appartamento
        </Button>
      </div>
    </div>
  );
};

export default ApartmentManager;
