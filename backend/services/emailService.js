const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Servizio per l'invio di email
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465', // true solo per porta 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  /**
   * Invia email di benvenuto con credenziali al nuovo cliente
   * @param {Object} client - Dati del cliente
   * @param {string} password - Password in chiaro (da inviare solo via email)
   */
  async sendWelcomeEmail(client, password) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: client.email,
        subject: 'Benvenuto nell\'Area Clienti di Costruzioni Viola',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1a3c6c; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Costruzioni Viola</h1>
              <p style="color: #ffa500; margin: 5px 0 0 0;">Area Clienti</p>
            </div>
            
            <div style="padding: 20px; border: 1px solid #eee;">
              <h2>Benvenuto, ${client.name}</h2>
              <p>Grazie per aver scelto Costruzioni Viola. È stato creato un account per accedere all'area clienti riservata.</p>
              
              <h3>Le tue credenziali di accesso:</h3>
              <p><strong>Email:</strong> ${client.email}</p>
              <p><strong>Password temporanea:</strong> ${password}</p>
              
              <p style="margin-top: 20px;">Per accedere all'area riservata, visita: 
                <a href="https://www.costruzioniviola.it/area-clienti" style="color: #1a3c6c;">Area Clienti</a>
              </p>
              
              <div style="background-color: #f8f9fa; padding: 15px; margin-top: 20px; border-left: 4px solid #ffa500;">
                <p style="margin: 0;"><strong>Nota:</strong> Per ragioni di sicurezza, ti consigliamo di cambiare la password al primo accesso.</p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Costruzioni Viola. Tutti i diritti riservati.</p>
              <p>Questa email è stata inviata automaticamente, si prega di non rispondere.</p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email di benvenuto inviata:', info.messageId);
      return info;
    } catch (error) {
      console.error('Errore nell\'invio dell\'email di benvenuto:', error);
      throw new Error('Impossibile inviare l\'email di benvenuto');
    }
  }

  /**
   * Invia notifica di nuovo documento caricato
   * @param {Object} client - Dati del cliente
   * @param {Object} document - Dati del documento
   */
  async sendNewDocumentNotification(client, document) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: client.email,
        subject: 'Nuovo documento disponibile - Costruzioni Viola',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1a3c6c; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Costruzioni Viola</h1>
              <p style="color: #ffa500; margin: 5px 0 0 0;">Area Clienti</p>
            </div>
            
            <div style="padding: 20px; border: 1px solid #eee;">
              <h2>Nuovo documento disponibile</h2>
              <p>Gentile ${client.name},</p>
              <p>Ti informiamo che un nuovo documento è stato caricato nell'Area Clienti:</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #1a3c6c;">
                <p><strong>Titolo:</strong> ${document.title}</p>
                <p><strong>Data caricamento:</strong> ${new Date(document.uploaded_at).toLocaleDateString('it-IT')}</p>
              </div>
              
              <p>Per visualizzare il documento, accedi alla tua 
                <a href="https://www.costruzioniviola.it/area-clienti" style="color: #1a3c6c;">Area Clienti</a>
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Costruzioni Viola. Tutti i diritti riservati.</p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email di notifica documento inviata:', info.messageId);
      return info;
    } catch (error) {
      console.error('Errore nell\'invio dell\'email di notifica documento:', error);
      // Non interrompiamo il processo se fallisce l'invio email di notifica
    }
  }
}

module.exports = new EmailService();
