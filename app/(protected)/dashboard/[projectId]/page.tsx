"use client";

import useProjects from "@/hooks/use-project";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import { DeleteButton } from "./delete-button";

const DashboardPage = () => {
  const { project } = useProjects();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* github link icon */}
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center gap-x-2">
            <Github className="size-5 text-white" />
            <div className="mj-2">
              <p className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {project?.githubUrl}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 cursor-pointer">
          <DeleteButton />
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard />
        </div>
      </div>

      <div className="mt-8"></div>
      <CommitLog />
    </div>
  );
};

export default DashboardPage;
