import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { createUser, updateUser } from '../api/users';

export default function UserForm({ initialUser = null, onSuccess, onCancel }) {
	const isEdit = Boolean(initialUser && onCancel);
	const [username, setUsername] = useState(isEdit ? initialUser.username : '');
	const [email, setEmail]       = useState(isEdit ? initialUser.email || '' : '');
	const [error, setError]       = useState('');

	const handleSubmit = async e => {
		e.preventDefault();
		setError('');
		try {
			const payload = { username, email: email || null };
			let res;
			if (isEdit) {
				res = await updateUser(initialUser.id, payload);
			} else {
				res = await createUser(payload);
			}
			onSuccess(res.data);
			if (!isEdit) {
				setUsername(''); setEmail('');
			}
		} catch (err) {
			setError(err.response?.data?.errors?.[0]?.msg || err.message);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="user-form">
			<input
				type="text"
				placeholder="Username"
				value={username}
				onChange={e => setUsername(e.target.value)}
				required
			/>
			<input
				type="email"
				placeholder="Email (optional)"
				value={email}
				onChange={e => setEmail(e.target.value)}
			/>
			<button type="submit">{isEdit ? 'Update' : 'Add'}</button>
			{isEdit && (
				<button type="button" onClick={onCancel}>
					Cancel
				</button>
			)}
			{error && <p className="error">{error}</p>}
		</form>
	);
}

UserForm.propTypes = {
	initialUser: PropTypes.shape({
		id: PropTypes.number.isRequired,
		username: PropTypes.string.isRequired,
		email: PropTypes.string
	}),
	onSuccess: PropTypes.func.isRequired,
	onCancel: PropTypes.func
};