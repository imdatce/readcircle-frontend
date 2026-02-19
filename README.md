# 📖 ReadCircle (Spiritual Reading Distribution) - Frontend

This is the frontend application for **ReadCircle** (also known as Sura), a collaborative platform designed to distribute and manage spiritual readings such as Quranic Hatims, specific Surahs, Prayers (Cevşen), and Dhikrs among multiple participants.

Built with modern web technologies, it offers a fast, responsive, and highly interactive user experience.

## ✨ Key Features

- **⚡ Modern Tech Stack:** Built on top of **Next.js 15** (App Router) and **React 19**.
- **🎨 Styling:** Beautifully styled with **Tailwind CSS**, featuring smooth animations and modern UI/UX patterns.
- **🌗 Theme Support:** Built-in Dark and Light mode support (`ThemeContext`).
- **🌍 Multi-language (i18n):** Supports English, Turkish, and Arabic out of the box (`LanguageContext`).
- **📱 Responsive Design:** Fully optimized for mobile, tablet, and desktop screens.
- **📖 Interactive Reading Modals:** Read texts in Arabic, Latin transliteration, or translated meanings. Includes image-based Quran page rendering.
- **📿 Digital Tasbih (Zikirmatik):** Integrated interactive counter for Dhikr and Salawat assignments.
- **🔗 Easy Sharing:** Generate unique session codes and shareable links (including direct WhatsApp sharing) to invite participants easily.

## 🛠️ Technologies Used

- **Framework:** [Next.js](https://nextjs.org/) (TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** React Context API & Custom Hooks
- **Icons:** Inline SVG & Heroicons

## 📂 Project Structure

- `app/`: Next.js App Router pages (Home, Admin, Join, Auth)
- `components/`: Reusable UI components
- `common/`: Common elements like Zikirmatik
- `modals/`: Interactive modals (e.g., ReadingModal)
- `context/`: Global State (Auth, Language, Theme)
- `hooks/`: Custom React hooks (e.g., useDistributionSession)
- `public/`: Static assets, images, and localized text resources
- `types/`: TypeScript interface and type definitions
- `utils/`: Helper functions (text formatters, etc.)

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

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 Available Scripts

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📄 License

This project is licensed under the MIT License
