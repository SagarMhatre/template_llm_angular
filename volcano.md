
Installation : npm install volcano-sdk

Sample code : 

import { agent, llmOpenAI, mcp } from "volcano-sdk";

const llm = llmOpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!, 
  model: "gpt-4o-mini" 
});


const results = await agent({ llm })
  .then({ 
    prompt: "Find the astrological sign for birthdate 1993-07-11",
  })
  .then({ 
    prompt: "Write a one-line fortune for that sign" 
  })
  .run();

console.log(results[1].llmOutput);
// Output: "Fortune based on the astrological sign"
