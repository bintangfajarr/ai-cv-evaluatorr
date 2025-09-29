import dotenv from 'dotenv';
dotenv.config();

import openRouterClient, { LLM_CONFIG } from '../src/config/llm.js';

const testLLM = async() => {
    console.log('Testing LLM connection...');
    console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Set (hidden)' : 'NOT SET');
    console.log('Model:', LLM_CONFIG.model);

    try {
        const response = await openRouterClient.post('/chat/completions', {
            model: LLM_CONFIG.model,
            messages: [
                { role: 'user', content: 'Say "Hello, I am working!"' }
            ],
            max_tokens: 20,
        });

        console.log('\n✓ LLM Response:', response.data.choices[0].message.content);
        console.log('\n✅ LLM connection working!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ LLM test failed!');
        console.error('Status:', error.response && error.response.status);
        console.error('Error:', error.response && error.response.data || error.message);

        if (error.response && error.response.status === 401) {
            console.error('\n⚠️  API Key invalid atau tidak diset dengan benar');
        } else if (error.response && error.response.status === 404) {
            console.error('\n⚠️  Model tidak ditemukan. Coba model lain.');
            console.error('Model gratis yang tersedia:');
            console.error('- meta-llama/llama-3.1-8b-instruct:free');
            console.error('- mistralai/mistral-7b-instruct:free');
            console.error('- google/gemma-2-9b-it:free');
        }

        process.exit(1);
    }
};

testLLM();