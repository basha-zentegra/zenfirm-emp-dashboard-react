// Toast.jsx
import { useEffect } from "react";
// import "./toast.css";
import "../../css/toast.css"

const icons = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export default function Toast({type = "info", message, duration = 3000, onClose,}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  console.log(message)

  return (
    <div className={`toast1 toast1-${type} bg-primary`}>
      <div className="toast1-icon">
        {icons[type]}
      </div>

      <div className="toast1-content">
        <div className="toast1-title">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>
        <div>{message}</div>
      </div>

      <button className="toast1-close cursor-pointer" onClick={onClose}>
        ×
      </button>

    </div>
  );
}