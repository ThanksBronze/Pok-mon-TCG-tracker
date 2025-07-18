import PropTypes from 'prop-types';
import ProtectedRoute from './ProtectedRoute';

export default function AdminRoute({ children }) {
	return (
		<ProtectedRoute requiredRole="admin">
			{children}
		</ProtectedRoute>
	);
}

AdminRoute.propTypes = {
	children: PropTypes.node.isRequired
};