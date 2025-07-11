import React, { useState, useEffect, useMemo } from 'react';
import {
	fetchCards as apiFetchCards,
	createCard as apiCreateCard,
	updateCard as apiUpdateCard,
	deleteCard as apiDeleteCard,
} from '../api/cards';
import { fetchSets } from '../api/sets';
import { fetchCardTypes } from '../api/cardTypes';
import { fetchSeries } from '../api/series';

export default function CardList() {
	const [cards, setCards] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [editingCardId, setEditingCardId] = useState(null);
	const [editedCard, setEditedCard] = useState({});
	const [seriesList, setSeriesList] = useState([]);
	const [sets, setSets] = useState([]);
	const [types, setTypes] = useState([]);
	const [selectedSeries, setSelectedSeries] = useState('');

	// form state for new card
	const [name, setName] = useState('');
	const [typeId, setTypeId] = useState('');
	const [setId, setSetId] = useState('');
	const [noInSet, setNoInSet] = useState('');

	// Fetch all cards once on mount
	useEffect(() => {
		apiFetchCards()
			.then(res => setCards(res.data))
			.catch(err => console.error('Fetch cards error:', err));
	}, []);

	useEffect(() => {
			fetchSeries()
				.then(res => setSeriesList(res.data))
				.catch(err => console.error('Fetch series error:', err));
		}, []);

		useEffect(() => {
				fetchSets()
					.then(res => setSets(res.data))
					.catch(err => console.error('Fetch sets error:', err));
			}, []);

			useEffect(() => {
					fetchCardTypes()
						.then(res => setTypes(res.data))
						.catch(err => console.error('Fetch types error:', err));
				}, []);

	// Live filter
	const filteredCards = useMemo(() => {
		const q = searchQuery.toLowerCase();
		return cards.filter(c =>
			c.name.toLowerCase().includes(q) ||
			String(c.type_id).includes(q) ||
			String(c.set_id).includes(q) ||
			String(c.no_in_set ?? '').includes(q)
		);
	}, [cards, searchQuery]);

	// Add
	const handleAdd = e => {
		e.preventDefault();
		apiCreateCard({
			name,
			type_id: +typeId,
			set_id:  +setId,
			no_in_set: noInSet ? +noInSet : null
		})
		.then(({ data }) => {
			const setObj = sets.find(s => s.id === data.set_id);
			const seriesObj = seriesList.find(ser => ser.id === setObj?.series_id);
			const typeObj = types.find(t => t.id === data.type_id);

			const enriched = {
				...data,
				series_name: seriesObj?.name || '–',
				set_name: setObj?.name_of_expansion || '–',
				type_name: typeObj?.name || '–',
			};

			setCards(cs => [ enriched, ...cs ]);

			setName('');
			setTypeId('');
			setSetId('');
			setNoInSet('');
		})
		.catch(err => console.error('Add error:', err));
};

	// Edit
	const startEdit = c => {
		setEditingCardId(c.id);
		setEditedCard({
			name: c.name,
			type_id: c.type_id,
			set_id: c.set_id,
			no_in_set: c.no_in_set,
			user_id: c.user_id,
		});
	};
	const cancelEdit = () => {
		setEditingCardId(null);
		setEditedCard({});
	};
	const saveEdit = id => {
		apiUpdateCard(id, editedCard)
			.then(() => {
				setCards(cards.map(c => c.id === id ? { id, ...editedCard } : c));
				cancelEdit();
			})
			.catch(err => console.error('Save error:', err));
	};

	// Delete
	const deleteCard = id => {
		apiDeleteCard(id)
			.then(() => {
				setCards(prev => prev.filter(c => c.id !== id));
			})
			.catch(err => console.error('Delete error:', err));
	};

	return (
		<div className="container">
			<h2>Add a Card</h2>
			<form onSubmit={handleAdd} className="add-form">
				<input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
				<select
					value={selectedSeries}
					onChange={e => {
						setSelectedSeries(e.target.value);
						setSetId('');
					}}
					required
				>
					<option value="" disabled>— choose series —</option>
					{seriesList.map(ser => (
						<option key={ser.id} value={ser.id}>
							{ser.name}
						</option>
					))}
				</select>
				<select value={typeId} onChange={e => setTypeId(e.target.value)} required>
					<option value="" disabled>— Choose Type —</option>
					{types.map(t => (
						<option key={t.id} value={t.id}>
							{t.name}
						</option>
					))}
				</select>
				<select value={setId} onChange={e => setSetId(e.target.value)} required disabled={!selectedSeries}> 
					<option value="" disabled>— Choose Set —</option>
						{sets
							.filter(s => s.series_id === parseInt(selectedSeries, 10))
							.map(set => (
						<option key={set.id} value={set.id}>
							{set.name_of_expansion}
						</option>
						))}
				</select>
				<input type="number" placeholder="No. in Set (opt)" value={noInSet} onChange={e => setNoInSet(e.target.value)} />
				<button type="submit">Add</button>
			</form>

			<h2>Filter Cards</h2>
			<input
				type="text"
				className="search-input"
				placeholder="Type to filter..."
				value={searchQuery}
				onChange={e => setSearchQuery(e.target.value)}
			/>

			<div className="card-grid">
				{filteredCards.length === 0
					? <p>No cards match.</p>
					: filteredCards.map(card => (
						<div key={card.id} className="card-item">
							{editingCardId === card.id ? (
								<>
									<input
										type="text"
										value={editedCard.name}
										onChange={e => setEditedCard(ec => ({ ...ec, name: e.target.value }))}
									/>
									<select
									value={editedCard.type_id}
									onChange={e => setEditedCard(ec => ({ ...ec, type_id: parseInt(e.target.value,10) }))}
									required
								>
									<option value="" disabled>— Choose Type —</option>
									{types.map(t => (
										<option key={t.id} value={t.id}>
											{t.name}
										</option>
									))}
								</select>
									<input
										type="number"
										value={editedCard.set_id}
										onChange={e => setEditedCard(ec => ({ ...ec, set_id: parseInt(e.target.value,10) }))}
									/>
									<input
										type="number"
										value={editedCard.no_in_set ?? ''}
										onChange={e => setEditedCard(ec => ({ ...ec, no_in_set: e.target.value ? parseInt(e.target.value,10) : null }))}
									/>
									<div className="card-actions">
										<button onClick={() => saveEdit(card.id)}>Save</button>
										<button onClick={cancelEdit}>Cancel</button>
									</div>
								</>
							) : (
								<>
									<h3>{card.name}</h3>
									<p>Serie: {card.series_name}</p>
									<p>Set: {card.set_name}</p>
									<p>Type: {card.type_name}</p>
									<p>No. in Set: {card.no_in_set ?? '—'}</p>
									<p>User: {card.user_name}</p>
									<div className="card-actions">
										<button onClick={() => startEdit(card)}>Edit</button>
										<button onClick={() => deleteCard(card.id)}>Delete</button>
									</div>
								</>
							)}
						</div>
					))
				}
			</div>
		</div>
	);
}
