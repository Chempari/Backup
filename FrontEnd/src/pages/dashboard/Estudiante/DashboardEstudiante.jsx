import { useState, useEffect, useMemo } from 'react';
import api from '../../../Api/axios';
import { EstudianteHeader } from './components/EstudianteHeader';
import { ResumenCards } from './components/ResumenCards';
import { CursosLista } from './components/CursosLista';
import './DashboardEstudiante.css';

export function DashboardEstudiante() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ categoria: 'Todos', nivel: 'Todos', precio: 'Todos' });

  useEffect(() => {
    api.get('/Dashboard/estudiante')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Error al cargar dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const resumen = data?.resumen || {};
  const inscripciones = useMemo(() => data?.inscripciones || [], [data]);

  const categorias = useMemo(() => {
    const set = new Set();
    inscripciones.forEach((i) => {
      const c = i.curso_id && i.curso_id.categoria;
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [inscripciones]);

  const inscripcionesFiltradas = useMemo(() => {
    return inscripciones.filter((insc) => {
      const curso = insc.curso_id || {};
      if (filtros.categoria !== 'Todos' && curso.categoria !== filtros.categoria) return false;
      if (filtros.nivel !== 'Todos' && curso.nivel !== filtros.nivel) return false;
      if (filtros.precio === 'Gratis' && (curso.precio || 0) > 0) return false;
      if (filtros.precio === 'Pagado' && (curso.precio || 0) === 0) return false;
      return true;
    });
  }, [inscripciones, filtros]);

  const filtrosActivos = filtros.categoria !== 'Todos' || filtros.nivel !== 'Todos' || filtros.precio !== 'Todos';

  return (
    <div className="dashboard-wrapper">
      <main className="main-content">
        <EstudianteHeader filtros={filtros} onChange={setFiltros} categorias={categorias} />
        <ResumenCards resumen={resumen} loading={loading} />

        {loading ? (
          <div style={{ color: 'var(--blanco-puro)', textAlign: 'center', padding: '40px', fontSize: '18px' }}>
            Cargando tus cursos...
         </div>
        ) : error ? (
          <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '20px', background: 'rgba(255,0,0,0.1)', borderRadius: '12px', border: '1px solid rgba(255,0,0,0.2)' }}>
            {error}
         </div>
        ) : (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--blanco-puro)', marginBottom: '24px' }}>
              Mis cursos
           </h2>
            {inscripcionesFiltradas.length === 0 ? (
              <p style={{ color: 'rgba(232, 240, 236, 0.7)', textAlign: 'center', padding: '32px', fontSize: '16px' }}>
                {filtrosActivos
                  ? 'No hay cursos que coincidan con los filtros seleccionados.'
                  : 'Aun no estas inscrito en ningun curso.'}
             </p>
            ) : (
              <CursosLista inscripciones={inscripcionesFiltradas} />
            )}
         </>
        )}
     </main>
   </div>
  );
}
