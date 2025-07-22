import React, { useState, useEffect } from "react";
import TypeForm from "../components/TypeForm";
import TypeList from "../components/TypeList";
import { fetchCardTypes } from "../api/cardTypes";

export default function SetPage() {
	const [types, setTypes] = useState([]);

	useEffect(() => {
		fetchCardTypes()
			.then(res => setTypes(res.data))
			.catch(err => console.error('Failed to load sets:', err));
	}, []);

	const handleCreated = newType => {
		setTypes(s => [newType, ...s]);
	}

	return (
		<div className="Type-page">
			<h1>Manage Sets</h1>
			<TypeForm onCreated={handleCreated} />
			<TypeList types={types} />
		</div>
	);
}