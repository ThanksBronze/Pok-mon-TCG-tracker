import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { deleteCard as apiDeleteCard, updateCard as apiUpdateCard } from '../api/cards';
import { fetchSeries } from '../api/series';
import { fetchSets } from '../api/sets';
import { fetchCardTypes } from '../api/cardTypes';
import CardModal from './CardModal';
import './CardList.css';

export default function CardList({ cards }) {
	const [cardsState, setCardsState] = useState(cards);
	const [seriesList, setSeriesList] = useState([]);
	const [sets, setSets] = useState([]);
	const [types, setTypes] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCard, setSelectedCard] = useState(null);

	useEffect(() => {
		setCardsState(cards);
	}, [cards]);

	useEffect(() => {
		fetchSeries().then(r => setSeriesList(r.data));
		fetchSets() .then(r => setSets(r.data));
		fetchCardTypes().then(r => setTypes(r.data));
	}, []);

	const filtered = useMemo(() => {
		const q = searchQuery.toLowerCase();
		return cardsState.filter(c => c.name.toLowerCase().includes(q));
	}, [cardsState, searchQuery]);

	const handleUpdate = async (id, payload) => {
		const res = await apiUpdateCard(id, payload);
		setCardsState(cs => cs.map(c => c.id === id ? res.data : c));
		setSelectedCard(res.data);
	};

	const handleDelete = async id => {
		if (!window.confirm('Are you sure?')) return;
		await apiDeleteCard(id);
		setCardsState(cs => cs.filter(c => c.id !== id));
		setSelectedCard(null);
	};

	return (
		<div className="card-list">
			<input
				type="text"
				className="search-input"
				placeholder="Filter cards…"
				value={searchQuery}
				onChange={e => setSearchQuery(e.target.value)}
			/>

			<div className="card-grid">
				{filtered.map(card => (
					<div
						data-testid="card-item"
						key={card.id}
						className="card-item"
						onClick={() => setSelectedCard(card)}
					>
						<img src={card.image_small} alt={card.name} />
						<div>{card.name}</div>
					</div>
				))}
			</div>

			{selectedCard && (
				<CardModal
					card={selectedCard}
					onClose={() => setSelectedCard(null)}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
					seriesList={seriesList}
					sets={sets}
					types={types}
				/>
			)}
		</div>
	);
}

CardList.propTypes = {
	cards: PropTypes.array.isRequired
};
