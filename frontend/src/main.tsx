  import { createRoot } from "react-dom/client";
  import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
  import Signup from "./app/Signup";
  import Login from "./app/Login";
  import Home from "./app/Home";
  import PhaserGame from "./app/PhaserGame";
  import PhaserGame1 from "./app/PhaserGame1";
  import PhaserGame2 from "./app/PhaserGame2";
  import PhaserGame3 from "./app/PhaserGame3";
  import PhaserGame4 from "./app/PhaserGame4";
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
          <Route
            path="/game2"
            element={
              <ProtectedWrapper>
                <PhaserGame1 />
              </ProtectedWrapper>
            }
          />
          <Route
            path="/game3"
            element={
              <ProtectedWrapper>
                <PhaserGame2 />
              </ProtectedWrapper>
            }
          />
          <Route
            path="/game4"
            element={
              <ProtectedWrapper>
                <PhaserGame3 />
              </ProtectedWrapper>
            }
          />
          <Route
            path="/game5"
            element={
              <ProtectedWrapper>
                <PhaserGame4 />
              </ProtectedWrapper>
            }
          />
          <Route path="/" element={<Navigate to="/signup" replace />} />

        </Routes>
      </Router>
    );
  }

  createRoot(document.getElementById("root")!).render(<App />);