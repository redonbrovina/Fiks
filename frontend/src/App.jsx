import './App.css'
import Layout from './components/Layout'
import About from './pages/client/About'
import Contact from './pages/client/Contact'
import Home from './pages/client/Home'
import Sherbimet from './pages/client/Sherbimet'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
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
