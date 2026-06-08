# Névé Rando - Agent & Development Instructions

This document centralizes all guidelines, practices, and configuration details for the Névé Rando project. It is **dynamic** and should evolve, move, or be modified as project patterns, dependencies, and requirements change.

---

## 🚀 Project Overview
**Névé Rando** is an interactive mobile application built with React Native and Expo, designed to help users explore and book hikes accessible via public transportation without a car.

---

## 🛠️ Technology Stack
* **Framework**: [Expo v56.0.5](https://docs.expo.dev/versions/v56.0.0/)
* **Platform**: React Native (0.85.3) & React Native Web
* **Routing**: Expo Router (v56.2.7)
* **Styling**: NativeWind v4 (Tailwind CSS for React Native)
* **State Management**: React Context (`AppContext.tsx`)
* **Icons**: `SymbolView` from `expo-symbols` (using platform-native SF Symbols where supported)
* **Animations**: React Native Reanimated (v4)

---

## 📐 Coding Practices & Guidelines

### 1. Styling with NativeWind v4
* Use the `className` prop for styling React Native components (e.g., `<View className="flex-1 bg-slate-100">`).
* Ensure text sizes, colors, and layouts follow a clean, consistent palette (e.g., slate colors for UI, orange for primary highlights/hikes).
* Respect platform safe areas using `SafeAreaView` from `react-native` or `react-native-safe-area-context`.

### 2. Expo Routing & Views
* The routing structure is located under `app/`.
* Key screens:
  * Main tabs: `app/(tabs)/index.tsx` (Explorer), `app/(tabs)/mes-aventures.tsx` (My Adventures), `app/(tabs)/mon-compte.tsx` (Account)
  * Modals and secondary screens: `app/details.tsx`, `app/search.tsx`, `app/onboarding.tsx`, `app/plan-transport.tsx`, `app/recap.tsx`

### 3. State & Context
* Shared application state (favorites, filters, hikes data, passes) is defined and maintained in `context/AppContext.tsx`. Always import from this context when fetching or mutating hike and user data.

### 4. Reading Documentation
* **CRITICAL**: Expo v56 introduced changes. Always refer to the exact versioned documentation at `https://docs.expo.dev/versions/v56.0.0/` before writing any new device APIs, modules, or configuring configurations.

---

## 📦 Git & Remote Configuration
* **Git Repository**: `https://github.com/maudsauvage13-web/rando.git`
* **Default Branch**: `main`
* **Workflow**:
  * Keep commits semantic and clear (e.g., `feat: implement public transport MVP`).
  * Ensure the working tree is clean or cleanly staged before pushing.

---

## 🔄 Dynamic Instructions Evolution
This file is the single source of truth for the AI agent and developers working on this project. 
* Add new coding conventions here as they are established.
* Update package constraints or API references as you upgrade dependencies.
* Feel free to restructure, expand, or move sections to better suit our development lifecycle.
