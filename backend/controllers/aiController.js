const axios = require('axios');

const askAI = async (req, res) => {
    const { question, context } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    const systemPrompt = `You are an intelligent farm assistant for a Nigerian smart farm called Leaders-Union Smart Farm. Only answer farming-related questions. Keep answers concise (3-5 sentences max). Use this farm context to give specific actionable advice: ${context || 'No context available.'}`;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            { text: systemPrompt + '\n\nFarmer question: ' + question }
                        ]
                    }
                ]
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
        res.json({ reply });

    } catch (error) {
        console.error('Gemini error status:', error.response?.status);
        console.error('Gemini error data:', JSON.stringify(error.response?.data));
        console.error('Gemini key exists:', !!process.env.GEMINI_API_KEY);

        res.status(500).json({
            message: 'AI service unavailable',
            detail: error.response?.data?.error?.message || error.message
        });
    }
};

module.exports = { askAI };