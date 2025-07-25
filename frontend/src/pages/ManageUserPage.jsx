import React from 'react';
import UserList from '../components/UserList';

export default function UsersPage() {
	return (
		<div className="page users-page">
			<h1>Admin: Manage Users</h1>
			<UserList />
		</div>
	);
}