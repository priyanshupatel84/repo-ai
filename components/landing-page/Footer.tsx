import { Github, Twitter, Mail } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-800 py-8 text-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-semibold">GitHub AI Insights</h3>
            <p className="mt-2 text-sm text-gray-400">Empowering developers with AI</p>
          </div>
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-blue-400">
              <Github className="h-6 w-6" />
            </Link>
            <Link href="#" className="hover:text-blue-400">
              <Twitter className="h-6 w-6" />
            </Link>
            <Link href="#" className="hover:text-blue-400">
              <Mail className="h-6 w-6" />
            </Link>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between border-t border-gray-700 pt-8 md:flex-row">
          <nav className="mb-4 flex space-x-4 md:mb-0">
            <Link href="#" className="text-sm hover:text-blue-400">
              FAQ
            </Link>
            <Link href="#" className="text-sm hover:text-blue-400">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm hover:text-blue-400">
              Terms of Service
            </Link>
          </nav>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} GitHub AI Insights. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

