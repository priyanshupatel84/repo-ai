"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GithubSignIn } from "@/components/github-sign-in";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignInPage() {
  const router = useRouter();

  const { data: session } = useSession();
  if (session) {
    router.push("/dashboard");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (result?.error) {
      console.error("Signin failed:", result.error);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="relative h-screen">
      {/* Button positioned in the top-left corner */}
      <div className="absolute top-0 left-0 p-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="p-2 hover:bg-accent border-2 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
          Home
        </Button>
      </div>
  
      {/* Centered content */}
      <div className="flex flex-col items-center justify-center h-full">
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg bg-card">
          <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
  
          <GithubSignIn />
  
          <Separator className="my-6" />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full cursor-pointer">
                Sign In
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don`&apos;`t have an account?{" "}
            <Button
              variant="link"
              className="px-0 cursor-pointer"
              onClick={() => router.push("/sign-up")}
            >
              Sign up
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
