import './App.css'
import Layout from './components/Layout'
import About from './pages/client/About'
import Contact from './pages/client/Contact'
import Home from './pages/client/Home'
import Sherbimet from './pages/client/Sherbimet'
import SignIn from './pages/authentication/SignIn'
import SignUp from './pages/authentication/SignUp'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Authentication routes */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Client routes */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/rreth-nesh" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/sherbimet" element={<Sherbimet />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

