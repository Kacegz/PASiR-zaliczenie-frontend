import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Rating,
  TextField,
  Box,
  IconButton,
  Tooltip,
  CardActions,
  Button,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

const TeaList = () => {
  const [teas, setTeas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTeas()
  }, [user])

  const fetchTeas = async () => {
    try {
      const response = await axios.get('/api/teas')
      setTeas(response.data)
    } catch (error) {
      toast.error('Failed to fetch teas')
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this tea?')) return

    try {
      await axios.delete(`/api/teas/${id}`)
      setTeas((prevTeas) => prevTeas.filter((tea) => tea.id !== id))
      toast.success('Tea deleted successfully')
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Not enough permissions to delete this tea')
      } else {
        toast.error('Failed to delete tea')
      }
    }
  }

  const handleEdit = (id, e) => {
    e.stopPropagation()
    navigate(`/teas/${id}/edit`)
  }

  const filteredTeas = teas.filter((tea) =>
    tea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tea.origin.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          label="Search teas"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        {user && (
          <Tooltip title="Add new tea">
            <IconButton
              color="primary"
              onClick={() => navigate('/teas/add')}
              sx={{ ml: 2 }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Grid container spacing={3}>
        {filteredTeas.map((tea) => (
          <Grid item key={tea.id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <CardActionArea onClick={() => navigate(`/teas/${tea.id}`)}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {tea.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {tea.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Origin: {tea.origin}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Created by: {tea.createdBy}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Rating value={tea.averageRating || 0} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({tea.averageRating ? tea.averageRating.toFixed(1) : 'No ratings'})
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/teas/${tea.id}`)}>
                  View Details
                </Button>
              </CardActions>
              {(isAdmin || (user && tea.createdBy === user.sub)) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 1,
                  }}
                >
                  <Tooltip title="Edit tea">
                    <IconButton
                      size="small"
                      onClick={(e) => handleEdit(tea.id, e)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete tea">
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(tea.id, e)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default TeaList 