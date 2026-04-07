import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ClientiList } from './pages/ClientiList';
import { ClienteDettaglio } from './pages/ClienteDettaglio';
import { ClienteForm } from './pages/ClienteForm';
import { SopralluoghiList } from './pages/SopralluoghiList';
import { SopralluogoForm } from './pages/SopralluogoForm';
import { SopralluogoDettaglio } from './pages/SopralluogoDettaglio';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clienti" element={<ClientiList />} />
          <Route path="clienti/nuovo" element={<ClienteForm />} />
          <Route path="clienti/:id" element={<ClienteDettaglio />} />
          <Route path="clienti/:id/modifica" element={<ClienteForm />} />
          <Route path="sopralluoghi" element={<SopralluoghiList />} />
          <Route path="sopralluoghi/nuovo" element={<SopralluogoForm />} />
          <Route path="sopralluoghi/:id" element={<SopralluogoDettaglio />} />
          <Route path="sopralluoghi/:id/modifica" element={<SopralluogoForm />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
