import { Link } from 'react-router-dom';
import { imageUrl } from '../utils';
import './UserLink.css';

export function UserLink({ user, size = 'md', showRole = false, link = true }) {
  if (!user) return null;
  const inner = (
    <span className={`user-link user-link--${size}`}>
      <span className="user-link-avatar">
        {user.foto ? (
          <img src={imageUrl(user.foto)} alt={user.nombre} />
        ) : (
          <span className="user-link-initial">
            {(user.nombre || '?').charAt(0).toUpperCase()}
         </span>
        )}
     </span>
      <span className="user-link-text">
        <span className="user-link-name">
          {user.nombre}
          {user.apellido ? ` ${user.apellido}` : ''}
       </span>
        {showRole && user.rol && (
          <span className={`user-link-role user-link-role--${user.rol}`}>
            {user.rol}
         </span>
        )}
     </span>
   </span>
  );
  if (!link) return inner;
  return (
    <Link to={`/usuarios/${user._id}`} className="user-link-anchor">
      {inner}
  </Link>
  );
}
