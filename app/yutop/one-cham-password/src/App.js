import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import dogImage from "./one-cham.png";

function App() {
  const [password, setPassword] = useState("");

  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

  const randomString = (length) => {
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const generatePassword = () => {
    // 10%の確率で "bow-wow-bow-wow"
    if (Math.random() < 0.1) {
      setPassword("bow-wow-bow-wow");
      return;
    }

    const part1 = randomString(3);
    const part2 = randomString(3);
    setPassword(`bow-wow-${part1}-${part2}`);
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="mb-4 text-primary">One-Cham Password</h1>

      <h2 className="mb-3">Doggo will generate a password for you.</h2>
      <img
        src={dogImage}
        alt="Doggo wants me to connect to the network"
        className="img-fluid rounded shadow mb-4"
        style={{ maxWidth: "300px", cursor: "pointer" }}
        onClick={generatePassword}
      />

      {password && (
        <div className="card p-3 shadow-sm">
          <h3 className="text-monospace text-center mb-0">{password}</h3>
        </div>
      )}
    </div>
  );
}

export default App;
