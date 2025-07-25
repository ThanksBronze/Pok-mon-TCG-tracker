import React from 'react';
import PropTypes from 'prop-types';
import './CardModal.css';

export default function CardModal({ card, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{card.name}</h2>
        </div>

        {/* Bild */}
        <div className="modal-image-container">
          <img
            className="modal-image"
            src={card.image_large}
            alt={card.name}
          />
        </div>
{/* Detaljer under bilden */}
<div className="modal-details">
          <p><strong>Series:</strong> {card.series_name}</p>
          <p><strong>Set:</strong> {card.set_name}</p>
          <p><strong>Type:</strong> {card.type_name}</p>
          <p><strong>Rarity:</strong> {card.rarity}</p>
          {card.price_market != null && (
            <p><strong>Market price:</strong> ${card.price_market}</p>
          )}
        </div>
      </div>
    </div>
  );
}

CardModal.propTypes = {
  card: PropTypes.shape({
    name:         PropTypes.string,
    image_large:  PropTypes.string,
    series_name:  PropTypes.string,
    set_name:     PropTypes.string,
    type_name:    PropTypes.string,
    rarity: PropTypes.string,
    price_market: PropTypes.number
  }).isRequired,
  onClose: PropTypes.func.isRequired
};