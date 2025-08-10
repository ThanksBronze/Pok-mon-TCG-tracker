import React, { useState, useEffect } from 'react';
import { fetchUsers, deleteUser } from '../api/users';
import UserForm from './UserForm';
import './AdminLists.css';

export default function UserList() {
	const [users, setUsers]       = useState([]);
	const [editingId, setEditingId] = useState(null);

	useEffect(() => {
		load();
	}, []);

	const load = () =>
		fetchUsers()
			.then(res => setUsers(res.data))
			.catch(console.error);

	const handleUpdateSuccess = updatedUser => {
		setUsers(us => us.map(u => (u.id === updatedUser.id ? updatedUser : u)));
		setEditingId(null);
	};

	const handleDelete = id => {
		if (!window.confirm('Are you sure you want to delete this user?')) return;
		deleteUser(id)
			.then(() => setUsers(us => us.filter(u => u.id !== id)))
			.catch(console.error);
	};

	return (
		<div className="user-list">
			<h2>Users</h2>
			<ul>
				{users.map(u => (
					<li key={u.id} className="user-item">
						{editingId === u.id ? (
							<UserForm
								initialUser={u}
								onSuccess={handleUpdateSuccess}
								onCancel={() => setEditingId(null)}
							/>
						) : (
							<>
								<span>
									{u.username} {u.email && `(${u.email})`}
								</span>
								<div className="actions">
									<button onClick={() => setEditingId(u.id)}>Edit</button>
									<button onClick={() => handleDelete(u.id)}>Delete</button>
								</div>
							</>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}