import type React from "react"
import Image from "next/image"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
 

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-muted items-center justify-center p-8">
        <div className="max-w-md">
          <Image
            src="/auth-illustration.svg"
            alt="Authentication"
            width={500}
            height={400}
            className="mx-auto"
            priority
          />
          <h1 className="text-3xl font-bold mt-6 text-center">Project Management Dashboard</h1>
          <p className="text-muted-foreground text-center mt-2">
            Manage your projects, collaborate with your team, and track your progress all in one place.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">{children}</div>
    </div>
  )
}

