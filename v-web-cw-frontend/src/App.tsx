import './App.css'
import Home from './pages/Home'
import Header from './components/Header'
import { ResultProvider } from './contexts/ResultContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import ProfilePage from './pages/Profile'
import { Outlet } from 'react-router-dom'
import Like from './pages/Like'

function MainLayout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <ResultProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/likes" element={<Like />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </ResultProvider>
  )
}

export default App;
