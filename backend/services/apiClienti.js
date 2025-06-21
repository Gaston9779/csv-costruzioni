const axios = require('axios');
require('dotenv').config();

/**
 * Servizio per interagire con l'API esterna dei clienti
 */
class ClientiAPIService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: process.env.API_CLIENT_URL,
      headers: {
        'Authorization': `Bearer ${process.env.API_CLIENT_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 secondi
    });
  }

  /**
   * Recupera tutti i clienti dall'API esterna
   */
  async getAllClients() {
    try {
      const response = await this.apiClient.get('/');
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero dei clienti dall\'API:', error.message);
      throw new Error('Impossibile recuperare i clienti dall\'API esterna');
    }
  }

  /**
   * Recupera un cliente specifico dall'API esterna
   */
  async getClientById(clientId) {
    try {
      const response = await this.apiClient.get(`/${clientId}`);
      return response.data;
    } catch (error) {
      console.error(`Errore nel recupero del cliente ${clientId} dall'API:`, error.message);
      throw new Error(`Impossibile recuperare il cliente ${clientId} dall'API esterna`);
    }
  }

  /**
   * Cerca un cliente per email
   */
  async findClientByEmail(email) {
    try {
      const response = await this.apiClient.get(`/search?email=${email}`);
      return response.data;
    } catch (error) {
      console.error(`Errore nella ricerca del cliente con email ${email}:`, error.message);
      return null;
    }
  }
}

module.exports = new ClientiAPIService();
