import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../Api/axios';
import './CertificadoDetalle.css';

export function CertificadoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/Certificados/' + id)
      .then((res) => setCert(res.data.certificado))
      .catch((err) => setError(err.response?.data?.message || 'Error al cargar certificado'))
      .finally(() => setLoading(false));
  }, [id]);

  const fmtFecha = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  if (loading) return <div className="dash-loading">Cargando certificado</div>;
  if (error) return <div className="dash-error">{error}</div>;
  if (!cert) return <div className="dash-error">Certificado no encontrado</div>;

  const nombre = (cert.usuario_id?.nombre || 'Estudiante') + (cert.usuario_id?.apellido ? ' ' + cert.usuario_id.apellido : '');
  const curso = cert.curso_id?.titulo || 'Curso';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cert-page">
      <div className="cert-actions no-print">
        <button className="cert-btn-secondary" onClick={() => navigate(-1)}>Volver</button>
        <button className="cert-btn-primary" onClick={handlePrint}>Imprimir / Guardar como PDF</button>
     </div>

      <div className="certificado">
        <div className="certificado-border">
          <div className="certificado-header">
            <div className="certificado-brand">MENTORA</div>
            <div className="certificado-tipo">Certificado de Finalizacion</div>
         </div>

          <div className="certificado-body">
            <p className="certificado-otorgado">Se otorga el presente certificado a</p>
            <h1 className="certificado-nombre">{nombre}</h1>
            <p className="certificado-por">por haber completado satisfactoriamente el curso</p>
            <h2 className="certificado-curso">{curso}</h2>
            <p className="certificado-fecha">
              Finalizado el <strong>{fmtFecha(cert.fecha_finalizacion)}</strong>
           </p>
         </div>

          <div className="certificado-footer">
            <div className="certificado-firma">
              <svg viewBox="0 0 200 60" className="certificado-firma-svg">
                <path
                  d="M10 40 C 30 10, 50 50, 70 25 S 110 50, 130 30 S 170 40, 190 20"
                  fill="none"
                  stroke="#1b2e26"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
             </svg>
              <div className="certificado-firma-linea"></div>
              <div className="certificado-firma-nombre">Direccion Academica</div>
              <div className="certificado-firma-cargo">Mentora</div>
           </div>

            <div className="certificado-sello">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#5d55dd" strokeWidth="2" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#5d55dd" strokeWidth="1" />
                <text x="50" y="45" textAnchor="middle" fontSize="10" fill="#5d55dd" fontWeight="bold">MENTORA</text>
                <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#5d55dd">CERTIFICADO</text>
             </svg>
           </div>
         </div>

          <div className="certificado-id">ID: {cert._id}</div>
       </div>
     </div>
   </div>
  );
}
