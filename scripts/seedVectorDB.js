import { initializeCollections, storeJobDescription, storeScoringRubric } from '../src/services/ragService.js';

const jobDescription = `
Product Engineer (Backend) 2025

You'll be building new product features alongside a frontend engineer and product manager using Agile methodology.
As a Product Engineer, you'll write clean, efficient code to enhance our product's codebase in meaningful ways.

Requirements:
- Backend languages and frameworks (Node.js, Django, Rails)
- Database management (MySQL, PostgreSQL, MongoDB)
- RESTful APIs
- Security compliance
- Cloud technologies (AWS, Google Cloud, Azure)
- Server-side languages (Java, Python, Ruby, or JavaScript)
- Understanding of frontend technologies
- User authentication and authorization
- Scalable application design principles
- Creating database schemas
- Implementing automated testing platforms and unit tests
- Familiarity with LLM APIs, embeddings, vector databases and prompt design

Key Responsibilities:
- Designing and fine-tuning AI prompts
- Building LLM chaining flows
- Implementing Retrieval-Augmented Generation (RAG)
- Handling long-running AI processes
- Designing safeguards for API failures and LLM randomness
- Writing reusable, testable, and efficient code
`;

const scoringRubrics = [{
        category: 'cv_evaluation',
        parameter: 'technical_skills',
        weight: 0.40,
        description: 'Alignment with job requirements (backend, databases, APIs, cloud, AI/LLM)',
        scoringGuide: '1=Irrelevant skills, 2=Few overlaps, 3=Partial match, 4=Strong match, 5=Excellent match + AI/LLM exposure',
    },
    {
        category: 'cv_evaluation',
        parameter: 'experience_level',
        weight: 0.25,
        description: 'Years of experience and project complexity',
        scoringGuide: '1=<1 yr/trivial projects, 2=1-2 yrs, 3=2-3 yrs with mid-scale projects, 4=3-4 yrs solid track record, 5=5+ yrs/high-impact projects',
    },
    {
        category: 'cv_evaluation',
        parameter: 'achievements',
        weight: 0.20,
        description: 'Impact of past work (scaling, performance, adoption)',
        scoringGuide: '1=No clear achievements, 2=Minimal improvements, 3=Some measurable outcomes, 4=Significant contributions, 5=Major measurable impact',
    },
    {
        category: 'cv_evaluation',
        parameter: 'cultural_fit',
        weight: 0.15,
        description: 'Communication, learning mindset, teamwork/leadership',
        scoringGuide: '1=Not demonstrated, 2=Minimal, 3=Average, 4=Good, 5=Excellent and well-demonstrated',
    },
    {
        category: 'project_evaluation',
        parameter: 'correctness',
        weight: 0.30,
        description: 'Implements prompt design, LLM chaining, RAG context injection',
        scoringGuide: '1=Not implemented, 2=Minimal attempt, 3=Works partially, 4=Works correctly, 5=Fully correct + thoughtful',
    },
    {
        category: 'project_evaluation',
        parameter: 'code_quality',
        weight: 0.25,
        description: 'Clean, modular, reusable, tested',
        scoringGuide: '1=Poor, 2=Some structure, 3=Decent modularity, 4=Good structure + some tests, 5=Excellent quality + strong tests',
    },
    {
        category: 'project_evaluation',
        parameter: 'resilience',
        weight: 0.20,
        description: 'Handles long jobs, retries, randomness, API failures',
        scoringGuide: '1=Missing, 2=Minimal, 3=Partial handling, 4=Solid handling, 5=Robust, production-ready',
    },
    {
        category: 'project_evaluation',
        parameter: 'documentation',
        weight: 0.15,
        description: 'README clarity, setup instructions, trade-off explanations',
        scoringGuide: '1=Missing, 2=Minimal, 3=Adequate, 4=Clear, 5=Excellent + insightful',
    },
    {
        category: 'project_evaluation',
        parameter: 'creativity',
        weight: 0.10,
        description: 'Extra features beyond requirements',
        scoringGuide: '1=None, 2=Very basic, 3=Useful extras, 4=Strong enhancements, 5=Outstanding creativity',
    },
];

const seedVectorDB = async() => {
    try {
        console.log('Seeding Vector Database...\n');

        // Initialize collections
        await initializeCollections();

        // Store job description
        await storeJobDescription(
            'job-backend-2025',
            'Product Engineer (Backend) 2025',
            jobDescription
        );

        // Store scoring rubrics
        for (let i = 0; i < scoringRubrics.length; i++) {
            const rubric = scoringRubrics[i];
            await storeScoringRubric(
                `rubric-${i}`,
                rubric.category,
                rubric.parameter,
                rubric.description,
                rubric.scoringGuide
            );
        }

        console.log('\n✅ Vector database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding vector DB:', error.message);
        process.exit(1);
    }
};

seedVectorDB();