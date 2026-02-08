const AdminFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-800 to-slate-900 border-t-4 border-orange-500 py-8 mt-12 text-white md:ml-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">FB</span>
              </div>
              <span className="text-xl font-black">FoodBuzz Admin</span>
            </div>
            <p className="text-slate-300 text-sm">
              Professional admin dashboard for managing your food delivery
              platform
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a
                  href="/admindashboard"
                  className="hover:text-orange-400 transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/managemenuadmin"
                  className="hover:text-orange-400 transition-colors"
                >
                  Menu Management
                </a>
              </li>
              <li>
                <a
                  href="/manageordersadmin"
                  className="hover:text-orange-400 transition-colors"
                >
                  Orders
                </a>
              </li>
              <li>
                <a
                  href="/report"
                  className="hover:text-orange-400 transition-colors"
                >
                  Reports
                </a>
              </li>
            </ul>
          </div>

          {/* System Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">System Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-300">All Systems Operational</span>
              </div>
              <div className="text-slate-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 pt-6 text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} FoodBuzz Admin Dashboard. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
