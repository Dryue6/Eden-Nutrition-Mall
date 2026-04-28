/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Category from './pages/Category';
import ProductDetail from './pages/ProductDetail';
import Seckill from './pages/Seckill';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import AddressList from './pages/AddressList';

// Auth Guard Component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Layout Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="category" element={<Category />} />
          <Route path="seckill" element={<Seckill />} />
          <Route path="cart" element={<AuthGuard><Cart /></AuthGuard>} />
          <Route path="profile" element={<AuthGuard><Profile /></AuthGuard>} />
        </Route>

        {/* Full Page Routes */}
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
        <Route path="/orders" element={<AuthGuard><OrderList /></AuthGuard>} />
        <Route path="/order/:orderNo" element={<AuthGuard><OrderDetail /></AuthGuard>} />
        <Route path="/address" element={<AuthGuard><AddressList /></AuthGuard>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


