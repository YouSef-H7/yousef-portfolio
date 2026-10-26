import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './content.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Admin from './pages/admin/Admin.jsx';
import NotFound from './pages/NotFound.jsx';
import './styles/site.css';
import './styles/admin.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ContentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  </React.StrictMode>,
);
