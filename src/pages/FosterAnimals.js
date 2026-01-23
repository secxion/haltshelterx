import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const FosterAnimals = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/animals/foster-eligible')
      .then(res => res.json())
      .then(data => {
        setAnimals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-center mb-6">
        <img src="/haltfav.png" alt="" className="w-16 h-16 animate-pulse" />
      </div>
      <h1 className="text-3xl font-bold mb-3 text-center">💝 Open Your Heart, Open Your Home</h1>
      <p className="text-gray-700 text-center mb-8 text-lg max-w-2xl mx-auto">These precious animals are ready for foster care—temporary love that makes permanent miracles possible. Give them a safe haven while they await their forever families.</p>
      {loading ? (
        <div className="text-center py-8">Loading foster animals...</div>
      ) : animals.length === 0 ? (
        <div className="text-center py-8">No foster-eligible animals available at this time.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {animals.map(animal => (
            <div key={animal._id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <img src={animal.imageUrl || '/images/animals/default.jpg'} alt={animal.name} className="w-32 h-32 object-cover rounded-full mb-4" />
              <h2 className="text-xl font-bold mb-2">{animal.name}</h2>
              <p className="text-gray-700 mb-2">{animal.species}</p>
              <p className="text-gray-500 mb-2">{animal.breed}</p>
              <p className="text-gray-500 mb-2">{animal.age} years old</p>
              <Link to={`/animals/${animal._id}`} className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-all transform hover:scale-105">💕 Learn More</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FosterAnimals;
