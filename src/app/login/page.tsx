"use client"; // Mark this as a client component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Use from next/navigation
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import styles from "./Login.module.css";

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");
    if (loginStatus === "true") {
      setIsLoggedIn(true);
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      <div className={styles.leftSide}>
        <h1 className={styles.heading}>Monitoring Dashboard</h1>
        <p className={styles.subHeading}>
          Yogyakarta Smart Freeway Street Light System
        </p>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.rightSide}>
        <div className={styles.copyright}></div>
        <div>
          <h2 className={styles.greeting}>Hello Admin!</h2>
          <p className={styles.welcomeText}>Welcome Back</p>
          <form onSubmit={handleLogin} className={styles.form}>
            <div>
              <div style={{ position: "relative" }}>
                <FontAwesomeIcon
                  icon={faUser}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div style={{ position: "relative", marginTop: "10px" }}>
                <FontAwesomeIcon
                  icon={faLock}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
        </div>
        <div className={styles.copyright}>
          <p>&copy; Tim Capstone (C_09) DTETI FT UGM</p>
        </div>
      </div>
    </div>
  );
};

export default Login;