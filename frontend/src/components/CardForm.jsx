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
import './CardForm.css'

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

	function pickPriceVariant(prices) {
		if (!prices || typeof prices !== 'object') return null;
		const keysInOrder = [
			'holofoil',
			'reverseHolofoil',
			'reverseholofoil',
			'normal',
			'1stEditionHolofoil',
			'unlimitedHolofoil',
		];
		for (const k of keysInOrder) if (prices[k]) return { key: k, data: prices[k] };
		const first = Object.entries(prices)[0];
		return first ? { key: first[0], data: first[1] } : null;
	}
	
	function normalizeNumber(n) {
		const v = Number(n);
		return Number.isFinite(v) ? v : undefined;
	}

	async function withRetry(fn, {
		retries = 2,
		baseDelay = 400,
		factor = 2,
		retryStatuses = [500, 502, 503, 504],
		onRetry = (attempt, status) => {}
				} = {}) {
		let attempt = 0;
		while (true) {
			try {
				return await fn();
			} catch (err) {
				const status = err?.response?.status ?? err?.status;
				const canRetry = retryStatuses.includes(status) && attempt < retries;
				if (!canRetry) throw err;
				attempt++;
				onRetry(attempt, status);
				const delay = baseDelay * Math.pow(factor, attempt - 1);
				await new Promise(r => setTimeout(r, delay));
			}
		}
				}

	const handleSubmit = async e => {
		e.preventDefault();
	
		const setObj = sets.find(s => s.id === +setId);
		const cardApiId = setObj?.set_abb && noInSet ? `${setObj.set_abb}-${noInSet}` : null;
	
		let finalName = name;
		let finalTypeId = typeId;
		let image_small = null;
		let image_large = null;
		let rarity = null;
	
		let pricePatch = {};
	
		if (cardApiId) {
			try {
				const r = await withRetry(
					() => api.get(`/tcg/cards/${cardApiId}`),
					{onRetry: (n,s) => console.warn('External server error, Retry #${n} /tcg/cards (status ${s})')}
				);
				const tcgCard = r.data.data;
	
				finalName = tcgCard.name;
				image_small = tcgCard.images?.small ?? null;
				image_large = tcgCard.images?.large ?? null;
				rarity = tcgCard.rarity ?? null;
	
				const pricesObj = tcgCard.tcgplayer?.prices;
				const picked = pickPriceVariant(pricesObj);
				if (picked?.data) {
					const p = picked.data;
					pricePatch = {
						price_low:    normalizeNumber(p.low),
						price_mid:    normalizeNumber(p.mid),
						price_high:   normalizeNumber(p.high),
						price_market: normalizeNumber(p.market),
					};
				}
	
				if (!finalTypeId && Array.isArray(tcgCard.subtypes)) {
					const match = types.find(t => tcgCard.subtypes.includes(t.name));
					if (match) finalTypeId = String(match.id);
				}
			} catch (err) {
				if (err.response?.status !== 404) console.error('TCG lookup error:', err);
			}
		}
	
		const basePayload = {
			name: finalName,
			set_id: Number(setId),
			type_id: finalTypeId ? Number(finalTypeId) : null,
			no_in_set: noInSet ? Number(noInSet) : null,
			image_small,
			image_large,
			rarity,
		};
	
		const cleanedPricePatch = Object.fromEntries(
			Object.entries(pricePatch).filter(([, v]) => v !== undefined)
		);
	
		const payload = { ...basePayload, ...cleanedPricePatch };
	
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
