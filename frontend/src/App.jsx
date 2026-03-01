import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import CartSidebar from './components/CartSidebar';
import LoginModal from './components/LoginModal';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import GioiThieuPage from './pages/GioiThieuPage';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }) {
  const { user, loading, openLoginModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      openLoginModal();
      navigate('/', { replace: true });
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="loading-fullscreen">
        <div className="spinner" />
      </div>
    );
  }
  if (!user) return null;
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

            {/* Admin */}
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
          <LoginModal />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
