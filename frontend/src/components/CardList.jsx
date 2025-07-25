import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import CardModal from './CardModal';

export default function CardList({ cards }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return cards.filter(c =>
      c.name.toLowerCase().includes(q)
    );
  }, [cards, searchQuery]);

  return (
    <>
      <input
        type="text"
        placeholder="Filter cards…"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        style={{ marginBottom: '1rem', width: '100%' }}
      />

      <div className="card-grid">
        {filtered.map(card => (
          <div
            key={card.id}
            className="card-item"
            onClick={() => setSelectedCard(card)}
            style={{ cursor: 'pointer', textAlign: 'center' }}
          >
            <img
              src={card.image_small}
              alt={card.name}
              style={{ width: '100px', height: 'auto' }}
            />
            <div>{card.name}</div>
          </div>
        ))}
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  );
}

CardList.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object).isRequired
};