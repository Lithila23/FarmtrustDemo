import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, Trash2, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems, removeFromCart, processPayment } = useCart();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');
  const [checkoutForm, setCheckoutForm] = useState({
    deliveryAddress: '',
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, []);

  // Scroll Locking (Crucial UX)
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const openPaymentWindow = (order) => {
    setSelectedOrder(order);
    setPaymentModalOpen(true);
    setPaymentSuccess(false);
    setError('');
    setCheckoutForm({
      deliveryAddress: '',
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    });
  };

  const closePaymentWindow = () => {
    setPaymentModalOpen(false);
    setSelectedOrder(null);
    setPaymentLoading(false);
    setPaymentSuccess(false);
    setError('');
  };

  const handleCheckoutChange = (field, value) => {
    if (field === 'cardholderName') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }

    if (['cardNumber', 'cvv', 'expiryMonth', 'expiryYear'].includes(field)) {
      value = value.replace(/\D/g, '');
    }

    setCheckoutForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitMockPayment = async () => {
    if (!selectedOrder) return;

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
      processPayment(selectedOrder.id);
      setPaymentSuccess(true);
    } finally {
      setPaymentLoading(false);
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-[110] w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 transform flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <ShoppingBag size={24} className="text-primary-600 dark:text-primary-400" />
            Order History
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map(order => (
              <div key={order.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary-200 dark:hover:border-primary-800 transition-colors relative">
                
                {/* Remove Button */}
                <button 
                  onClick={() => removeFromCart(order.id)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-start justify-between mb-3 pr-8">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{order.crop?.name || 'Crop'}</h3>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${order.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400 dark:border-green-400/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400 dark:border-yellow-400/20'}`}>
                    {order.paymentStatus?.toUpperCase() || 'PENDING'}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{order.quantity} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Price:</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">${Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="font-medium uppercase">{order.paymentMethod}</span>
                  </div>
                  {order.paymentReference && (
                    <div className="flex justify-between pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500">Ref:</span>
                      <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{order.paymentReference}</span>
                    </div>
                  )}
                </div>

                {/* Actions Area */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  {order.paymentStatus === 'pending' ? (
                    <button 
                      onClick={() => openPaymentWindow(order)}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Checkout
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                      <CheckCircle2 size={16} /> Completed
                    </div>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-12 flex flex-col items-center">
              <ShoppingBag size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Your History is Empty</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Looks like you haven't bought anything yet.</p>
            </div>
          )}
        </div>
      </div>

      {paymentModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[120] bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:border dark:border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mock Payment Window</h3>
              <button type="button" onClick={closePaymentWindow} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Crop: {selectedOrder.crop?.name || 'Crop'}</p>
                <p className="text-slate-600 dark:text-slate-300">Quantity: {selectedOrder.quantity} kg</p>
                <p className="text-slate-600 dark:text-slate-300">Total: ${Number(selectedOrder.totalAmount).toFixed(2)}</p>
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
                    <p className="text-slate-600 dark:text-slate-400">The cart item was marked as paid locally.</p>
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
    </>,
    document.body
  );
};

export default CartDrawer;
