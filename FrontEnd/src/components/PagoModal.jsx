import { useState } from 'react';
import { Modal } from './Modal';
import './PagoModal.css';

function formatCardNumber(v) {
  const digits = v.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(v) {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return digits.slice(0, 2) + '/' + digits.slice(2);
}

export function PagoModal({ open, onClose, onConfirm, precio, titulo, loading }) {
  const [tarjeta, setTarjeta] = useState('');
  const [nombre, setNombre] = useState('');
  const [expiracion, setExpiracion] = useState('');
  const [cvv, setCvv] = useState('');

  const reset = () => {
    setTarjeta('');
    setNombre('');
    setExpiracion('');
    setCvv('');
  };

  const handleConfirm = async () => {
    await onConfirm();
    reset();
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Confirmar pago">
      <div className="pago-resumen">
        <span className="pago-resumen-label">Curso</span>
        <strong className="pago-resumen-titulo">{titulo || 'Curso'}</strong>
        <span className="pago-resumen-precio">${precio || 0}</span>
    </div>

      <div className="pago-form">
        <label className="pago-field">
          <span>Numero de tarjeta</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={tarjeta}
            onChange={(e) => setTarjeta(formatCardNumber(e.target.value))}
          />
      </label>

        <label className="pago-field">
          <span>Nombre del titular</span>
          <input
            type="text"
            placeholder="Como aparece en la tarjeta"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
      </label>

        <div className="pago-field-row">
          <label className="pago-field">
            <span>Fecha de expiracion</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="MM/AA"
              value={expiracion}
              onChange={(e) => setExpiracion(formatExpiry(e.target.value))}
            />
        </label>
          <label className="pago-field">
            <span>CVV</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="123"
              maxLength={4}
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
            />
        </label>
      </div>
    </div>

      <div className="pago-actions">
        <button type="button" className="pago-btn-cancel" onClick={handleClose} disabled={loading}>
          Cancelar
      </button>
        <button type="button" className="pago-btn-confirm" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Procesando...' : 'Pagar y unirme al curso'}
      </button>
    </div>
  </Modal>
  );
}
