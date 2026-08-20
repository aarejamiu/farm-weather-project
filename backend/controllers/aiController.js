const axios = require('axios');

const askAI = async (req, res) => {
    const { question, context } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    const systemPrompt = `You are an intelligent farm assistant for a Nigerian smart farm called Leaders-Union Smart Farm. Only answer farming-related questions. Keep answers concise (3-5 sentences). Use this farm context to give specific actionable advice: ${context || 'No context available.'}`;

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'liquid/lfm-2.5-2.6b:free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: question }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://leaders-union-farm-weather-site.onrender.com',
                    'X-Title': 'Leaders-Union Smart Farm'
                }
            }
        );

        const reply = response.data.choices?.[0]?.message?.content;

        if (!reply) {
            console.error('OpenRouter empty response:', JSON.stringify(response.data));
            return res.status(500).json({ message: 'AI service unavailable', detail: 'Empty response' });
        }

        res.json({ reply });

    } catch (error) {
        console.error('OpenRouter status:', error.response?.status);
        console.error('OpenRouter error:', JSON.stringify(error.response?.data));
        console.error('Key exists:', !!process.env.OPENROUTER_API_KEY);

        res.status(500).json({
            message: 'AI service unavailable',
            detail: error.response?.data?.error?.message || error.message
        });
    }
};

module.exports = { askAI };