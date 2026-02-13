const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Mock Sales Ledger
const Sales_Ledger = [
    { id: 1, vendorId: 'v1', amount: 1500, date: new Date().toISOString() },
    { id: 2, vendorId: 'v1', amount: 2000, date: new Date().toISOString() },
    { id: 3, vendorId: 'v1', amount: 1200, date: new Date(Date.now() - 86400000).toISOString() }, // Yesterday
    { id: 4, vendorId: 'v1', amount: 3000, date: new Date(Date.now() - 604800000).toISOString() }, // Last Week
];

// Mock Vendor Profile Metrics
const Vendor_Metrics = {
    'v1': {
        avgRating: 4.5,
        orderPlaced: 150,
        orderServed: 135,
        totalDishes: 25
    }
};

// Update Endpoint for Manual Testing
app.post('/api/vendor/update/:id', (req, res) => {
    const vendorId = req.params.id;
    const { amount, orderPlaced, orderServed, avgRating } = req.body;

    // Update Metrics
    if (Vendor_Metrics[vendorId]) {
        Vendor_Metrics[vendorId].orderPlaced = parseInt(orderPlaced) || Vendor_Metrics[vendorId].orderPlaced;
        Vendor_Metrics[vendorId].orderServed = parseInt(orderServed) || Vendor_Metrics[vendorId].orderServed;
        Vendor_Metrics[vendorId].avgRating = parseFloat(avgRating) || Vendor_Metrics[vendorId].avgRating;
    }

    // Update Ledger (Add new sale for today)
    if (amount) {
        Sales_Ledger.push({
            id: Sales_Ledger.length + 1,
            vendorId: vendorId,
            amount: parseInt(amount),
            date: new Date().toISOString()
        });
    }

    res.json({ message: 'Data updated successfully' });
});

app.get('/api/vendor/analytics/:id', async (req, res) => {
    const vendorId = req.params.id;
    const metrics = Vendor_Metrics[vendorId];

    if (!metrics) {
        return res.status(404).json({ error: 'Vendor not found' });
    }

    // Backend Earnings Calculation
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Recalculate based on updated ledger
    const todayEarnings = Sales_Ledger
        .filter(s => s.vendorId === vendorId && s.date.startsWith(todayStr))
        .reduce((sum, s) => sum + s.amount, 0);

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekEarnings = Sales_Ledger
        .filter(s => s.vendorId === vendorId && new Date(s.date) >= weekAgo)
        .reduce((sum, s) => sum + s.amount, 0);

    const totalEarnings = Sales_Ledger
        .filter(s => s.vendorId === vendorId)
        .reduce((sum, s) => sum + s.amount, 0);


    const earnings = {
        today: todayEarnings,
        thisWeek: thisWeekEarnings,
        thisMonth: totalEarnings, // Mocked as total for now
        total: totalEarnings
    };

    try {
        // Dynamic Heuristic "AI" Logic
        let score = 50; // Base score
        const suggestions = [];

        const completionRate = metrics.orderServed / metrics.orderPlaced;
        const rating = metrics.avgRating;

        // Calculate Credibility Score
        if (rating > 4.5) score += 20;
        else if (rating > 4.0) score += 10;
        else if (rating < 3.0) score -= 10;

        if (completionRate > 0.95) score += 20;
        else if (completionRate > 0.85) score += 10;
        else if (completionRate < 0.70) score -= 15;

        if (earnings.thisWeek > 5000) score += 10;

        // Cap score between 0 and 100
        score = Math.max(0, Math.min(100, score));

        // Generate Context-Aware Suggestions (Bilingual)
        if (completionRate < 0.85) {
            suggestions.push({
                en: "Order completion low! Consider hiring more staff or simplifying the menu.",
                hi: "ऑर्डर पूरे करने की दर कम है! अधिक स्टाफ रखने या मेनू को सरल बनाने पर विचार करें।"
            });
        } else {
            suggestions.push({
                en: "Operations are efficient. Good job keeping up with orders!",
                hi: "कामकाज कुशल है। ऑर्डर समय पर पूरा करने के लिए बहुत बढ़िया!"
            });
        }

        if (rating < 4.0) {
            suggestions.push({
                en: "Customer ratings are dropping. Review recent feedback and food quality.",
                hi: "ग्राहकों की रेटिंग गिर रही है। हालिया फीडबैक और भोजन की गुणवत्ता की समीक्षा करें।"
            });
        } else {
            suggestions.push({
                en: "Customers love your food! Launch a loyalty program to retain them.",
                hi: "ग्राहक आपके भोजन को पसंद करते हैं! उन्हें बनाए रखने के लिए एक लॉयल्टी प्रोग्राम शुरू करें।"
            });
        }

        if (earnings.today > earnings.thisWeek / 7) {
            suggestions.push({
                en: "Sales are trending up! Perfect time to introduce a special dish.",
                hi: "बिक्री बढ़ रही है! एक विशेष डिश पेश करने का सही समय है।"
            });
        }

        const aiResponse = {
            credibility_score: score,
            suggestions: suggestions.slice(0, 3) // Return top 3 suggestions
        };

        res.json({
            ...metrics,
            earnings,
            ai_insights: aiResponse
        });
    } catch (error) {
        res.status(500).json({ error: 'AI Analysis failed' });
    }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 7860;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
