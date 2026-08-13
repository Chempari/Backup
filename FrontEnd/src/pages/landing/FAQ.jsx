import { useState } from 'react';
import './FAQ.css';

const PREGUNTAS = [{"pregunta":"Como me inscribo en un curso","respuesta":"Solo necesitas crear una cuenta gratuita, explorar el catalogo y hacer clic en Inscribirse en el curso que te interese. Si el curso es gratuito quedaras inscrito al instante; si es de pago, te pediremos confirmar la inscripcion mediante un metodo de pago."},{"pregunta":"Cuanto cuestan los cursos","respuesta":"Mentora ofrece cursos gratuitos y cursos de pago. El precio de cada curso lo define el instructor y se muestra claramente antes de la inscripcion. Los cursos gratuitos conservan todas las funcionalidades, incluido el certificado al finalizar."},{"pregunta":"Como obtengo mi certificado","respuesta":"Al completar el 100 por ciento de las lecciones de un curso podras generar tu certificado digital desde la seccion Mis Certificados. El certificado incluye tu nombre, el titulo del curso, la fecha de finalizacion y la firma del instructor."},{"pregunta":"Que pasa si no completo un curso","respuesta":"No pasa nada. Tu avance se guarda automaticamente y puedes retomar el curso cuando quieras desde la seccion Mis Cursos de tu panel. No hay fechas limite ni penalizaciones por tomarte tu tiempo."},{"pregunta":"Como me convierto en instructor","respuesta":"Desde tu perfil puedes solicitar el rol de instructor. Una vez aprobado, tendras acceso al panel de instructor donde podras crear cursos, subir lecciones, gestionar secciones y ver metricas como estudiantes inscritos y calificaciones."},{"pregunta":"Que metodos de pago aceptan","respuesta":"Aceptamos tarjetas de credito y debito Visa, Mastercard y American Express. Los pagos se procesan de forma segura mediante nuestro proveedor. Si tienes algun problema con un cobro, contactanos y te ayudaremos lo antes posible."}];

export function FAQ() {
  const [abierta, setAbierta] = useState(-1);

  const toggle = (i) => setAbierta(abierta === i ? -1 : i);

  return (
    <div className="landing-faq">
      {PREGUNTAS.map((item, i) => {
        const isOpen = abierta === i;
        return (
          <div key={i} className={"landing-faq-item" + (isOpen ? " landing-faq-item--open" : "")}>
            <button type="button" className="landing-faq-question" onClick={() => toggle(i)} aria-expanded={isOpen}>
              <span className="landing-faq-question-text">
                {item.pregunta}
              </span>
              <span className="landing-faq-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="landing-faq-answer">
                <p>{item.respuesta}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
