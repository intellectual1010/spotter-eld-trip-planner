import TripForm from "./components/TripForm";
import "./App.css";

function App() {
  return (
    <main className="app">
      <header className="hero">
        <div className="logo">SPOTTER</div>

        <h1>Driver Trip Planner</h1>

        <p>
          Route planning and Hours of Service compliance
          for property-carrying drivers.
        </p>
      </header>

      <TripForm />
    </main>
  );
}

export default App;