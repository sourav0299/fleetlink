import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold text-blue-600">
                  FleetLink
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a
                  href="#services"
                  className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
                >
                  Services
                </a>
                <Link
                  href="/all-bookings"
                  className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
                >
                  All Bookings
                </Link>
                <Link
                  href="/all-vehicles"
                  className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
                >
                  All Vehicles
                </Link>
                <a
                  href="#about"
                  className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
                >
                  Contact
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/add-vehicle"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Add Vehicle
              </Link>
              <Link
                href="/booking"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Book Vehicle
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-slate-900 mb-6">
                Fleet Management
                <span className="text-blue-600"> Made Simple</span>
              </h1>
              <p className="text-xl text-slate-700 mb-8 leading-relaxed">
                Streamline your fleet operations with real-time tracking, route
                optimization, and intelligent analytics. Reduce costs, improve
                efficiency, and scale your business effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/add-vehicle"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold text-lg shadow-lg text-center"
                >
                  Start Free Trial
                </Link>
                <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-600 hover:text-white transition font-semibold text-lg">
                  Watch Demo
                </button>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-emerald-700 font-medium">
                <span>✅ 30-day free trial</span>
                <span>✅ No credit card required</span>
              </div>
            </div>
            <div className="relative text-slate-700">
              <div className="bg-white rounded-xl shadow-2xl p-8 border border-blue-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Fleet Dashboard</h3>
                  <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Live
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
                    <span className="font-medium">🚛 Total Vehicles</span>
                    <span className="font-bold text-xl text-blue-700">247</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
                    <span className="font-medium">🟢 Active</span>
                    <span className="font-bold text-xl text-green-700">
                      189
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-l-4 border-orange-500">
                    <span className="font-medium">⚡ Fuel Efficiency</span>
                    <span className="font-bold text-xl text-orange-700">
                      +12%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto">
              Comprehensive fleet management solutions to optimize your
              operations and drive growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-400 hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                📍
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                Real-time Tracking
              </h3>
              <p className="text-slate-700 mb-4">
                Monitor your entire fleet in real-time with GPS tracking and
                live updates on vehicle location and status.
              </p>
              <a
                href="#"
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center"
              >
                Learn more <span className="ml-1">→</span>
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-xl hover:border-green-400 hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                🗺️
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                Route Optimization
              </h3>
              <p className="text-slate-700 mb-4">
                AI-powered route planning to reduce fuel costs, save time, and
                improve delivery efficiency.
              </p>
              <a
                href="#"
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center"
              >
                Learn more <span className="ml-1">→</span>
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-xl hover:border-purple-400 hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                👥
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                Driver Management
              </h3>
              <p className="text-slate-700 mb-4">
                Comprehensive driver performance tracking, scheduling, and
                safety monitoring system.
              </p>
              <a
                href="#"
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center"
              >
                Learn more <span className="ml-1">→</span>
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200 rounded-xl p-6 hover:shadow-xl hover:border-orange-400 hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                🔧
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                Maintenance Scheduling
              </h3>
              <p className="text-slate-700 mb-4">
                Automated maintenance alerts and scheduling to keep your fleet
                running smoothly and prevent breakdowns.
              </p>
              <a
                href="#"
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center"
              >
                Learn more <span className="ml-1">→</span>
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-red-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-xl hover:border-red-400 hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                📊
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                Analytics & Reports
              </h3>
              <p className="text-slate-700 mb-4">
                Detailed insights and reports on fleet performance, costs, and
                operational metrics.
              </p>
              <a
                href="#"
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center"
              >
                Learn more <span className="ml-1">→</span>
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-200 rounded-xl p-6 hover:shadow-xl hover:border-yellow-400 hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                ⚡
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                Fuel Management
              </h3>
              <p className="text-slate-700 mb-4">
                Monitor fuel consumption, detect inefficiencies, and optimize
                fuel usage across your entire fleet.
              </p>
              <a
                href="#"
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center"
              >
                Learn more <span className="ml-1">→</span>
              </a>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-200 rounded-xl p-6 hover:shadow-xl hover:border-indigo-400 hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                🚛
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                Vehicle Rental
              </h3>
              <p className="text-slate-700 mb-4">
                Search and book available vehicles by city and date. Perfect for 
                transportation needs with real-time availability checking.
              </p>
              <Link
                href="/search-vehicles"
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center"
              >
                Search Vehicles <span className="ml-1">→</span>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-white to-pink-50 border-2 border-pink-200 rounded-xl p-6 hover:shadow-xl hover:border-pink-400 hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                📦
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">
                Package Delivery
              </h3>
              <p className="text-slate-700 mb-4">
                Fast and reliable package delivery service with real-time tracking,
                Google Maps integration, and transparent pricing.
              </p>
              <Link
                href="/booking"
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center"
              >
                Book Delivery <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Management Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Fleet Management Dashboard
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Access powerful tools to manage your fleet operations, track bookings, and monitor performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* All Bookings Card */}
            <Link href="/all-bookings" className="group">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
                    📋
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">All Bookings</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  View, filter, and manage all delivery bookings. Cancel bookings, track status, and monitor delivery progress in real-time.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  Manage Bookings <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>

            {/* All Vehicles Card */}
            <Link href="/all-vehicles" className="group">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
                    🚛
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">All Vehicles</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Manage your entire fleet, update vehicle status, filter by location and type, and perform bulk operations efficiently.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  Manage Fleet <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/booking"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold text-lg shadow-lg text-center"
            >
              📦 New Booking
            </Link>
            <Link
              href="/add-vehicle"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold text-lg shadow-lg text-center"
            >
              🚛 Add Vehicle
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Fleet Managers Worldwide
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of businesses optimizing their fleet operations
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-5xl font-bold text-yellow-300 mb-2">50+</div>
              <div className="text-blue-100 font-medium">Countries</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-5xl font-bold text-yellow-300 mb-2">
                10K+
              </div>
              <div className="text-blue-100 font-medium">Vehicles Tracked</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-5xl font-bold text-yellow-300 mb-2">5M+</div>
              <div className="text-blue-100 font-medium">Miles Optimized</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-5xl font-bold text-yellow-300 mb-2">98%</div>
              <div className="text-blue-100 font-medium">
                Customer Satisfaction
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="mb-4">
                <div className="flex text-yellow-400 text-xl mb-2">★★★★★</div>
                <p className="text-slate-800 italic">
                  &ldquo;FleetLink reduced our fuel costs by 25% and improved
                  our delivery times significantly. The real-time tracking
                  feature is a game-changer.&rdquo;
                </p>
              </div>
              <div className="flex items-center text-slate-700">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                  JD
                </div>
                <div>
                  <div className="font-semibold">John Davis</div>
                  <div className="text-sm text-slate-600">
                    Fleet Manager, LogiCorp
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <div className="mb-4">
                <div className="flex text-yellow-400 text-xl mb-2">★★★★★</div>
                <p className="text-slate-800 italic">
                  &ldquo;The maintenance scheduling feature has saved us
                  thousands in emergency repairs. Highly recommend FleetLink for
                  any business with a fleet.&rdquo;
                </p>
              </div>
              <div className="flex items-center text-slate-700">
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mr-3">
                  SM
                </div>
                <div>
                  <div className="font-semibold">Sarah Martinez</div>
                  <div className="text-sm text-slate-600">
                    Operations Director, QuickTrans
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <div className="mb-4">
                <div className="flex text-yellow-400 text-xl mb-2">★★★★★</div>
                <p className="text-slate-800 italic">
                  &ldquo;Excellent platform with intuitive interface. The
                  analytics help us make data-driven decisions that have
                  improved our bottom line.&rdquo;
                </p>
              </div>
              <div className="flex items-center text-slate-700">
                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                  MJ
                </div>
                <div>
                  <div className="font-semibold">Mike Johnson</div>
                  <div className="text-sm text-slate-600">
                    CEO, Urban Delivery Co
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-slate-700">
                  What is FleetLink?
                </h3>
                <p className="text-slate-700">
                  FleetLink is a comprehensive fleet management platform that
                  helps businesses track, manage, and optimize their vehicle
                  operations through real-time GPS tracking, route optimization,
                  driver management, and advanced analytics.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-slate-700">
                  How does fleet tracking work?
                </h3>
                <p className="text-slate-700">
                  Our GPS tracking system provides real-time location data for
                  all your vehicles. You can monitor routes, speed, idle time,
                  and receive alerts for any unusual activity through our web
                  dashboard or mobile app.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-slate-700">
                  Can FleetLink integrate with existing systems?
                </h3>
                <p className="text-slate-700">
                  Yes, FleetLink offers robust API integration capabilities that
                  allow seamless connection with your existing ERP, CRM, and
                  accounting systems for streamlined operations.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-slate-700">
                  What types of vehicles does FleetLink support?
                </h3>
                <p className="text-slate-700">
                  FleetLink supports all types of commercial vehicles including
                  trucks, vans, cars, motorcycles, and specialized equipment.
                  Our platform is scalable for fleets of any size.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-slate-700">
                  How much can I save with FleetLink?
                </h3>
                <p className="text-slate-700">
                  Our customers typically see 15-30% reduction in fuel costs,
                  20% improvement in route efficiency, and significant savings
                  on maintenance through predictive alerts and optimized
                  scheduling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Optimize Your Fleet?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already saving money and improving
            efficiency with FleetLink
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/add-vehicle"
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-8 py-4 rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition font-bold text-lg shadow-xl text-center"
            >
              Start Free Trial
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition font-semibold text-lg">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-4">
                FleetLink
              </div>
              <p className="text-gray-300 mb-4">
                Simplifying fleet management for businesses worldwide with
                intelligent tracking and optimization solutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  📘
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  🐦
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  💼
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Fleet Tracking
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Route Optimization
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Driver Management
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Maintenance
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    System Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              &copy; 2024 FleetLink. All rights reserved.
            </p>
            <p className="text-gray-400 mt-4 md:mt-0">
              Email: hello@fleetlink.com | Phone: +1 (555) 123-4567
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
