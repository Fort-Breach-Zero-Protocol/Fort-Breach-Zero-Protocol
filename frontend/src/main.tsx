
  import { createRoot } from "react-dom/client";
  import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
  import Signup from "./app/Signup";
  import Login from "./app/Login";
  import Home from "./app/Home";
  import PhaserGame from "./app/PhaserGame";
  import ProtectedWrapper from "./app/ProtectedWrapper";
  import PublicWrapper from "./app/PublicWrapper";
  import "./styles/index.css";

  function App() {
    return (
      <Router>
        <Routes>
          <Route
            path="/signup"
            element={
              <PublicWrapper>
                <Signup />
              </PublicWrapper>
            }
          />
          <Route
            path="/login"
            element={
              <PublicWrapper>
                <Login />
              </PublicWrapper>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedWrapper>
                <Home />
              </ProtectedWrapper>
            }
          />
          <Route
            path="/game"
            element={
              <ProtectedWrapper>
                <PhaserGame />
              </ProtectedWrapper>
            }
          />
          <Route path="/" element={<Navigate to="/signup" replace />} />
        </Routes>
      </Router>
    );
  }

  createRoot(document.getElementById("root")!).render(<App />);
  