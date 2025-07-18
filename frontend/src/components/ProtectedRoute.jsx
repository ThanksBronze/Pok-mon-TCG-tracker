import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  if (!token) {
    // no token → login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    let payload;
    try {
      payload = jwtDecode(token);
    } catch {
      // bad token → login
      return <Navigate to="/login" replace />;
    }
    if (!Array.isArray(payload.roles) || !payload.roles.includes(requiredRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

ProtectedRoute.defaultProps = {
  requiredRole: null,
};