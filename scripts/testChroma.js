import chromaClient from '../src/config/chromadb.js';

const testChroma = async() => {
    try {
        console.log('Testing ChromaDB connection...');
        const heartbeat = await chromaClient.heartbeat();
        console.log('✓ ChromaDB heartbeat:', heartbeat);

        const version = await chromaClient.version();
        console.log('✓ ChromaDB version:', version);

        console.log('\n✅ ChromaDB is working!');
        process.exit(0);
    } catch (error) {
        console.error('❌ ChromaDB test failed:', error.message);
        process.exit(1);
    }
};

testChroma();