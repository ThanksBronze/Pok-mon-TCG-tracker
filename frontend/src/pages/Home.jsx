import React, { useState, useEffect } from 'react';
import { fetchCards as apiFetchCards } from '../api/cards';
import { fetchSeries } from '../api/series';
import { fetchSets } from '../api/sets';
import { fetchCardTypes } from '../api/cardTypes';
import CardForm from '../components/CardForm';
import CardList from '../components/CardList';
import SearchPanel from '../components/SearchPanel';
import './Home.css';

export default function Home() {
	const [cards, setCards] = useState([]);
	const [filteredCards, setFilteredCards] = useState(null);

	const [seriesList, setSeriesList] = useState([]);
	const [sets, setSets] = useState([]);
	const [types, setTypes] = useState([]);

	const [formOpen, setFormOpen] = useState(false);

	useEffect(() => {
		apiFetchCards().then(r => setCards(r.data)).catch(console.error);
		fetchSeries().then(r => setSeriesList(r.data)).catch(console.error);
		fetchSets().then(r => setSets(r.data)).catch(console.error);
		fetchCardTypes().then(r => setTypes(r.data)).catch(console.error);
	}, []);

	const handleNewCard = newCard => {
		setCards(cs => [newCard, ...cs]);
		setFormOpen(false);
	};

	const handleRemoveCard = id => {
		setCards(cs => cs.filter(c => c.id !== id));
		setFilteredCards(fc => (fc ? fc.filter(c => c.id !== id) : null));
	};

	const handleSearchResults = results => {
		setFilteredCards(results);
	};

	const displayCards = filteredCards !== null ? filteredCards : cards;

	return (
		<div className="manage-cards">

			<div className="page-actions">
				<button
					type="button"
					className="btn add-card-toggle"
					onClick={() => setFormOpen(o => !o)}
					aria-expanded={formOpen}
					aria-controls="add-card-section"
				>
					{formOpen ? 'Close' : 'Add a card'}
					<svg
						className={`chevron ${formOpen ? 'open' : ''}`}
						width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
						style={{ marginLeft: '8px' }}
					>
						<path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
				</button>
			</div>

			{/* Collapsible CardForm section */}
			<div
				id="add-card-section"
				className={`add-card-collapsible ${formOpen ? 'open' : ''}`}
			>
				<CardForm onSuccess={handleNewCard} />
			</div>

			<SearchPanel onResults={handleSearchResults} />

			<CardList
				cards={displayCards}
				onDelete={handleRemoveCard}
				seriesList={seriesList}
				sets={sets}
				types={types}
			/>
		</div>
	);
}
