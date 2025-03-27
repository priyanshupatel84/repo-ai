import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariesCode } from "./gemini";
import  db  from "@/lib/db";

// export const loadGithubRepo = async ( 
//   githubUrl: string,
//   githubToken?: string,
// ) => {
//   try {
//     console.log("loading github repo : ", githubUrl);

//     const loader = new GithubRepoLoader(githubUrl, {
//       accessToken: githubToken ?? "", 
//       branch: "main",
//       ignoreFiles: [
//         "package-lock.json",
//         "yarn.lock",
//         "pnpm-lock.json",
//         "bun.lockb",
//         "node_modules",
//       ],
//       recursive: true,
//       processSubmodules: true,
//       unknown: "warn",
//       maxConcurrency: 5,
//     });

//     console.log("loaded github repo -----> : ", loader);

//     const docs = await loader.load();

//     return docs;
//   } catch (error) {
//     console.error("Error loading GitHub repo:", error);
//     throw new Error(`Failed to load GitHub repository: ${githubUrl}`);
//   }
// };


// // ! main entry point to this file
// export const indexGithubRepo = async (
//   projectId: string,
//   githubUrl: string,
//   githubToken?: string,
//   githubBranch: string,
// ) => {
//   const docs = await loadGithubRepo(githubUrl, githubToken, githubBranch);
//   console.log("loaded github  ******************** : ", docs);

//   const allEmbeddings = await generateEmbeddings(docs);

//   await Promise.allSettled(
//     allEmbeddings.map(async (embedding, index) => {
//       if (!embedding) return null;
//       console.log(`processing ${index} of ${allEmbeddings.length}`);

//       const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
//         data: {
//           summary: embedding.summary,
//           sourceCode: embedding.sourceCode,
//           fileName: embedding.fileName,
//           projectId,
//         },
//       });

//       await db.$executeRaw`
//     UPDATE "SourceCodeEmbedding"
//     SET "summaryEmbedding" = ${embedding.embedding}::vector
//     WHERE "id" = ${sourceCodeEmbedding.id}

//     `;
//     }),
//   );
// };


// const generateEmbeddings = async (docs: Document[]) => {
//   const results = [];
//   let currentIndex = 0;

//   while (currentIndex < docs.length) {
//     try {
//       const doc = docs[currentIndex];
//       console.log(`Processing document ${currentIndex + 1}/${docs.length}: ${doc.metadata.source}`);
      
//       // Process one document at a time
//       const summary = await summariesCode(doc);
//       await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between API calls
      
//       const embedding = await generateEmbedding(summary);
      
//       results.push({
//         summary,
//         embedding,
//         sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
//         fileName: doc.metadata.source as string,
//       });

//       currentIndex++; // Move to next document only after successful processing
//     } catch (error) {
//       console.log(`Retrying document ${currentIndex + 1} after error:`, error);
//       await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay on error
//       // Don't increment currentIndex, so we retry the same document
//     }
//   }

//   return results;
// };



// *************************************************************************************************************************
// In lib/github-loader.ts (indexGithubRepo)
import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Add GitHub URL parser
const parseGitHubUrl = (url: string) => {
  const cleanedUrl = url.replace(/\.git$/, "").replace(/\/$/, "");
  const match = cleanedUrl.match(/github\.com[/:]([^/]+)\/([^/#]+)/);
  if (!match) throw new Error("Invalid GitHub URL format");
  return { owner: match[1], repo: match[2].split("/tree/")[0] };
};

// Updated loadGithubRepo with branch detection
export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
  branchName?: string
) => {
  try {
    const { owner, repo } = parseGitHubUrl(githubUrl);

    // If no branch specified, get default branch
    if (!branchName) {
      const { data } = await octokit.rest.repos.get({ owner, repo });
      branchName = data.default_branch;
    }

    const loader = new GithubRepoLoader(`https://github.com/${owner}/${repo}`, {
      accessToken: githubToken ?? "",
      branch: branchName,
      ignoreFiles: [
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.json",
        "bun.lockb",
        "node_modules",
      ],
      recursive: true,
      processSubmodules: true,
      unknown: "warn",
      maxConcurrency: 3, // Reduced concurrency for rate limiting
    });

    return await loader.load();
    
  } catch (error) {
    console.error("Error loading GitHub repo:", error);
    throw new Error(`Failed to load GitHub repository: ${githubUrl}`);
  }
};

// Updated indexGithubRepo function
export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
  branchName?: string,
) => {
  try {
    const docs = await loadGithubRepo(githubUrl, githubToken, branchName);
    const allEmbeddings = await generateEmbeddings(docs);

    // Rate limited processing
    for (const [index, embedding] of allEmbeddings.entries()) {
      if (!embedding) continue;
      
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });

      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}
      `;
      
      // Add delay between processing
      if (index % 5 === 0) await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Error indexing GitHub repo:", error);
    throw error;
  }
};

// Enhanced generateEmbeddings with rate limiting
const generateEmbeddings = async (docs: Document[]) => {
  const results = [];
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000;

  for (let i = 0; i < docs.length; i++) {
    try {
      const doc = docs[i];
      const summary = await rateLimitedSummariesCode(doc);
      const embedding = await rateLimitedGenerateEmbedding(summary);
      
      results.push({
        summary,
        embedding,
        sourceCode: doc.pageContent,
        fileName: doc.metadata.source
      });

      retryCount = 0; // Reset retry counter on success
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        i--; // Retry same document
        const delay = BASE_DELAY * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`Skipping document after ${MAX_RETRIES} failures`, error);
        retryCount = 0;
      }
    }
  }
  return results;
};

// Rate limited API calls
const rateLimitedSummariesCode = async (doc: Document) => {
  try {
    return await summariesCode(doc);
  } catch (error) {
    if (error.response?.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return rateLimitedSummariesCode(doc);
    }
    throw error;
  }
};

const rateLimitedGenerateEmbedding = async (summary: string) => {
  try {
    return await generateEmbedding(summary);
  } catch (error) {
    if (error.response?.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return rateLimitedGenerateEmbedding(summary);
    }
    throw error;
  }
};