import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";

function App() {
  return (
    <Router>
      <Routes>
        {/* Define a route for the root path */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sign-in" element={<SignIn />} />
      </Routes>
    </Router>
  );
}

// Create a simple Home component
const Home = () => {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the root page.</p>
    </div>
  );
};

export default App;
