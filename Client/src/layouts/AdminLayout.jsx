import { useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import AdminFooter from "../components/AdminFooter";

export default function AdminLayout({ children, title, subtitle, icon }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />

      <main className="md:ml-16 transition-all duration-300">
        {/* Header Section */}
        {(title || subtitle) && (
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white py-12 px-6 shadow-xl">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-3">
                {icon && (
                  <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl">
                    {icon}
                  </div>
                )}
                <div>
                  <h1 className="text-4xl md:text-5xl font-black mb-2">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-orange-100 text-lg font-medium">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
}
