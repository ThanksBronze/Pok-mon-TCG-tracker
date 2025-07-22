import React, { useState, useEffect } from "react";
import SetForm from "../components/SetForm";
import SetList from "../components/SetList";
import { fetchSets } from "../api/sets";

export default function SetPage() {
	const [sets, setSets] = useState([]);

	useEffect(() => {
		fetchSets()
			.then(res => setSets(res.data))
			.catch(err => console.error('Failed to load sets:', err));
	}, []);

	const handleCreated = newSet => {
		setSets(s => [newSet, ...s]);
	}

	return (
		<div className="set-page">
			<h1>Manage Sets</h1>
			<SetForm onCreated={handleCreated} />
			<SetList sets={sets} />
		</div>
	);
}