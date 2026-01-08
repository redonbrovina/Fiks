import './App.css'
import Layout from './components/Layout'
import UserLayout from './components/UserLayout'
import AdminLayout from './components/AdminLayout'
import About from './pages/client/About'
import Home from './pages/client/Home'
import Sherbimet from './pages/client/Sherbimet'
import SignIn from './pages/authentication/SignIn'
import SignUp from './pages/authentication/SignUp'
import SignUpSuccess from './pages/authentication/SignUpSuccess'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientDashboard from './pages/logged_in/perdoruesi/ClientDashboard'
import AdminDashboard from './pages/logged_in/admin/AdminDashboard'
import UserManagement from './pages/logged_in/admin/UserManagement'
import ProfessionalsManagement from './pages/logged_in/admin/ProfessionalsManagement'
import AdminBookings from './pages/logged_in/admin/AdminBookings'
import ProfessionalDashboard from './pages/logged_in/perdoruesi/ProfessionalDashboard'
import Marketplace from './pages/logged_in/perdoruesi/Marketplace'
import AddService from './pages/logged_in/perdoruesi/AddService'
import Bookings from './pages/logged_in/perdoruesi/Bookings'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Authentication routes */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup-success" element={<SignUpSuccess />} />

          {/* Client routes (Public) */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/rreth-nesh" element={<About />} />
            <Route path="/sherbimet" element={<Sherbimet />} />
          </Route>

          {/* Logged in routes (user) */}
          <Route element={<UserLayout />}>
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/professional-dashboard" element={<ProfessionalDashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/add-service" element={<AddService />} />
            <Route path="/bookings" element={<Bookings />} />
          </Route>

          {/* Logged in routes (admin) */}
          <Route element={<AdminLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/professionals" element={<ProfessionalsManagement />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

