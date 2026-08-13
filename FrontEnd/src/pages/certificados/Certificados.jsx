import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../Api/axios';
import { imageUrl } from '../../utils';
import { StarIcon } from '../../components/Icons';
import './Certificados.css';

export function Certificados() {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/Certificados/mios')
      .then((res) => setCertificados(res.data.certificados || []))
      .catch((err) => setError(err.response?.data?.message || 'Error al cargar certificados'))
      .finally(() => setLoading(false));
  }, []);

  const fmtFecha = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="certificados-page">
      <div className="certificados-header">
        <h1>Mis Certificados</h1>
        <p>Tus constancias de finalizacion de cursos</p>
     </div>

      {loading ? (
        <div className="dash-loading">Cargando certificados</div>
      ) : error ? (
        <div className="dash-error">{error}</div>
      ) : certificados.length === 0 ? (
        <div className="certificados-empty">
          <p>Aun no tienes certificados</p>
          <Link to="/dashboard" className="certificados-link">Ir al dashboard</Link>
       </div>
      ) : (
        <div className="certificados-grid">
          {certificados.map((cert) => (
            <Link
              key={cert._id}
              to={'/certificates/' + cert._id}
              className="certificado-card"
            >
              <div className="certificado-card-media">
                {cert.curso_id?.imagen ? (
                  <img src={imageUrl(cert.curso_id.imagen)} alt={cert.curso_id.titulo} />
                ) : (
                  <div className="certificado-card-placeholder"><StarIcon size={40} /></div>
                )}
             </div>
              <div className="certificado-card-info">
                <span className="certificado-card-tag">Certificado</span>
                <h3>{cert.curso_id?.titulo || 'Curso'}</h3>
                <span className="certificado-card-fecha">
                  Finalizado el {fmtFecha(cert.fecha_finalizacion)}
               </span>
             </div>
           </Link>
          ))}
       </div>
      )}
   </div>
  );
}
