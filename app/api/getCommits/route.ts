import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { pollCommits } from "@/lib/github";

const ITEMS_PER_PAGE = 10;

const querySchema = z.object({
  projectId: z.string(),
  pageNo: z.coerce.number().int().positive().default(1),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const params = querySchema.parse({
      projectId: searchParams.get("projectId"),
      pageNo: searchParams.get("pageNo"),
    });

    // Process commits for the requested page
    await pollCommits(params.projectId, params.pageNo);

    // Get paginated commits from database
    const [commits, totalCommits] = await Promise.all([
      db.commit.findMany({
        where: { projectId: params.projectId },
        orderBy: { commitDate: "desc" },
        skip: (params.pageNo - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      }),
      db.commit.count({
        where: { projectId: params.projectId }
      })
    ]);

    return NextResponse.json({
      commits,
      totalCommits,
      totalPages: Math.ceil(totalCommits / ITEMS_PER_PAGE),
      currentPage: params.pageNo,
    });
  } catch (error) {
    console.error("Error fetching commits:", error);
    return NextResponse.json(
      { error: "Failed to fetch commits" },
      { status: 500 }
    );
  }
}