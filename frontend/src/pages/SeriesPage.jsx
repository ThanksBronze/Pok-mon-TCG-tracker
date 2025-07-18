import React, { useState, useEffect } from 'react';
import SeriesForm from '../components/SeriesForm';
import SeriesList from '../components/SeriesList';
import { fetchSeries } from '../api/series';

export default function SeriesPage() {
	const [series, setSeries] = useState([]);

	useEffect(() => {
		fetchSeries()
			.then(res => setSeries(res.data))
			.catch(err => console.error('Failed to load series:', err));
	}, []);

	const handleCreated = newSeries => {
		setSeries(s => [newSeries, ...s]);
	};

	return (
		<div className="series-page">
			<h1>Manage Series</h1>
			<SeriesForm onCreated={handleCreated} />
			<SeriesList series={series} />
		</div>
	);
}