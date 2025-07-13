import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Modal, Row, Col, Alert, Spinner, Badge, Nav, Tab, Tabs } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faSearch,
  faImage,
  faCheck,
  faTimes,
  faFilter,
  faSort,
  faFolderOpen,
  faBuilding,
  faRulerCombined,
  faBed,
  faBath,
  faEuroSign
} from '@fortawesome/free-solid-svg-icons';
import ApartmentManager from '../../components/ApartmentManager';

const AdminProjects = ({ onStatsUpdate }) => {

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);

  const [currentProject, setCurrentProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Residenziale',
    projectType: 'Singola',
    status: 'In corso',
    client: '',
    startDate: '',
    endDate: '',
    budget: '',
    visible: true,
    location: '',
    notes: '',
    apartments: [] // Inizializzato come array vuoto
  });

  const [activeTab, setActiveTab] = useState('info');

  const categories = ['Residenziale', 'Commerciale', 'Produttivo', 'Direzionale', 'Altro'];
  const statuses = ['In corso', 'Completato', 'In attesa', 'Annullato'];

  // Carica i progetti dal server
  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://csv-backend-yg2x.onrender.com/api/admin/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
      } else {
        setError('Errore nel caricamento dei progetti: ' + data.message);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei progetti:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Carica i clienti dal server
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://csv-backend-yg2x.onrender.com/api/admin/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setClients(data.localClients);
      } else {
        console.error('Errore nel caricamento dei clienti:', data.message);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error);
    }
  };

  // Carica progetti e clienti all'avvio
  useEffect(() => {
    console.log("AdminProjects - useEffect iniziale");
    fetchProjects();
    fetchClients();
  }, []);

  // Questo effetto può essere utilizzato dall'esterno per aggiornare i dati
  useEffect(() => {
    // Possiamo esporre le funzioni tramite una ref o props
    if (window.AdminProjectsRefresh) {
      window.AdminProjectsRefresh = {
        fetchProjects,
        fetchClients
      };
    } else {
      window.AdminProjectsRefresh = {
        fetchProjects,
        fetchClients
      };
    }

    return () => {
      // Cleanup quando il componente viene smontato
     
      window.AdminProjectsRefresh = null;
    };
  }, []);

  // Filtra i progetti in base ai criteri di ricerca
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !filterCategory || project.category === filterCategory;
    const matchesStatus = !filterStatus || project.status === filterStatus;
    const matchesClient = !filterClient || (project.client && project.client._id === filterClient);

    return matchesSearch && matchesCategory && matchesStatus && matchesClient;
  });

  // Recupera tutti i progetti dal backend
  const fetchProjectsFromBackend = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Aggiungiamo parametri timestamp per evitare caching
      const timestamp = new Date().getTime();
      const response = await fetch(`https://csv-backend-yg2x.onrender.com/api/admin/projects?_=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      const data = await response.json();
      
      // Log completo per debug
      console.log('RISPOSTA API PROGETTI:', data);
      if (data.projects && data.projects.length > 0) {
        console.log('ESEMPIO PROGETTO COMPLETO:', data.projects[0]);
        console.log('CAMPI DISPONIBILI:', Object.keys(data.projects[0]).join(', '));
      }

      if (data.success) {
        // Assicuriamoci che projectType sia impostato per ogni progetto
        const projectsWithType = data.projects.map(project => ({
          ...project,
          projectType: project.projectType || 'Singola' // Fallback a 'Singola' se undefined
        }));
        
        console.log('PROGETTI PROCESSATI:', projectsWithType.map(p => ({ 
          id: p._id, 
          title: p.title, 
          projectType: p.projectType 
        })));
        
        setProjects(projectsWithType);
      } else {
        setError(data.message || 'Errore nel caricamento dei progetti');
      }
    } catch (error) {
      console.error('Errore nel caricamento dei progetti:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Recupera tutti i clienti per il dropdown
  const fetchClientsFromBackend = async () => {
    try {
      console.log("Caricamento clienti in corso...");
      const token = localStorage.getItem('token');
      const response = await fetch('https://csv-backend-yg2x.onrender.com/api/admin/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Combina localClients e externalClients in un unico array
        const allClients = [
          ...(data.localClients || []),
          ...(data.externalClients || [])
        ];

       
        setClients(allClients.filter(client => client.role !== 'admin'));
       
      } else {
        console.error("Errore nel caricamento clienti:", data.message);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error);
    }
  };

  // Funzione per resettare il form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Residenziale',
      projectType: 'Singola',
      status: 'In corso',
      client: '',
      startDate: '',
      endDate: '',
      budget: '',
      visible: true,
      location: '',
      notes: '',
      apartments: []
    });
    setSelectedImages([]);
    setUploadedImages([]);
    setImagesToDelete([]);
  };

  // Gestisce l'invio del form per aggiungere/modificare un progetto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const isEditing = !!currentProject;
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `https://csv-backend-yg2x.onrender.com/api/admin/projects/${currentProject._id}`
        : 'https://csv-backend-yg2x.onrender.com/api/admin/projects';
      
      // Crea FormData per l'invio dei dati e file
      const formDataToSend = new FormData();
      
      // Aggiungi tutti i campi di testo
      Object.keys(formData).forEach(key => {
        if (key === 'apartments') {
          // Gli appartamenti vengono gestiti separatamente
          return;
        }
        
        if (formData[key] !== undefined && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Assicuriamoci che projectType sia sempre incluso esplicitamente
      formDataToSend.append('projectType', formData.projectType || 'Singola');
      
      // Aggiungi tutte le immagini selezionate
      if (selectedImages.length > 0) {
        selectedImages.forEach(image => {
          formDataToSend.append('images', image);
        });
      }
      
      // Gestione degli appartamenti e delle loro immagini
      if (formData.projectType === 'Multiproprietà' && formData.apartments && formData.apartments.length > 0) {
        console.log('Preparazione appartamenti:', formData.apartments);
        
        // Converti l'array di appartamenti in JSON e aggiungi al FormData
        formDataToSend.append('apartments', JSON.stringify(formData.apartments));
        
        // Aggiungi le immagini di ciascun appartamento
        formData.apartments.forEach((apartment, index) => {
          if (apartment.newImages && apartment.newImages.length > 0) {
            apartment.newImages.forEach((image, imgIndex) => {
              console.log(`Aggiunta immagine per appartamento ${index}:`, image.name);
              formDataToSend.append(`apartment_${index}_image`, image);
            });
          }
        });
      }
      
      // Aggiungi gli ID delle immagini da eliminare
      if (imagesToDelete.length > 0) {
        formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }
      
      console.log('Invio dati al server:', {
        method,
        url,
        apartments: formData.apartments,
        projectType: formData.projectType
      });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(showAddModal ? 'Progetto aggiunto con successo!' : 'Progetto aggiornato con successo!');
        fetchProjects();
        if (onStatsUpdate) onStatsUpdate();
        
        // Se siamo in modalità aggiunta, resettiamo il form
        if (showAddModal) {
          resetForm();
        }
        
        setTimeout(() => {
          setSuccess('');
          if (showEditModal) {
            setShowEditModal(false);
          }
        }, 2000);
      } else {
        setError(data.message || 'Errore durante il salvataggio');
      }
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Gestisce il click sul pulsante modifica
  const handleEditClick = (project) => {
    setActiveTab('info'); // Resettiamo il tab attivo
    setCurrentProject(project);
    
    console.log('Editing project:', project);
    
    // Prepara i dati del progetto per il form
    const projectData = {
      _id: project._id,
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'Residenziale',
      projectType: project.projectType || 'Singola',
      status: project.status || 'In corso',
      client: project.client?._id || '',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      budget: project.budget || '',
      visible: project.visible === undefined ? true : project.visible,
      location: project.location || '',
      notes: project.notes || '',
      apartments: project.apartments || []
    };
    
    console.log('Form data prepared:', projectData);
    
    setFormData(projectData);
    setUploadedImages(project.images || []);
    setImagesToDelete([]);
    setShowEditModal(true);
  };

  // Gestisce la modifica dei campi del form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gestisce la selezione delle immagini
  const handleImageSelection = (e) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  // Funzione per rimuovere un'immagine dalla selezione corrente
  const handleRemoveImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  // Funzione per eliminare un'immagine esistente quando si modifica un progetto
  const handleDeleteExistingImage = (imageId) => {
    // Segna l'immagine per la rimozione
    setImagesToDelete([...imagesToDelete, imageId]);
    
    // Aggiorna l'anteprima rimuovendo l'immagine
    if (currentProject && currentProject.images) {
      const updatedImages = currentProject.images.filter(img => img._id !== imageId);
      setCurrentProject({
        ...currentProject,
        images: updatedImages
      });
    }
  };

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  // Gestisce il click sul pulsante visualizza
  const handleViewClick = (project) => {
    setCurrentProject(project);
    setShowViewModal(true);
  };

  // Gestisce il click sul pulsante elimina
  const handleDeleteClick = (project) => {
    setCurrentProject(project);
    setShowDeleteModal(true);
  };

  // Gestisce il click sul pulsante aggiungi
  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Gestisce l'eliminazione del progetto
  const handleDeleteProject = async () => {
    if (!currentProject) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log('Elimino progetto con ID:', currentProject._id);

      // Usiamo esplicitamente l'endpoint corretto che corrisponde alla route in projects.js
      const url = `https://csv-backend-yg2x.onrender.com/api/projects/admin/${currentProject._id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Risposta del server:', data);

      if (data.success) {
        setSuccess('Progetto eliminato con successo');
        fetchProjects();
        if (onStatsUpdate) onStatsUpdate();
        setShowDeleteModal(false);
      } else {
        setError(data.message || 'Errore nell\'eliminazione del progetto');
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };
  

  // Form Aggiungi/Modifica Progetto
  const projectForm = (
    <Modal 
      show={showAddModal || showEditModal} 
      onHide={() => {
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
      }}
      size="lg"
      centered
      className="project-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {showAddModal ? 'Aggiungi Nuovo Progetto' : 'Modifica Progetto'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'info'} 
                onClick={() => setActiveTab('info')}
              >
                Informazioni Base
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'images'} 
                onClick={() => setActiveTab('images')}
              >
                Immagini
              </Nav.Link>
            </Nav.Item>
            {formData.projectType === 'Multiproprietà' && (
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'apartments'} 
                  onClick={() => setActiveTab('apartments')}
                >
                  Appartamenti {formData.apartments?.length > 0 && `(${formData.apartments.length})`}
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>

          {activeTab === 'info' && (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Titolo*</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cliente*</Form.Label>
                    <Form.Select
                      name="client"
                      value={formData.client}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleziona Cliente</option>
                      {clients?.map(client => (
                        <option key={client._id} value={client._id}>
                          {client.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Categoria</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      {categories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo Progetto</Form.Label>
                    <Form.Select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                    >
                      <option value="Singola">Singola Proprietà</option>
                      <option value="Multiproprietà">Multiproprietà</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stato</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      {statuses.map((status, index) => (
                        <option key={index} value={status}>
                          {status}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Budget (€)</Form.Label>
                    <Form.Control
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {activeTab === 'images' && (
            <>
              <Form.Group className="mb-4">
                <Form.Label>Carica Immagini</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelection}
                  className="mb-2"
                />
                <Form.Text className="text-muted">
                  Seleziona una o più immagini per il progetto
                </Form.Text>
              </Form.Group>
              
              {/* Immagini selezionate (nuove) */}
              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <h6>Immagini selezionate:</h6>
                  <Row>
                    {selectedImages.map((image, index) => (
                      <Col key={index} xs={6} md={4} lg={3} className="mb-3">
                        <div className="image-preview-container">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`Anteprima ${index + 1}`}
                            className="img-thumbnail"
                          />
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="remove-image-btn"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
              
              {/* Immagini esistenti (per la modifica) */}
              {currentProject && currentProject.images && currentProject.images.length > 0 && (
                <div className="mt-4">
                  <h6>Immagini esistenti:</h6>
                  <Row>
                    {currentProject.images.map((image, index) => (
                      <Col key={index} xs={6} md={4} lg={3} className="mb-3">
                        <div className="image-preview-container">
                          <img 
                            src={`https://csv-backend-yg2x.onrender.com${image.url}`} 
                            alt={`Immagine ${index + 1}`}
                            className="img-thumbnail"
                          />
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="remove-image-btn"
                            onClick={() => handleDeleteExistingImage(image._id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </>
          )}

          {activeTab === 'apartments' && formData.projectType === 'Multiproprietà' && (
            <ApartmentManager 
              apartments={formData.apartments}
              onChange={(updatedApartments) => {
                setFormData({
                  ...formData,
                  apartments: updatedApartments
                });
              }}
            />
          )}
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Annulla
              </Button>
              <Button 
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} className="me-2" />
                    Salva
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
  );

  // Tabella dei progetti
  const projectTable = (
    <Table responsive hover className="mt-4">
      <thead>
        <tr>
          <th>Titolo</th>
          <th>Cliente</th>
          <th>Categoria</th>
          <th>Tipo</th>
          <th>Stato</th>
          <th>Budget</th>
          <th>Data Inizio</th>
          <th>Data Fine</th>
          <th>Azioni</th>
        </tr>
      </thead>
      <tbody>
        {loading && !filteredProjects.length ? (
          <tr>
            <td colSpan="9" className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Caricamento...</span>
              </Spinner>
            </td>
          </tr>
        ) : filteredProjects.length === 0 ? (
          <tr>
            <td colSpan="9" className="text-center py-4">
              <FontAwesomeIcon icon={faFolderOpen} className="me-2" />
              Nessun progetto trovato.
            </td>
          </tr>
        ) : (
          filteredProjects.map(project => (
            <tr key={project._id}>
              <td>
                {project.title}
                {!project.visible && (
                  <Badge bg="secondary" className="ms-2">Nascosto</Badge>
                )}
              </td>
              <td>{project.client ? project.client.name || 'N/D' : 'N/D'}</td>
              <td>{project.category}</td>
              <td>
                {project.projectType === 'Multiproprietà' ? (
                  <Badge bg="info" className="py-2 px-2">
                    <FontAwesomeIcon icon={faBuilding} className="me-1" />
                    Multiproprietà {project.apartments ? `(${project.apartments.length})` : ''}
                  </Badge>
                ) : (
                  <Badge bg="secondary" className="py-2 px-2">Singola</Badge>
                )}
                {console.log(`Debug - Progetto ${project.title}: projectType=${project.projectType}`)}
              </td>
              <td>
                <Badge bg={
                  project.status === 'Completato' ? 'success' : 
                  project.status === 'In corso' ? 'primary' : 
                  project.status === 'In attesa' ? 'warning' : 
                  'danger'
                }>
                  {project.status}
                </Badge>
              </td>
              <td>{project.budget ? `€${parseInt(project.budget).toLocaleString('it-IT')}` : 'N/D'}</td>
              <td>{formatDate(project.startDate)}</td>
              <td>{formatDate(project.endDate)}</td>
              <td>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  className="me-1 mb-1"
                  onClick={() => handleViewClick(project)}
                  title="Visualizza dettagli"
                >
                  <FontAwesomeIcon icon={faEye} />
                </Button>
                <Button 
                  variant="outline-success" 
                  size="sm"
                  className="me-1 mb-1"
                  onClick={() => handleEditClick(project)}
                  title="Modifica progetto"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  className="me-1 mb-1"
                  onClick={() => handleDeleteClick(project)}
                  title="Elimina progetto"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );

  // Modal di visualizzazione dettagli progetto
  const projectViewModal = (
    <Modal 
      show={showViewModal} 
      onHide={() => setShowViewModal(false)}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faEye} className="me-2" />
          Dettagli Progetto
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {currentProject && (
          <>
            <Row className="mb-4">
              <Col md={8}>
                <h3>{currentProject.title}</h3>
                <p className="text-muted">
                  {currentProject.projectType === 'Multiproprietà' ? (
                    <Badge bg="info" className="me-2">
                      <FontAwesomeIcon icon={faBuilding} className="me-1" />
                      Multiproprietà {currentProject.apartments ? `(${currentProject.apartments.length})` : ''}
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="me-2">Singola</Badge>
                  )}
                  <Badge 
                    bg={
                      currentProject.status === 'Completato' ? 'success' : 
                      currentProject.status === 'In corso' ? 'primary' : 
                      currentProject.status === 'In attesa' ? 'warning' : 
                      'danger'
                    }
                  >
                    {currentProject.status}
                  </Badge>
                </p>
              </Col>
              <Col md={4} className="text-md-end">
                <p className="mb-1">
                  <strong>Budget:</strong> {currentProject.budget ? `€${parseInt(currentProject.budget).toLocaleString('it-IT')}` : 'N/D'}
                </p>
                <p className="mb-1">
                  <strong>Data inizio:</strong> {formatDate(currentProject.startDate)}
                </p>
                <p className="mb-0">
                  <strong>Data fine:</strong> {formatDate(currentProject.endDate)}
                </p>
              </Col>
            </Row>
            
            {/* Tabs per navigare tra le diverse sezioni */}
            <Tabs defaultActiveKey="info" className="mb-4">
              <Tab eventKey="info" title="Informazioni">
                <Row className="mt-3">
                  <Col md={12}>
                    <h5>Descrizione</h5>
                    <p>{currentProject.description || 'Nessuna descrizione disponibile.'}</p>
                  </Col>
                </Row>
                
                <Row className="mt-3">
                  <Col md={6}>
                    <h5>Cliente</h5>
                    <p>{currentProject.client ? currentProject.client.name : 'Nessun cliente specificato'}</p>
                  </Col>
                  <Col md={6}>
                    <h5>Categoria</h5>
                    <p>{currentProject.category || 'N/D'}</p>
                  </Col>
                </Row>
                
                {currentProject.location && (
                  <Row className="mt-3">
                    <Col md={12}>
                      <h5>Ubicazione</h5>
                      <p>{currentProject.location}</p>
                    </Col>
                  </Row>
                )}
                
                {currentProject.notes && (
                  <Row className="mt-3">
                    <Col md={12}>
                      <h5>Note</h5>
                      <p>{currentProject.notes}</p>
                    </Col>
                  </Row>
                )}
              </Tab>
              
              <Tab eventKey="images" title="Immagini">
                {currentProject.images && currentProject.images.length > 0 ? (
                  <Row className="mt-3">
                    {currentProject.images.map((image, index) => (
                      <Col key={index} xs={6} md={3} className="mb-3">
                        <Card>
                          <Card.Img 
                            variant="top" 
                            src={`https://csv-backend-yg2x.onrender.com${image.url}`} 
                            alt={`Immagine ${index + 1}`} 
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info" className="mt-3">
                    Nessuna immagine disponibile per questo progetto.
                  </Alert>
                )}
              </Tab>
              
              {currentProject.projectType === 'Multiproprietà' && (
                <Tab eventKey="apartments" title={`Appartamenti (${currentProject.apartments?.length || 0})`}>
                  {currentProject.apartments && currentProject.apartments.length > 0 ? (
                    currentProject.apartments.map((apt, index) => (
                      <Card key={index} className="mb-3">
                        <Card.Header>
                          <h5 className="mb-0">
                            <FontAwesomeIcon icon={faBuilding} className="me-2" />
                            {apt.title || `Appartamento ${index + 1}`}
                            <Badge 
                              bg={apt.status === 'Disponibile' ? 'success' : apt.status === 'Venduto' ? 'danger' : 'warning'}
                              className="ms-2"
                            >
                              {apt.status}
                            </Badge>
                          </h5>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <p>
                                <FontAwesomeIcon icon={faRulerCombined} className="me-2" />
                                <strong>Superficie:</strong> {apt.squareMeters ? `${apt.squareMeters} m²` : 'N/D'}
                              </p>
                              <p>
                                <FontAwesomeIcon icon={faBed} className="me-2" />
                                <strong>Camere:</strong> {apt.bedrooms || 'N/D'}
                              </p>
                              <p>
                                <FontAwesomeIcon icon={faBath} className="me-2" />
                                <strong>Bagni:</strong> {apt.bathrooms || 'N/D'}
                              </p>
                            </Col>
                            <Col md={6}>
                              <p>
                                <FontAwesomeIcon icon={faTimes} className="me-2" />
                                <strong>Piano:</strong> {apt.floor !== undefined && apt.floor !== null ? apt.floor : 'N/D'}
                              </p>
                              <p>
                                <FontAwesomeIcon icon={faEuroSign} className="me-2" />
                                <strong>Prezzo:</strong> {apt.budget ? `€${parseInt(apt.budget).toLocaleString('it-IT')}` : 'N/D'}
                              </p>
                            </Col>
                          </Row>
                          
                          {apt.description && (
                            <div className="mt-3">
                              <h6>Descrizione</h6>
                              <p>{apt.description}</p>
                            </div>
                          )}
                          
                          {apt.images && apt.images.length > 0 && (
                            <div className="mt-3">
                              <h6>Immagini</h6>
                              <Row>
                                {apt.images.map((img, imgIndex) => (
                                  <Col key={imgIndex} xs={6} md={3} className="mb-3">
                                    <Card>
                                      <Card.Img 
                                        variant="top" 
                                        src={`https://csv-backend-yg2x.onrender.com${img.url}`} 
                                        alt={`Immagine ${imgIndex + 1}`}
                                      />
                                    </Card>
                                  </Col>
                                ))}
                              </Row>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <Alert variant="info" className="mt-3">
                      Nessun appartamento disponibile per questo progetto.
                    </Alert>
                  )}
                </Tab>
              )}
            </Tabs>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary" 
          onClick={() => setShowViewModal(false)}
        >
          Chiudi
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className="admin-projects-page">
      {/* Header con titolo e pulsante aggiungi */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestione Progetti</h2>
        <Button variant="primary" onClick={handleAddClick}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nuovo Progetto
        </Button>
      </div>

      {/* Messaggi di successo o errore */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {/* Sezione filtri */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Cerca</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faSearch} />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Cerca per nome, descrizione..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Categoria</Form.Label>
                <Form.Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">Tutte le categorie</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Stato</Form.Label>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tutti gli stati</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Cliente</Form.Label>
                <Form.Select
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                >
                  <option value="">Tutti i clienti</option>
                  {clients?.map(client => (
                    <option key={client._id} value={client._id}>{client.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {projectForm}
      {projectTable}
      {projectViewModal}

      {/* Modale di conferma eliminazione */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Conferma Eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <p>Sei sicuro di voler eliminare il progetto <strong>{currentProject?.title}</strong>?</p>
          <p className="text-danger">Questa azione non può essere annullata.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annulla
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteProject}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Elimina
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminProjects;
