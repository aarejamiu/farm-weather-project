const axios = require('axios');

const askAI = async (req, res) => {
    const { question, context } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    try {
        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: 'claude-sonnet-4-6',
                max_tokens: 1000,
                system: `You are an intelligent farm assistant for a Nigerian smart farm called Leaders-Union Smart Farm. You only answer farming-related questions. Keep answers concise (3–5 sentences max). Use the farm context below to give specific, actionable advice. Never make up data not in the context.\n\nFarm context: ${context || 'No context available.'}`,
                messages: [{ role: 'user', content: question }]
            },
            {
                headers: {
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                }
            }
        );

        const reply = response.data.content?.[0]?.text || 'No response generated.';
        res.json({ reply });

    } catch (error) {
        console.error('AI error:', error.response?.data || error.message);
        res.status(500).json({ message: 'AI service unavailable' });
    }
};

module.exports = { askAI };