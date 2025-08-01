import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { deleteCard as apiDeleteCard, updateCard as apiUpdateCard } from '../api/cards';
import { fetchSeries } from '../api/series';
import { fetchSets } from '../api/sets';
import { fetchCardTypes } from '../api/cardTypes';
import CardModal from './CardModal';
import './CardList.css';

export default function CardList({ cards, onDelete }) {
	const [cardsState, setCardsState] = useState(cards);
	const [seriesList, setSeriesList] = useState([]);
	const [sets, setSets] = useState([]);
	const [types, setTypes] = useState([]);
	const [selectedCard, setSelectedCard] = useState(null);

	useEffect(() => {
		setCardsState(cards);
	}, [cards]);

	useEffect(() => {
		fetchSeries().then(r => setSeriesList(r.data));
		fetchSets().then(r => setSets(r.data));
		fetchCardTypes().then(r => setTypes(r.data));
	}, []);
	

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

		if (onDelete) onDelete(id);
	};

return (
		<div className="card-list">
			<div className="card-grid">
				{cardsState.map(card => (
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
	cards: PropTypes.array.isRequired,
	onDelete: PropTypes.func,
};
