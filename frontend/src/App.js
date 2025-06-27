import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import NewCard from './pages/NewCard.jsx';
import EditCard from './pages/EditCard.jsx';

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/cards/new" element={<NewCard />} />
				<Route path="/cards/:id/edit" element={<EditCard />} />
			</Routes>
		</BrowserRouter>
	);
}