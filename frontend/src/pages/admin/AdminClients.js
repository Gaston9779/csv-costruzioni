import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Modal, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faFileAlt,
  faSearch,
  faUserPlus,
  faCheck,
  faTimes,
  faProjectDiagram
} from '@fortawesome/free-solid-svg-icons';

const AdminClients = ({ onStatsUpdate }) => {
  console.log("AdminClients componente inizializzato");

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [currentClient, setCurrentClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    external_id: '',
    notes: ''
  });

  // Carica i clienti all'avvio
  useEffect(() => {
    console.log("AdminClients - useEffect iniziale");
    fetchClients();
  }, []);

  // Esponiamo la funzione fetchClients per permettere l'aggiornamento dall'esterno
  useEffect(() => {
    // Definiamo un oggetto globale per esporre le funzioni di refresh
    if (window.AdminClientsRefresh) {
      window.AdminClientsRefresh.fetchClients = fetchClients;
    } else {
      window.AdminClientsRefresh = {
        fetchClients
      };
    }

    return () => {
      // Pulizia quando il componente viene smontato
      console.log("AdminClients smontato, cleanup refresh functions");
      window.AdminClientsRefresh = null;
    };
  }, []);

  // Filtra i clienti in base al termine di ricerca
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.external_id && client.external_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Carica i clienti dal backend
  const fetchClients = async () => {
    console.log("Avvio fetchClients...");
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log("Risposta fetchClients:", data);

      if (data.success) {
        // Combina localClients e externalClients in un unico array
        const allClients = [
          ...(data.localClients || []),
          ...(data.externalClients || [])
        ];
        
        setClients(allClients);
        console.log("Clienti caricati:", allClients.length);
        
        if (onStatsUpdate && typeof onStatsUpdate === 'function') {
          onStatsUpdate(); // Aggiorna le statistiche nel componente padre
        }
      } else {
        setError(data.message || 'Errore nel caricamento dei clienti');
        console.error("Errore nel caricamento dei clienti:", data.message);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Gestisce l'invio del form per aggiungere/modificare un cliente
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEditing = !!currentClient;
    setLoading(true);
    setError('');
    setSuccess('');

    console.log(`${isEditing ? 'Aggiornamento' : 'Creazione'} cliente in corso...`, formData);

    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `http://localhost:5000/api/admin/clients/${currentClient._id}`
        : 'http://localhost:5000/api/admin/clients';

      const method = isEditing ? 'PUT' : 'POST';
      console.log("Richiesta API:", method, url);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log("Risposta API:", data);

      if (data.success) {
        setSuccess(isEditing ? 'Cliente aggiornato con successo' : 'Cliente creato con successo');
        console.log("Operazione completata, ricarico clienti...");
        await fetchClients();
        if (onStatsUpdate) onStatsUpdate();

        if (isEditing) {
          setShowEditModal(false);
        } else {
          setShowAddModal(false);
        }

        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          external_id: '',
          notes: ''
        });
      } else {
        setError(data.message || 'Si è verificato un errore');
        console.error("Errore API:", data.message || 'Si è verificato un errore');
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Elimina un cliente
  const handleDeleteClient = async () => {
    if (!currentClient) return;

    console.log("Eliminazione cliente:", currentClient._id);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/clients/${currentClient._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log("Risposta eliminazione:", data);

      if (data.success) {
        setSuccess('Cliente eliminato con successo');
        console.log("Cliente eliminato, ricarico clienti...");
        await fetchClients();
        if (onStatsUpdate) onStatsUpdate();
        setShowDeleteModal(false);
      } else {
        setError(data.message || 'Errore nell\'eliminazione del cliente');
        console.error("Errore eliminazione:", data.message);
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apre il modal di modifica e popola i dati
  const handleEditClick = (client) => {
    setCurrentClient(client);

    // Per ragioni di sicurezza, lasciamo vuoto il campo password durante l'edit
    setFormData({
      name: client.name || '',
      email: client.email || '',
      password: '', // Campo password vuoto in fase di modifica
      external_id: client.external_id || '',
      notes: client.notes || ''
    });

    setShowEditModal(true);
  };

  // Apre il modal di visualizzazione
  const handleViewClick = (client) => {
    setCurrentClient(client);
    setShowViewModal(true);
  };

  // Apre il modal di eliminazione
  const handleDeleteClick = (client) => {
    setCurrentClient(client);
    setShowDeleteModal(true);
  };

  // Apre il modal per aggiungere un nuovo cliente
  const handleAddClick = () => {
    setCurrentClient(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      external_id: '',
      notes: ''
    });
    setShowAddModal(true);
  };

  useEffect(() => {
    console.log("AdminClients montato, fetchClients parte", clients);
    fetchClients();
  }, []);

  useEffect(() => {
    console.log("AdminClients montato", currentClient);
  }, [currentClient]);

  return (
    <div className="admin-clients">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestione Clienti</h2>
        <Button
          variant="success"
          onClick={handleAddClick}
        >
          <FontAwesomeIcon icon={faUserPlus} className="me-2" />
          Nuovo Cliente
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="search-box">
              <div className="input-group">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Cerca cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Button
                variant="outline-secondary"
                onClick={fetchClients}
                disabled={loading}
              >
                {loading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  'Aggiorna'
                )}
              </Button>
            </div>
          </div>

          {loading && clients.length === 0 ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Caricamento...</span>
              </Spinner>
              <p className="mt-3">Caricamento clienti...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>ID Cliente</th>
                    <th>Ruolo</th>
                    <th>Documenti</th>
                    <th>Progetti</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        {searchTerm ? 'Nessun cliente trovato con questi criteri' : 'Nessun cliente disponibile'}
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map(client => (
                      <tr key={client._id}>
                        <td>{client.name}</td>
                        <td>{client.email}</td>
                        <td>{client.external_id || '-'}</td>
                        <td>
                          <span className={`badge ${client.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                            {client.role === 'admin' ? 'Admin' : 'Cliente'}
                          </span>
                        </td>
                        <td>{client.documentCount || 0}</td>
                        <td>{client.projectCount || 0}</td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="me-1"
                            onClick={() => handleViewClick(client)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleEditClick(client)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          {client.role !== 'admin' && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(client)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Aggiungi Cliente */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Aggiungi Nuovo Cliente</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Minimo 6 caratteri
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    name="external_id"
                    value={formData.external_id}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Opzionale, per riferimento interno
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Annulla
            </Button>
            <Button
              variant="success"
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
                  Creazione...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                  Crea Cliente
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Modifica Cliente */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifica Cliente</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Password
                    {currentClient && (
                      <small className="text-muted ms-2">
                        (Lasciare vuoto per mantenere la password attuale)
                      </small>
                    )}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={currentClient ? "Inserisci solo se vuoi cambiarla" : "Inserisci password"}
                    required={!currentClient} // Richiesto solo per nuovi client
                  />
                  {currentClient && (
                    <Form.Text className="text-muted">
                      Per ragioni di sicurezza, non è possibile visualizzare la password attuale.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    name="external_id"
                    value={formData.external_id}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
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
                  Aggiornamento...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  Aggiorna
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Visualizza Cliente */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Dettagli Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentClient && (
            <div>
              <p><strong>Nome:</strong> {currentClient.name}</p>
              <p><strong>Email:</strong> {currentClient.email}</p>
              <p><strong>ID Cliente:</strong> {currentClient.external_id || 'Non specificato'}</p>
              <p><strong>Ruolo:</strong> {currentClient.role === 'admin' ? 'Amministratore' : 'Cliente'}</p>
              <p><strong>Data registrazione:</strong> {new Date(currentClient.created_at).toLocaleDateString('it-IT')}</p>
              <p><strong>Ultimo aggiornamento:</strong> {new Date(currentClient.updated_at).toLocaleDateString('it-IT')}</p>
              <p><strong>Note:</strong> {currentClient.notes || 'Nessuna nota'}</p>

              <div className="mt-4 d-flex flex-column gap-3">
                <div>
                  <h6>Documenti associati: {currentClient.documentCount || 0}</h6>
                  {currentClient.documentCount > 0 && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        setShowViewModal(false);
                        // Qui potrebbe andare alla pagina dei documenti del cliente
                      }}
                    >
                      <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                      Visualizza Documenti
                    </Button>
                  )}
                </div>
                
                <div>
                  <h6>Progetti associati: {currentClient.projectCount || 0}</h6>
                  {currentClient.projectCount > 0 && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => {
                        setShowViewModal(false);
                        // Qui potrebbe andare alla pagina dei progetti del cliente
                      }}
                    >
                      <FontAwesomeIcon icon={faProjectDiagram} className="me-2" />
                      Visualizza Progetti
                    </Button>
                  )}
                </div>
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
              handleEditClick(currentClient);
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Modifica
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Conferma Eliminazione */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conferma Eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentClient && (
            <p>
              Sei sicuro di voler eliminare il cliente <strong>{currentClient.name}</strong>?<br />
              Questa azione non può essere annullata e rimuoverà anche tutti i documenti associati.
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
            onClick={handleDeleteClient}
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
};

export default AdminClients;
