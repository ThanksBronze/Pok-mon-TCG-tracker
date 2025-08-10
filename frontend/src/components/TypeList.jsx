import React, { useState, useEffect } from 'react';
import { fetchCardTypes, deleteCardType } from '../api/cardTypes';
import TypeForm from './TypeForm';
import './AdminLists.css';

export default function TypeList() {
	const [types, setTypes] = useState([]);
	const [editingId, setEditingId] = useState(null);
	const [showForm, setShowForm] = useState(false);

	useEffect(() => { load(); }, []);
	const load = () => fetchCardTypes().then(res => setTypes(res.data)).catch(console.error);

	const handleAdd = newType => { setTypes([newType, ...types]); setShowForm(false); };
	const handleUpdate = updated => { setTypes(types.map(t => t.id === updated.id ? updated : t)); setEditingId(null); };
	const handleDelete = id => {
		if (!window.confirm('Delete this type?')) return;
		deleteCardType(id).then(() => setTypes(types.filter(t => t.id !== id))).catch(console.error);
	};

	return (
		<div className="type-list">
			<h2>Card Types</h2>
			{!showForm && editingId === null && (
				<button onClick={() => setShowForm(true)}>Add New Type</button>
			)}
			{showForm && <TypeForm onSuccess={handleAdd} />}
			<ul>
				{types.map(t => (
					<li key={t.id} className="type-item">
						{editingId === t.id ? (
							<TypeForm initial={t} onSuccess={handleUpdate} onCancel={() => setEditingId(null)} />
						) : (
							<>
								<span>{t.name}</span> {t.category && <em>({t.category})</em>}
								<div className="actions">
									<button onClick={() => setEditingId(t.id)}>Edit</button>
									<button onClick={() => handleDelete(t.id)}>Delete</button>
								</div>
							</>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
