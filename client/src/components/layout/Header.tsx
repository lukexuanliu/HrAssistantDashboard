import { useState } from "react";
import { Link, useLocation } from "wouter";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-primary" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 4 0 0112 0v1zm0 0h6v-1a6 4 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
              />
            </svg>
            <span className="ml-3 text-xl font-semibold text-neutral-dark">HR Assistant</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className={`font-medium ${location === "/" ? "text-primary" : "text-neutral-dark hover:text-primary"}`}>
              Home
            </Link>
            <Link href="/chat" className={`font-medium ${location === "/chat" ? "text-primary" : "text-neutral-dark hover:text-primary"}`}>
              Chat
            </Link>
            <Link href="/files" className={`font-medium ${location === "/files" ? "text-primary" : "text-neutral-dark hover:text-primary"}`}>
              Files
            </Link>
            <Link href="/dashboard" className={`font-medium ${location === "/dashboard" ? "text-primary" : "text-neutral-dark hover:text-primary"}`}>
              Dashboard
            </Link>
            <Link href="/employees" className={`font-medium ${location === "/employees" ? "text-primary" : "text-neutral-dark hover:text-primary"}`}>
              Employees
            </Link>
            <Link href="/settings" className={`font-medium ${location === "/settings" ? "text-primary" : "text-neutral-dark hover:text-primary"}`}>
              Settings
            </Link>
          </nav>
          <button className="md:hidden" onClick={toggleMenu}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-neutral-dark" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>
      </header>
      {isMenuOpen && <MobileMenu location={location} />}
    </>
  );
}
