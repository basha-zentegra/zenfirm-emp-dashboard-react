// ToastContainer.jsx
import "../../css/toast.css"
import "../../css/toast.css"
import Toast from "./Toast";

export default function ToastContainer({ toasts, removeToast }) {


  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />

      ))}
    </div>
  );
}

// removeToast(toast.id); console.log("Clear is clicked!!");