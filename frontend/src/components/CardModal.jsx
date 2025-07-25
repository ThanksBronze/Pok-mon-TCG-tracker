import React from 'react';
import PropTypes from 'prop-types';
import './CardModal.css';

export default function CardModal({ card, onClose }) {
	return (
		<div className="modal-overlay" onClick={onClose} data-testid="modal-overlay">
			<div className="modal-content" onClick={e => e.stopPropagation()}>
				<button className="modal-close" onClick={onClose}>×</button>

				<div className="modal-header">
					<h2 className="modal-title">{card.name}</h2>
				</div>

				<div className="modal-image-container">
					<img
						className="modal-image"
						src={card.image_large}
						alt={card.name}
					/>
				</div>
				<div className="modal-details">
					<p>Series: {card.series_name}</p>
					<p>Set: {card.set_name}</p>
					<p>Type: {card.type_name}</p>
					<p>Rarity: {card.rarity}</p>
					{card.price_market != null && (
						<p>Market Price: ${card.price_market}</p>
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