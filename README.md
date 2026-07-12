# 🚚 Transporter Cost & Delivery Analytics Dashboard

> A modern, production-ready React dashboard for monitoring transporter operations, delivery costs, and performance analytics.

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-success)](https://vitest.dev/)
[![CI](https://github.com/rohandev19/Transporter-Cost-Delivery-Analytics-Dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/rohandev19/Transporter-Cost-Delivery-Analytics-Dashboard/actions)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Overview

This dashboard application helps logistics and transportation companies monitor their operational costs, track driver and vehicle performance, and detect data anomalies in real-time. Built as a modern frontend portfolio project showcasing professional React development practices.

### 🎯 Key Features

- **📊 Real-time Dashboard** - Monitor key metrics: deliveries, costs, distances, and anomalies
- **📤 CSV Upload** - Import operational data with validation and error reporting
- **🔍 Anomaly Detection** - Automatically flag suspicious costs and data quality issues
- **👨‍✈️ Driver Analytics** - Track individual driver performance and efficiency
- **🚗 Vehicle Analytics** - Monitor vehicle costs and fuel efficiency
- **📈 Data Visualization** - Interactive charts and KPI cards
- **🔐 Role-Based Access** - Admin, Supervisor, and Viewer roles with different permissions
- **💾 Persistent Storage** - Local state management with Zustand

## 🛠️ Tech Stack

### Core

- **React 18** - UI library with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing

### Styling & UI

- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Data Management

- **Zustand** - Lightweight state management
- **Zod** - Schema validation
- **TanStack Table** - Advanced data tables (planned)
- **Recharts** - Interactive chart components

### Form & Validation

- **React Hook Form** - Form state management
- **Zod** - Runtime type validation

### Testing

- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing

## 📁 Project Structure

```
src/
├── app/
│   ├── routes/          # Route definitions and protection
│   └── providers/       # Context providers
├── components/
│   ├── common/          # Reusable UI components
│   ├── charts/          # Chart components
│   ├── dashboard/       # Dashboard-specific components
│   ├── layout/          # Layout components (Sidebar, Topbar)
│   ├── table/           # Table components
│   └── upload/          # Upload components
├── features/            # Feature-based modules
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard page
│   ├── upload/          # Upload page
│   ├── operations/      # Operations table
│   ├── drivers/         # Driver analytics
│   ├── vehicles/        # Vehicle analytics
│   ├── anomalies/       # Anomaly center
│   └── reports/         # Report generation
├── constants/           # App constants and configs
├── data/                # Mock data generators
├── hooks/               # Custom React hooks
├── lib/                 # External library utilities
├── schemas/             # Zod validation schemas
├── stores/              # Zustand stores
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── tests/               # Test files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/rohandev19/Transporter-Cost-Delivery-Analytics-Dashboard.git
cd Transporter-Cost-Delivery-Analytics-Dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎭 Demo Login

The application uses **frontend-only authentication** for demonstration purposes.

| Role       | Description                                    | Permissions                    |
| ---------- | ---------------------------------------------- | ------------------------------ |
| Admin      | Full access to all features                    | Upload, Export, Edit, Delete   |
| Supervisor | Can view analytics and export reports          | View, Export                   |
| Viewer     | Read-only access to dashboard and analytics    | View only                      |

**Note:** This is a demo authentication system. For production use, implement proper backend authentication.

## 📊 Features in Detail

### Dashboard Overview

- **KPI Cards**: Total deliveries, costs, delivery points, distance traveled
- **Metrics**: Active drivers, vehicles, anomalies detected
- **Charts**: Cost breakdowns, trends, and comparative analytics

### CSV Data Upload

- Drag-and-drop or file browser upload
- Real-time validation with detailed error reporting
- Sample CSV download
- Support for required and optional fields
- Max file size: 5MB

**Required CSV Columns:**

```
date, driverName, plateNumber, customerName, deliveryPoints, kilometer, gasolineCost
```

**Optional CSV Columns:**

```
tollCost, parkingCost, overtimeCost, incentiveCost
```

### Anomaly Detection

Automatic detection of data issues including:

- **Cost Anomalies**: Excessive gasoline/toll costs
- **Data Quality**: Missing fields, zero values with costs
- **Operational**: Unrealistic daily kilometers, low-efficiency trips
- **Duplicates**: Same date/driver/vehicle/customer combinations

### Business Logic

**Cost Calculations:**

```typescript
totalCost = gasolineCost + tollCost + parkingCost + overtimeCost + incentiveCost
costPerPoint = totalCost / deliveryPoints
costPerKm = totalCost / kilometer
```

## 🔒 Security Notes

- This is a **frontend-only portfolio project** using **dummy data**
- Authentication is simulated for UI demonstration only
- No real user data is collected or stored remotely
- File upload processing happens entirely in the browser
- Data is stored in browser localStorage via Zustand persist

**For Production Use:**

- Implement backend API with proper authentication (JWT, OAuth)
- Add server-side validation and sanitization
- Use a real database (PostgreSQL, MongoDB)
- Implement proper RBAC (Role-Based Access Control)
- Add rate limiting and input sanitization
- Use HTTPS and secure session management

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 🎨 Design Principles

- **Professional First**: Clean, functional UI without excessive decoration
- **Data Clarity**: Easy-to-read metrics and clear status indicators
- **Operational Feel**: Designed for internal company use, not marketing
- **Consistent Spacing**: Proper use of Tailwind's spacing system
- **Status Visibility**: Color-coded badges for valid/warning/anomaly states

## 📝 Future Improvements

- [ ] Advanced filtering and search in operations table
- [ ] Export to PDF and Excel
- [ ] Interactive charts with Recharts
- [ ] Driver and vehicle detailed pages
- [ ] Date range picker for custom periods
- [ ] Print-friendly report layouts
- [ ] Dark mode support
- [ ] Real-time notifications
- [ ] Integration with backend API
- [ ] GPS tracking integration
- [ ] Mobile responsive optimization
- [ ] Multi-language support (i18n)

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**

- GitHub: [@rohandev19](https://github.com/rohandev19)
- Portfolio: [Your Portfolio URL]
- LinkedIn: [Your LinkedIn]

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- State management by [Zustand](https://github.com/pmndrs/zustand)

---

**⚠️ Disclaimer:** This project uses dummy data for demonstration purposes. It is not intended for production use without proper backend implementation and security measures.

Made with ❤️ as a portfolio project to demonstrate modern React development practices.
