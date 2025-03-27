"use client";

import { ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Hero() {

  const { data: session } = useSession();
  const router = useRouter();

  const handleTryItNow = () => {
    router.push(session ? "/dashboard" : "/sign-in");
  };

  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="container mx-auto px-6 py-20 md:py-28 lg:flex lg:items-center lg:justify-between">
        <div className="lg:w-1/2 space-y-6 animate-fadeIn">
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            Unlock the Power of Your GitHub Repository with AI!
          </h1>
          <p className="text-xl md:text-2xl text-blue-100">
            AI-summarized commits and intelligent Q&A for your GitHub projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={handleTryItNow}
          className="group inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-50 hover:scale-105 hover:shadow-lg"
        >
          {session ? "Go to Dashboard" : "Try It Now"}
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
        {!session && (
          <button
            onClick={() => router.push("/sign-up")}
            className="group inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:shadow-lg"
          >
            Sign Up
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        )}
      </div>
        </div>
        <div className="mt-12 lg:mt-0 lg:w-1/2 transform transition-transform duration-500 hover:scale-105">
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-400 opacity-75 blur"></div>
            <Image
              src="/landing_page_img.jpg"
              alt="AI and GitHub collaboration"
              width={600}
              height={400}
              className="relative rounded-lg shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
