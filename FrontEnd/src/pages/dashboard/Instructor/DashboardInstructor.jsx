import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../Api/axios';
import { SummaryCard } from '../shared';
import { InstructorCourses } from './components/InstructorCourses';
import { InstructorComentariosRecientes } from './components/InstructorComentariosRecientes';
import './DashboardInstructor.css';
import '../shared/dashboard-shared.css';

export function DashboardInstructor() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/Dashboard/instructor')
      .then((res) => {
        setData(res.data);
        setError('');
      })
      .catch((err) => {
        const msg = (err.response && err.response.data && err.response.data.message) || err.message || 'Error al cargar dashboard';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const togglePublicado = async (curso) => {
    try {
      const res = await api.patch(`/Cursos/${curso._id}/publicar`);
      setData((prev) => (prev ? {
        ...prev,
        cursos: prev.cursos.map((c) => (c._id === curso?._id ? ((res.data && res.data.curso) || c) : c))
      } : prev));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCurso = async (cursoId) => {
    if (!confirm('Eliminar este curso y todo su contenido?')) return;
    try {
      await api.delete(`/Cursos/${cursoId}`);
      setData((prev) => (prev ? {
        ...prev,
        cursos: (prev.cursos || []).filter((c) => c._id !== cursoId)
      } : prev));
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.message) || 'Error al eliminar');
    }
  };

  if (loading) return <div className="dash-loading">Cargando</div>;
  if (error) return <div className="dash-error">{error}</div>;

  const resumen = (data && data.resumen) || {};
  const cursos = (data && data.cursos) || [];
  const comentarios = (data && data.comentariosRecientes) || [];

  return (
    <div className="dashboard-instructor">
      <div className="dashboard-instructor__topbar">
        <div>
          <h1 className="dashboard-instructor__role">Instructor</h1>
          <p className="dashboard-instructor__subtitle">Bienvenido a tus estudiantes y crea nuevos cursos</p>
       </div>
        <Link to="/cursos/nuevo" className="dashboard-instructor__create-action">Crear curso</Link>
     </div>

      <div className="summary-cards">
        <SummaryCard value={resumen.total_cursos || 0} label="Cursos totales" />
        <SummaryCard value={resumen.cursos_publicados || 0} label="Publicados" />
        <SummaryCard value={resumen.total_estudiantes || 0} label="Estudiantes" />
        <SummaryCard value={resumen.calificacion_promedio_global || 0} label="Calif. promedio" />
     </div>

      <h2 className="dashboard-instructor__section-title">Mis cursos</h2>
      <InstructorCourses 
        cursos={cursos} 
        onTogglePublicado={togglePublicado} 
        onDelete={deleteCurso}
        onVisualizar={(cursoId) => window.open(`/cursos/${cursoId}?instructor=true`, '_blank')}
        onVerInscritos={() => {}}
      />

      <h2 className="dashboard-instructor__section-title">Comentarios recientes</h2>
      <InstructorComentariosRecientes comentarios={comentarios} />
   </div>
  );
}