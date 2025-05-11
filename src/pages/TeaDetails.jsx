import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Box,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

const TeaDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [tea, setTea] = useState(null)
  const [userRating, setUserRating] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      await fetchTeaDetails()
      if (user) {
        await fetchUserRating()
      }
    }
    fetchData()
  }, [id])

  useEffect(() => {
    if (user) {
      fetchUserRating()
    }
  }, [user])

  const fetchTeaDetails = async () => {
    try {
      const response = await axios.get(`/api/teas/${id}`)
      setTea(response.data)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch tea details')
      navigate('/teas')
    }
  }

  const fetchUserRating = async () => {
    try {
      const response = await axios.get(`/api/teas/${id}/israted`)
      setUserRating(response.data.rating || 0)
    } catch (error) {
      console.error('Failed to fetch user rating:', error)
    }
  }

  const handleRatingChange = async (event, newValue) => {
    if (!user) {
      toast.info('Please log in to rate teas')
      return
    }

    try {
      await axios.post(`/api/teas/${id}/rate`, { score: newValue })
      setUserRating(newValue)
      fetchTeaDetails()
      toast.success('Rating submitted successfully')
    } catch (error) {
      toast.error('Failed to submit rating')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tea?')) return

    try {
      await axios.delete(`/api/teas/${id}`)
      toast.success('Tea deleted successfully')
      navigate('/teas')
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Not enough permissions to delete this tea')
      } else {
        toast.error('Failed to delete tea')
      }
    }
  }

  const handleEdit = () => {
    navigate(`/teas/${id}/edit`)
  }

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {tea.name}
          </Typography>
          {(isAdmin || (user && tea.createdBy === user.sub)) && (
            <Box>
              <Tooltip title="Edit tea">
                <IconButton
                  onClick={handleEdit}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete tea">
                <IconButton onClick={handleDelete} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        <Typography variant="body1" paragraph>
          {tea.description}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Origin: {tea.origin}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating
            value={tea.averageRating || 0}
            readOnly
            size="large"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({tea.averageRating ? tea.averageRating.toFixed(1) : 'No ratings'})
          </Typography>
        </Box>
        {user && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your Rating:
            </Typography>
            <Rating
              value={userRating}
              onChange={handleRatingChange}
              disabled={userRating > 0}
            />
            {userRating > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                You have already rated this tea
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default TeaDetails 