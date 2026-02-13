import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TrendingUp,
    DollarSign,
    Activity,
    Star,
    MessageSquare,
    Zap,
    Award,
    Edit3,
    Save,
    Globe
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    AreaChart,
    Area,
    XAxis
} from 'recharts';
import { motion } from 'framer-motion';

const API_BASE_URL = '/api';

const Dashboard = () => {
    const [language, setLanguage] = useState('en');

    const translations = {
        en: {
            title: "Predictive Analytics",
            welcome: "Welcome back, Vendor!!",
            liveStatus: "Live Status: Active",
            simulate: "Simulate Data",
            cancel: "Cancel Edit",
            update: "Update & Predict",
            manualTitle: "Manual Data Simulation",
            addSales: "Add Sales (₹)",
            ordersPlaced: "Orders Placed",
            ordersServed: "Orders Served",
            avgRating: "Avg Rating",
            earnings: "Today's Earnings",
            efficiency: "Order Efficiency",
            quickStats: "Quick Stats",
            totalDishes: "Total Dishes",
            consultant: "Smart Consultant",
            predictions: "AI Predictions",
            credibility: "Credibility",
            growth: "Weekly Revenue Growth",
            fromYesterday: "from yesterday",
            served: "Served",
            missed: "Missed",
            validSales: "Please enter a valid sales amount.",
            validOrders: "Please enter valid order counts.",
            validServed: "Orders served cannot exceed orders placed.",
            validRating: "Rating must be between 0 and 5.",
            successUpdate: "Data Updated Successfully!"
        },
        hi: {
            title: "अनुमानित विश्लेषण (Analytics)",
            welcome: "स्वागत है, वेंडर!!",
            liveStatus: "लाइव स्थिति: सक्रिय",
            simulate: "डाटा सिमुलेट करें",
            cancel: "रद्द करें",
            update: "अपडेट और भविष्यवाणी",
            manualTitle: "मैनुअल डेटा सिमुलेशन",
            addSales: "बिक्री जोड़ें (₹)",
            ordersPlaced: "ऑर्डर मिले",
            ordersServed: "ऑर्डर पूरे किए",
            avgRating: "औसत रेटिंग",
            earnings: "आज की कमाई",
            efficiency: "ऑर्डर दक्षता",
            quickStats: "त्वरित आंकड़े",
            totalDishes: "कुल व्यंजन",
            consultant: "स्मार्ट सलाहकार",
            predictions: "AI भविष्यवाणियां",
            credibility: "विश्वसनीयता",
            growth: "साप्ताहिक राजस्व वृद्धि",
            fromYesterday: "कल से",
            served: "पूरे किए",
            missed: "छूटे हुए",
            validSales: "कृपया वैध बिक्री राशि दर्ज करें।",
            validOrders: "कृपया वैध ऑर्डर संख्या दर्ज करें।",
            validServed: "पूरे किए गए ऑर्डर मिले हुए ऑर्डर से अधिक नहीं हो सकते।",
            validRating: "रेटिंग 0 और 5 के बीच होनी चाहिए।",
            successUpdate: "डेटा सफलतापूर्वक अपडेट किया गया!"
        }
    };

    const t = translations[language];

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        orderPlaced: '',
        orderServed: '',
        avgRating: ''
    });

    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/vendor/analytics/v1`);
            setData(response.data);
            setFormData({
                amount: '',
                orderPlaced: response.data.orderPlaced,
                orderServed: response.data.orderServed,
                avgRating: response.data.avgRating
            });
            setError(null);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = async () => {
        // Validation Logic
        const { amount, orderPlaced, orderServed, avgRating } = formData;
        setError(null);

        if (amount && (isNaN(amount) || amount < 0)) {
            setError(t.validSales);
            return;
        }

        if (isNaN(orderPlaced) || isNaN(orderServed) || orderPlaced < 0 || orderServed < 0) {
            setError(t.validOrders);
            return;
        }

        if (parseInt(orderServed) > parseInt(orderPlaced)) {
            setError(t.validServed);
            return;
        }

        if (isNaN(avgRating) || avgRating < 0 || avgRating > 5) {
            setError(t.validRating);
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/vendor/update/v1`, formData);
            // Silent update - no success alert
            setIsEditing(false);
            setLoading(true);
            fetchData();
        } catch (err) {
            console.error('Error updating data:', err);
            setError('Failed to update data. Please ensure the backend is running.');
        }
    };

    if (loading) return <div className="loading" style={{ padding: '2rem', textAlign: 'center' }}>Loading Analytics...</div>;
    if (!data) return <div className="error" style={{ padding: '2rem', textAlign: 'center' }}>Failed to load platform data.</div>;

    const efficiencyData = [
        { name: t.served, value: data.orderServed },
        { name: t.missed, value: data.orderPlaced - data.orderServed }
    ];

    const COLORS = ['#1DB954', '#1e293b'];

    return (
        <div className="dashboard-container">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>{t.title}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{t.welcome}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                        className="glass-card"
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '2rem',
                            cursor: 'pointer',
                            color: 'white',
                            fontWeight: '600',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    >
                        <Globe size={18} color="var(--accent)" />
                        <span style={{ fontSize: '0.9rem' }}>{language === 'en' ? 'English' : 'हिंदी'}</span>
                    </button>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="glass-card"
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-primary)',
                            border: isEditing ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
                        }}
                    >
                        <Edit3 size={16} /> {isEditing ? t.cancel : t.simulate}
                    </button>
                    <div className="glass-card" style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{t.liveStatus}</span>
                    </div>
                </div>
            </header>

            {isEditing && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="glass-card"
                    style={{ marginBottom: '2rem', padding: '1.5rem' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{t.manualTitle}</h3>
                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.85rem'
                            }}>
                                {error}
                            </div>
                        )}
                        <button
                            onClick={handleUpdate}
                            style={{
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Save size={16} /> {t.update}
                        </button>
                    </div>
                    <div className="grid grid-cols-4" style={{ gap: '1rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        <div>
                            <label className="label" style={{ display: 'block' }}>{t.addSales}</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                                placeholder="e.g. 5000"
                            />
                        </div>
                        <div>
                            <label className="label" style={{ display: 'block' }}>{t.ordersPlaced}</label>
                            <input
                                type="number"
                                value={formData.orderPlaced}
                                onChange={(e) => setFormData({ ...formData, orderPlaced: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label className="label" style={{ display: 'block' }}>{t.ordersServed}</label>
                            <input
                                type="number"
                                value={formData.orderServed}
                                onChange={(e) => setFormData({ ...formData, orderServed: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label className="label" style={{ display: 'block' }}>{t.avgRating}</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.avgRating}
                                onChange={(e) => setFormData({ ...formData, avgRating: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-3">
                {/* Income Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                >
                    <div className="label"><DollarSign size={16} /> {t.earnings}</div>
                    <div className="income-big">₹{data.earnings.today.toLocaleString()}</div>
                    <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                        <TrendingUp size={14} /> +12.5% {t.fromYesterday}
                    </div>
                </motion.div>

                {/* Efficiency Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                >
                    <div className="label"><Activity size={16} /> {t.efficiency}</div>
                    <div style={{ height: '120px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={efficiencyData}
                                    innerRadius={40}
                                    outerRadius={55}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {efficiencyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '-40px', fontWeight: '700' }}>
                        {Math.round((data.orderServed / data.orderPlaced) * 100)}%
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '20px' }}>
                        {data.orderServed} / {data.orderPlaced} {t.ordersServed}
                    </p>
                </motion.div>

                {/* Metrics Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card"
                >
                    <div className="label"><Zap size={16} /> {t.quickStats}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <div className="label" style={{ fontSize: '0.7rem' }}>{t.avgRating}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Star size={16} fill="#fbbf24" color="#fbbf24" /> {data.avgRating}
                            </div>
                        </div>
                        <div>
                            <div className="label" style={{ fontSize: '0.7rem' }}>{t.totalDishes}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{data.totalDishes}</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-2" style={{ marginTop: '1.5rem' }}>
                {/* AI Smart Consultant Box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card"
                    style={{ border: '1px solid rgba(29, 185, 84, 0.3)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="label" style={{ color: 'var(--primary)' }}><Award size={16} /> {t.consultant}</div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t.predictions}</h2>
                        </div>
                        <div className="score-badge">
                            {t.credibility}: {data.ai_insights.credibility_score}%
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        {data.ai_insights.suggestions.map((suggestion, idx) => (
                            <div key={idx} className="suggestion-item">
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <MessageSquare size={18} color="var(--primary)" />
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        {/* Handle both old string format (if cached) and new object format */}
                                        {typeof suggestion === 'string' ? suggestion : suggestion[language]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Weekly Growth Summary */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card"
                >
                    <div className="label">{t.growth}</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>₹{data.earnings.thisWeek.toLocaleString()}</h2>
                    <div style={{ height: '200px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { day: 'Mon', revenue: 4000 },
                                { day: 'Tue', revenue: 3000 },
                                { day: 'Wed', revenue: 2000 },
                                { day: 'Thu', revenue: 2780 },
                                { day: 'Fri', revenue: 1890 },
                                { day: 'Sat', revenue: 2390 },
                                { day: 'Sun', revenue: data.earnings.today },
                            ]}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1DB954" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" stroke="#b3b3b3" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="#1DB954" fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
