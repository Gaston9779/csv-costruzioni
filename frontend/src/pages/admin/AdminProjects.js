import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Modal, Row, Col, Alert, Spinner, Badge, Tabs, Tab } from 'react-bootstrap';
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
  faFolderOpen
} from '@fortawesome/free-solid-svg-icons';

const AdminProjects = ({ onStatsUpdate }) => {
  console.log("AdminProjects componente inizializzato");

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
    status: 'In corso',
    client: '',
    startDate: '',
    endDate: '',
    budget: '',
    visible: true,
    location: '',
    notes: ''
  });

  const categories = ['Residenziale', 'Commerciale', 'Produttivo', 'Direzionale', 'Altro'];
  const statuses = ['In corso', 'Completato', 'In attesa', 'Annullato'];

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
      console.log("AdminProjects smontato, cleanup refresh functions");
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
  const fetchClients = async () => {
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

        console.log("Clienti caricati:", allClients.length);
        setClients(allClients.filter(client => client.role !== 'admin'));
        console.log("Clienti filtrati:", allClients.filter(client => client.role !== 'admin').length);
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
      status: 'In corso',
      client: '',
      startDate: '',
      endDate: '',
      budget: '',
      visible: true,
      location: '',
      notes: ''
    });
    setSelectedImages([]);
    setImagesToDelete([]);
    setCurrentProject(null);
  };

  // Gestisce l'invio del form per aggiungere/modificare un progetto
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEditing = !!currentProject;
    console.log(`${isEditing ? 'Aggiornamento' : 'Creazione'} progetto in corso...`, formData);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `https://csv-backend-yg2x.onrender.com/api/admin/projects/${currentProject.projectId}`
        : 'https://csv-backend-yg2x.onrender.com/api/admin/projects';

      console.log("URL API:", url);

      // Creiamo un FormData per gestire l'upload delle immagini
      const formDataToSend = new FormData();

      // Aggiungiamo i campi del form
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      console.log("FormData keys:", [...formDataToSend.keys()]);

      // Aggiungiamo le nuove immagini
      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          formDataToSend.append('images', selectedImages[i]);
          console.log(`Aggiunta immagine: ${selectedImages[i].name}`);
        }
      }

      // Aggiungiamo l'elenco delle immagini da eliminare
      if (isEditing && imagesToDelete.length > 0) {
        formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
        console.log(`Immagini da eliminare: ${imagesToDelete.length}`);
      }

      const method = isEditing ? 'PUT' : 'POST';

      console.log(`Invio richiesta ${method} a ${url}`);
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log(`Risposta ricevuta da ${url}:`, data);

      if (data.success) {
        setSuccess(isEditing ? 'Progetto aggiornato con successo' : 'Progetto creato con successo');
        // Attendi il completamento del fetchProjects per garantire l'aggiornamento della tabella
        await fetchProjects();
        if (onStatsUpdate) onStatsUpdate();

        if (isEditing) {
          setShowEditModal(false);
        } else {
          setShowAddModal(false);
        }

        // Reset form
        resetForm();
      } else {
        console.error("Errore API:", data.message || 'Si è verificato un errore');
        setError(data.message || 'Si è verificato un errore');
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  // Gestisce il click sul pulsante modifica
  const handleEditClick = (project) => {
    setCurrentProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'Residenziale',
      status: project.status || 'In corso',
      client: project.client?._id || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      budget: project.budget || '',
      location: project.location || '',
      visible: project.visible === undefined ? true : project.visible,
      notes: project.notes || ''
    });
    setUploadedImages(project.images || []);
    setShowEditModal(true);
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
      const url = `https://csv-backend-yg2x.onrender.com/api/admin/projects/${currentProject.projectId}`;

      console.log(`Eliminazione progetto: ${url}`);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log(`Risposta eliminazione:`, data);

      if (data.success) {
        setSuccess('Progetto eliminato con successo');
        // Attendi il completamento del fetchProjects per garantire l'aggiornamento della tabella
        await fetchProjects();
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
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>{client.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabella progetti */}
      <Card>
        <Card.Body>
          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Caricamento...</span>
              </Spinner>
              <p className="mt-2">Caricamento progetti...</p>
            </div>
          )}

          {!loading && filteredProjects.length === 0 && (
            <div className="text-center my-4">
              <p>Nessun progetto trovato. {searchTerm && 'Prova con un altro termine di ricerca.'}</p>
              <Button variant="primary" onClick={handleAddClick}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Crea il primo progetto
              </Button>
            </div>
          )}

          {!loading && filteredProjects.length > 0 && (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Titolo</th>
                    <th>Cliente</th>
                    <th>Categoria</th>
                    <th>Stato</th>
                    <th>ID</th>
                    <th>Data creazione</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(project => (
                    <tr key={project.projectId}>
                      <td>{project.title}</td>
                      <td>{project.client?.name || 'N/D'}</td>
                      <td>{project.category || 'N/D'}</td>
                      <td>
                        <Badge bg={
                          project.status === 'Completato' ? 'success' :
                            project.status === 'In corso' ? 'primary' :
                              project.status === 'In attesa' ? 'warning' : 'secondary'
                        }>
                          {project.status || 'N/D'}
                        </Badge>
                      </td>
                      <td>{project.projectId}</td>
                      <td>{formatDate(project.createdAt)}</td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewClick(project)}
                          className="me-1"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditClick(project)}
                          className="me-1"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(project)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Aggiungi Progetto */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nuovo Progetto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Titolo *</Form.Label>
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
                  <Form.Label>Cliente *</Form.Label>
                  <Form.Select
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    required={false}
                  >
                    <option value="">Seleziona un cliente</option>
                    {clients.map(client => (
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
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stato</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Inizio</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Fine</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Località</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descrizione</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Progetto visibile sul sito"
                name="visible"
                checked={formData.visible}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Immagini</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelection}
              />
              <Form.Text className="text-muted">
                Seleziona una o più immagini per il progetto.
              </Form.Text>
            </Form.Group>

            {selectedImages.length > 0 && (
              <div className="mb-3">
                <p>Immagini selezionate: {selectedImages.length}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Annulla
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
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
                  Creazione...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  Crea Progetto
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Modifica Progetto */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifica Progetto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Titolo *</Form.Label>
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
                  <Form.Label>Cliente *</Form.Label>
                  <Form.Select
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleziona un cliente</option>
                    {clients.map(client => (
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
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stato</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Inizio</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Fine</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Località</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descrizione</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Progetto visibile sul sito"
                name="visible"
                checked={formData.visible}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Aggiungi Immagini</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelection}
              />
            </Form.Group>

            {uploadedImages.length > 0 && (
              <div className="mb-3">
                <p>Immagini esistenti: {uploadedImages.length}</p>
                {/* Qui potrebbe essere visualizzata una galleria delle immagini */}
              </div>
            )}

            {selectedImages.length > 0 && (
              <div className="mb-3">
                <p>Nuove immagini selezionate: {selectedImages.length}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Annulla
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
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
                  Aggiornamento...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  Aggiorna Progetto
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Visualizza Progetto */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Dettagli Progetto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentProject && (
            <div>
              <h4>{currentProject.title}</h4>

              <div className="my-4">
                <Row>
                  <Col md={6}>
                    <p><strong>Cliente:</strong> {currentProject.client?.name || 'N/D'}</p>
                    <p><strong>Categoria:</strong> {currentProject.category || 'N/D'}</p>
                    <p><strong>Stato:</strong> {currentProject.status || 'N/D'}</p>
                    <p><strong>Budget:</strong> {currentProject.budget ? `€${currentProject.budget.toLocaleString('it-IT')}` : 'N/D'}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Data Inizio:</strong> {formatDate(currentProject.startDate)}</p>
                    <p><strong>Data Fine:</strong> {formatDate(currentProject.endDate)}</p>
                    <p><strong>Località:</strong> {currentProject.location || 'N/D'}</p>
                    <p><strong>Visibile sul sito:</strong> {currentProject.visible ? 'Sì' : 'No'}</p>
                  </Col>
                </Row>
              </div>

              <div className="my-4">
                <h5>Descrizione</h5>
                <p>{currentProject.description || 'Nessuna descrizione disponibile.'}</p>
              </div>

              {currentProject.notes && (
                <div className="my-4">
                  <h5>Note</h5>
                  <p>{currentProject.notes}</p>
                </div>
              )}

              <div className="my-4">
                <h5>Immagini</h5>
                {uploadedImages?.length > 0 ? (
                  <p>{uploadedImages.length} immagini disponibili</p>
                  /* Qui potrebbe essere visualizzata una galleria di immagini */
                ) : (
                  <p>Nessuna immagine disponibile</p>
                )}

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowImagesModal(true)}
                  className="mt-2"
                >
                  <FontAwesomeIcon icon={faImage} className="me-2" />
                  Gestisci Immagini
                </Button>
              </div>

              <div className="mt-4">
                <p><strong>Creato il:</strong> {formatDate(currentProject.createdAt)}</p>
                <p><strong>Ultimo aggiornamento:</strong> {formatDate(currentProject.updatedAt)}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Chiudi
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowViewModal(false);
              handleEditClick(currentProject);
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Modifica
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Elimina Progetto */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conferma Eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentProject && (
            <p>
              Sei sicuro di voler eliminare il progetto <strong>{currentProject.title}</strong>?<br />
              Questa azione non può essere annullata e rimuoverà anche tutte le immagini associate.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Annulla
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteProject}
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
                Eliminazione...
              </>
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
