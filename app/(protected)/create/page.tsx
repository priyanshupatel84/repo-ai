"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useProjects from "@/hooks/use-project";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
  BranchName?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { mutate } = useProjects();

  const onSubmit = async (data: FormInput) => {
    setIsLoading(true);
    try {
      const res = await axios.post("/api/createProject", {
        projectName: data.projectName,
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
        branchName: data.BranchName,
      });

      if(res.status === 200) {
        mutate(); // Refresh projects list
        toast.success("Project created successfully");
        router.push("/dashboard");
      }

    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error
        : "Failed to create project";

      if (errorMessage?.includes("GitHub API rate limit hit")) {
        setOpen(true);
      } else {
        toast.error(errorMessage || "Failed to create project");
      }
    } finally {
      setIsLoading(false);
      reset();
    }
  };

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <Image
        src="/create_page_img.svg"
        className="h-56 w-auto"
        alt="create page logo"
        width={200}
        height={200}
      />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link Your Github Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your Github repository to link it to Dionysus
          </p>
        </div>
        <div className="h-4"></div>

        {/* form ka section hai  */}
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Github URL"
              type="url"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken")}
              placeholder="Github Token (optional) "
            />
            <div className="h-2"></div>
            <Input
              {...register("BranchName")}
              placeholder="Branch Name"
            />

            <div className="h-4"></div>
            <Button type="submit" disabled={isLoading}>
              {!isLoading
                ? "Create Project"
                : "Creating Project..."}
            </Button>
          </form>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Limit Hit</DialogTitle>
            <DialogDescription>
              Please wait a moment and try again.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePage;
