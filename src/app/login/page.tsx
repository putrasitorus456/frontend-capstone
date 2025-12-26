"use client"; // Mark this as a client component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import styles from "./Login.module.css";

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error before login attempt

    // Check if the username and password are correct
    if (username === "admin" && password === "admin") {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      router.push("/dashboard");
    } else {
      setError("Username atau password salah.");
    }
  };

  return (
    <div className={styles.container}>
      {/* Left side section */}
      <div className={styles.leftSide}>
        <h1 className={styles.heading}>Monitoring Dashboard</h1>
        <p className={styles.subHeading}>Yogyakarta Smart Freeway Street Light System</p>
      </div>

      {/* Right side section (form) */}
      <div className={styles.rightSide}>
        <h2 className={styles.greeting}>Hello Again!</h2>
        <p className={styles.welcomeText}>Please enter your login details below.</p>
        
        <form className={styles.form} onSubmit={handleLogin}>
          {/* Username input field */}
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faUser} className={styles.icon} />
            <input
              type="text"
              placeholder="Username"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Controlled input
            />
          </div>

          {/* Password input field */}
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faLock} className={styles.icon} />
            <input
              type="password"
              placeholder="Password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Controlled input
            />
          </div>

          {/* Login button */}
          <button type="submit" className={styles.loginButton}>
            Login
          </button>

          {/* Conditionally rendered error message */}
          {error && (
            <p className={styles.error}>
              <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
            </p>
          )}
        </form>
        
        {/* Copyright information */}
        <p className={styles.copyright}>
          Tim Capstone C-09 DTETI FT UGM
        </p>
      </div>
    </div>
  );
};

export default Login;