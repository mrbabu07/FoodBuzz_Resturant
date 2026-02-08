import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookSquare,
  faTwitterSquare,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500 rounded-full animate-float"></div>
        <div
          className="absolute top-20 right-20 w-24 h-24 bg-orange-400 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/3 w-20 h-20 bg-orange-300 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/favicon.jpg"
                alt="Logo"
                className="h-12 w-12 rounded-xl shadow-lg"
              />
              <span className="font-black text-3xl bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                FoodBuzz
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              We provide the best homemade recipes and premium food delivery
              service. Experience culinary excellence with every order! 🍽️
            </p>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">
                Online & Ready to Serve
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <span className="text-orange-500">🔗</span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home", icon: "🏠" },
                { to: "/recipe", label: "Recipes", icon: "📚" },
                { to: "/order_1st", label: "Order Now", icon: "🛒" },
                { to: "/about", label: "About Us", icon: "ℹ️" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-3 text-gray-300 hover:text-orange-400 hover:translate-x-2 transition-all duration-300 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <span className="text-orange-500">⚡</span>
              Services
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Fast Delivery", icon: "🚚" },
                { label: "Recipe Collection", icon: "📖" },
                { label: "24/7 Support", icon: "🎧" },
                { label: "Premium Quality", icon: "⭐" },
              ].map((service) => (
                <li
                  key={service.label}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <span className="text-lg">{service.icon}</span>
                  {service.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <span className="text-orange-500">📞</span>
              Contact Us
            </h3>
            <div className="space-y-4">
              <a
                href="https://mail.google.com/mail/u/0/?ogbl#inbox?compose=CllgCJvkXlpztnJrzZWvjVgffZrjTqmNPJZSMqKjlzkkmcBWSRPZBgJmwSTMvkmRbVQxXVrjlDq"
                className="flex items-center gap-3 text-gray-300 hover:text-orange-400 transition-all duration-300 group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">
                  📧
                </span>
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-sm">foodBuzz@gmail.com</div>
                </div>
              </a>

              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-lg">📱</span>
                <div>
                  <div className="font-semibold">Phone</div>
                  <div className="text-sm">+880 123 456 789</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-lg">📍</span>
                <div>
                  <div className="font-semibold">Location</div>
                  <div className="text-sm">Dhaka, Bangladesh</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Newsletter */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Social Icons */}
            <div className="flex items-center gap-6">
              <span className="text-gray-400 font-semibold">Follow us:</span>
              {[
                {
                  href: "#",
                  icon: "fab fa-facebook-square",
                  label: "Facebook",
                  color: "hover:text-blue-500",
                },
                {
                  href: "#",
                  icon: "fab fa-twitter-square",
                  label: "Twitter",
                  color: "hover:text-blue-400",
                },
                {
                  href: "#",
                  icon: "fab fa-instagram",
                  label: "Instagram",
                  color: "hover:text-pink-500",
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className={`text-3xl text-gray-400 ${social.color} hover:scale-125 transition-all duration-300`}
                  aria-label={social.label}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-semibold whitespace-nowrap">
                Stay updated:
              </span>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-r-xl font-bold hover:from-orange-600 hover:to-orange-700 hover:scale-105 transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-gray-400">
                &copy; 2025{" "}
                <span className="font-bold text-orange-500">FoodBuzz</span>. All
                Rights Reserved.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Made with ❤️ for food lovers everywhere
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              <Link
                to="/terms"
                className="text-gray-400 hover:text-orange-400 transition-colors text-sm font-medium"
              >
                Terms & Conditions
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-orange-400 transition-colors text-sm font-medium"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                to="/adminlogin"
                className="text-gray-400 hover:text-orange-400 transition-colors text-sm font-medium"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600"></div>
      </div>
    </footer>
  );
};

export default Footer;
