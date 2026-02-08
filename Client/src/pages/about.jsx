import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const About = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="bg-white w-full relative min-h-screen">
      {/* Hero Banner with Parallax Effect */}
      <section className="relative w-full h-[450px] md:h-[550px] lg:h-[650px] overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover transform scale-105"
          style={{
            backgroundImage: "url('https://i.ibb.co.com/G48pRSGk/Capture.png')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-white"></div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full px-6 text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 text-white drop-shadow-2xl animate-fade-in">
              About
              <span className="block text-orange-400">FoodBuzz</span>
            </h1>
            <p className="text-lg md:text-2xl text-white/90 mb-4 drop-shadow-lg font-light">
              Discover our story, passion for food, and commitment to delivering
              exceptional culinary experiences.
            </p>
            <p className="text-base md:text-xl text-white/80 drop-shadow-lg font-light">
              From farm to table — we bring you the finest flavors!
            </p>

            <div className="mt-10 flex justify-center gap-4">
              <div className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold">
                🌱 Fresh Ingredients
              </div>
              <div className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold">
                👨‍🍳 Expert Chefs
              </div>
              <div className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold hidden md:block">
                ❤️ Made with Love
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full">
            <path
              fill="#ffffff"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="max-w-6xl mx-auto -mt-12 px-6 mb-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 flex justify-center items-center">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://i.ibb.co.com/Q78tP4TD/Capture2.png"
                  alt="Our Story"
                  className="w-full max-w-md rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
              </div>
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <h3 className="text-3xl md:text-4xl font-black text-orange-600 mb-4">
                Our Story 📖
              </h3>
              <p className="text-gray-700 text-lg mb-6 font-medium leading-relaxed">
                Founded with a passion for exceptional food and outstanding
                service, FoodBuzz has been serving delicious meals and sharing
                culinary traditions for years. We believe that great food brings
                people together and creates lasting memories.
              </p>
              <button className="inline-flex items-center px-6 py-3 rounded-2xl bg-orange-500 text-white font-black hover:bg-orange-600 hover:scale-105 transition-all w-fit">
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Handmade Pizza Section */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-black text-orange-600 mb-4">
                Handmade Pizza 🍕
              </h2>
              <p className="text-gray-700 text-lg mb-6 font-medium leading-relaxed">
                Taste the authentic flavors of our handmade pizza, prepared with
                love and baked to perfection in a wood-fired oven. Every pizza
                is crafted with premium ingredients and traditional techniques.
              </p>
              <button className="inline-flex items-center px-6 py-3 rounded-2xl bg-orange-500 text-white font-black hover:bg-orange-600 hover:scale-105 transition-all w-fit">
                Order Now →
              </button>
            </div>
            <div className="md:w-1/2 p-8 flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-400 rounded-2xl transform rotate-3 shadow-xl"></div>
                <img
                  src="https://i.ibb.co.com/6cPj0YpS/44.jpg"
                  alt="Handmade Pizza"
                  className="relative w-full max-w-md rounded-2xl shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-black text-orange-600 mb-3">
              Why Choose Us? ⭐
            </h2>
            <p className="text-gray-600 text-lg font-medium">
              Discover what makes FoodBuzz special
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🌱",
                title: "Fresh Ingredients",
                desc: "We use only the freshest ingredients to prepare every meal, ensuring both taste and quality.",
              },
              {
                icon: "📜",
                title: "Authentic Recipes",
                desc: "Our dishes are inspired by traditional recipes passed down through generations.",
              },
              {
                icon: "🚀",
                title: "Fast Delivery",
                desc: "Enjoy your favorite meals at your doorstep with our reliable and speedy delivery service.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-2xl bg-orange-50 hover:bg-orange-100 transition-all hover:scale-105 duration-300"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-black text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
