import React, { useState, useEffect } from 'react';
import { fetchSets, deleteSet } from '../api/sets';
import SetForm from './SetForm';
import './AdminLists.css';


export default function SetList() {
	const [sets, setSets] = useState([]);
	const [editingId, setEditingId] = useState(null);

	useEffect(() => { load(); }, []);
	const load = () => fetchSets().then(res => setSets(res.data)).catch(console.error);

	const handleUpdate = updated => { setSets(sets.map(s => s.id === updated.id ? updated : s)); setEditingId(null); };
	const handleDelete = id => {
		if (!window.confirm('Delete this set?')) return;
		deleteSet(id).then(() => setSets(sets.filter(s => s.id !== id))).catch(console.error);
	};

	return (
		<div className="set-list">
			<h2>Sets</h2>
			<ul>
				{sets.map(s => (
					<li key={s.id} className="set-item">
						{editingId === s.id ? (
							<SetForm initial={s} onSuccess={handleUpdate} onCancel={() => setEditingId(null)} />
						) : (
							<>
								<span>{s.name_of_expansion}</span>
								<div className="actions">
									<button onClick={() => setEditingId(s.id)}>Edit</button>
									<button onClick={() => handleDelete(s.id)}>Delete</button>
								</div>
							</>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
