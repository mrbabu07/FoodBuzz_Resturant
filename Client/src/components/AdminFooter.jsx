import { useState } from "react";
const AdminFooter = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-300 py-4 mt-4 text-center text-sm text-gray-600 select-none">
      © {new Date().getFullYear()} MyAdmin Dashboard. All rights reserved.
    </footer>
  );
};

export default AdminFooter;
