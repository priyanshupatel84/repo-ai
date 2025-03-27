"use client";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProjects from "@/hooks/use-project";
import { useState } from "react";
import { askQuestion } from "./action";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "./code-references";
import axios from "axios";
import { toast } from "sonner";
import { useSavedAnswers } from "@/hooks/useSavedAnser";

const AskQuestionCard = () => {
  const { project, mutate: mutateProjects } = useProjects();
  const { mutate: mutateSavedAnswers } = useSavedAnswers(project?.id || "");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [fileReferences, setFileReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project?.id) return;
    setLoading(true);
    setFileReferences([]);
    setAnswer("");

    try {
      const { output, fileReferences, error } = await askQuestion(
        question,
        project.id
      );
      setOpen(true);

      if (error === "NO_RELEVANT_FILES") {
        setAnswer(output);
        setFileReferences([]);
        return;
      }

      setFileReferences(fileReferences);

      if (typeof output !== "string") {
        for await (const delta of readStreamableValue(output)) {
          if (delta) {
            setAnswer((prev) => prev + delta);
          }
        }
      } else {
        setAnswer(output);
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle no relevant files error
      if (
        error instanceof Error &&
        error.message === "No relevant code files found for your question"
      ) {
        setAnswer(
          "I couldn't find any relevant code files to answer this question. Please try being more specific or ask about a different part of the codebase."
        );
        setOpen(true); // Ensure dialog opens
        setFileReferences([]);
      } else {
        setAnswer("Sorry, there was an error processing your request.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnswer = async () => {
    if (!project?.id) return;
    setSaveLoading(true);

    try {
      await axios.post("/api/saveAnswer", {
        projectId: project.id,
        question,
        answer,
        filesReferences: fileReferences,
      });

      // Revalidate the projects data
      // await mutate();

      await Promise.all([mutateProjects(), mutateSavedAnswers()]);

      toast.success("Answer saved successfully");
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.error || "Error saving answer"
          : "Error saving answer"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95vh] overflow-y-auto rounded-xl sm:max-w-[95vw] lg:max-w-[90vw]">
          <DialogHeader className="space-y-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <DialogTitle className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl font-bold text-transparent">
                {question}
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  disabled={saveLoading}
                  variant="outline"
                  className="transition-all duration-200 hover:shadow-md"
                  onClick={handleSaveAnswer}
                >
                  {saveLoading ? "Saving..." : "Save Answer"}
                </Button>
                <Button
                  variant="ghost"
                  className="bg-black text-white hover:bg-neutral-300 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-all duration-200 hover:shadow-md"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-8">
            <div className="prose prose-sm dark:prose-invert max-h-[45vh] overflow-auto rounded-xl border bg-card p-6 shadow-inner ">
              <MDEditor.Markdown
                source={answer}
                style={{
                  backgroundColor: "#f5f5f5",
                  color: "#000",
                  borderRadius: "8px",
                  padding: "16px",
                  border: "1px solid #e0e0e0",
                  margin: "8px 0",
                  overflow: "hidden",
                  fontFamily: "Arial, sans-serif",
                }}
              />
            </div>
            {fileReferences.length > 0 && (
              <CodeReferences fileReferences={fileReferences} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Card className="col-span-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-2xl font-bold text-transparent">
            Ask a question
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Textarea
              placeholder="Which file should I edit to modify the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[120px] resize-none rounded-xl text-lg focus:ring-2 focus:ring-primary/20"
            />
            <Button
              type="submit"
              disabled={loading || !question.trim()}
              className="w-full transition-all duration-200 hover:shadow-lg sm:w-auto"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-pulse">Processing</span>
                  <span className="animate-bounce">...</span>
                </span>
              ) : (
                "Ask Dionysus!"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
