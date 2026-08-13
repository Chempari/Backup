import { useState, useEffect, useCallback } from 'react';
import api from '../../../Api/axios';

export function useResenas(cursoId) {
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarResenas = useCallback(() => {
    return api.get(`/Cursos/${cursoId}/resenas`)
      .then((res) => setResenas(res.data.resenas || []));
  }, [cursoId]);

  useEffect(() => {
    cargarResenas()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cargarResenas]);

  const crearComentario = useCallback(async (comentario) => {
    const res = await api.post('/Resenas', { curso_id: cursoId, comentario: comentario.trim() });
    await cargarResenas();
    return res.data.resena;
  }, [cursoId, cargarResenas]);

  const responder = useCallback(async (resenaId, comentario) => {
    const res = await api.post('/Resenas', {
      curso_id: cursoId,
      comentario: comentario.trim(),
      respuesta_a: resenaId
    });
    await cargarResenas();
    return res.data.resena;
  }, [cursoId, cargarResenas]);

  const calificar = useCallback(async (calificacion) => {
    await api.post('/Resenas', { curso_id: cursoId, calificacion });
    await cargarResenas();
  }, [cursoId, cargarResenas]);

  const actualizarResena = useCallback(async (resenaId, data) => {
    const body = typeof data === 'string' ? { comentario: data } : { ...(data || {}) };
    await api.put(`/Resenas/${resenaId}`, body);
    await cargarResenas();
  }, [cargarResenas]);

  const eliminarResena = useCallback(async (resenaId) => {
    await api.delete(`/Resenas/${resenaId}`);
    await cargarResenas();
  }, [cargarResenas]);

  return {
    resenas,
    loading,
    crearComentario,
    responder,
    calificar,
    actualizarResena,
    eliminarResena,
  };
}
