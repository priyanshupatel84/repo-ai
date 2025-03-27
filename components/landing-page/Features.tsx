import { GitCommit, MessageSquare } from 'lucide-react'

export default function Features() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-6">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Key Features</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-6 shadow-md">
            <GitCommit className="mb-4 h-12 w-12 text-blue-600" />
            <h3 className="mb-2 text-xl font-semibold">AI Summarized Commits</h3>
            <p className="text-gray-600">
              Get concise and clear summaries of your repository`&apos;`s commit history.
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-6 shadow-md">
            <MessageSquare className="mb-4 h-12 w-12 text-blue-600" />
            <h3 className="mb-2 text-xl font-semibold">Intelligent Q&A</h3>
            <p className="text-gray-600">
              Ask questions about your repo, and let AI provide detailed insights.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

