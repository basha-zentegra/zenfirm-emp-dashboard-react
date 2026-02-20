import { useState, useEffect, useRef, useCallback } from "react";

const Stopwatch = ({ initialSeconds = 0 }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // ✅ Fix: use functional updater to read current isRunning
  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => {
      if (prev === true) {
        // Stopping → reset
        setTimeLeft(0);
      }
      return !prev;
    });
    console.log(formatTime(timeLeft));
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  return (
    <div style={styles.wrapper}>
      <span className="fw-medium text-muted" style={styles.time}>{formatTime(timeLeft)}</span>
      <button className="btn btn-sm fs-3 py-0 border-0" onClick={toggleTimer}>
        {isRunning ? <i class="bi bi-stop-circle text-danger"></i> : <i class="bi bi-play-circle text-success"></i>}
      </button>
    </div>
  );
};
const styles = {
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "1px 10px",
    borderRadius: "8px",
    fontSize: "18px",
  },
  time: {
    letterSpacing: "2px",
  },
  button: {
    border: "none",
    background: "black",
    color: "white",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    cursor: "pointer",
  },
};

export default Stopwatch
