import { Review } from "src/reviews/models/review.model";

export const COLLECTION_NAMES = {
    User: {
        user:"User"
    },
    Integrations: {
        Integration: "Integration"
    },
    Organization: {
        organization: 'Organization',
        subscription: 'Organization: Subscription',
        subscriptionLogs: 'Organization: Subscription Logs',
        members: 'Organization: Members',
        availedTrials: 'Organization: Availed Trials',
    },
    Reviews: {
        Review :'Review'
     }
}

// I am making an AI Code Reviewer Tool
// Sure, here’s a crisp and professional description for your **AI Code Reviewer** tool:

// ---

// ### 🧠 AI Code Reviewer – Smart, Scalable Code Review Automation

// **AI Code Reviewer** is an intelligent developer assistant that automates code reviews using advanced AI models. It integrates seamlessly with GitHub and offers two main features:

// 1. **🔍 Try Here (Instant Review):**
//    A web-based playground where developers can paste their code and instantly receive AI-generated feedback on:

//    * Code quality & structure
//    * Potential bugs
//    * Optimization suggestions
//    * Best practices & style

// 2. **🔁 GitHub PR Integration:**
//    A GitHub App that automatically reviews pull requests, leaving comments like a human reviewer. It helps teams:

//    * Save time in code reviews
//    * Catch issues early
//    * Maintain consistent code quality

// ### 🛠️ Tech Highlights:

// * **Frontend:** Next.js (React) + Tailwind CSS
// * **Backend:** NestJS + MongoDB 
// * **AI Models:** OpenAI / Claude / other LLMs with routing logic
// * **Queue System:** RabbitMQ for managing free & paid user requests
// * **Token Bucketing:** Enforces usage limits based on plan
// * **Stripe Integration:** Manages paid plans, trials, and usage billing
// * **Analytics:** Tracks user activity and AI performance


// So Currently I am in the Organization Part 
// So for now every user login through Github have their Org created with their username

// Now What I need to do starts a Free Trial add 
// make multiple documents in these collections 

// Organization: Subscription
// Organization: Subscription Logs
// Organization: Members
// Organization: Availed Trials
