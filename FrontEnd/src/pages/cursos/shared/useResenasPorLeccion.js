import { useState, useEffect, useCallback } from 'react';
import api from '../../../Api/axios';

export function useResenasPorLeccion(leccionId) {
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(() => {
    if (!leccionId) return Promise.resolve([]);
    return api.get('/Lecciones/' + leccionId + '/resenas')
      .then((res) => res.data.resenas || []);
  }, [leccionId]);

  useEffect(() => {
    if (!leccionId) {
      return;
    }
    let cancelado = false;
    Promise.resolve().then(() => { if (!cancelado) setLoading(true); });
    cargar()
      .then((lista) => { if (!cancelado) setResenas(lista); })
      .catch(() => {})
      .finally(() => { if (!cancelado) setLoading(false); });
    return () => { cancelado = true; };
  }, [cargar, leccionId]);

  const crearComentario = useCallback(async (cursoId, comentario) => {
    const res = await api.post('/Resenas', {
      curso_id: cursoId,
      leccion_id: leccionId,
      comentario: comentario.trim()
    });
    await cargar();
    return res.data.resena;
  }, [leccionId, cargar]);

  const eliminarResena = useCallback(async (resenaId) => {
    await api.delete('/Resenas/' + resenaId);
    await cargar();
  }, [cargar]);

  return { resenas, loading, crearComentario, eliminarResena, recargar: cargar };
}
