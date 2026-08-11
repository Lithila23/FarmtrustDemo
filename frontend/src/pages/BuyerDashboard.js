import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';
import CropCard from '../components/CropCard';

// ── Image-fallback helper ────────────────────────────────────────────────────
const CROP_EMOJI_MAP = {
  banana: '🍌', coconut: '🥥', watermelon: '🍉', mango: '🥭',
  apple: '🍎', orange: '🍊', grape: '🍇', strawberry: '🍓',
  tomato: '🍅', potato: '🥔', carrot: '🥕', corn: '🌽',
  wheat: '🌾', rice: '🍚', onion: '🧅', garlic: '🧄',
  pepper: '🫑', broccoli: '🥦', spinach: '🥬', pumpkin: '🎃',
  lemon: '🍋', pineapple: '🍍', peach: '🍑', pear: '🍐',
  cherry: '🍒', blueberry: '🫐', mushroom: '🍄', cabbage: '🥬',
  cucumber: '🥒', avocado: '🥑', eggplant: '🍆', radish: '🌱',
};

const getCropEmoji = (name = '') => {
  const key = name.toLowerCase();
  for (const [word, emoji] of Object.entries(CROP_EMOJI_MAP)) {
    if (key.includes(word)) return emoji;
  }
  return '🌿';
};

const BuyerDashboard = () => {
  const { addToCart } = useCart();
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    deliveryAddress: '',
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const handleAuthFailure = (msg) => {
    if (msg === 'Token is not valid' || msg === 'No token, authorization denied') {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return true;
    }
    return false;
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'x-auth-token': token
      }
    };
  };

  const fetchOrders = async () => {
    try {
      const res = await client.get('/orders/my', getAuthConfig());
      setOrders(res.data);
    } catch (err) {
      const msg = err.response?.data?.msg;
      if (handleAuthFailure(msg)) return;
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await client.get('/crops', getAuthConfig());
        setCrops(res.data);
      } catch (err) {
        console.error('Error fetching crops:', err);
      }
    };

    fetchCrops();
    fetchOrders();
  }, []);

  const openPaymentWindow = (crop) => {
    setSelectedCrop(crop);
    setQuantity(1);
    setError('');
    setPaymentSuccess(false);
    setCheckoutForm({
      deliveryAddress: '',
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    });
    setPaymentModalOpen(true);
  };

  const closePaymentWindow = () => {
    setPaymentModalOpen(false);
    setSelectedCrop(null);
    setPaymentLoading(false);
    setError('');
    setPaymentSuccess(false);
  };

  const handleCheckoutChange = (field, value) => {
    if (field === 'cardholderName') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }

    if (field === 'cardNumber' || field === 'cvv' || field === 'expiryMonth' || field === 'expiryYear') {
      value = value.replace(/\D/g, '');
    }

    setCheckoutForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitMockPayment = async () => {
    if (!selectedCrop) return;

    const trimmedAddress = checkoutForm.deliveryAddress.trim();
    const trimmedName = checkoutForm.cardholderName.trim();
    const digitsOnlyCard = checkoutForm.cardNumber.replace(/\D/g, '');
    const digitsOnlyCvv = checkoutForm.cvv.replace(/\D/g, '');
    const lettersOnlyName = checkoutForm.cardholderName.replace(/[^a-zA-Z\s]/g, '');

    if (!trimmedAddress || !trimmedName || !digitsOnlyCard || !checkoutForm.expiryMonth || !checkoutForm.expiryYear || !digitsOnlyCvv) {
      setError('Please complete the delivery address and card details.');
      return;
    }

    if (checkoutForm.cardholderName !== lettersOnlyName) {
      setError('Cardholder name can only include letters and spaces.');
      return;
    }

    if (digitsOnlyCard.length < 13 || digitsOnlyCard.length > 19) {
      setError('Card number must contain 13 to 19 digits only.');
      return;
    }

    if (digitsOnlyCvv.length < 3 || digitsOnlyCvv.length > 4) {
      setError('CVV must contain 3 or 4 digits only.');
      return;
    }

    if (checkoutForm.cardNumber !== digitsOnlyCard) {
      setError('Card number can only include numbers.');
      return;
    }

    setPaymentLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setPaymentSuccess(true);
    } finally {
      setPaymentLoading(false);
    }
  };

  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPreview = selectedCrop ? (Number(selectedCrop.price) * Number(quantity || 0)).toFixed(2) : '0.00';
  const selectedCropPrice = selectedCrop ? Number(selectedCrop.price).toFixed(2) : '0.00';

  return (
    <div className="relative overflow-hidden min-h-screen transition-colors duration-300"
      style={{
        background: 'linear-gradient(180deg, #fff1f5 0%, #f3e8ff 35%, #e0f2fe 70%, #d1fae5 100%)'
      }}
    >
      {/* Dark mode overlay */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          background: 'linear-gradient(180deg, #1e0a2e 0%, #1a1040 35%, #0d1f3c 70%, #022c22 100%)'
        }}
      />
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30 dark:opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #f9a8d4, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-25 dark:opacity-15 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #c4b5fd, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full opacity-30 dark:opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #7dd3fc, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-[400px] h-[300px] rounded-full opacity-0 dark:opacity-25 blur-[90px]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full h-full">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-900 dark:text-primary-400">Buyer Dashboard</h1>
          <span className="badge badge-success">Live Market</span>
        </div>
        <h2 className="page-title">Available Crops</h2>
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search crops..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCrops.length > 0 ? (
            filteredCrops.map(crop => (
              <CropCard
                key={crop.id}
                crop={crop}
                role="buyer"
                onAddToCart={() => addToCart(crop)}
                onBuyNow={() => openPaymentWindow(crop)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No crops available</h3>
              <p className="text-slate-600 dark:text-slate-400">Farmers haven't listed any crops yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>

      {paymentModalOpen && selectedCrop && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:border dark:border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mock Payment Window</h3>
              <button type="button" onClick={closePaymentWindow} className="btn-secondary px-3 py-2">
                Close
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Crop: {selectedCrop.name}</p>
                <p className="text-slate-600 dark:text-slate-300">Unit price: Rs. {selectedCropPrice} / kg</p>
                <p className="text-slate-600 dark:text-slate-300">Quantity: {quantity} kg</p>
                <p className="text-slate-600 dark:text-slate-300 font-semibold">Total: Rs. {totalPreview}</p>
              </div>

              <div>
                <label className="form-label dark:text-slate-300">Quantity (kg)</label>
                <input
                  type="number"
                  min="1"
                  max={selectedCrop.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  disabled={paymentLoading || paymentSuccess}
                />
              </div>

              <div>
                <label className="form-label dark:text-slate-300">Delivery Address</label>
                <textarea
                  rows="3"
                  value={checkoutForm.deliveryAddress}
                  onChange={(e) => handleCheckoutChange('deliveryAddress', e.target.value)}
                  placeholder="Enter the delivery address"
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  disabled={paymentLoading || paymentSuccess}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label dark:text-slate-300">Cardholder Name</label>
                  <input
                    type="text"
                    pattern="[A-Za-z ]*"
                    value={checkoutForm.cardholderName}
                    onChange={(e) => handleCheckoutChange('cardholderName', e.target.value)}
                    placeholder="Name on card"
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    disabled={paymentLoading || paymentSuccess}
                  />
                </div>

                <div>
                  <label className="form-label dark:text-slate-300">Card Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={19}
                    value={checkoutForm.cardNumber}
                    onChange={(e) => handleCheckoutChange('cardNumber', e.target.value)}
                    placeholder="Numbers only"
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    disabled={paymentLoading || paymentSuccess}
                  />
                </div>

                <div>
                  <label className="form-label dark:text-slate-300">Expiry Month</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    value={checkoutForm.expiryMonth}
                    onChange={(e) => handleCheckoutChange('expiryMonth', e.target.value)}
                    placeholder="MM"
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    disabled={paymentLoading || paymentSuccess}
                  />
                </div>

                <div>
                  <label className="form-label dark:text-slate-300">Expiry Year</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={checkoutForm.expiryYear}
                    onChange={(e) => handleCheckoutChange('expiryYear', e.target.value)}
                    placeholder="YYYY"
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    disabled={paymentLoading || paymentSuccess}
                  />
                </div>

                <div>
                  <label className="form-label dark:text-slate-300">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={checkoutForm.cvv}
                    onChange={(e) => handleCheckoutChange('cvv', e.target.value)}
                    placeholder="3 or 4 digits"
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    disabled={paymentLoading || paymentSuccess}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
                <p className="text-slate-700 dark:text-slate-300">This is a mock checkout only. No real payment gateway is connected.</p>
                <p className="text-2xl font-bold text-primary-700">Rs. {totalPreview}</p>
              </div>

              {!paymentSuccess ? (
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={submitMockPayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Processing mock payment...' : 'Cofirm Payment'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-600 p-4 bg-slate-50 dark:bg-slate-700/50">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Mock payment completed</p>
                    <p className="text-slate-600 dark:text-slate-400">Delivery address and card details were accepted locally.</p>
                  </div>
                  <button type="button" className="btn-primary w-full" onClick={closePaymentWindow}>
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      </div>{/* /relative z-10 */}
    </div>
  );
};

export default BuyerDashboard;