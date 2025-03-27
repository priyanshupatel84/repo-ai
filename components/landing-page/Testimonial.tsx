import { User } from 'lucide-react'

export default function Testimonials() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-6">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">User Benefits</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            "Save time reviewing commit histories",
            "Gain deeper insights into your projects",
            "Boost team collaboration with summarized data",
          ].map((benefit, index) => (
            <div key={index} className="rounded-lg bg-gray-50 p-6 shadow-md">
              <User className="mb-4 h-12 w-12 text-blue-600" />
              <p className="text-gray-600">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

