import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 mt-auto transition-colors duration-300 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-2 mb-4 w-max">
              <img src="/public/favicon.svg" alt="Vortex Logo" className="w-8 h-8 animate-[spin_10s_linear_infinite]" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-700">
                Vortex
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              The premier hub for acquiring rare artifacts, mystical charms, and high-performance technology. Forged in the depths, delivered to your realm.
            </p>
          </div>

          {/* Archive Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">The Archives</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors font-medium">Browse Artifacts</Link></li>
              <li><Link to="/cart" className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors font-medium">Your Void (Cart)</Link></li>
              <li><Link to="/orders" className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors font-medium">Order History</Link></li>
            </ul>
          </div>

          {/* Support / Legal Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-3">
              {/* Note: Standard <a> tags here since they might eventually link externally, but you can change to <Link> if making real pages */}
              <li><a href="mailto:hotoke.atlast@gmail.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors font-medium">Contact The Fool</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors font-medium">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors font-medium">Terms of Exchange</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
            © {new Date().getFullYear()} The Vortex Archives. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            <a href="https://x.com/notGehrman" className="hover:text-amber-500 transition-colors" target="_blank" rel="noopener noreferrer">
              X (Twitter)
            </a>
            <a href="https://discord.com/users/1189602830634471520" className="hover:text-amber-500 transition-colors" target="_blank" rel="noopener noreferrer">
              Discord
            </a>
            <a href="https://github.com/hotokeAtlast" className="hover:text-amber-500 transition-colors" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}