// src/components/CardList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
	fetchCards as apiFetchCards,
	createCard as apiCreateCard,
	updateCard as apiUpdateCard,
	deleteCard as apiDeleteCard,
} from '../api/cards';

export default function CardList() {
	const [cards, setCards] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [editingCardId, setEditingCardId] = useState(null);
	const [editedCard, setEditedCard] = useState({});

	// form state for new card
	const [name, setName] = useState('');
	const [typeId, setTypeId] = useState('');
	const [setId, setSetId] = useState('');
	const [noInSet, setNoInSet] = useState('');
	const [userId, setUserId] = useState('');

	// Fetch all cards once on mount
	useEffect(() => {
		apiFetchCards()
			.then(res => setCards(res.data))
			.catch(err => console.error('Fetch cards error:', err));
	}, []);

	// Live filter
	const filteredCards = useMemo(() => {
		const q = searchQuery.toLowerCase();
		return cards.filter(c =>
			c.name.toLowerCase().includes(q) ||
			String(c.type_id).includes(q) ||
			String(c.set_id).includes(q) ||
			String(c.no_in_set ?? '').includes(q) ||
			String(c.user_id).includes(q)
		);
	}, [cards, searchQuery]);

	// Add
	const handleAdd = e => {
		e.preventDefault();
		apiCreateCard({
			name,
			type_id: parseInt(typeId, 10),
			set_id: parseInt(setId, 10),
			no_in_set: noInSet ? parseInt(noInSet, 10) : null,
			user_id: parseInt(userId, 10),
		})
			.then(res => {
				setCards(cards.concat(res.data));
				setName(''); setTypeId(''); setSetId(''); setNoInSet(''); setUserId('');
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
			.then(res => {
				setCards(cards.filter(c => c.id !== res.data.id));
			})
			.catch(err => console.error('Delete error:', err));
	};

	return (
		<div className="container">
			<h2>Add a Card</h2>
			<form onSubmit={handleAdd} className="add-form">
				<input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
				<input type="number" placeholder="Type ID" value={typeId} onChange={e => setTypeId(e.target.value)} required />
				<input type="number" placeholder="Set ID" value={setId} onChange={e => setSetId(e.target.value)} required />
				<input type="number" placeholder="No. in Set (opt)" value={noInSet} onChange={e => setNoInSet(e.target.value)} />
				<input type="number" placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} required />
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
									<input
										type="number"
										value={editedCard.type_id}
										onChange={e => setEditedCard(ec => ({ ...ec, type_id: parseInt(e.target.value,10) }))}
									/>
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
									<input
										type="number"
										value={editedCard.user_id}
										onChange={e => setEditedCard(ec => ({ ...ec, user_id: parseInt(e.target.value,10) }))}
									/>
									<div className="card-actions">
										<button onClick={() => saveEdit(card.id)}>Save</button>
										<button onClick={cancelEdit}>Cancel</button>
									</div>
								</>
							) : (
								<>
									<h3>{card.name}</h3>
									<p>Type ID: {card.type_id}</p>
									<p>Set ID: {card.set_id}</p>
									<p>No. in Set: {card.no_in_set ?? '—'}</p>
									<p>User ID: {card.user_id}</p>
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
