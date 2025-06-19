const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { callAnthropicWithRetry } = require('../utils/anthropicHelper');

const router = express.Router();

// Define a POST endpoint for generating Mermaid markdown from a use case description
router.post('/', async (req, res) => {
  const { description, useCaseDescription, apiKey } = req.body; // Extract the description, use case description, and API key from the request body
  const anthropic = new Anthropic({ apiKey }); // Initialize the Anthropic API client with the provided API key

  // Define the prompt to be sent to the Anthropic API, requesting the generation of Mermaid markdown
  const prompt = `Generate the mermaid markdown for the use case that was just created. Also feel
  free to reference the description. Only provide the mermaid markdown, without any additional explanations or comments.
  The mermaid markdown should accurately represent all flows and scenarios described in the use case, including alternate flows. Every single flow should be represented. Even if they aren't
  in the use case description and they are neccesary still add them. Be very thorough. 
  Lets say this was the description: A customer contacts support through various channels (phone, email, chat). The issue is logged, and initial troubleshooting is provided. If unresolved, it's escalated to a specialist. The specialist diagnoses and provides a solution. The customer is informed and asked to confirm the resolution. If resolved, the case is closed; if not, it returns for further troubleshooting. The customer can provide feedback on the support experience, which is reviewed for service improvement.
  And this was the Use Case Description: 
Use Case: 
Pre-conditions:

Customer support system is operational
Support agents are available
Customer has an account in the system
Knowledge base is up-to-date

Success Criteria:

Customer's issue is resolved
Support case is closed
Customer provides positive feedback
Resolution is documented for future reference

Triggers:

Customer initiates contact with support through phone, email, chat, or self-service portal

Actors:

Customer
Initial Support Agent
Specialist Support Agent
Support System
Knowledge Base System
Feedback System

Description:
The goal of the system is to efficiently resolve customer issues through a structured support process, utilizing various channels and levels of expertise while maintaining customer satisfaction and improving service quality.
Basic Flow:

Customer contacts support through chosen channel
System logs the support request and assigns a unique case ID
System assigns case to an available Initial Support Agent
Initial Support Agent reviews the issue and customer history
Initial Support Agent provides initial troubleshooting based on knowledge base
Customer attempts the suggested solution
Initial Support Agent asks if the issue is resolved
Customer confirms issue resolution
System prompts customer for feedback
Customer provides feedback
System logs feedback and resolution details
System closes the case
Use Case ends in Success

Alternate Flows:
3A. Customer uses self-service portal:

System presents relevant knowledge base articles
Customer follows self-help instructions
System prompts customer if issue is resolved
If resolved, continue from Step 9 of Basic Flow
If unresolved, continue from Step 3 of Basic Flow

5A. Initial Support Agent cannot find relevant solution in knowledge base:

Agent informs customer that additional research is needed
Agent puts customer on hold or promises a callback
Agent consults with colleagues or performs additional research
Use Case continues from Step 5 of Basic Flow

7A. Customer indicates issue is not resolved:

Initial Support Agent attempts additional troubleshooting
If still unresolved, Agent escalates the issue to a Specialist Support Agent
Specialist Support Agent reviews the case
Specialist Support Agent diagnoses the issue and provides a solution
Customer attempts the suggested solution
Specialist Support Agent asks if the issue is resolved
If resolved, continue from Step 8 of Basic Flow
If unresolved, return to step 3 of this flow

7B. Customer requests escalation:

Initial Support Agent escalates the issue to a Specialist Support Agent
Use Case continues from Step 3 of Alternate Flow 7A

8A. Customer indicates issue is not resolved after specialist intervention:

Specialist Support Agent informs customer that further investigation is needed
Agent schedules a follow-up appointment or promises to call back
Agent consults with additional specialists or product development team
Use Case continues from Step 3 of Alternate Flow 7A

10A. Customer declines to provide feedback:

System logs that feedback was declined
Use Case ends in Success

10B. Customer provides negative feedback:

System flags the case for review
Support manager is notified
Support manager reviews the case and contacts the customer for additional information
Support manager takes necessary actions to address the concerns
Use Case ends in Success with follow-up actions

Additional Alternate Flows:
1A. System experiences technical issues:

Customer is informed of technical difficulties
System logs the failed attempt
Customer is provided alternative contact methods
Use Case ends in Failure

2A. High volume of requests:

System estimates wait time and informs customer
Customer chooses to wait or request a callback
If callback requested, system schedules callback and notifies available agent
Use Case continues from Step 3 of Basic Flow or ends if customer abandons

5B. Issue requires on-site support:

Agent informs customer that on-site support is necessary
Agent schedules on-site visit
On-site support is conducted
Use Case continues from Step 7 of Basic Flow

8B. Customer is dissatisfied with resolution:

Agent offers alternative solutions or escalation
If customer accepts, return to Step 5 of Basic Flow or Step 2 of Alternate Flow 7A
If customer declines, agent offers compensation or alternative resolution
Use Case ends in Partial Success

11A. Resolution reveals systemic issue:

System flags the case for product/service improvement
Product team is notified for potential updates
Use Case continues from Step 12 of Basic Flow
This is what the Mermaid should look like.Look how thorough it is, thats how thorough every single one should be.
graph TD
    %% Basic Flow
    A[Start] --> B[1. Customer contacts support]
    B --> C[2. System logs request and assigns case ID]
    C --> D[3. System assigns case to Initial Support Agent]
    D --> E[4. Agent reviews issue and customer history]
    E --> F[5. Agent provides initial troubleshooting]
    F --> G[6. Customer attempts solution]
    G --> H[7. Agent asks if issue is resolved]
    H --> I[8. Customer confirms resolution]
    I --> J[9. System prompts for feedback]
    J --> K[10. Customer provides feedback]
    K --> L[11. System logs feedback and resolution]
    L --> M[12. System closes the case]
    M --> N[End - Success]

    %% Alternate Flows 
    %% 1A
    B -.-> |1A| AA[Customer informed of technical difficulties]
    AA --> AB[System logs failed attempt]
    AB --> AC[Customer provided alternative contact methods]
    AC --> AD[End - Failure]

    %% 2A
    C -.-> |2A| BA[System estimates wait time]
    BA --> BB{Customer choice}
    BB -->|Wait| D
    BB -->|Callback| BC[System schedules callback]
    BC --> BD[Agent notified]
    BD --> D
    BB -->|Abandon| BE[End - Customer Abandoned]

    %% 3A
    C -.-> |3A| CA[System presents knowledge base articles]
    CA --> CB[Customer follows self-help instructions]
    CB --> CC{Issue resolved?}
    CC -->|Yes| J
    CC -->|No| D

    %% 5A
    E -.-> |5A| DA[Agent informs customer research needed]
    DA --> DB[Agent puts customer on hold/promises callback]
    DB --> DC[Agent consults colleagues/researches]
    DC --> F

    %% 5B
    E -.-> |5B| EA[Agent informs on-site support needed]
    EA --> EB[Agent schedules on-site visit]
    EB --> EC[On-site support conducted]
    EC --> H

    %% 7A and 7B
    H -.-> |7A/7B| FA[Agent attempts additional troubleshooting/Customer requests escalation]
    FA --> FB{Resolved?}
    FB -->|No| FC[Agent escalates to Specialist]
    FC --> FD[Specialist reviews case]
    FD --> FE[Specialist diagnoses and provides solution]
    FE --> FF[Customer attempts solution]
    FF --> FG{Resolved?}
    FG -->|Yes| I
    FG -->|No| FD

    %% 8A
    I -.-> |8A| HA[Specialist informs further investigation needed]
    HA --> HB[Agent schedules follow-up]
    HB --> HC[Agent consults additional specialists]
    HC --> FD

    %% 8B
    I -.-> |8B| IA{Customer dissatisfied}
    IA -->|Accept alternatives| IB[Agent offers alternative solutions]
    IB --> F
    IA -->|Decline alternatives| IC[Agent offers compensation]
    IC --> ID[End - Partial Success]

    %% 10A
    K -.-> |10A| JA[System logs feedback declined]
    JA --> M

    %% 10B
    K -.-> |10B| KA[System flags case for review]
    KA --> KB[Support manager notified]
    KB --> KC[Manager reviews and contacts customer]
    KC --> KD[Manager takes action]
    KD --> KE[End - Success with follow-up]

    %% 11A
    L -.-> |11A| LA[System flags for product improvement]
    LA --> LB[Product team notified]
    LB --> M
Dont put the %% in ur responses. Keep it in normal mermaid markdown syntax.
Description: ${description}
Use Case Description: ${useCaseDescription}`; // Include both the description and the detailed use case in the prompt

  try {
    // Call the Anthropic API with retry logic to generate the Mermaid markdown
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-opus-4-20250514', // Specify the model to use
      max_tokens: 2000, // Limit the number of tokens in the response
      temperature: 0, // Set temperature for deterministic output
      system: prompt, // Use the prompt defined above as the system message
      messages: [
        {
          role: 'user',
          content: prompt, // Provide a simple instruction as the content for the user message
        },
      ],
    });

    // Respond with the generated Mermaid markdown
    res.json({ completion: msg.content[0].text });
  } catch (error) {
    // Log and respond with an error if the API call fails
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate mermaid markdown' });
  }
});

module.exports = router;