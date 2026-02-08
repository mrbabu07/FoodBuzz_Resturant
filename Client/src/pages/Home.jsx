import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function Home() {
  const [featuredMenuItems, setFeaturedMenuItems] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalMenuItems: 0,
    averageRating: 4.8,
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch featured menu items
      const menuResponse = await fetch("/api/menu-items");
      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        setFeaturedMenuItems(menuData.slice(0, 6));
      }

      // Fetch popular recipes
      const recipesResponse = await fetch("/api/recipes");
      if (recipesResponse.ok) {
        const recipesData = await recipesResponse.json();
        setPopularRecipes(recipesData.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12)
      return {
        text: "Good Morning",
        emoji: "🌅",
        color: "from-amber-400 to-orange-500",
      };
    if (hour < 17)
      return {
        text: "Good Afternoon",
        emoji: "☀️",
        color: "from-blue-400 to-indigo-500",
      };
    return {
      text: "Good Evening",
      emoji: "🌙",
      color: "from-purple-400 to-pink-500",
    };
  };

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-10 animate-float"></div>
          <div
            className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-10 animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-10 animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative container-modern py-20 lg:py-32">
          <div className="text-center animate-fade-in">
            {/* Dynamic Greeting */}
            <div
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${greeting.color} text-white font-semibold mb-8 shadow-lg`}
            >
              <span className="text-2xl">{greeting.emoji}</span>
              <span>{greeting.text}! Welcome to FoodBuzz</span>
              <span className="text-sm opacity-90">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-tight">
              <span className="text-gradient">Delicious Food</span>
              <br />
              <span className="text-gray-900">Delivered Fast</span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience culinary excellence with our premium ingredients,
              expert chefs, and lightning-fast delivery. Your perfect meal is
              just a click away.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link
                to="/order_1st"
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span className="text-2xl">🍽️</span>
                  Order Now
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </Link>

              <Link
                to="/recipe"
                className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300 hover:scale-105 flex items-center gap-3"
              >
                <span className="text-2xl">📚</span>
                Browse Recipes
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                {
                  label: "Happy Customers",
                  value: "10K+",
                  icon: "👥",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  label: "Menu Items",
                  value: `${featuredMenuItems.length || 50}+`,
                  icon: "🍕",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  label: "Average Rating",
                  value: "4.9★",
                  icon: "⭐",
                  color: "from-yellow-500 to-orange-500",
                },
                {
                  label: "Cities",
                  value: "25+",
                  icon: "🏙️",
                  color: "from-purple-500 to-pink-500",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.color} text-white text-2xl mb-4 shadow-lg`}
                  >
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Items */}
      <section className="py-20 bg-white">
        <div className="container-modern">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Featured <span className="text-gradient">Menu</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular dishes, crafted with premium ingredients
              and love
            </p>
          </div>

          {loading ? (
            <div className="grid-modern">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse"
                >
                  <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-modern">
              {featuredMenuItems.map((item, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden rounded-xl mb-6">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ${item.price}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {item.category}
                    </span>
                    <Link to="/order_1st" className="btn-primary text-sm">
                      Order Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/order_1st" className="btn-primary text-lg px-8 py-4">
              View Full Menu
              <svg
                className="w-5 h-5 ml-2 inline"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Recipes */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container-modern">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Popular <span className="text-gradient">Recipes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn to cook amazing dishes at home with our step-by-step guides
            </p>
          </div>

          {loading ? (
            <div className="grid-modern-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse"
                >
                  <div className="bg-gray-200 h-32 rounded-xl mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-modern-4">
              {popularRecipes.map((recipe, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {recipe.difficulty || "Easy"}
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {recipe.name}
                  </h4>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {(recipe.prepTime || 15) + (recipe.cookTime || 15)}min
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {recipe.servings || 4}
                    </span>
                  </div>

                  <Link
                    to={`/recipe/${recipe._id}`}
                    className="btn-secondary w-full text-center text-sm"
                  >
                    View Recipe
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/recipe" className="btn-primary text-lg px-8 py-4">
              Explore All Recipes
              <svg
                className="w-5 h-5 ml-2 inline"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-modern">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Why Choose <span className="text-gradient">FoodBuzz?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We deliver exceptional dining experiences with premium quality and
              service
            </p>
          </div>

          <div className="grid-modern-4">
            {[
              {
                icon: "🌱",
                title: "Fresh Ingredients",
                description:
                  "Sourced daily from local farms and premium suppliers",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: "⚡",
                title: "Lightning Fast",
                description: "Average delivery time of 25 minutes or less",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: "👨‍🍳",
                title: "Expert Chefs",
                description:
                  "Prepared by professional chefs with years of experience",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: "📱",
                title: "Easy Ordering",
                description: "Seamless ordering experience across all devices",
                color: "from-orange-500 to-red-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} text-white text-3xl mb-6 shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container-modern text-center">
          <div className="animate-fade-in">
            <h2 className="text-5xl font-black mb-6">Ready to Order?</h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
              Join thousands of satisfied customers and experience the best food
              delivery service in town
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/order_1st"
                className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
              >
                <span className="text-2xl">🚀</span>
                Start Ordering
              </Link>

              <Link
                to="/register"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 hover:scale-105 flex items-center gap-3"
              >
                <span className="text-2xl">👤</span>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
