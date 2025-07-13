import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

// Importazione dei componenti
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ChiSiamo from './pages/ChiSiamo';
import Servizi from './pages/Servizi';
import ServizioDettaglio from './pages/ServizioDettaglio';
import Progetti from './pages/Progetti';
import ProgettoDettaglio from './pages/ProgettoDettaglio';
import TecnologiaQualita from './pages/TecnologiaQualita';
import Contatti from './pages/Contatti';
import AreaClienti from './pages/AreaClienti';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/common/ScrollToTop';

// Importazione degli stili
import './App.css';
import './styles/PageHeader.css';
import './styles/Buttons.css';

// Configurazione delle icone FontAwesome
library.add(fab, fas);

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chi-siamo" element={<ChiSiamo />} />
          <Route path="/servizi" element={<Servizi />} />
          <Route path="/servizi/:tipo" element={<ServizioDettaglio />} />
          <Route path="/progetti" element={<Progetti />} />
          <Route path="/progetti/:id" element={<ProgettoDettaglio />} />
          <Route path="/tecnologia-qualita" element={<TecnologiaQualita />} />
          <Route path="/contatti" element={<Contatti />} />
          <Route path="/area-clienti" element={<AreaClienti />} /> 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
