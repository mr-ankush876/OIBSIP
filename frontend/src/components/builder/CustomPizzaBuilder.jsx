import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, ShoppingBag, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useCart } from '../../context/CartContext';

const CustomPizzaBuilder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ingredients catalogue from backend
  const [ingredients, setIngredients] = useState({
    bases: [],
    sauces: [],
    cheeses: [],
    vegetables: [],
  });

  // User selections
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVegetables, setSelectedVegetables] = useState([]);

  // Server-verified price breakdown
  const [priceData, setPriceData] = useState({
    unitPrice: 0,
    basePrice: 0,
    saucePrice: 0,
    cheesePrice: 0,
    vegetablesTotal: 0,
    isAvailable: true,
    unavailableIngredients: [],
  });

  const [addedSuccess, setAddedSuccess] = useState(false);

  // Load ingredients from backend
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get('/pizzas/ingredients');
        if (data.success && data.ingredients) {
          setIngredients(data.ingredients);
          // Set sensible defaults if available
          if (data.ingredients.bases.length > 0) setSelectedBase(data.ingredients.bases[0]);
          if (data.ingredients.sauces.length > 0) setSelectedSauce(data.ingredients.sauces[0]);
          if (data.ingredients.cheeses.length > 0) setSelectedCheese(data.ingredients.cheeses[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load pizza ingredients.');
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  // Update server price calculation whenever selections change
  useEffect(() => {
    if (!selectedBase || !selectedSauce || !selectedCheese) return;

    const fetchPrice = async () => {
      try {
        const payload = {
          baseId: selectedBase._id,
          sauceId: selectedSauce._id,
          cheeseId: selectedCheese._id,
          vegetableIds: selectedVegetables.map((v) => v._id),
        };
        const data = await apiClient.post('/pizzas/custom-price', payload);
        if (data.success) {
          setPriceData({
            unitPrice: data.priceBreakdown.unitPrice,
            basePrice: data.priceBreakdown.base.price,
            saucePrice: data.priceBreakdown.sauce.price,
            cheesePrice: data.priceBreakdown.cheese.price,
            vegetablesTotal: data.priceBreakdown.vegetablesTotal,
            isAvailable: data.isAvailable,
            unavailableIngredients: data.unavailableIngredients || [],
          });
        }
      } catch (err) {
        // Fallback local sum if network hiccup
        const baseP = selectedBase.price || 0;
        const sauceP = selectedSauce.price || 0;
        const cheeseP = selectedCheese.price || 0;
        const vegP = selectedVegetables.reduce((s, v) => s + (v.price || 0), 0);
        setPriceData((prev) => ({
          ...prev,
          unitPrice: baseP + sauceP + cheeseP + vegP,
        }));
      }
    };

    fetchPrice();
  }, [selectedBase, selectedSauce, selectedCheese, selectedVegetables]);

  const toggleVegetable = (veg) => {
    setSelectedVegetables((prev) => {
      const exists = prev.some((v) => v._id === veg._id);
      if (exists) {
        return prev.filter((v) => v._id !== veg._id);
      } else {
        return [...prev, veg];
      }
    });
  };

  const handleNext = () => {
    if (step === 1 && !selectedBase) return;
    if (step === 2 && !selectedSauce) return;
    if (step === 3 && !selectedCheese) return;
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) return;

    const customPizzaItem = {
      isCustom: true,
      name: `Artisan Pizza (${selectedBase.name} + ${selectedCheese.name})`,
      price: priceData.unitPrice,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      customDetails: {
        baseId: selectedBase._id,
        sauceId: selectedSauce._id,
        cheeseId: selectedCheese._id,
        vegetableIds: selectedVegetables.map((v) => v._id),
        baseName: selectedBase.name,
        sauceName: selectedSauce.name,
        cheeseName: selectedCheese.name,
        vegetableNames: selectedVegetables.map((v) => v.name),
      },
    };

    addToCart(customPizzaItem);
    setAddedSuccess(true);
    setTimeout(() => {
      navigate('/cart');
    }, 1000);
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'var(--color-muted)' }}>Loading fresh ingredients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>
          <AlertCircle size={48} style={{ margin: '0 auto' }} />
        </div>
        <h3>Failed to load ingredients</h3>
        <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="badge badge-special" style={{ marginBottom: '8px' }}>
          <Sparkles size={14} /> Artisan Customizer
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-dark)', letterSpacing: '-0.5px' }}>
          {t('builder.title')}
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          {t('builder.subtitle')}
        </p>
      </div>

      {/* 4 Step Progress Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '36px',
        flexWrap: 'wrap',
      }}>
        {[
          { num: 1, label: t('builder.step1') },
          { num: 2, label: t('builder.step2') },
          { num: 3, label: t('builder.step3') },
          { num: 4, label: t('builder.step4') },
          { num: 5, label: t('builder.summary') },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: step === s.num ? 'var(--color-primary)' : step > s.num ? '#fee2e2' : '#f1f5f9',
              color: step === s.num ? '#ffffff' : step > s.num ? 'var(--color-primary)' : 'var(--color-muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{s.num}</span>
            <span>{s.label.split('.')[1] || s.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Step Content */}
        <div className="card" style={{ padding: '28px' }}>
          {/* STEP 1: BASES (EXACTLY 5 OPTIONS) */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                  {t('builder.step1')}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)' }}>
                  {t('builder.step1Subtitle')}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {ingredients.bases.map((base) => {
                  const isSelected = selectedBase?._id === base._id;
                  const isOutOfStock = !base.isAvailable || base.stockQuantity < 1;

                  return (
                    <div
                      key={base._id}
                      onClick={() => !isOutOfStock && setSelectedBase(base)}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                        backgroundColor: isSelected ? '#fff1f2' : isOutOfStock ? '#f8fafc' : '#ffffff',
                        opacity: isOutOfStock ? 0.6 : 1,
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-dark)' }}>
                          {base.name}
                        </span>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                          ₹{base.price}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', lineHeight: '1.4' }}>
                        {base.description}
                      </p>
                      {isOutOfStock && (
                        <span className="badge badge-danger" style={{ marginTop: '8px' }}>
                          {t('builder.outOfStock')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SAUCES (EXACTLY 5 OPTIONS) */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                  {t('builder.step2')}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)' }}>
                  {t('builder.step2Subtitle')}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {ingredients.sauces.map((sauce) => {
                  const isSelected = selectedSauce?._id === sauce._id;
                  const isOutOfStock = !sauce.isAvailable || sauce.stockQuantity < 1;

                  return (
                    <div
                      key={sauce._id}
                      onClick={() => !isOutOfStock && setSelectedSauce(sauce)}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                        backgroundColor: isSelected ? '#fff1f2' : isOutOfStock ? '#f8fafc' : '#ffffff',
                        opacity: isOutOfStock ? 0.6 : 1,
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-dark)' }}>
                          {sauce.name}
                        </span>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                          ₹{sauce.price}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', lineHeight: '1.4' }}>
                        {sauce.description}
                      </p>
                      {isOutOfStock && (
                        <span className="badge badge-danger" style={{ marginTop: '8px' }}>
                          {t('builder.outOfStock')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CHEESE */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                  {t('builder.step3')}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)' }}>
                  {t('builder.step3Subtitle')}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {ingredients.cheeses.map((cheese) => {
                  const isSelected = selectedCheese?._id === cheese._id;
                  const isOutOfStock = !cheese.isAvailable || cheese.stockQuantity < 1;

                  return (
                    <div
                      key={cheese._id}
                      onClick={() => !isOutOfStock && setSelectedCheese(cheese)}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                        backgroundColor: isSelected ? '#fff1f2' : isOutOfStock ? '#f8fafc' : '#ffffff',
                        opacity: isOutOfStock ? 0.6 : 1,
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-dark)' }}>
                          {cheese.name}
                        </span>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                          ₹{cheese.price}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', lineHeight: '1.4' }}>
                        {cheese.description}
                      </p>
                      {isOutOfStock && (
                        <span className="badge badge-danger" style={{ marginTop: '8px' }}>
                          {t('builder.outOfStock')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: MULTIPLE VEGETABLES */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                  {t('builder.step4')}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)' }}>
                  {t('builder.step4Subtitle')}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {ingredients.vegetables.map((veg) => {
                  const isSelected = selectedVegetables.some((v) => v._id === veg._id);
                  const isOutOfStock = !veg.isAvailable || veg.stockQuantity < 1;

                  return (
                    <div
                      key={veg._id}
                      onClick={() => !isOutOfStock && toggleVegetable(veg)}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-secondary)' : '1.5px solid var(--color-border)',
                        backgroundColor: isSelected ? '#fff7ed' : isOutOfStock ? '#f8fafc' : '#ffffff',
                        opacity: isOutOfStock ? 0.6 : 1,
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? 'var(--color-secondary)' : 'var(--color-dark)' }}>
                          {veg.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                          +₹{veg.price}
                        </div>
                      </div>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        border: isSelected ? 'none' : '2px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-secondary)' : '#ffffff',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {isSelected && <Check size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: FINAL SUMMARY */}
          {step === 5 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                  {t('builder.summary')}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)' }}>
                  Review your handcrafted recipe before adding to cart
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                  <span><strong>{t('builder.base')}:</strong> {selectedBase?.name}</span>
                  <span style={{ fontWeight: 700 }}>₹{selectedBase?.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                  <span><strong>{t('builder.sauce')}:</strong> {selectedSauce?.name}</span>
                  <span style={{ fontWeight: 700 }}>₹{selectedSauce?.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                  <span><strong>{t('builder.cheese')}:</strong> {selectedCheese?.name}</span>
                  <span style={{ fontWeight: 700 }}>₹{selectedCheese?.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                  <div>
                    <strong>{t('builder.vegetables')}:</strong>{' '}
                    {selectedVegetables.length > 0
                      ? selectedVegetables.map((v) => v.name).join(', ')
                      : t('builder.noneSelected')}
                  </div>
                  <span style={{ fontWeight: 700 }}>₹{priceData.vegetablesTotal}</span>
                </div>
              </div>

              {addedSuccess && (
                <div style={{ padding: '12px', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 700, marginBottom: '16px' }}>
                  ✓ Custom Pizza added to Cart! Opening cart...
                </div>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!priceData.isAvailable}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800 }}
              >
                <ShoppingBag size={20} />
                {t('builder.addToCart')} — ₹{priceData.unitPrice}
              </button>
            </div>
          )}

          {/* Nav Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="btn btn-outline"
            >
              <ArrowLeft size={16} />
              {t('builder.back')}
            </button>

            {step < 5 && (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
              >
                {t('builder.next')}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Live Calculation Sidebar */}
        <div className="card" style={{ padding: '24px', backgroundColor: '#fffaf5', border: '1.5px solid #fed7aa' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '16px' }}>
            🛒 Recipe Blueprint
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--color-muted)' }}>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>Base:</span>{' '}
              {selectedBase ? `${selectedBase.name} (₹${selectedBase.price})` : 'Not chosen'}
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>Sauce:</span>{' '}
              {selectedSauce ? `${selectedSauce.name} (₹${selectedSauce.price})` : 'Not chosen'}
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>Cheese:</span>{' '}
              {selectedCheese ? `${selectedCheese.name} (₹${selectedCheese.price})` : 'Not chosen'}
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>Vegetables ({selectedVegetables.length}):</span>
              {selectedVegetables.length > 0 ? (
                <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                  {selectedVegetables.map((v) => (
                    <li key={v._id}>{v.name} (+₹{v.price})</li>
                  ))}
                </ul>
              ) : (
                <span style={{ fontStyle: 'italic', display: 'block' }}> None selected</span>
              )}
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #fed7aa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700, color: 'var(--color-dark)' }}>{t('builder.livePrice')}</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              ₹{priceData.unitPrice}
            </span>
          </div>

          {!priceData.isAvailable && (
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--color-danger)' }}>
              ⚠️ Unavailable: {priceData.unavailableIngredients.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomPizzaBuilder;
