import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <main className="flex-grow flex items-center justify-center px-4 py-12 bg-[#F5F5F5]">
      <div className="bg-white rounded-lg shadow-md max-w-lg w-full p-8 text-center">
        <div className="mx-auto flex justify-center mb-6">
          <div className="rounded-full bg-blue-100 p-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-primary" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-neutral-dark mb-4">
          Hello, HR Bot
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your intelligent HR assistant is ready to help you manage employees, track time off, and streamline HR workflows.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <Link href="/chat">
            <Button 
              className="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
            >
              Get Started
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="border border-primary text-primary hover:bg-blue-50 font-medium py-2 px-6 rounded-md transition duration-200"
          >
            Learn More
          </Button>
        </div>
      </div>
    </main>
  );
}
