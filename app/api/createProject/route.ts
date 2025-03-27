import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getServerSession, Session } from "next-auth";

import db from "@/lib/db";
import { indexGithubRepo } from "@/lib/github-loader";
import { pollCommits } from "@/lib/github";
import { authOptions } from "@/lib/auth";


const schema = z.object({
  projectName: z.string(),
  githubUrl: z.string(),
  githubToken: z.string().optional(),
  branchName: z.string().optional(),
});

export async function POST(req: NextRequest) {

  const session = await getServerSession(authOptions) as Session | null;
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectName, githubUrl, githubToken, branchName } = schema.parse(body);

    console.log("Received projectName:", projectName);
    console.log("Received githubUrl:", githubUrl);

    const project = await db.project.create({
      data: {
        githubUrl,
        projectName,
        branchName,
        status: "loading",
        userToProjects: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    // Async processing
    const response = await Promise.all([
      indexGithubRepo(project.id, githubUrl, githubToken, branchName),
      pollCommits(project.id, 1)
    ]);

    console.log("Response from Promise.all:", response);

    if(response) {
      return NextResponse.json({project}, {status: 200});
    }

  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}