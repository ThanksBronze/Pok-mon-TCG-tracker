// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { fetchCards as apiFetchCards } from '../api/cards';
import CardForm from '../components/CardForm';
import CardList from '../components/CardList';

export default function Home() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    apiFetchCards()
      .then(r => setCards(r.data))
      .catch(console.error);
  }, []);

  const handleNewCard = newCard => {
    setCards(cs => [newCard, ...cs]);
  };

  const handleRemoveCard = id => {
    setCards(cs => cs.filter(c => c.id !== id));
  };

  return (
    <div className="manage-cards">
      <CardForm onSuccess={handleNewCard} />
      <CardList cards={cards} onDelete={handleRemoveCard} />
    </div>
  );
}
