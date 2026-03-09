# F1 Strategy & Telemetry Simulator

A high-performance full-stack web application designed to simulate Formula 1 race strategies. This tool calculates tire degradation curves and lap time deltas to help race engineers determine the optimal "stint" length for different compounds.



## Project Overview
Built as a technical demonstration of **Full-Stack Development**, this project manages a database of Grand Prix circuits and processes algorithmic lap time decay. It features a modern, type-safe architecture that connects a Go-based REST API to a React frontend.

### Core Features:
* **Circuit Management (CRUD):** Add, view, and remove F1 tracks from a persistent MariaDB database.
* **Strategy Predictor:** Real-time processing of lap time "decay" based on tire compound physics (Soft, Medium, Hard).
* **Tire Life Simulation:** Calculates the linear degradation of tires over a 10-lap stint to show performance "cliffs."
* **F1 Dashboard UI:** A high-fidelity, dark-mode interface designed for high-pressure telemetry environments.

---

## Technical Stack

| Layer | Technology | Key Library/Package |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite) | TypeScript (TSX), Axios |
| **Backend** | Go (Golang) | Gin Gonic (Web Framework) |
| **Database** | MariaDB / MySQL | GORM (Object-Relational Mapping) |
| **State** | React Hooks | `useState`, `useEffect` |



---

## Logic & Processing
The "Strategy Predictor" uses a linear degradation model to simulate race pace:
$$LapTime_{current} = BaseTime + (Lap \times WearRate)$$

* **Softs:** High grip, high wear rate ($0.25s$ per lap).
* **Mediums:** Balanced performance ($0.12s$ per lap).
* **Hards:** Consistent pace, low wear ($0.05s$ per lap).

---

## Installation & Setup

### 1. Prerequisites
* **Go** 1.2x or higher
* **Node.js** (v18+) & **npm**
* **MariaDB** (Running on port 3306)

### 2. Backend Setup
```bash
cd backend
go mod tidy
# Ensure your .env file is configured with DB_USER and DB_PASSWORD
go run main.go
```
### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
this will be available at `http://localhost:5173`.

### Database Architecture

The system uses GORM's AutoMigrate feature to maintain the following schema:
- race_tracks: ID, Name, Location, Laps, BaseLapTime.
- tire_compounds: ID, Name, WearRate, LifeSpan.


### Future Enhancements
- Interactive Charts: Visualizing the degradation curve with Chart.js.
- Pit Stop Logic: Adding "Box-Box" recommendations when tire health drops below 20%.
- Weather Engine: Processing the impact of rain on lap time coefficients.
