// src/components/CardModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './CardModal.css';

export default function CardModal({
  card,
  onClose,
  onUpdate,    // Ny prop: callback för att spara ändringar
  onDelete,
  seriesList,  // Passa in lookup‑listor från förälder
  sets,
  types
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    series_id: '',
    set_id: '',
    type_id: '',
    no_in_set: ''
  });

  // När kortet ändras (eller när vi går in i edit), ladda in default‑värden
  useEffect(() => {
    setForm({
      name:       card.name,
      series_id:  card.series_id?.toString() || '',
      set_id:     card.set_id.toString(),
      type_id:    card.type_id.toString(),
      no_in_set:  card.no_in_set?.toString() || ''
    });
  }, [card]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    // Bygg upp en uppdaterad payload
    const payload = {
      name:       form.name,
      series_id:  +form.series_id,
      set_id:     +form.set_id,
      type_id:    +form.type_id,
      no_in_set:  form.no_in_set ? +form.no_in_set : null
    };
    await onUpdate(card.id, payload);
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {isEditing ? (
          <div className="modal-edit-form">
            <label>
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </label>

            <label>
              Series
              <select
                name="series_id"
                value={form.series_id}
                onChange={handleChange}
                required
              >
                <option value="" disabled>— choose series —</option>
                {seriesList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>

            <label>
              Set
              <select
                name="set_id"
                value={form.set_id}
                onChange={handleChange}
                required
                disabled={!form.series_id}
              >
                <option value="" disabled>— choose set —</option>
                {sets
                  .filter(s => s.series_id === +form.series_id)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name_of_expansion}
                    </option>
                  ))
                }
              </select>
            </label>

            <label>
              Type
              <select
                name="type_id"
                value={form.type_id}
                onChange={handleChange}
                required
              >
                <option value="" disabled>— choose type —</option>
                {types.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>

            <label>
              No. in Set
              <input
                name="no_in_set"
                type="number"
                min="1"
                value={form.no_in_set}
                onChange={handleChange}
              />
            </label>

            <div className="modal-actions">
              <button className="modal-save" onClick={handleSave}>Save</button>
              <button className="modal-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
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

            <div className="modal-actions">
              <button className="modal-edit" onClick={() => setIsEditing(true)}>Edit</button>
              <button className="modal-delete" onClick={() => onDelete(card.id)}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

CardModal.propTypes = {
  card: PropTypes.shape({
    id:           PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name:         PropTypes.string,
    image_large:  PropTypes.string,
    series_name:  PropTypes.string,
    set_name:     PropTypes.string,
    type_name:    PropTypes.string,
    rarity:       PropTypes.string,
    price_market: PropTypes.number,
		series_id: PropTypes.number,
		set_id: PropTypes.number,
		type_id: PropTypes.number,
		no_in_set: PropTypes.number,
  }).isRequired, 
  onClose:     PropTypes.func.isRequired,
  onUpdate:    PropTypes.func.isRequired,   // ny
  onDelete:    PropTypes.func.isRequired,
  seriesList:  PropTypes.array.isRequired,  // ny
  sets:        PropTypes.array.isRequired,  // ny
  types:       PropTypes.array.isRequired   // ny
};
