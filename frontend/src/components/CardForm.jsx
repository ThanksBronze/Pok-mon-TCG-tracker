import React, { useState, useEffect } from 'react';
import {
	createCard as apiCreateCard,
	updateCard as apiUpdateCard,
	fetchCard as apiFetchCard
} from '../api/cards';
import { fetchSeries } from '../api/series';
import { fetchSets } from '../api/sets';
import { fetchCardTypes as apiFetchTypes } from '../api/cardTypes';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function CardForm({ onSuccess }) {
	const { id } = useParams();
	const isEdit = Boolean(id);
	const navigate = useNavigate();

	// lookup lists
	const [seriesList, setSeriesList] = useState([]);
	const [sets, setSets] = useState([]);
	const [types, setTypes] = useState([]);

	// form fields
	const [name, setName] = useState('');
	const [selectedSeries, setSeries] = useState('');
	const [setId, setSetId] = useState('');
	const [typeId, setTypeId] = useState('');
	const [noInSet, setNoInSet] = useState('');

	useEffect(() => {
		fetchSeries().then(r => setSeriesList(r.data)).catch(console.error);
		fetchSets().then(r => setSets(r.data)).catch(console.error);
		apiFetchTypes().then(r => setTypes(r.data)).catch(console.error);
	}, []);

	// if editing existing → load it
	useEffect(() => {
		if (!isEdit) return;
		apiFetchCard(id)
			.then(r => {
				const c = r.data;
				setName(c.name);
				setSeries(c.series_id?.toString() || '');
				setSetId(c.set_id.toString());
				setTypeId(c.type_id.toString());
				setNoInSet(c.no_in_set?.toString() || '');
			})
			.catch(console.error);
	}, [id, isEdit]);

	const handleSubmit = async e => {
		e.preventDefault();
	
		// 1) Hitta set‐objektet för att bygga API‐id (t.ex. "base1-4")
		const setObj    = sets.find(s => s.id === +setId);
		const cardApiId = setObj?.set_abb && noInSet
			? `${setObj.set_abb}-${noInSet}`
			: null;
	
		// 2) Förbered variabler för fälten både från form & TCG‐API
		let finalName   = name;
		let finalTypeId = typeId;            // fallback till manuellt val
		let image_small = null;
		let image_large = null;
		let rarity      = null;
		let price_low   = null;
		let price_mid   = null;
		let price_high  = null;
		let price_market= null;
	
		if (cardApiId) {
			try {
				const r       = await api.get(`/tcg/cards/${cardApiId}`);
				const tcgCard = r.data.data;
	
				// namn, bilder, rarity, pris:
				finalName   = tcgCard.name;
				image_small = tcgCard.images.small;
				image_large = tcgCard.images.large;
				rarity      = tcgCard.rarity;
				if (tcgCard.tcgplayer?.prices?.holofoil) {
					const p     = tcgCard.tcgplayer.prices.holofoil;
					price_low    = p.low;
					price_mid    = p.mid;
					price_high   = p.high;
					price_market = p.market;
				}
	
				// **Subtype‐fallback**: om användaren inte valt typ, försök hitta en matchning
				if (!finalTypeId && Array.isArray(tcgCard.subtypes)) {
					const match = types.find(t => tcgCard.subtypes.includes(t.name));
					if (match) {
						finalTypeId = String(match.id);
					}
				}
			} catch (err) {
				if (err.response?.status !== 404) console.error('TCG lookup error:', err);
				// 404 = inte hittad → lämna finalName (och finalTypeId) oförändrade
			}
		}
	
		// 3) Bygg payload med både användar‐ och API‐fält
		const payload = {
			name:         finalName,
			type_id:      +finalTypeId,
			set_id:       +setId,
			no_in_set:    noInSet ? +noInSet : null,
			image_small,
			image_large,
			rarity,
			price_low,
			price_mid,
			price_high,
			price_market
		};
	
		// 4) Skicka mot din backend
		try {
			let res;
			if (isEdit) {
				res = await apiUpdateCard(id, payload);
			} else {
				res = await apiCreateCard(payload);
				onSuccess?.(res.data);
			}
			navigate('/');
		} catch (err) {
			console.error('Save error:', err);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="card-form">
			<label>
				Name
				<input
					name="name"
					value={name}
					onChange={e => setName(e.target.value)}
					required
				/>
			</label>

			<label>
				Series
				<select
					value={selectedSeries}
					onChange={e => { setSeries(e.target.value); setSetId(''); }}
					required
				>
					<option value="" disabled>— choose series —</option>
					{seriesList.map(s => (
						<option key={s.id} value={s.id}>{s.name}</option>
					))}
				</select>
			</label>

			<label>
				Card Type
				<select
					value={typeId}
					onChange={e => setTypeId(e.target.value)}
				>
					<option value="" disabled>— choose type —</option>
					{types.map(t => (
						<option key={t.id} value={t.id}>{t.name}</option>
					))}
				</select>
			</label>

			<label>
				Set
				<select
					value={setId}
					onChange={e => setSetId(e.target.value)}
					required
					disabled={!selectedSeries}
				>
					<option value="" disabled>— choose set —</option>
					{sets
						.filter(s => s.series_id === +selectedSeries)
						.map(s => (
							<option key={s.id} value={s.id}>
								{s.name_of_expansion}
							</option>
						))
					}
				</select>
			</label>

			<label>
				No. in Set
				<input
					type="number"
					value={noInSet}
					onChange={e => setNoInSet(e.target.value)}
					min="1"
				/>
			</label>

			<button type="submit">{isEdit ? 'Update' : 'Create'}</button>
		</form>
	);
}

CardForm.propTypes = {
	onSuccess: PropTypes.func,
};
