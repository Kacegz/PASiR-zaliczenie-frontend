import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import TeaList from './pages/TeaList'
import TeaDetails from './pages/TeaDetails'
import AddTea from './pages/AddTea'
import EditTea from './pages/EditTea'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/teas" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/teas" element={<TeaList />} />
            <Route path="/teas/:id" element={<TeaDetails />} />
            <Route
              path="/teas/add"
              element={<AddTea />}
            />
            <Route
              path="/teas/:id/edit"
              element={<EditTea />}
            />
          </Routes>
        </Box>
      </Box>
    </AuthProvider>
  )
}

export default App
