import React, { useState } from 'react';
import { createSeries, updateSeries } from '../api/series';
import PropTypes from 'prop-types';

function SeriesForm({ initialName = '', onSuccess, onCancel }) {
	const isEdit = Boolean(initialName && onCancel);
	const [name, setName] = useState(isEdit ? initialName.name : '');
	const [error, setError] = useState('');

	const handleSubmit = async e => {
		e.preventDefault();
		setError('');
		try {
			const data = { name };
			let res;
			if (isEdit) {
				res = await updateSeries(initialName.id, data);
			} else {
				res = await createSeries(data);
			}
			onSuccess(res.data);
			setName('');
		} catch (err) {
			setError(err.response?.data?.errors?.[0]?.msg || err.message);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="series-form">
			<input
				type="text"
				placeholder="Series name"
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

SeriesForm.propTypes = {
  initialName: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func
};

export default SeriesForm;