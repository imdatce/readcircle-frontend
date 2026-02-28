```markdown
# 📖 SURA (Spiritual Union for Reflection & Affinity) - Frontend

This is the frontend application for **SURA**, a collaborative digital sanctuary designed to distribute and manage spiritual readings such as Quranic Hatims, Risale-i Nur, Prayers (Cevşen), and Dhikrs among multiple participants.

Built with modern web technologies, it offers a fast, responsive, and highly interactive distraction-free user experience.

## ✨ Key Features

- **⚡ Modern Tech Stack:** Built on top of **Next.js 15** (App Router) and **React 19**.
- **📖 Comprehensive Library & Reading Modes:** Access Quran-ı Kerim, Risale-i Nur, Cevşen, and daily prayers. Includes advanced reading features like **Auto-scrolling**, **Sepia (Eye Protection) Mode**, Font resizing, and immersive **Full-Screen** experiences.
- **📿 Smart Ibadah Tracking:** Integrated interactive Digital Tasbih (Zikirmatik), location-based Prayer Times, and Qada (Kaza) prayer tracking.
- **🔗 Spiritual Circles (Hatim Distribution):** Generate unique session codes and shareable links (including direct WhatsApp sharing) to invite participants to Quranic Hatims and Dhikr circles easily.
- **📱 PWA Ready:** Fully installable as a Progressive Web App (PWA) for a native-like mobile experience.
- **🌗 Theme Support:** Built-in Dark and Light mode support (`ThemeContext`).
- **🌍 Multi-language (i18n):** Supports English, Turkish, and Arabic out of the box (`LanguageContext`).
- **🧘 Distraction-Free:** Completely ad-free and designed to keep the user focused on their spiritual journey.

## 🛠️ Technologies Used

- **Framework:** [Next.js](https://nextjs.org/) (TypeScript)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** React Context API & Custom Hooks
- **PWA:** `@ducanh2912/next-pwa`
- **Icons:** Inline SVG & Heroicons

## 📂 Project Structure

- `app/`: Next.js App Router pages (Home, Admin, Join, Auth, Resources)
- `components/`: Reusable UI components (Widgets, Accordions, Header, Footer)
- `components/modals/`: Interactive modals (e.g., ReadingModal for Quran/Cevşen)
- `context/`: Global State (Auth, Language, Theme)
- `hooks/`: Custom React hooks (e.g., useDistributionSession)
- `public/`: Static assets, images, PWA manifests, and localized text resources
- `types/`: TypeScript interface and type definitions
- `utils/`: Helper functions (text formatters, Firebase utils, etc.)

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- **Node.js** (v18.17 or higher is recommended)
- **npm** (or yarn/pnpm)

### Installation

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <repository-url>
   cd fe

```

2. **Install dependencies:**
```bash
npm install

```


3. **Set up Environment Variables:**
Create a `.env.local` file in the root of the `fe` directory and add the URL of your backend API:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080

```


*(Update the port if your Spring Boot backend runs on a different port)*
4. **Run the development server:**
```bash
npm run dev

```


5. **Open the app:**
Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

## 📜 Available Scripts

* `npm run dev`: Runs the app in development mode.
* `npm run build`: Builds the app for production.
* `npm start`: Starts the production server.
* `npm run lint`: Runs ESLint to check for code quality issues.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute to our mission of connecting the Ummah.

## 📄 License

This project is licensed under the MIT License.

```

```