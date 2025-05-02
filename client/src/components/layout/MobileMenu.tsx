import { Link } from "wouter";

interface MobileMenuProps {
  location: string;
}

export default function MobileMenu({ location }: MobileMenuProps) {
  return (
    <div className="md:hidden bg-white shadow-lg absolute top-16 inset-x-0 z-10">
      <div className="px-2 pt-2 pb-3 space-y-1">
        <Link href="/" className={`block px-3 py-2 rounded-md text-base font-medium ${
          location === "/" 
            ? "text-primary bg-blue-50" 
            : "text-neutral-dark hover:bg-blue-50 hover:text-primary"
        }`}>
          Home
        </Link>
        <Link href="/chat" className={`block px-3 py-2 rounded-md text-base font-medium ${
          location === "/chat" 
            ? "text-primary bg-blue-50" 
            : "text-neutral-dark hover:bg-blue-50 hover:text-primary"
        }`}>
          Chat
        </Link>
        <Link href="/files" className={`block px-3 py-2 rounded-md text-base font-medium ${
          location === "/files" 
            ? "text-primary bg-blue-50" 
            : "text-neutral-dark hover:bg-blue-50 hover:text-primary"
        }`}>
          Files
        </Link>
        <Link href="/dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${
          location === "/dashboard" 
            ? "text-primary bg-blue-50" 
            : "text-neutral-dark hover:bg-blue-50 hover:text-primary"
        }`}>
          Dashboard
        </Link>
        <Link href="/employees" className={`block px-3 py-2 rounded-md text-base font-medium ${
          location === "/employees" 
            ? "text-primary bg-blue-50" 
            : "text-neutral-dark hover:bg-blue-50 hover:text-primary"
        }`}>
          Employees
        </Link>
        <Link href="/settings" className={`block px-3 py-2 rounded-md text-base font-medium ${
          location === "/settings" 
            ? "text-primary bg-blue-50" 
            : "text-neutral-dark hover:bg-blue-50 hover:text-primary"
        }`}>
          Settings
        </Link>
      </div>
    </div>
  );
}
