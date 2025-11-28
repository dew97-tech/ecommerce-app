import { AuthNavigation } from "@/components/auth/auth-navigation"
import Image from "next/image"

export default function AuthLayout({ children }) {
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      {/* Left Column - Image & Branding */}
      <div className="hidden lg:flex flex-col relative bg-zinc-900 text-white dark:border-r">
        {/* Background Image */}
        <div className="absolute inset-0 bg-zinc-900">
             <Image
                src="/tech_ecommerce_bg_1764356278240.png"
                alt="TechNexus Background"
                fill
                className="object-cover opacity-50"
                priority
             />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-20 flex flex-col justify-between h-full p-10">
            {/* Logo */}
            <div className="flex items-center text-lg font-medium">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-6 w-6"
                >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
                TechNexus
            </div>

            {/* Slogan/Testimonial */}
            <div className="relative z-20 mt-auto">
                <blockquote className="space-y-2">
                <p className="text-lg">
                    &ldquo;Experience the future of technology shopping. Premium gear, unbeatable prices, and a community of enthusiasts.&rdquo;
                </p>
                <footer className="text-sm">The TechNexus Team</footer>
                </blockquote>
            </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="relative flex items-center justify-center py-12">
        <AuthNavigation />
        <div className="mx-auto grid w-[350px] gap-6">
            {children}
        </div>
      </div>
    </div>
  )
}
