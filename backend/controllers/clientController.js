const Client = require('../models/Client');
const Document = require('../models/Document');
const Project = require('../models/Project');
const path = require('path');

/**
 * Controller per le operazioni accessibili ai clienti
 */
const clientController = {
  /**
   * Ottiene il profilo del cliente autenticato
   */
  getProfile: async (req, res) => {
    try {
      // L'ID del cliente è disponibile da req.user (dal token JWT)
      const userId = req.user.id;
      
      // Recupero del profilo cliente
      const client = await Client.findById(userId).select('-password');
      
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Profilo cliente non trovato'
        });
      }
      
      res.json({
        success: true,
        profile: {
          id: client._id,
          name: client.name,
          email: client.email,
          created_at: client.created_at
        }
      });
      
    } catch (error) {
      console.error('Errore durante il recupero del profilo cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante il recupero del profilo'
      });
    }
  },
  
  /**
   * Ottiene i progetti del cliente autenticato
   */
  getProjects: async (req, res) => {
    try {
      const clientId = req.user.id;
      
      // Recupero progetti che appartengono al cliente
      const projects = await Project.find({ client: clientId })
        .sort({ updatedAt: -1 });
      
      res.json({
        success: true,
        projects: projects.map(project => ({
          id: project._id,
          projectId: project.projectId,
          title: project.title,
          description: project.description,
          category: project.category,
          status: project.status || 'In corso',
          progress: project.progress || 0,
          startDate: project.startDate,
          endDate: project.endDate,
          updatedAt: project.updatedAt,
          notes: project.notes,
          images: project.images ? project.images.map(img => ({
            url: img.url,
            caption: img.caption
          })) : []
        }))
      });
      
    } catch (error) {
      console.error('Errore durante il recupero dei progetti:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante il recupero dei progetti'
      });
    }
  },
  
  /**
   * Ottiene i documenti del cliente autenticato
   */
  getDocuments: async (req, res) => {
    try {
      // L'ID del cliente è disponibile da req.user (dal token JWT)
      const clientId = req.user.id;
      
      // Recupero documenti del cliente
      const documents = await Document.find({ client: clientId })
        .sort({ uploaded_at: -1 });
      
      res.json({
        success: true,
        documents: documents.map(doc => ({
          id: doc._id,
          title: doc.title,
          fileName: doc.file_name,
          fileType: doc.file_type,
          fileSize: doc.file_size,
          uploadedAt: doc.uploaded_at
        }))
      });
      
    } catch (error) {
      console.error('Errore durante il recupero dei documenti del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante il recupero dei documenti'
      });
    }
  },
  
  /**
   * Scarica un documento specifico del cliente
   */
  downloadDocument: async (req, res) => {
    try {
      const { documentId } = req.params;
      const clientId = req.user.id;
      
      // Recupero documento verificando che appartenga al cliente
      const document = await Document.findOne({
        _id: documentId,
        client: clientId
      });
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Documento non trovato o non hai i permessi per accedervi'
        });
      }
      
      // Ottieni il path del file e il nome
      const filePath = document.file_path;
      const fileName = document.file_name;
      
      // Verifica che il file esista
      if (!filePath) {
        return res.status(404).json({
          success: false,
          message: 'File non trovato'
        });
      }
      
      // Imposta headers per il download
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', document.file_type);
      
      // Invia il file
      res.sendFile(path.resolve(filePath));
      
    } catch (error) {
      console.error('Errore durante il download del documento:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante il download del documento'
      });
    }
  },
  
  /**
   * Ottiene statistiche sui documenti del cliente
   */
  getDocumentStats: async (req, res) => {
    try {
      const clientId = req.user.id;
      
      // Conta i documenti del cliente
      const count = await Document.countDocuments({ client: clientId });
      
      // Trova il documento più recente
      const latestDocument = await Document.findOne({ client: clientId })
        .sort({ uploaded_at: -1 });
      
      // Calcola la dimensione totale
      const documents = await Document.find({ client: clientId });
      const totalSize = documents.reduce((sum, doc) => sum + doc.file_size, 0);
      
      res.json({
        success: true,
        stats: {
          count,
          latestUpload: latestDocument ? latestDocument.uploaded_at : null,
          totalSize
        }
      });
      
    } catch (error) {
      console.error('Errore durante il recupero delle statistiche:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante il recupero delle statistiche dei documenti'
      });
    }
  }
};

module.exports = clientController;
