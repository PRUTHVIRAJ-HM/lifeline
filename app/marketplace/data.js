export const courses = [
  {
    id: 1,
    title: 'Complete Web Development Bootcamp 2025',
    instructor: 'Dr. Angela Yu',
    category: 'programming',
    price: 3499,
    originalPrice: 8999,
    rating: 4.8,
    reviews: 245000,
    students: 890000,
    duration: '65 hours',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    bestseller: true,
    updated: 'Dec 2024',
    features: ['65 hours video', '140 downloadable resources', 'Certificate', 'Lifetime access'],
    description: 'Master full-stack web development with HTML, CSS, JavaScript, React, Node.js, and MongoDB',
    outcomes: [
      'Build responsive websites with modern HTML/CSS',
      'Create full-stack apps with React, Node, and MongoDB',
      'Deploy production-ready apps and APIs',
      'Follow best practices and testing patterns'
    ],
    includes: ['Lifetime access', 'Certificate of completion', 'Downloadable resources', 'Assignments and quizzes'],
    chapters: [
      {
        title: 'Getting Started',
        duration: '3h 20m',
        lessons: [
          { title: 'Course overview and setup', duration: '18m', videoId: 'UB1O30fR-EE' },
          { title: 'HTML foundations', duration: '46m', videoId: 'qz0aGYrrlhU' },
          { title: 'CSS essentials', duration: '51m', videoId: '1Rs2ND1ryYc' },
          { title: 'Responsive layouts', duration: '45m', videoId: 'srvUrASNj0s' }
        ]
      },
      {
        title: 'JavaScript Core',
        duration: '12h 10m',
        lessons: [
          { title: 'Modern JS basics', duration: '1h 05m', videoId: 'W6NZfCO5SIk' },
          { title: 'DOM and events', duration: '1h 20m', videoId: '5fb2aPlgoys' },
          { title: 'Async JS and fetch', duration: '1h 15m', videoId: 'PoRJizFvM7s' },
          { title: 'Modules and tooling', duration: '58m', videoId: 'cCOL7MC4Pl0' }
        ]
      },
      {
        title: 'Frontend with React',
        duration: '16h 40m',
        lessons: [
          { title: 'React fundamentals', duration: '1h 30m' },
          { title: 'Hooks and state', duration: '1h 20m' },
          { title: 'Routing and forms', duration: '1h 10m' },
          { title: 'State management patterns', duration: '1h 05m' }
        ]
      },
      {
        title: 'Backend with Node & MongoDB',
        duration: '15h 30m',
        lessons: [
          { title: 'Express fundamentals', duration: '1h 10m' },
          { title: 'REST APIs and auth', duration: '1h 35m' },
          { title: 'MongoDB data modeling', duration: '1h 25m' },
          { title: 'Testing and deployment', duration: '1h 10m' }
        ]
      }
    ],
    content: {
      longDescription: 'A comprehensive path from zero to full-stack engineer with modern JavaScript, React, Node, and MongoDB. You will ship multiple production-grade apps, practice deployment, and learn patterns teams actually use.',
      prerequisites: [
        'Basic computer literacy and ability to install software',
        'No prior programming required, but curiosity helps',
        'A laptop capable of running Node.js and a modern browser'
      ],
      skills: [
        'Responsive UI with modern HTML/CSS',
        'React hooks, state, routing, and forms',
        'REST API design with Express and MongoDB',
        'Authentication, security basics, and deployment'
      ],
      projects: [
        {
          title: 'Personal Portfolio SPA',
          summary: 'Build and deploy a responsive React portfolio that showcases projects, blog posts, and contact forms.',
          deliverables: ['Live deployment', 'Reusable component library', 'Form handling with validation']
        },
        {
          title: 'Task Manager API + UI',
          summary: 'Create a full-stack CRUD task manager with Express, MongoDB, JWT auth, and a React front-end.',
          deliverables: ['Protected routes', 'Pagination and search', 'Dockerized dev environment']
        },
        {
          title: 'E-commerce Mini Store',
          summary: 'Implement product listings, cart, checkout simulation, and admin dashboard with charts.',
          deliverables: ['Role-based access', 'State management patterns', 'Production build and deployment guide']
        }
      ],
      resources: [
        'Starter GitHub repos for frontend and backend',
        'Environment setup checklist (Node, MongoDB, VS Code)',
        'Design assets and component templates',
        'Deployment runbooks for Render/Vercel'
      ],
      certification: 'Complete all capstones and quizzes to unlock the Full-Stack Developer certificate.'
    }
  },
  {
    id: 2,
    title: 'Machine Learning A-Z: Python & R in Data Science',
    instructor: 'Kirill Eremenko',
    category: 'ai',
    price: 3999,
    originalPrice: 9999,
    rating: 4.9,
    reviews: 156000,
    students: 620000,
    duration: '44 hours',
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
    bestseller: true,
    updated: 'Nov 2024',
    features: ['44 hours video', '50+ algorithms', 'Real projects', 'Certificate'],
    description: 'Learn to create Machine Learning algorithms from scratch in Python and R',
    outcomes: [
      'Implement ML algorithms end-to-end',
      'Handle data preprocessing and feature engineering',
      'Train, evaluate, and tune models',
      'Deploy simple ML services'
    ],
    includes: ['Lifetime access', 'Certificate', 'Project files', 'Quizzes and assignments'],
    chapters: [
      {
        title: 'Foundations',
        duration: '4h 10m',
        lessons: [
          { title: 'What is ML?', duration: '20m' },
          { title: 'Python & R setup', duration: '35m' },
          { title: 'Data preprocessing', duration: '1h 05m' },
          { title: 'Model evaluation basics', duration: '40m' }
        ]
      },
      {
        title: 'Core Algorithms',
        duration: '12h 30m',
        lessons: [
          { title: 'Regression models', duration: '1h 15m' },
          { title: 'Classification models', duration: '1h 20m' },
          { title: 'Clustering', duration: '1h 05m' },
          { title: 'Dimensionality reduction', duration: '55m' }
        ]
      },
      {
        title: 'Model Improvement',
        duration: '7h 45m',
        lessons: [
          { title: 'Cross-validation', duration: '42m' },
          { title: 'Hyperparameter tuning', duration: '50m' },
          { title: 'Ensemble methods', duration: '1h 05m' },
          { title: 'Handling imbalance', duration: '38m' }
        ]
      },
      {
        title: 'Projects',
        duration: '6h 20m',
        lessons: [
          { title: 'Customer churn prediction', duration: '1h 15m' },
          { title: 'Credit risk scoring', duration: '1h 05m' },
          { title: 'Market basket analysis', duration: '1h 00m' },
          { title: 'Model deployment basics', duration: '50m' }
        ]
      }
    ],
    content: {
      longDescription: 'Hands-on machine learning in Python (and R option) focusing on practical preprocessing, model training, evaluation, and deployment basics. You will implement algorithms from scratch and with libraries to build intuition.',
      prerequisites: [
        'Comfort with basic Python or R syntax',
        'High school level math and statistics',
        'A machine capable of running Jupyter/VS Code'
      ],
      skills: [
        'Data cleaning and feature engineering',
        'Supervised and unsupervised algorithms',
        'Model evaluation, tuning, and cross-validation',
        'Exporting and deploying simple ML services'
      ],
      projects: [
        {
          title: 'Churn Prediction API',
          summary: 'Build a churn classifier, evaluate with ROC-AUC, expose via FastAPI/Flask.',
          deliverables: ['Feature pipeline', 'Model artifact + metrics report', 'Simple REST endpoint']
        },
        {
          title: 'Credit Risk Scoring Notebook',
          summary: 'Train and compare logistic regression vs gradient boosting with explainability plots.',
          deliverables: ['EDA notebook', 'SHAP/feature importance visuals', 'Hyperparameter tuning notes']
        },
        {
          title: 'Market Basket Analysis Dashboard',
          summary: 'Implement association rules and visualize top itemsets and lift in a lightweight dashboard.',
          deliverables: ['Cleaned dataset', 'Rule mining outputs', 'Interactive charts']
        }
      ],
      resources: [
        'Ready-to-use notebooks for each algorithm',
        'Dataset packs (CSV/Parquet) and data cards',
        'Evaluation templates and metric cheat-sheets',
        'Deployment starter for FastAPI/Render'
      ],
      certification: 'Finish the three ML projects and pass the model evaluation quiz to earn the Machine Learning Practitioner badge.'
    }
  },
  {
    id: 3,
    title: 'UI/UX Design Masterclass: Complete Design System',
    instructor: 'Brad Hussey',
    category: 'design',
    price: 2999,
    originalPrice: 7999,
    rating: 4.7,
    reviews: 89000,
    students: 340000,
    duration: '38 hours',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    bestseller: false,
    updated: 'Oct 2024',
    features: ['38 hours video', 'Design projects', 'Figma templates', 'Portfolio ready'],
    description: 'Master UI/UX design from scratch with Figma, Adobe XD, and real-world projects',
    outcomes: [
      'Design user-centered interfaces',
      'Build design systems and components',
      'Prototype with Figma and XD',
      'Present and handoff designs'
    ],
    includes: ['Lifetime access', 'Certificate', 'Design files', 'Real-world briefs'],
    chapters: [
      {
        title: 'Design Foundations',
        duration: '3h 30m',
        lessons: [
          { title: 'UX fundamentals', duration: '32m' },
          { title: 'Color and typography', duration: '41m' },
          { title: 'Layout and grids', duration: '38m' },
          { title: 'Accessibility basics', duration: '30m' }
        ]
      },
      {
        title: 'Design Systems',
        duration: '5h 50m',
        lessons: [
          { title: 'Components and tokens', duration: '46m' },
          { title: 'States and variants', duration: '40m' },
          { title: 'Patterns and templates', duration: '52m' },
          { title: 'Documentation', duration: '37m' }
        ]
      },
      {
        title: 'Prototyping',
        duration: '4h 20m',
        lessons: [
          { title: 'Interactive prototypes', duration: '45m' },
          { title: 'Microinteractions', duration: '40m' },
          { title: 'User testing', duration: '38m' },
          { title: 'Developer handoff', duration: '36m' }
        ]
      },
      {
        title: 'Portfolio Projects',
        duration: '6h 10m',
        lessons: [
          { title: 'Mobile app redesign', duration: '1h 05m' },
          { title: 'Web dashboard', duration: '1h 10m' },
          { title: 'Design critique', duration: '42m' },
          { title: 'Case study writeup', duration: '48m' }
        ]
      }
    ],
    content: {
      longDescription: 'End-to-end UI/UX journey that covers research, design systems, prototyping, and presentation. You will create a cohesive design system and multiple polished case studies ready for your portfolio.',
      prerequisites: [
        'No prior design experience required',
        'Access to Figma or Adobe XD',
        'Willingness to iterate with feedback'
      ],
      skills: [
        'User-centered design process',
        'Design systems, tokens, and components',
        'Interactive prototyping and microinteractions',
        'Handoff docs for engineering teams'
      ],
      projects: [
        {
          title: 'Mobile App Redesign',
          summary: 'Audit an existing app and redesign onboarding, home, and profile screens with accessibility in mind.',
          deliverables: ['Heuristic review', 'Figma prototype', 'Annotated handoff file']
        },
        {
          title: 'Dashboard UI Kit',
          summary: 'Create a reusable design system for a SaaS dashboard with charts, filters, and tables.',
          deliverables: ['Token set (color/type/spacing)', 'Component library', 'Usage guidelines']
        },
        {
          title: 'Portfolio Case Study',
          summary: 'Document your process from research to prototype for one project and publish a polished case study.',
          deliverables: ['Process narrative', 'Before/after visuals', 'Reflection on trade-offs']
        }
      ],
      resources: [
        'Figma component starter files',
        'Accessibility checklist for designers',
        'Usability testing script templates',
        'Case study writing guide'
      ],
      certification: 'Submit two portfolio-ready case studies to earn the UI/UX Design Mastery certificate.'
    }
  },
  {
    id: 4,
    title: 'Data Science & Analytics Career Path',
    instructor: 'Jose Portilla',
    category: 'data',
    price: 4499,
    originalPrice: 10999,
    rating: 4.8,
    reviews: 178000,
    students: 520000,
    duration: '80 hours',
    level: 'All Levels',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    bestseller: true,
    updated: 'Dec 2024',
    features: ['80 hours video', 'Python & SQL', '15 projects', 'Job ready'],
    description: 'Complete data science bootcamp covering Python, SQL, Tableau, and Machine Learning',
    outcomes: [
      'Analyze data with Python and SQL',
      'Build dashboards in Tableau',
      'Apply ML models to business problems',
      'Prepare for data roles'
    ],
    includes: ['Lifetime access', 'Certificate', 'Datasets', 'Projects and solutions'],
    chapters: [
      {
        title: 'Python & SQL Foundations',
        duration: '8h 40m',
        lessons: [
          { title: 'Python for data', duration: '1h 05m' },
          { title: 'Pandas and NumPy', duration: '1h 20m' },
          { title: 'SQL querying', duration: '1h 15m' },
          { title: 'Joins and window functions', duration: '1h 05m' }
        ]
      },
      {
        title: 'Analytics & Visualization',
        duration: '7h 30m',
        lessons: [
          { title: 'Exploratory analysis', duration: '55m' },
          { title: 'Data visualization', duration: '1h 05m' },
          { title: 'Tableau dashboards', duration: '1h 10m' },
          { title: 'Storytelling with data', duration: '48m' }
        ]
      },
      {
        title: 'Machine Learning',
        duration: '10h 15m',
        lessons: [
          { title: 'ML workflow', duration: '45m' },
          { title: 'Classification & regression', duration: '1h 20m' },
          { title: 'Model evaluation', duration: '1h 05m' },
          { title: 'Feature engineering', duration: '1h 00m' }
        ]
      },
      {
        title: 'Career Projects',
        duration: '6h 50m',
        lessons: [
          { title: 'Sales forecasting', duration: '1h 05m' },
          { title: 'Customer segmentation', duration: '58m' },
          { title: 'Churn prediction', duration: '1h 02m' },
          { title: 'Executive dashboard', duration: '1h 10m' }
        ]
      }
    ],
    content: {
      longDescription: 'Career-focused path for data analyst/scientist roles covering Python, SQL, dashboards, and applied ML. Emphasis on business impact, storytelling, and deployable artifacts.',
      prerequisites: [
        'Basic Excel familiarity helpful but not required',
        'Comfortable with beginner programming concepts',
        'A machine with Python, a DB client, and spreadsheet software'
      ],
      skills: [
        'Data wrangling with Pandas and SQL',
        'Exploratory analysis and visualization',
        'ML for common business use cases',
        'Dashboarding and stakeholder storytelling'
      ],
      projects: [
        {
          title: 'Executive Sales Dashboard',
          summary: 'Design a Tableau/BI dashboard that surfaces KPIs, trends, and drill-downs for regional managers.',
          deliverables: ['SQL queries and data model', 'Interactive dashboard', 'Insights summary']
        },
        {
          title: 'Churn & Segmentation Notebook',
          summary: 'Combine clustering with classification to segment customers and predict churn risk.',
          deliverables: ['Data cleaning pipeline', 'Model comparison with metrics', 'Actionable recommendations']
        },
        {
          title: 'Forecasting Mini Project',
          summary: 'Build a time-series forecast for a key metric and communicate uncertainty to stakeholders.',
          deliverables: ['EDA + feature prep', 'Forecast plot + error bands', 'Communication brief']
        }
      ],
      resources: [
        'SQL cheat-sheets and window function recipes',
        'Pandas notebooks with reusable utilities',
        'Tableau/BI dashboard templates',
        'Interview prep question bank for data roles'
      ],
      certification: 'Complete the dashboard, ML, and forecasting projects to earn the Data Science Career certificate.'
    }
  },
  {
    id: 5,
    title: 'Full Stack JavaScript with MERN Stack',
    instructor: 'Maximilian Schwarzmüller',
    category: 'programming',
    price: 3299,
    originalPrice: 8499,
    rating: 4.7,
    reviews: 123000,
    students: 410000,
    duration: '52 hours',
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    bestseller: false,
    updated: 'Nov 2024',
    features: ['52 hours video', 'MERN projects', 'Deploy apps', 'Certificate'],
    description: 'Build full-stack applications with MongoDB, Express, React, and Node.js',
    outcomes: [
      'Build RESTful APIs with Express',
      'Create React frontends with modern patterns',
      'Integrate MongoDB and Mongoose',
      'Deploy MERN apps to production'
    ],
    includes: ['Lifetime access', 'Certificate', 'Source code', 'Deployment guides'],
    chapters: [
      {
        title: 'MERN Foundations',
        duration: '4h 20m',
        lessons: [
          { title: 'Stack overview', duration: '32m' },
          { title: 'Project setup', duration: '41m' },
          { title: 'TypeScript intro', duration: '36m' },
          { title: 'Linting & formatting', duration: '28m' }
        ]
      },
      {
        title: 'Backend API',
        duration: '6h 15m',
        lessons: [
          { title: 'Express routing', duration: '50m' },
          { title: 'Auth and JWT', duration: '1h 05m' },
          { title: 'MongoDB models', duration: '55m' },
          { title: 'File uploads', duration: '40m' }
        ]
      },
      {
        title: 'Frontend React',
        duration: '7h 40m',
        lessons: [
          { title: 'React router', duration: '48m' },
          { title: 'State management', duration: '1h 02m' },
          { title: 'Forms and validation', duration: '55m' },
          { title: 'UI components', duration: '46m' }
        ]
      },
      {
        title: 'Deployment',
        duration: '3h 50m',
        lessons: [
          { title: 'CI/CD basics', duration: '45m' },
          { title: 'Env and secrets', duration: '38m' },
          { title: 'Dockerizing', duration: '44m' },
          { title: 'Hosting options', duration: '32m' }
        ]
      }
    ],
    content: {
      longDescription: 'Practical MERN stack training focused on production-minded patterns. You will ship APIs, secure them, connect React frontends, and deploy with CI/CD.',
      prerequisites: [
        'Comfortable with JavaScript fundamentals',
        'Basic Git and terminal usage',
        'Node.js and MongoDB installed locally'
      ],
      skills: [
        'RESTful API design with Express',
        'MongoDB data modeling and Mongoose',
        'React routing, forms, and state management',
        'Deployment, environment config, and Docker basics'
      ],
      projects: [
        {
          title: 'Auth-Enabled API',
          summary: 'JWT-protected Express API with role-based access and validation.',
          deliverables: ['Auth flow with refresh tokens', 'Request validation and error handling', 'API docs via Swagger/OpenAPI']
        },
        {
          title: 'MERN Dashboard',
          summary: 'React dashboard consuming your API with charts, filters, and optimistic updates.',
          deliverables: ['Reusable UI components', 'Data fetching with caching', 'Protected routes and role UI states']
        },
        {
          title: 'Deployment Pipeline',
          summary: 'Containerize the stack and deploy to a cloud host with CI/CD checks.',
          deliverables: ['Dockerfiles for client/server', 'CI config for tests/lint', 'Deployment guide']
        }
      ],
      resources: [
        'Postman/Thunder tests collection',
        'Sample env files and secrets guide',
        'UI starter for React + Tailwind',
        'Docker compose for local dev'
      ],
      certification: 'Deliver the API, dashboard, and deployment pipeline to earn the MERN Professional certificate.'
    }
  },
  {
    id: 6,
    title: 'Digital Marketing & Social Media Strategy',
    instructor: 'Phil Ebiner',
    category: 'business',
    price: 2799,
    originalPrice: 6999,
    rating: 4.9,
    reviews: 95000,
    students: 280000,
    duration: '42 hours',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    bestseller: false,
    updated: 'Oct 2024',
    features: ['42 hours video', 'SEO & SEM', 'Social media', 'Analytics'],
    description: 'Master digital marketing, SEO, social media marketing, and content strategy',
    outcomes: [
      'Plan and execute marketing campaigns',
      'Optimize SEO and SEM channels',
      'Measure performance with analytics',
      'Build social media strategy'
    ],
    includes: ['Lifetime access', 'Certificate', 'Templates', 'Campaign checklists'],
    chapters: [
      {
        title: 'Marketing Foundations',
        duration: '3h 50m',
        lessons: [
          { title: 'Marketing basics', duration: '36m' },
          { title: 'Buyer personas', duration: '34m' },
          { title: 'Positioning', duration: '32m' },
          { title: 'Messaging', duration: '28m' }
        ]
      },
      {
        title: 'SEO & SEM',
        duration: '5h 20m',
        lessons: [
          { title: 'Keyword research', duration: '42m' },
          { title: 'On-page SEO', duration: '50m' },
          { title: 'Google Ads basics', duration: '46m' },
          { title: 'Analytics setup', duration: '38m' }
        ]
      },
      {
        title: 'Social Media',
        duration: '4h 45m',
        lessons: [
          { title: 'Channel strategy', duration: '40m' },
          { title: 'Content calendar', duration: '35m' },
          { title: 'Paid social', duration: '46m' },
          { title: 'Reporting', duration: '32m' }
        ]
      },
      {
        title: 'Campaign Projects',
        duration: '3h 30m',
        lessons: [
          { title: 'SEO campaign plan', duration: '42m' },
          { title: 'Social campaign plan', duration: '38m' },
          { title: 'Email automation', duration: '36m' },
          { title: 'Performance review', duration: '30m' }
        ]
      }
    ],
    content: {
      longDescription: 'Actionable digital marketing playbook spanning SEO, SEM, social, content, and analytics. You will design campaigns, launch them, and measure ROI with real metrics.',
      prerequisites: [
        'No prior marketing experience required',
        'Access to Google Analytics/Search Console (demo data is fine)',
        'Willingness to run small test campaigns'
      ],
      skills: [
        'SEO/SEM keyword strategy and execution',
        'Paid social campaign setup and optimization',
        'Content planning and distribution',
        'Analytics reporting and ROI storytelling'
      ],
      projects: [
        {
          title: 'SEO Campaign Plan',
          summary: 'Research keywords, map them to pages, and create an on-page optimization plan with tracking.',
          deliverables: ['Keyword map', 'On-page checklist', 'Baseline vs target metrics']
        },
        {
          title: 'Paid Social Pilot',
          summary: 'Design a small-budget paid social campaign with creative variants and audience testing.',
          deliverables: ['Audience definitions', 'Ad copy/creative matrix', 'Performance dashboard template']
        },
        {
          title: 'Content Calendar & Reporting',
          summary: 'Ship a 4-week content calendar and build a weekly performance report.',
          deliverables: ['Calendar with channels/goals', 'UTM tracking plan', 'Analytics report with insights']
        }
      ],
      resources: [
        'SEO on-page checklist and schema examples',
        'Ad copy templates and creative briefs',
        'UTM builder and reporting template',
        'Analytics dashboard starter (Looker/GA4)'
      ],
      certification: 'Complete the SEO plan, paid pilot, and content/reporting projects to earn the Digital Marketing Strategist certificate.'
    }
  },
  {
    id: 7,
    title: 'Advanced React & Redux Complete Guide',
    instructor: 'Stephen Grider',
    category: 'programming',
    price: 3699,
    originalPrice: 8999,
    rating: 4.9,
    reviews: 142000,
    students: 380000,
    duration: '48 hours',
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    bestseller: true,
    updated: 'Dec 2024',
    features: ['48 hours video', 'Advanced patterns', 'Redux toolkit', 'Testing'],
    description: 'Deep dive into React hooks, Redux, Context API, and modern React patterns',
    outcomes: [
      'Master advanced React patterns',
      'Structure scalable frontends',
      'Manage complex state with Redux Toolkit',
      'Test and optimize React apps'
    ],
    includes: ['Lifetime access', 'Certificate', 'Source code', 'Testing suites'],
    chapters: [
      {
        title: 'Advanced React',
        duration: '4h 50m',
        lessons: [
          { title: 'Hooks deep dive', duration: '48m' },
          { title: 'Context patterns', duration: '42m' },
          { title: 'Performance tuning', duration: '46m' },
          { title: 'Error boundaries', duration: '38m' }
        ]
      },
      {
        title: 'Redux Mastery',
        duration: '6h 15m',
        lessons: [
          { title: 'Redux Toolkit essentials', duration: '52m' },
          { title: 'Async flows', duration: '48m' },
          { title: 'Middleware patterns', duration: '46m' },
          { title: 'Testing reducers', duration: '42m' }
        ]
      },
      {
        title: 'Architecture',
        duration: '5h 30m',
        lessons: [
          { title: 'Folder structure', duration: '36m' },
          { title: 'Feature-driven design', duration: '40m' },
          { title: 'Monorepo thoughts', duration: '32m' },
          { title: 'Scaling teams', duration: '34m' }
        ]
      },
      {
        title: 'Testing & Deployment',
        duration: '4h 10m',
        lessons: [
          { title: 'Component testing', duration: '44m' },
          { title: 'Integration tests', duration: '42m' },
          { title: 'CI/CD basics', duration: '38m' },
          { title: 'Monitoring', duration: '32m' }
        ]
      }
    ],
    content: {
      longDescription: 'Senior-level React patterns with deep dives into state, performance, testing, and architecture. Focused on building scalable frontends and production-quality codebases.',
      prerequisites: [
        'Solid experience with React fundamentals',
        'Comfortable with JavaScript/TypeScript',
        'Basic familiarity with Redux or other state tools'
      ],
      skills: [
        'Advanced hooks and render performance',
        'Redux Toolkit patterns and async flows',
        'Testing React apps (unit/integration)',
        'Architecture for scale and team workflows'
      ],
      projects: [
        {
          title: 'Feature-Driven Dashboard',
          summary: 'Build a modular dashboard using feature folders, RTK Query, and performance optimizations.',
          deliverables: ['Feature modules with tests', 'Data fetching layer with caching', 'Performance profiling notes']
        },
        {
          title: 'Design System Integration',
          summary: 'Integrate a design system with accessibility checks and theming for multiple brands.',
          deliverables: ['Theming strategy', 'A11y audit checklist', 'Storybook stories for components']
        },
        {
          title: 'CI/Test Pipeline',
          summary: 'Set up automated tests, linting, and preview deployments for a React app.',
          deliverables: ['CI config with lint/test/build', 'Coverage report', 'Preview environment instructions']
        }
      ],
      resources: [
        'Performance tuning checklist',
        'Redux Toolkit patterns reference',
        'Testing recipes (RTL/Cypress)',
        'Storybook starter with a11y add-ons'
      ],
      certification: 'Complete the three advanced projects with tests to earn the Advanced React Architect certificate.'
    }
  },
  {
    id: 8,
    title: 'Graphic Design Bootcamp: Photoshop, Illustrator',
    instructor: 'Lindsay Marsh',
    category: 'design',
    price: 2499,
    originalPrice: 6499,
    rating: 4.7,
    reviews: 76000,
    students: 210000,
    duration: '35 hours',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800',
    bestseller: false,
    updated: 'Sep 2024',
    features: ['35 hours video', 'Adobe Suite', '20+ projects', 'Portfolio'],
    description: 'Learn professional graphic design with Adobe Photoshop and Illustrator',
    outcomes: [
      'Design graphics for print and digital',
      'Master Photoshop and Illustrator tools',
      'Create professional assets and mockups',
      'Build a portfolio-ready project set'
    ],
    includes: ['Lifetime access', 'Certificate', 'Project files', 'Design briefs'],
    chapters: [
      {
        title: 'Design Essentials',
        duration: '3h 20m',
        lessons: [
          { title: 'Color, type, layout', duration: '34m' },
          { title: 'Working with grids', duration: '28m' },
          { title: 'Design briefs', duration: '30m' },
          { title: 'Exporting assets', duration: '26m' }
        ]
      },
      {
        title: 'Photoshop',
        duration: '4h 30m',
        lessons: [
          { title: 'Layers and masks', duration: '38m' },
          { title: 'Retouching', duration: '40m' },
          { title: 'Compositing', duration: '42m' },
          { title: 'Mockups', duration: '36m' }
        ]
      },
      {
        title: 'Illustrator',
        duration: '4h 20m',
        lessons: [
          { title: 'Vectors and shapes', duration: '36m' },
          { title: 'Logos and branding', duration: '40m' },
          { title: 'Icon sets', duration: '34m' },
          { title: 'Illustrations', duration: '38m' }
        ]
      },
      {
        title: 'Portfolio Projects',
        duration: '3h 15m',
        lessons: [
          { title: 'Poster design', duration: '42m' },
          { title: 'Brand kit', duration: '38m' },
          { title: 'Web hero design', duration: '32m' },
          { title: 'Case study polish', duration: '29m' }
        ]
      }
    ],
    content: {
      longDescription: 'Practical graphic design bootcamp focused on Photoshop and Illustrator with portfolio-ready projects. Learn workflows for print, digital, branding, and mockups.',
      prerequisites: [
        'No prior design experience needed',
        'Access to Adobe Photoshop and Illustrator',
        'Ability to practice regularly on assignments'
      ],
      skills: [
        'Branding, layout, and typography',
        'Advanced Photoshop and Illustrator tools',
        'Asset export for print and digital',
        'Portfolio presentation and case studies'
      ],
      projects: [
        {
          title: 'Brand Kit',
          summary: 'Create a logo, color system, and type pairing, then package them into a concise brand guide.',
          deliverables: ['Logo variants and usage rules', 'Color/typography tokens', 'Mini brand guideline PDF']
        },
        {
          title: 'Poster & Social Set',
          summary: 'Design a hero poster and adapt it into social media formats with consistent visual language.',
          deliverables: ['Print-ready poster', 'Social adaptations (1:1, 9:16, 16:9)', 'Mockups for presentation']
        },
        {
          title: 'Portfolio Hero Page',
          summary: 'Design a web hero section showcasing a campaign, with export-ready assets and annotations.',
          deliverables: ['Layered PSD/AI files', 'Web-export assets', 'Annotated file for developers']
        }
      ],
      resources: [
        'PSD/AI starter files',
        'Print vs digital export checklist',
        'Mockup templates for presentation',
        'Case study outline template'
      ],
      certification: 'Deliver the brand kit, campaign assets, and hero page to earn the Graphic Design Pro certificate.'
    }
  }
]
