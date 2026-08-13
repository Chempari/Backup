import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../Api/axios';
import './PublicNavbar.css';

export function PublicNavbar({ onNosotrosClick, categorias = [] }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    if (dropdownOpen || searchOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [dropdownOpen, searchOpen]);

  const irACategoria = (cat) => {
    setDropdownOpen(false);
    navigate('/explorar?categoria=' + encodeURIComponent(cat));
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
    setSearchOpen(true);
    const debounce = setTimeout(() => searchCourses(value), 300);
    return () => clearTimeout(debounce);
  };

  const handleSearchFocus = () => {
    if (!searchQuery.trim()) fetchTrending();
    else searchCourses(searchQuery);
    setSearchOpen(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setSearchOpen(false), 200);
  };

  const handleResultClick = (curso) => {
    navigate('/cursos/' + curso._id);
    setSearchQuery('');
    setSearchOpen(false);
  };

  return (
    <nav className="public-navbar">
      <Link to="/" className="public-navbar-brand">MENTORA</Link>
      <div className="public-navbar-links">
        <Link to="/explorar">Cursos</Link>
        <div className="public-navbar-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className={"public-navbar-dropdown-trigger" + (dropdownOpen ? " public-navbar-dropdown-trigger--active" : "")}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            Categorias
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="public-navbar-dropdown-menu" role="menu">
              {categorias.length === 0 ? (
                <p className="public-navbar-dropdown-empty">Cargando...</p>
              ) : (
                categorias.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="public-navbar-dropdown-item"
                    onClick={() => irACategoria(cat)}
                    role="menuitem"
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <button type="button" className="public-navbar-link-btn" onClick={onNosotrosClick}>Nosotros</button>
      </div>
      
      {/* Buscador funcional */}
      <div className="public-navbar-search" ref={searchRef}>
        <input
          type="text"
          placeholder="Buscar cursos..."
          className="public-navbar-search-input"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="public-navbar-search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        {searchOpen && (
          <div className="public-navbar-search-dropdown">
            {searchLoading ? (
              <div className="public-navbar-search-loading">Buscando...</div>
            ) : searchResults.length === 0 ? (
              <div className="public-navbar-search-empty">No se encontraron cursos</div>
            ) : (
              searchResults.map((curso) => (
                <button
                  key={curso._id}
                  type="button"
                  className="public-navbar-search-result"
                  onClick={() => handleResultClick(curso)}
                >
                  <img src={curso.imagen ? `http://localhost:3977${curso.imagen}` : ''} alt={curso.titulo} className="public-navbar-search-result-img" onError={(e) => e.target.style.display='none'} />
                  <div className="public-navbar-search-result-info">
                    <span className="public-navbar-search-result-title">{curso.titulo}</span>
                    <span className="public-navbar-search-result-meta">{curso.categoria} · {curso.nivel}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="public-navbar-actions">
        {user ? (
          <Link to="/dashboard" className="public-navbar-btn-primary">Ir al panel</Link>
        ) : (
          <>
            <Link to="/login" className="public-navbar-btn-secondary">Iniciar sesion</Link>
            <Link to="/register" className="public-navbar-btn-primary">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}
