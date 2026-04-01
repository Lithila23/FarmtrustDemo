import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BuyerDashboard = () => {
  const [crops, setCrops] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        const res = await axios.get('http://localhost:5000/api/crops', config);
        setCrops(res.data);
      } catch (err) {
        console.error('Error fetching crops:', err);
      }
    };
    fetchCrops();
  }, []);

  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-900">Buyer Dashboard</h1>
          <span className="badge badge-success">Live Market</span>
        </div>
        <h2 className="page-title">Available Crops</h2>
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search crops..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.length > 0 ? (
            filteredCrops.map(crop => (
              <div key={crop._id} className="glass-card hover:shadow-2xl hover:scale-[1.02] transition-transform">
                <h3 className="text-xl font-bold text-primary mb-2">{crop.name}</h3>
                <p className="text-slate-600 mb-2"><strong>Available:</strong> {crop.quantity} kg</p>
                <p className="text-lg font-bold text-accent mb-4">${crop.price}/kg</p>
                {crop.description && <p className="text-slate-600 mb-4">{crop.description}</p>}
                <button className="btn-primary w-full">Add to Cart</button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No crops available</h3>
              <p className="text-slate-600">Farmers haven't listed any crops yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;