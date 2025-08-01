import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { searchCards } from '../api/cards';
import { fetchSeries } from '../api/series';
import { fetchCardTypes } from '../api/cardTypes';
import { fetchSets } from '../api/sets';
import './SearchPanel.css'

function paramsToKey(p) {
	return JSON.stringify({
		q: p.q || '',
		series: p.series || '',
		set: p.set || '',
		type: p.type || '',
		rarity: p.rarity || ''
	});
}

export default function SearchPanel({ onResults }) {
	const [query, setQuery] = useState('');
	const [filters, setFilters] = useState({ series: '', set: '', type: '', rarity: '' });
	const [seriesList, setSeriesList] = useState([]);
	const [setsList, setSetsList] = useState([]);
	const [typesList, setTypesList] = useState([]);

	const lastKeyRef = useRef(null);
	const abortCtrlRef = useRef(null);
	const debounceRef = useRef(null);

	useEffect(() => {
		fetchSeries().then(r => setSeriesList(r.data)).catch(() => {});
		fetchSets().then(r => setSetsList(r.data)).catch(() => {});
		fetchCardTypes().then(r => setTypesList(r.data)).catch(() => {});
	}, []);

	useEffect(() => {
		const currentParams = { q: query, ...filters };

		const isEmpty =
			!query &&
			!filters.series &&
			!filters.set &&
			!filters.type &&
			!filters.rarity;

		if (isEmpty) {
			if (lastKeyRef.current !== 'EMPTY') {
				onResults(null);
				lastKeyRef.current = 'EMPTY';
			}
			return;
		}

		const key = paramsToKey(currentParams);
		if (key === lastKeyRef.current) {
			return;
		}

		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(async () => {
			if (abortCtrlRef.current) {
				abortCtrlRef.current.abort();
			}
			const ctrl = new AbortController();
			abortCtrlRef.current = ctrl;

			try {
				const resp = await searchCards(currentParams, { signal: ctrl.signal });
				onResults(resp.data);
				lastKeyRef.current = key;
			} catch (err) {
				if (err.name !== 'AbortError') {
					console.error('Search error:', err);
				}
			}
		}, 300);

		return () => {
			clearTimeout(debounceRef.current);
		};
	}, [query, filters, onResults]);

	return (
		<div className="search-panel">
			<input
				type="search"
				placeholder="Search cards…"
				value={query}
				onChange={e => setQuery(e.target.value)}
			/>

			<div className="facets">
				<select
					value={filters.series}
					onChange={e => setFilters(f => ({ ...f, series: e.target.value, set: '' }))}
				>
					<option value="">— all series —</option>
					{seriesList.map(s => (
						<option key={s.id} value={s.id}>{s.name}</option>
					))}
				</select>

				<select
					value={filters.set}
					onChange={e => setFilters(f => ({ ...f, set: e.target.value }))}
					disabled={!filters.series}
				>
					<option value="">— all sets —</option>
					{setsList
						.filter(s => s.series_id === +filters.series)
						.map(s => (
							<option key={s.id} value={s.id}>{s.name_of_expansion}</option>
						))}
				</select>

				<select
					value={filters.type}
					onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
				>
					<option value="">— all types —</option>
					{typesList.map(t => (
						<option key={t.id} value={t.id}>{t.name}</option>
					))}
				</select>

				<select
					value={filters.rarity}
					onChange={e => setFilters(f => ({ ...f, rarity: e.target.value }))}
				>
					<option value="">— all rarities —</option>
					{['Common', 'Uncommon', 'Rare', 'Mythic'].map(r => (
						<option key={r} value={r}>{r}</option>
					))}
				</select>
			</div>
		</div>
	);
}

SearchPanel.propTypes = {
	onResults: PropTypes.func.isRequired
};
