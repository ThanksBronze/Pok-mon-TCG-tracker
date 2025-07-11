import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NewCard from './pages/NewCard.jsx';
import EditCard from './pages/EditCard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

				<Route path="/" element={
					<ProtectedRoute>
						<Home />
					</ProtectedRoute>
				} />
				<Route path="/cards/new" element={
					<ProtectedRoute>
						<NewCard />
					</ProtectedRoute>
					} />
				<Route path="/cards/:id/edit" element={
					<ProtectedRoute>
						<EditCard />
					</ProtectedRoute>
					} />
				{/* ev. 404 */}
			</Routes>
		</BrowserRouter>
	);
}