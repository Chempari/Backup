import { Link } from 'react-router-dom';
import { CursoCard } from './CursoCard';

export function InstructorCourses({ cursos, onTogglePublicado, onDelete, onVisualizar }) {
  if (cursos.length === 0) {
    return (
      <p className="dashboard-instructor__no-courses">
        No has creado ningun curso. <Link to="/cursos/nuevo">Crea uno aqui</Link>
      </p>
    );
  }

  return (
    <div className="instructor-course-grid">
      {cursos.map((curso) => (
        <CursoCard
          key={curso._id}
          curso={curso}
          onTogglePublicado={onTogglePublicado}
          onDelete={onDelete}
          onVisualizar={onVisualizar}
        />
      ))}
    </div>
  );
}
