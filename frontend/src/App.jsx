import './App.css'
import Layout from './components/Layout'
import UserLayout from './components/UserLayout'
import About from './pages/client/About'
import Contact from './pages/client/Contact'
import Home from './pages/client/Home'
import Sherbimet from './pages/client/Sherbimet'
import SignIn from './pages/authentication/SignIn'
import SignUp from './pages/authentication/SignUp'
import SignUpSuccess from './pages/authentication/SignUpSuccess'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientDashboard from './pages/logged_in/perdoruesi/ClientDashboard'

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
            <Route path="/home" element={<Home />} /> 
            <Route path="/home" element={<Home />} />
            <Route path="/rreth-nesh" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/sherbimet" element={<Sherbimet />} />
          </Route>

          {/* Logged in routes (Protected) */}
          <Route element={<UserLayout />}>
            <Route path="/dashboard" element={<ClientDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

