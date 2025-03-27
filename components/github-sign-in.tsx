"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "@/components/ui/github";

const GithubSignIn =  () => {

  const handleSignIn = async () => {
    await signIn("github");
  };

  return (
    <Button className="w-full cursor-pointer" variant="outline" onClick={handleSignIn}>
      <Github />
      Continue with GitHub
    </Button>
  );
};

export { GithubSignIn };
