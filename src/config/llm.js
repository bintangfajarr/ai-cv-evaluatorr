import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const openRouterClient = axios.create({
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'CV Evaluator',
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds
});

export const LLM_CONFIG = {
    model: process.env.LLM_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
    temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.3,
    max_tokens: parseInt(process.env.LLM_MAX_TOKENS) || 2000,
};

// Test function
export const testLLMConnection = async() => {
    try {
        const response = await openRouterClient.post('/chat/completions', {
            model: LLM_CONFIG.model,
            messages: [{ role: 'user', content: 'Say hello' }],
            max_tokens: 10,
        });
        console.log('✓ LLM test successful:', response.data.choices[0].message.content);
        return true;
    } catch (error) {
        console.error('✗ LLM test failed:', error.response && error.response.data || error.message);
        return false;
    }
};

export default openRouterClient;