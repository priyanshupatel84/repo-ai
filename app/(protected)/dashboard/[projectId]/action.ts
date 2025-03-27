"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import db from "@/lib/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const askQuestion = async (question: string, projectId: string) => {
  const stream = createStreamableValue();
  // generate the vector query
  try {
    const queryVector = await generateEmbedding(question).catch((error) => {
      throw new Error(
        `Failed to generate embedding: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    });

    const vectorQuery = `[${queryVector.join(",")}]`;
    // Query database with error handling
    const result = (await db.$queryRaw`
        SELECT "fileName", "sourceCode", "summary",
        1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
        FROM "SourceCodeEmbedding"
        WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
        AND "projectId" = ${projectId}
        ORDER BY similarity DESC 
        LIMIT 10`) as {
      fileName: string;
      sourceCode: string;
      summary: string;
    }[];

    if (!result.length) {
      // Return error instead of throwing
      return {
        output:
          "I couldn't find any relevant code files to answer this question. Please try being more specific or ask about a different part of the codebase.",
        fileReferences: [],
        error: "NO_RELEVANT_FILES",
      };
    }

    let context = "";
    for (const doc of result) {
      context += `source:${doc.fileName}\ncode content:${doc.sourceCode}\nsummary : ${doc.summary}\n\n`;
    }

    const generateResponse = async () => {
      try {
        const { textStream } = streamText({
          model: google("gemini-2.0-pro-exp-02-05"),
          prompt: `
  You are an AI code assistant specializing in answering questions about a GitHub repo codebase. Your primary audience consists of technical interns with basic programming knowledge.

Capabilities & Behavior:

You possess expert knowledge in software development and programming.

You provide clear, step-by-step explanations with relevant code snippets when necessary.

You focus on helpfulness, accuracy, and clarity in responses.

You avoid making up information that is not explicitly available in the provided context.

You use markdown syntax for formatting, making explanations easy to read.

Instructions for Answering Questions:

If the question is about a specific file, function, or code snippet within the repository, extract relevant information from the CONTEXT BLOCK and provide a detailed breakdown.

If the provided context does not contain the necessary details, respond with:
"I don't have enough information in the provided context to answer this question."

Avoid unnecessary apologies and instead indicate when new context has been provided.

Keep responses informative, and formatted for easy comprehension.

Prompt Structure:

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

Now, provide a detailed and structured answer to the question using the available context.`,
        });
        for await (const delta of textStream) {
          if (delta) {
            stream.update(delta);
          }
        }
      } finally {
        stream.done();
      }
    };
    await generateResponse();

    return {
      output: stream.value,
      fileReferences: result,
      error: null,
    };
  } catch (error) {
    console.error("Error in askQuestion:", error);
    return {
      output: "Sorry, there was an error processing your request.",
      fileReferences: [],
      error: "SERVER_ERROR",
    };
  }
};
