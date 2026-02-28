import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import CartSidebar from './components/CartSidebar';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import GioiThieuPage from './pages/GioiThieuPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-fullscreen">
        <div className="spinner" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public pages — all share the Navbar via Layout */}
            <Route path="/" element={<Layout><LandingPage /></Layout>} />
            <Route path="/san-pham"      element={<Layout><ProductsPage /></Layout>} />
            <Route path="/san-pham/:id"  element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/checkout"      element={<Layout><CheckoutPage /></Layout>} />
            <Route path="/lien-he"       element={<Layout><ContactPage /></Layout>} />
            <Route path="/gioi-thieu"    element={<Layout><GioiThieuPage /></Layout>} />

            {/* Admin pages — no Layout (have their own styling) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <CartSidebar />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
