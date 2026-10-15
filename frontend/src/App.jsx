import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import CallLayer from "./components/call/CallLayer";
import { SocketProvider } from "./context/SocketContext";
import { PresenceProvider } from "./context/PresenceContext";
import { ChatProvider } from "./context/ChatContext";
import { ContactProvider } from "./context/ContactContext";
import { NotificationProvider } from "./context/NotificationContext";
import { CallProvider } from "./context/CallContext";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SocketProvider>
              <PresenceProvider>
                <ChatProvider>
                  <ContactProvider>
                    <NotificationProvider>
                      <CallProvider>
                        <MainLayout />
                        <CallLayer />
                      </CallProvider>
                    </NotificationProvider>
                  </ContactProvider>
                </ChatProvider>
              </PresenceProvider>
            </SocketProvider>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}