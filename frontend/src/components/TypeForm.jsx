import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { createCardType, updateCardType } from '../api/cardTypes';

export default function TypeForm({ initial = {}, onSuccess, onCancel }) {
	const isEdit = Boolean(initial.id && onCancel);
	const [name, setName] = useState(isEdit ? initial.name : '');
	const [category, setCategory] = useState(isEdit ? initial.category : '');
	const [error, setError] = useState('');

	const handleSubmit = async e => {
		e.preventDefault(); setError('');
		try {
			const payload = { name, category: category || null };
			let res;
			if (isEdit) res = await updateCardType(initial.id, payload);
			else res = await createCardType(payload);
			onSuccess(res.data);
			setName(''); setCategory('');
		} catch (err) {
			setError(err.response?.data?.errors?.[0]?.msg || err.message);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="type-form">
			<input
				type="text"
				placeholder="Type name"
				value={name}
				onChange={e => setName(e.target.value)}
				required
			/>
			<input
				type="text"
				placeholder="Category (optional)"
				value={category}
				onChange={e => setCategory(e.target.value)}
			/>
			<button type="submit">{isEdit ? 'Update' : 'Add'}</button>
			{isEdit && <button type="button" onClick={onCancel}>Cancel</button>}
			{error && <p className="error">{error}</p>}
		</form>
	);
}

TypeForm.propTypes = {
	initial: PropTypes.shape({ id: PropTypes.number, name: PropTypes.string, category: PropTypes.string }),
	onSuccess: PropTypes.func.isRequired,
	onCancel: PropTypes.func,
};
