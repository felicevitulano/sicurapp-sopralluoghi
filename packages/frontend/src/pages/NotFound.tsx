import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="text-6xl font-bold text-gray-200">404</p>
      <p className="text-gray-600 mt-2">Pagina non trovata</p>
      <Link to="/dashboard" className="btn-primary mt-4">Vai alla Dashboard</Link>
    </div>
  );
}
