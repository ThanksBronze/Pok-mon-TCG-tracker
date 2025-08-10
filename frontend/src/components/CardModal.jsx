import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import './CardModal.css';

export default function CardModal({
  card,
  onClose,
  onUpdate,
  onDelete,
  seriesList,
  sets,
  types
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const [form, setForm] = useState({
    name: '',
    series_id: '',
    set_id: '',
    type_id: '',
    no_in_set: ''
  });

  useEffect(() => {
    setForm({
      name: card.name || '',
      series_id: card.series_id?.toString() || '',
      set_id: card.set_id?.toString() || '',
      type_id: card.type_id?.toString() || '',
      no_in_set: card.no_in_set?.toString() || ''
    });
  }, [card]);

  // aktuell typtext för accentfärgen
  const currentTypeName = useMemo(() => {
    if (isEditing) {
      const t = types.find(x => String(x.id) === form.type_id);
      return t?.name || card.type_name;
    }
    return card.type_name;
  }, [isEditing, form.type_id, types, card.type_name]);

  const accent =
    currentTypeName === 'Fire' ? '#ff7a59' :
    currentTypeName === 'Water' ? '#5ab7ff' :
    currentTypeName === 'Grass' ? '#64d488' :
    currentTypeName === 'Lightning' ? '#ffd45a' :
    currentTypeName === 'Psychic' ? '#b97cff' :
    currentTypeName === 'Fighting' ? '#f08a5b' :
    currentTypeName === 'Metal' ? '#a1b2c3' :
    currentTypeName === 'Darkness' ? '#6b6b92' :
    '#9e7bff';

  // ESC: först stäng bild, sen modal
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        if (showFull) setShowFull(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showFull, onClose]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      series_id: +form.series_id,
      set_id: +form.set_id,
      type_id: +form.type_id,
      no_in_set: form.no_in_set ? +form.no_in_set : null
    };
    await onUpdate(card.id, payload);
    setIsEditing(false);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      data-testid="modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        {/* ----- KORTLAYOUT (både view & edit) ----- */}
        <div className="cardlike-wrap">
          <div className="tcg-card" style={{ '--accent': accent }}>
            <div className="tcg-inner">
              {/* TOPP */}
              <header className="tcg-top">
                <span className="tcg-badge">{currentTypeName || '—'}</span>

                {/* Namn: text eller input inline */}
                {isEditing ? (
                  <input
                    className="tcg-input tcg-input--name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name…"
                  />
                ) : (
                  <h2 className="tcg-name">{card.name}</h2>
                )}

                {/* #No in set: text eller litet input */}
                {isEditing ? (
                  <input
                    className="tcg-input tcg-input--num"
                    name="no_in_set"
                    type="number"
                    min="1"
                    value={form.no_in_set}
                    onChange={handleChange}
                    placeholder="#"
                  />
                ) : (
                  (card.no_in_set ? <span className="tcg-num">#{card.no_in_set}</span> : <span className="tcg-num" />)
                )}
              </header>

              {/* BILD – klickbar för lightbox */}
              <div
                className="tcg-art"
                role="button"
                tabIndex={0}
                title="Click to zoom"
                onClick={() => setShowFull(true)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setShowFull(true)}
              >
                {card.image_large ? (
                  <img className="tcg-img" src={card.image_large} alt={card.name} />
                ) : (
                  <div className="tcg-img tcg-img--placeholder">No image</div>
                )}
              </div>

              {/* INFO – i edit-läge visar vi selects inline */}
              <section className="tcg-info">
                <div className="tcg-row">
                  <span>Series</span>
                  {isEditing ? (
                    <span className="tcg-field">
                      <select
                        className="tcg-select"
                        name="series_id"
                        value={form.series_id}
                        onChange={e => {
                          // nollställ set om series ändras
                          const v = e.target.value;
                          setForm(f => ({ ...f, series_id: v, set_id: '' }));
                        }}
                        required
                      >
                        <option value="">— choose —</option>
                        {seriesList.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </span>
                  ) : (
                    <b>{card.series_name || '—'}</b>
                  )}
                </div>

                <div className="tcg-row">
                  <span>Set</span>
                  {isEditing ? (
                    <span className="tcg-field">
                      <select
                        className="tcg-select"
                        name="set_id"
                        value={form.set_id}
                        onChange={handleChange}
                        required
                        disabled={!form.series_id}
                      >
                        <option value="">— choose —</option>
                        {sets
                          .filter(s => s.series_id === +form.series_id)
                          .map(s => (
                            <option key={s.id} value={s.id}>{s.name_of_expansion}</option>
                          ))}
                      </select>
                    </span>
                  ) : (
                    <b>{card.set_name || '—'}</b>
                  )}
                </div>

                <div className="tcg-row">
                  <span>Type</span>
                  {isEditing ? (
                    <span className="tcg-field">
                      <select
                        className="tcg-select"
                        name="type_id"
                        value={form.type_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">— choose —</option>
                        {types.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </span>
                  ) : (
                    <b>{card.type_name || '—'}</b>
                  )}
                </div>

                <div className="tcg-row">
                  <span>Rarity</span>
                  <b>{card.rarity || '—'}</b>
                </div>

                {card.price_market != null && (
                  <div className="tcg-row">
                    <span>Market</span>
                    <b>${card.price_market}</b>
                  </div>
                )}
              </section>

              {/* FOOT */}
              <footer className="tcg-foot">
                <span className="tcg-foot-left">{card.series_name || ''}</span>
                <span className="tcg-foot-right">{card.set_name || ''}</span>
              </footer>
            </div>
          </div>
        </div>

        {/* Knappar under kortet */}
        <div className="modal-actions modal-actions--tight">
          {isEditing ? (
            <>
              <button className="modal-save" onClick={handleSave}>Save</button>
              <button className="modal-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="modal-edit" onClick={() => setIsEditing(true)}>Edit</button>
              <button className="modal-delete" onClick={() => onDelete(card.id)}>Delete</button>
            </>
          )}
        </div>
      </div>

      {/* Lightbox för hel bild */}
      {showFull && (
        <div
          className="imglight-overlay"
          onClick={e => { e.stopPropagation(); setShowFull(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="imglight-content">
            <img
              className="imglight-img"
              src={card.image_large || card.image_small}
              alt={card.name}
            />
          </div>
          <button
            className="imglight-close"
            onClick={e => { e.stopPropagation(); setShowFull(false); }}
            aria-label="Close image"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

CardModal.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    image_large: PropTypes.string,
    image_small: PropTypes.string,
    series_name: PropTypes.string,
    set_name: PropTypes.string,
    type_name: PropTypes.string,
    rarity: PropTypes.string,
    price_market: PropTypes.number,
    series_id: PropTypes.number,
    set_id: PropTypes.number,
    type_id: PropTypes.number,
    no_in_set: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  seriesList: PropTypes.array.isRequired,
  sets: PropTypes.array.isRequired,
  types: PropTypes.array.isRequired
};
