import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../Api/axios';
import { imageUrl } from '../../utils';
import { PublicNavbar } from '../../components/PublicNavbar';
import { Modal } from '../../components/Modal';
import { FAQ } from './FAQ';
import './Landing.css';

const BENEFICIOS = [
  { icon: 'ritmo', titulo: 'Aprende a tu ritmo', desc: 'Accede a los cursos cuando quieras, desde cualquier dispositivo.' },
  { icon: 'cert', titulo: 'Instructores certificados', desc: 'Aprende de profesionales con experiencia real en la industria.' },
  { icon: 'reloj', titulo: 'Acceso 24/7', desc: 'Tu contenido disponible todos los dias, sin horarios fijos.' },
  { icon: 'proy', titulo: 'Proyectos practicos', desc: 'Aplica lo aprendido con ejercicios y proyectos reales.' }
];

export function Landing() {
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [nosotrosOpen, setNosotrosOpen] = useState(false);
  const [terminosOpen, setTerminosOpen] = useState(false);
  const [privacidadOpen, setPrivacidadOpen] = useState(false);

  useEffect(() => {
    api.get('/Cursos', { params: { publicado: true, limite: 6 } })
      .then((res) => {
        const cursos = res.data.cursos || (res.data && res.data.data && res.data.data.cursos) || [];
        setDestacados(cursos);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/Cursos/categorias')
      .then((res) => setCategorias(res.data.categorias || []))
      .catch(console.error);
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing">
      <PublicNavbar
        onNosotrosClick={() => setNosotrosOpen(true)}
        categorias={categorias}
      />

      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-hero-eyebrow">Aprende sin limites</span>
          <h1 className="landing-hero-title">Aprende nuevas habilidades a tu propio ritmo</h1>
          <p className="landing-hero-subtitle">
            Cursos en linea con instructores expertos, proyectos practicos y certificacion al finalizar.
            Construye tu futuro profesional desde donde estes.
         </p>
          <div className="landing-hero-cta">
            <Link to="/register" className="landing-btn-primary">Empezar gratis</Link>
            <Link to="/explorar" className="landing-btn-secondary">Explorar cursos</Link>
         </div>
          <div className="landing-hero-stats">
            <div><strong>+50</strong><span>Cursos disponibles</span></div>
            <div><strong>+20</strong><span>Instructores</span></div>
            <div><strong>24/7</strong><span>Acceso total</span></div>
         </div>
       </div>
        <div className="landing-hero-visual" aria-hidden="true">
          <div className="landing-hero-shape shape-a" />
          <div className="landing-hero-shape shape-b" />
          <div className="landing-hero-shape shape-c" />
          <div className="landing-hero-illo">
            <svg viewBox="0 0 400 320" fill="none">
              <rect x="60" y="60" width="280" height="200" rx="14" fill="#fff" stroke="#1b2e26" strokeWidth="3" />
              <rect x="80" y="80" width="240" height="30" rx="6" fill="#5d55dd" />
              <circle cx="100" cy="95" r="6" fill="#fff" />
              <rect x="120" y="89" width="60" height="12" rx="3" fill="#fff" opacity="0.7" />
              <rect x="80" y="130" width="110" height="80" rx="6" fill="#e8f0ec" />
              <rect x="210" y="130" width="110" height="80" rx="6" fill="#a3beb0" />
              <rect x="80" y="225" width="240" height="14" rx="4" fill="#1b2e26" opacity="0.1" />
              <circle cx="320" cy="240" r="20" fill="#5d55dd" />
              <polygon points="312,230 332,240 312,250" fill="#fff" />
           </svg>
         </div>
       </div>
     </section>

      <section className="landing-section" id="destacados">
        <div className="landing-section-head">
          <h2>Cursos destacados</h2>
          <Link to="/explorar" className="landing-link-arrow">Ver todos</Link>
       </div>
        {loading ? (
          <p className="landing-loading">Cargando cursos</p>
        ) : destacados.length === 0 ? (
          <p className="landing-empty">Aun no hay cursos publicados. Vuelve pronto</p>
        ) : (
          <div className="landing-grid">
            {destacados.map((curso) => (
              <Link to={"/cursos/" + curso._id} key={curso._id} className="landing-card">
                <div className="landing-card-media">
                  {curso.imagen ? (
                    <img src={imageUrl(curso.imagen)} alt={curso.titulo} />
                  ) : (
                    <div className="landing-card-placeholder">
                      {(curso.titulo && curso.titulo.charAt(0)) || '?'}
                   </div>
                  )}
               </div>
                <div className="landing-card-body">
                  <span className={"landing-card-nivel " + (curso.nivel || '')}>
                    {curso.nivel || 'Todos los niveles'}
                 </span>
                  <h3>{curso.titulo}</h3>
                  {curso.instructorID && (
                    <span className="landing-card-instructor">Por {curso.instructorID.nombre}</span>
                  )}
                  <div className="landing-card-meta">
                    <span>{curso.categoria || 'General'}</span>
                    {curso.calificacion_promedio > 0 && (
                      <span className="landing-card-rating">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden="true">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        {curso.calificacion_promedio}
                      </span>
                    )}
                 </div>
               </div>
             </Link>
            ))}
         </div>
        )}
     </section>

      <section className="landing-section landing-section--alt" id="nosotros">
        <div className="landing-section-head">
          <h2>Por que elegirnos</h2>
       </div>
        <div className="landing-beneficios">
          {BENEFICIOS.map((b) => (
            <div key={b.icon} className="landing-beneficio">
              <div className="landing-beneficio-icon" aria-hidden="true">
                {b.icon === 'ritmo' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                 </svg>
                )}
                {b.icon === 'cert' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6" />
                    <polyline points="9 14 7 22 12 19 17 22 15 14" />
                 </svg>
                )}
                {b.icon === 'reloj' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                 </svg>
                )}
                {b.icon === 'proy' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                 </svg>
                )}
             </div>
              <h3>{b.titulo}</h3>
              <p>{b.desc}</p>
           </div>
          ))}
       </div>
     </section>

      <section className="landing-section" id="faq">
        <div className="landing-section-head">
          <h2>Preguntas frecuentes</h2>
       </div>
        <FAQ />
     </section>

      <footer className="landing-footer">
        <div className="landing-footer-cols">
          <div className="landing-footer-brand-col">
            <div className="landing-footer-brand">MENTORA</div>
            <p>
              Plataforma de cursos online para que aprendas a tu ritmo, con
              instructores expertos y proyectos practicos.
           </p>
            <small>&copy; {new Date().getFullYear()} Mentora. Todos los derechos reservados</small>
         </div>
          <div>
            <h4>Plataforma</h4>
            <ul>
              <li><a href="#" onClick={scrollToTop}>Inicio</a></li>
              <li><Link to="/explorar">Cursos</Link></li>
              <li><button type="button" className="landing-footer-link" onClick={() => setNosotrosOpen(true)}>Nosotros</button></li>
           </ul>
         </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><button type="button" className="landing-footer-link" onClick={() => setTerminosOpen(true)}>Terminos de servicio</button></li>
              <li><button type="button" className="landing-footer-link" onClick={() => setPrivacidadOpen(true)}>Politica de privacidad</button></li>
           </ul>
         </div>
          <div className="landing-footer-cta">
            <h4>Empieza hoy</h4>
            <p>Inscríbete de manera gratuita y obtén recomendaciones personalizadas, actualizaciones y ofertas.</p>
            <Link to="/register" className="landing-footer-cta-btn">Unete de forma gratuita</Link>
         </div>
       </div>
     </footer>

      <Modal open={nosotrosOpen} onClose={() => setNosotrosOpen(false)} title="Sobre Mentora">
        <p><strong>Mentora</strong> es una plataforma de cursos online pensada para que cualquier persona pueda aprender a su propio ritmo, desde cualquier lugar y en cualquier dispositivo.</p>
        <h3>Nuestra propuesta de valor</h3>
        <ul>
          <li>Contenido creado por instructores con experiencia real en la industria.</li>
          <li>Cursos organizados en secciones y lecciones faciles de seguir.</li>
          <li>Certificados digitales al completar el 100 por ciento de un curso.</li>
          <li>Acceso desde cualquier dispositivo, sin horarios fijos.</li>
          <li>Comunidad activa que deja comentarios y resuelve dudas.</li>
        </ul>
        <p>Nuestro objetivo es democratizar el aprendizaje y ayudarte a construir el futuro profesional que querés.</p>
      </Modal>

      <Modal open={terminosOpen} onClose={() => setTerminosOpen(false)} title="Terminos de servicio">
        <p><strong>Ultima actualizacion:</strong>enero 2026.</p>
        <h3>1. Aceptacion</h3>
        <p>Al usar Mentora aceptas estos terminos. Si no estas de acuerdo, no utilices la plataforma.</p>
        <h3>2. Uso de la cuenta</h3>
        <p>Eres responsable de mantener la confidencialidad de tu contrasena y de toda la actividad que ocurra en tu cuenta.</p>
        <h3>3. Contenido</h3>
        <p>Los cursos publicados son responsabilidad de sus respectivos instructores. Mentora no se hace responsable por la precision o vigencia del contenido.</p>
        <h3>4. Pagos y reembolsos</h3>
        <p>Los cursos pagos se cobran una sola vez. Las politicas de reembolso se evaluan caso por caso escribiendo a soporte.</p>
      </Modal>

      <Modal open={privacidadOpen} onClose={() => setPrivacidadOpen(false)} title="Politica de privacidad">
        <p><strong>Ultima actualizacion:</strong>enero 2026.</p>
        <h3>1. Datos que recopilamos</h3>
        <ul>
          <li>Informacion de la cuenta: nombre, correo electronico.</li>
          <li>Datos de uso: cursos vistos, progreso, certificados generados.</li>
          <li>Contenido publicado: comentarios, calificaciones y reseñas.</li>
        </ul>
        <h3>2. Como usamos los datos</h3>
        <p>Para personalizar tu experiencia, mostrar tu progreso y mantener la plataforma funcionando. Nunca vendemos tus datos.</p>
        <h3>3. Tus derechos</h3>
        <p>Puedes solicitar la eliminacion de tu cuenta y de todos tus datos asociados escribiendo a soporte.</p>
      </Modal>
    </div>
  );
}
