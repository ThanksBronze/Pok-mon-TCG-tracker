import React, { useState, useEffect } from 'react';
import { createCard, fetchCard, updateCard } from '../api/cards';
import { useParams, useNavigate } from 'react-router-dom';

export default function CardForm() {
	const { id } = useParams();
	const isEdit = Boolean(id);
	const [form, setForm] = useState({
		name: '',
		set_id: '',
		type_id: '',
		no_in_set: ''
	});
	const navigate = useNavigate();

	useEffect(() => {
		if (isEdit) {
			fetchCard(id).then(res => setForm({
				name: res.data.name,
				set_id: res.data.set_id,
				type_id: res.data.type_id,
				no_in_set: res.data.no_in_set
			}));
		}
	}, [id, isEdit]);

	const handleChange = e =>
		setForm(f => ({ ...f, [e.target.name]: e.target.value }));

	const handleSubmit = async e => {
		e.preventDefault();
		if (isEdit) await updateCard(id, form);
		else await createCard(form);
		navigate('/');
	};

	return (
		<form onSubmit={handleSubmit}>
			<label>
				Name:
				<input
					name="name"
					value={form.name}
					onChange={handleChange}
					required
				/>
			</label>
			<br />
			<label>
				Set ID:
				<input
					name="set_id"
					type="number"
					value={form.set_id}
					onChange={handleChange}
					required
				/>
			</label>
			<br />
			<label>
				Type ID:
				<input
					name="type_id"
					type="number"
					value={form.type_id}
					onChange={handleChange}
					required
				/>
			</label>
			<br />
			<label>
			No in Set:
			<input
					name="no_in_set"
					type="number"
					value={form.no_in_set}
					onChange={handleChange}
					required
				/>
			</label>
			<br />
			<button type="submit">{isEdit ? 'Update' : 'Create'}</button>
		</form>
	);
}