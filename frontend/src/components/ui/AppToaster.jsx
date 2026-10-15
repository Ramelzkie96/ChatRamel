import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 3500,
        style: {
          background: "#0b1226",
          color: "#ffffff",
          border: "1px solid #1a2340",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        },
        success: {
          iconTheme: { primary: "#22c55e", secondary: "#0b1226" },
        },
        error: {
          duration: 4500,
          iconTheme: { primary: "#ef4444", secondary: "#0b1226" },
        },
      }}
    />
  );
}