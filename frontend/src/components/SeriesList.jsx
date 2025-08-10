import React, { useState, useEffect } from 'react';
import { fetchSeries, deleteSeries } from '../api/series';
import SeriesForm from './SeriesForm';
import './AdminLists.css';


export default function SeriesList() {
	const [series, setSeries] = useState([]);
	const [editingId, setEditingId] = useState(null);
			
	useEffect(() => {
		load();
	}, []);
			
	const load = () => {
		fetchSeries()
			.then(res => setSeries(res.data))
			.catch(console.error);
	};
			
	const handleUpdateSuccess = updated => {
		setSeries(series.map(s => (s.id === updated.id ? updated : s)));
		setEditingId(null);
	};
			
	const handleDelete = id => {
		if (!window.confirm('Delete this series?')) return;
		deleteSeries(id)
			.then(() => setSeries(series.filter(s => s.id !== id)))
			.catch(console.error);
	};
			
	return (
		<div className="series-list">
			<h2>Series</h2>
			<ul>
				{series.map(s => (
					<li key={s.id} className="series-item">
						{editingId === s.id ? (
							<SeriesForm
								initialName={s}
								onSuccess={handleUpdateSuccess}
								onCancel={() => setEditingId(null)}
							/>
						) : (
							<>
								<span>{s.name}</span>
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