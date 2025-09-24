# FleetLink - Fleet Management & Package Delivery Platform

## Features

### Vehicle Management
• Vehicle registration with document upload (RC, Driver License)
• Vehicle status tracking (Available, Busy, Maintenance)
• Vehicle type support (Truck, Van, Car, etc.)
• Load capacity management
• Driver information management
• Vehicle search and filtering by city, type, and availability
• Bulk vehicle operations

### Package Delivery System
• Google Maps integration for pickup and drop locations
• Real-time distance and duration calculation
• Dynamic pricing based on distance and GST
• Package type categorization (Documents, Food, Electronics, etc.)
• Weight-based pricing calculations
• Delivery time estimation

### Booking Management
• Multi-step booking process with form validation
• Session storage for booking data persistence
• Vehicle selection from available fleet
• Real-time booking status tracking
• Booking cancellation functionality
• Booking history and management
• SMS notifications for booking updates

### Payment Integration
• Razorpay payment gateway integration
• Secure payment processing
• Payment order creation and verification
• Multiple payment methods support
• Payment status tracking
• One-time registration fee for vehicles (₹99)
• Dynamic pricing for delivery services

### User Interface
• Responsive design for mobile and desktop
• Modern UI with Tailwind CSS
• Interactive forms with real-time validation
• Loading states and progress indicators
• Toast notifications for user feedback
• Success pages with countdown timers
• Error handling with user-friendly messages

### Dashboard & Analytics
• All vehicles management dashboard
• All bookings management dashboard
• Vehicle status filtering and search
• Booking status filtering (Confirmed, Cancelled, Completed)
• Bulk operations for fleet management
• Real-time data updates

### Technical Features
• Next.js 15.5.3 with Turbopack
• MongoDB Atlas database integration
• Google Maps JavaScript API integration
• Cloudinary for file uploads
• TypeScript for type safety
• Server-side rendering and static generation
• API routes for backend functionality
• Docker containerization support
• Build optimization and error handling

### API Endpoints
• Vehicle registration and management
• Booking creation and management
• Payment processing and verification
• Search functionality for vehicles
• CRUD operations for all entities
• Health check endpoints

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
