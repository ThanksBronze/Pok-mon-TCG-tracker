import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchSeries, fetchSets, fetchCardTypes, searchCards } from '../api/cards';

export default function SearchPanel({ onResults }) {
	const [query, setQuery] = useState('');
	const [filters, setFilters] = useState({ series: '', set: '', type: '', rarity: '' });
	const [seriesList, setSeriesList] = useState([]);
	const [setsList, setSetsList] = useState([]);
	const [typesList, setTypesList] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchSeries().then(r => setSeriesList(r.data));
		fetchSets().then(r => setSetsList(r.data));
		fetchCardTypes().then(r => setTypesList(r.data));
	}, []);

	useEffect(() => {
		const handle = setTimeout(async () => {
			setLoading(true);
			const params = { q: query, ...filters };
			const resp = await searchCards(params);
			onResults(resp.data);
			setLoading(false);
		}, 300);

		return () => clearTimeout(handle);
	}, [query, filters, onResults]);

	return (
		<div className="search-panel">
			<input
				type="search"
				placeholder="Sök kort…"
				value={query}
				onChange={e => setQuery(e.target.value)}
			/>

			<div className="facets">
				<select
					value={filters.series}
					onChange={e => setFilters(f => ({ ...f, series: e.target.value }))}
				>
					<option value="">— alla serier —</option>
					{seriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
				</select>

				<select
					value={filters.set}
					onChange={e => setFilters(f => ({ ...f, set: e.target.value }))}
					disabled={!filters.series}
				>
					<option value="">— alla set —</option>
					{setsList.filter(s => s.series_id === +filters.series)
									 .map(s => <option key={s.id} value={s.id}>{s.name_of_expansion}</option>)}
				</select>

				<select
					value={filters.type}
					onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
				>
					<option value="">— alla typer —</option>
					{typesList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
				</select>

				<select
					value={filters.rarity}
					onChange={e => setFilters(f => ({ ...f, rarity: e.target.value }))}
				>
					<option value="">— alla rarity —</option>
					{['Common','Uncommon','Rare','Mythic'].map(r => <option key={r} value={r}>{r}</option>)}
				</select>
			</div>

			{loading && <p>Loading…</p>}
		</div>
	);
}

SearchPanel.propTypes = {
	onResults: PropTypes.func.isRequired
};
