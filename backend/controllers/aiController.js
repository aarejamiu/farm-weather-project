const axios = require('axios');

const askAI = async (req, res) => {
    const { question, context } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    const prompt = `You are an intelligent farm assistant for a Nigerian smart farm called Leaders-Union Smart Farm. Only answer farming-related questions. Keep answers concise (3-5 sentences). Use this farm context: ${context || 'No context available.'}\n\nFarmer question: ${question}`;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {
            console.error('Gemini empty response:', JSON.stringify(response.data));
            return res.status(500).json({ message: 'AI service unavailable', detail: 'Empty response from Gemini' });
        }

        res.json({ reply });

    } catch (error) {
        console.error('Gemini status:', error.response?.status);
        console.error('Gemini error:', JSON.stringify(error.response?.data));
        console.error('Key exists:', !!process.env.GEMINI_API_KEY);
        console.error('Key prefix:', process.env.GEMINI_API_KEY?.slice(0, 8));

        res.status(500).json({
            message: 'AI service unavailable',
            detail: error.response?.data?.error?.message || error.message
        });
    }
};

module.exports = { askAI };