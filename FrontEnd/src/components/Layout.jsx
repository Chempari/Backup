import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { LayoutBackground } from './LayoutBackground';
import api from '../Api/axios';
import './layout.css';

export function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const content = document.querySelector('.layout-page-transition');
    if (!content) return;

    content.classList.remove('page-enter');
    void content.offsetWidth;
    content.classList.add('page-enter');
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Search functionality
  const fetchTrending = async () => {
    try {
      setSearchLoading(true);
      const res = await api.get('/Cursos/tendencia');
      if (res.data.success) {
        setSearchResults(res.data.cursos);
      }
    } catch (err) {
      console.error('Error fetching trending:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const searchCourses = async (query) => {
    if (!query.trim()) {
      await fetchTrending();
      return;
    }
    try {
      setSearchLoading(true);
      const res = await api.get('/Cursos', { params: { titulo: query, limite: 5 } });
      if (res.data.success) {
        setSearchResults(res.data.cursos || res.data.data?.cursos || []);
      }
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(true);
    const debounce = setTimeout(() => searchCourses(value), 300);
    return () => clearTimeout(debounce);
  };

  const handleSearchFocus = () => {
    if (!searchQuery.trim()) fetchTrending();
    else searchCourses(searchQuery);
    setShowResults(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  const handleResultClick = (curso) => {
    navigate('/cursos/' + curso._id);
    setSearchQuery('');
    setShowResults(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    if (showResults) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showResults]);

  return (
    <div className="layout-wrapper">
      {/* Fondo Geométrico Global para toda la app */}
      <LayoutBackground />

      {/* NAVBAR GLASSMORPHISM GLOBAL */}
      <nav className="layout-navbar" style={{ zIndex: 100 }}>
        <Link to="/dashboard" className="layout-logo" style={{ textDecoration: 'none' }}>
          MENTORA
        </Link>

        {/* Buscador funcional */}
        <div className="layout-search layout-input-container" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Buscar cursos..."
            className="layout-input layout-search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          <span className="layout-input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          {showResults && (
            <div className="layout-search-dropdown">
              {searchLoading ? (
                <div className="layout-search-loading">Buscando...</div>
              ) : searchResults.length === 0 ? (
                <div className="layout-search-empty">No se encontraron cursos</div>
              ) : (
                searchResults.map((curso) => (
                  <button
                    key={curso._id}
                    type="button"
                    className="layout-search-result"
                    onClick={() => handleResultClick(curso)}
                  >
                    <img src={curso.imagen ? `http://localhost:3977${curso.imagen}` : ''} alt={curso.titulo} className="layout-search-result-img" onError={(e) => e.target.style.display='none'} />
                    <div className="layout-search-result-info">
                      <span className="layout-search-result-title">{curso.titulo}</span>
                      <span className="layout-search-result-meta">{curso.categoria} · {curso.nivel}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="layout-auth-buttons">
          <Link to="/explorar" className="layout-btn-text" style={{ textDecoration: 'none' }}>Explorar</Link>
          <Link to="/dashboard" className="layout-btn-text" style={{ textDecoration: 'none' }}>Dashboard</Link>

          {/* Opciones exclusivas para instructor */}
          {user?.rol === 'instructor' && (
            <Link to="/cursos/nuevo" className="layout-btn-text" style={{ textDecoration: 'none' }}>Crear curso</Link>
          )}

          {user?.rol !== 'instructor' && (
            <Link to="/certificates" className="layout-btn-text" style={{ textDecoration: 'none' }}>Mis Certificados</Link>
          )}
          <Link to="/perfil" className="layout-btn-text" style={{ textDecoration: 'none' }}>Perfil</Link>

          {/* Nombre del usuario dinámico */}
          <span style={{ fontSize: '14px', color: 'rgb(255, 255, 255)', marginLeft: '8px', fontWeight: 500 }}>
            {user?.nombre || 'Usuario'}
          </span>

          {/* Botón de cerrar sesión unificado */}
          <button className="layout-btn-primary layout-btn-nav" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL DINÁMICO */}
      <main key={location.pathname} className="layout-content layout-page-transition" style={{ position: 'relative', zIndex: 10 }}>
        {/* Renderizado de título dinámico si se pasa la prop 'title' */}
        {title && (
          <div className="layout-header-section" style={{ marginBottom: '24px' }}>
            <h1 className="layout-title" style={{ textAlign: 'left' }}>{title}</h1>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}