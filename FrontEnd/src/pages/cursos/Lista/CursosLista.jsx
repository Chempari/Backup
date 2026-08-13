import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../Api/axios';
import { CursoCard } from './components/CursoCard';
import './CursosLista.css';

const NIVELES = ['', 'principiante', 'intermedio', 'avanzado'];
const PRECIO_RANGOS = [
  { value: '', label: 'Todos los precios' },
  { value: '0,0', label: 'Gratis' },
  { value: '0,100', label: '0 - 100' },
  { value: '100,300', label: '100 - 300' },
  { value: '300,700', label: '300 - 700' },
  { value: '700,', label: '700+' },
];

export function CursosLista() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const filters = {
    titulo: searchParams.get('q') || '',
    categoria: searchParams.get('categoria') || '',
    nivel: searchParams.get('nivel') || '',
    precio: searchParams.get('precio') || '',
  };

  useEffect(() => {
    api.get('/Cursos/categorias')
      .then((res) => setCategorias(res.data.categorias || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const q = {};
    if (filters.titulo) q.titulo = filters.titulo;
    if (filters.categoria) q.categoria = filters.categoria;
    if (filters.nivel) q.nivel = filters.nivel;
    if (filters.precio) {
      const [min, max] = filters.precio.split(',');
      if (min !== undefined && min !== '') q.precio_min = Number(min);
      if (max !== undefined && max !== '') q.precio_max = Number(max);
    }

    let cancelado = false;
    api.get('/Cursos', { params: q })
      .then((res) => { if (!cancelado) setCursos(res.data.cursos || res.data.data?.cursos || []); })
      .catch((err) => { if (!cancelado) setError(err.response?.data?.message || 'Error al cargar cursos'); })
      .finally(() => { if (!cancelado) setLoading(false); });

    return () => { cancelado = true; };
  }, [filters.titulo, filters.categoria, filters.nivel, filters.precio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next);
    setError('');
    setLoading(true);
  };

  return (
    <div className="lista-page">
      <div className="lista-filters">
        <input name="titulo" placeholder="Buscar por titulo..." value={filters.titulo} onChange={handleChange} />
        <select name="categoria" value={filters.categoria} onChange={handleChange}>
          <option value="">Todas las categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select name="nivel" value={filters.nivel} onChange={handleChange}>
          <option value="">Todos los niveles</option>
          {NIVELES.filter(Boolean).map((n) => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
        </select>
        <select name="precio" value={filters.precio} onChange={handleChange}>
          {PRECIO_RANGOS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {loading && <div className="dash-loading">Cargando cursos...</div>}
      {error && <div className="dash-error">{error}</div>}

      {!loading && !error && (
        <div className="lista-grid" style={{ marginTop: 24 }}>
          {cursos.length === 0 ? (
            <p className="lista-empty-message">No se encontraron cursos.</p>
          ) : (
            cursos.map((curso) => <CursoCard key={curso._id} curso={curso} />)
          )}
        </div>
      )}
    </div>
  );
}
