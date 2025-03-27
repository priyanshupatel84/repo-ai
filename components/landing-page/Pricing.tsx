import { Check } from 'lucide-react'

export default function Pricing() {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-6">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Try It Free</h2>
        <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-xl">
          <h3 className="mb-4 text-2xl font-bold">Free Trial</h3>
          <ul className="mb-6 space-y-2">
            <li className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span>14-day free access</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span>Unlimited repositories</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span>Full feature access</span>
            </li>
          </ul>
          <button className="w-full rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-700">
            Start Free Trial
          </button>
        </div>
      </div>
    </section>
  )
}

