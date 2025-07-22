import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchSeries } from '../api/series';
import { createSet, updateSet } from '../api/sets';

export default function SetForm({ initial = {}, onSuccess, onCancel }) {
	const isEdit = Boolean(initial.id && onCancel);
	const [seriesList, setSeriesList] = useState([]);
	const [name, setName] = useState(isEdit ? initial.name_of_expansion : '');
	const [seriesId, setSeriesId] = useState(isEdit ? initial.series_id : '');
	const [error, setError] = useState('');

	useEffect(() => {
		fetchSeries()
			.then(res => setSeriesList(res.data))
			.catch(console.error);
	}, []);

	const handleSubmit = async e => {
		e.preventDefault();
		setError('');
		try {
			const payload = { name_of_expansion: name, series_id: seriesId };
			let res;
			if (isEdit) res = await updateSet(initial.id, payload);
			else res = await createSet(payload);
			onSuccess(res.data);
			setName('');
			setSeriesId('');
		} catch (err) {
			setError(err.response?.data?.errors?.[0]?.msg || err.message);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="set-form">
			<select
				value={seriesId}
				onChange={e => setSeriesId(+e.target.value)}
				required
			>
				<option value="" disabled>— Choose series —</option>
				{seriesList.map(ser => (
					<option key={ser.id} value={ser.id}>{ser.name}</option>
				))}
			</select>
			<input
				type="text"
				placeholder="Set name"
				value={name}
				onChange={e => setName(e.target.value)}
				required
			/>
			<button type="submit">{isEdit ? 'Update' : 'Add'}</button>
			{isEdit && <button type="button" onClick={onCancel}>Cancel</button>}
			{error && <p className="error">{error}</p>}
		</form>
	);
}

SetForm.propTypes = {
	initial: PropTypes.shape({
		id: PropTypes.number,
		name_of_expansion: PropTypes.string,
		series_id: PropTypes.number,
	}),
	onSuccess: PropTypes.func.isRequired,
	onCancel: PropTypes.func,
};