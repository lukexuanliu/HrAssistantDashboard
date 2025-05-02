import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} HR Assistant. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/terms" className="text-gray-500 hover:text-primary">
              <span className="sr-only">Terms</span>
              <span className="text-sm">Terms of Service</span>
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-primary">
              <span className="sr-only">Privacy</span>
              <span className="text-sm">Privacy Policy</span>
            </Link>
            <Link href="/help" className="text-gray-500 hover:text-primary">
              <span className="sr-only">Help</span>
              <span className="text-sm">Help Center</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
