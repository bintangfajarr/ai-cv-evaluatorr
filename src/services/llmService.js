import openRouterClient, { LLM_CONFIG } from '../config/llm.js';

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Call LLM with retry mechanism
 */
export const callLLM = async(prompt, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Calling LLM (attempt ${attempt}/${maxRetries})...`);

            const response = await openRouterClient.post('/chat/completions', {
                model: LLM_CONFIG.model,
                messages: [{
                        role: 'system',
                        content: 'You are a helpful assistant that always responds with valid JSON when requested.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: LLM_CONFIG.temperature,
                max_tokens: LLM_CONFIG.max_tokens,
            });
            // Extract content from response
            const content = response.data.choices[0].message.content;

            // Check if content is empty or null
            if (!content || content.trim() === '') {
                console.error('LLM returned empty response');
                throw new Error('Empty response from LLM');
            }

            console.log('✓ LLM response received');
            console.log('  Response length:', content.length, 'characters');
            console.log('  First 100 chars:', content.substring(0, 100));

            return content;

        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);

            // Handle rate limit
            if (error.response && error.response.status === 429) {
                const backoffMs = Math.pow(2, attempt) * 1000;
                console.log(`Rate limited. Waiting ${backoffMs}ms...`);
                await sleep(backoffMs);
                continue;
            }

            // Handle other API errors
            if (error.response) {
                console.error('API Error Status:', error.response.status);
                console.error('API Error Data:', JSON.stringify(error.response.data));
            }

            // If this is the last attempt, throw error
            if (attempt === maxRetries) {
                throw new Error(`LLM call failed after ${maxRetries} attempts: ${error.message}`);
            }

            // Exponential backoff for other errors
            const backoffMs = Math.pow(2, attempt) * 500;
            console.log(`Retrying in ${backoffMs}ms...`);
            await sleep(backoffMs);
        }
    }
};
/**
 * Parse JSON response from LLM
 */
export const parseLLMJSON = (llmResponse) => {
    try {
        // Check if response is empty
        if (!llmResponse || llmResponse.trim() === '') {
            console.error('Empty LLM response received');
            throw new Error('Empty response from LLM');
        }

        // Remove markdown code blocks if present
        let cleaned = llmResponse.trim();
        cleaned = cleaned.replace(/```json\n?/g, '');
        cleaned = cleaned.replace(/```\n?/g, '');
        cleaned = cleaned.trim();

        // Log for debugging
        console.log('Attempting to parse:', cleaned.substring(0, 200) + '...');

        // Parse JSON
        const parsed = JSON.parse(cleaned);
        return parsed;
    } catch (error) {
        console.error('Failed to parse LLM JSON response:', error.message);
        console.error('Raw response:', llmResponse);
        throw new Error('Invalid JSON response from LLM');
    }
};
/**
 * Call LLM and parse JSON response
 */
export const callLLMJSON = async(prompt, maxRetries = 3) => {
    const response = await callLLM(prompt, maxRetries);
    return parseLLMJSON(response);
};