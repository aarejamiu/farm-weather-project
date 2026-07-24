const axios = require('axios');

const askAI = async (req, res) => {
    const { question, context } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    const systemPrompt = `You are an intelligent farm assistant for a Nigerian smart farm called Leaders-Union Smart Farm. Only answer farming-related questions. Keep answers concise (3-5 sentences max). Use this farm context to give specific actionable advice: ${context || 'No context available.'}`;

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama3-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: question }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const reply = response.data.choices?.[0]?.message?.content || 'No response generated.';
        res.json({ reply });

    } catch (error) {
        console.error('AI error:', error.response?.data || error.message);
        res.status(500).json({ message: 'AI service unavailable' });
    }
};

module.exports = { askAI };