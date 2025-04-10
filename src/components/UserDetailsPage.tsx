import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  SelectChangeEvent,
} from '@mui/material';
import { ErrorMessage } from './ErrorMessage';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';

const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Sprawdź, czy użytkownik przybył z listy użytkowników
    const state = location.state as { from?: string } | null;
    setCanGoBack(state?.from === '/users' || false);
  }, [location]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://pyrhouse-backend-f26ml.ondigitalocean.app/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Nie udało się pobrać szczegółów użytkownika');

        const userData = await response.json();
        setUser(userData);
        setEditedUser(userData);
      } catch (err: any) {
        setError(err.message || 'Wystąpił nieoczekiwany błąd podczas pobierania szczegółów użytkownika.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser(user);
    setUpdateError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditedUser({
      ...editedUser,
      [name as string]: value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: value,
    });
  };

  const handleUpdateUser = async () => {
    setIsUpdating(true);
    setUpdateError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://pyrhouse-backend-f26ml.ondigitalocean.app/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullname: editedUser.fullname,
          username: editedUser.username,
          role: editedUser.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się zaktualizować danych użytkownika');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      setUpdateSuccess(true);
      
      // Ukryj komunikat sukcesu po 3 sekundach
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err: any) {
      setUpdateError(err.message || 'Wystąpił nieoczekiwany błąd podczas aktualizacji danych użytkownika.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!user) {
    return <ErrorMessage message="Nie znaleziono użytkownika" />;
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'moderator':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        {canGoBack && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users')}
            variant="outlined"
            color="primary"
          >
            Powrót do listy użytkowników
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Karta profilu */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '3rem'
                }}
              >
                {user.fullname ? user.fullname.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}
              </Avatar>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {user.fullname}
              </Typography>
              
              <Chip 
                label={user.role.toUpperCase()} 
                color={getRoleColor(user.role)} 
                sx={{ mb: 2 }}
                icon={<BadgeIcon />}
              />
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Box sx={{ width: '100%', mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">{user.username}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Dołączył: {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                  </Typography>
                </Box>
                
                {user.lastLogin && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Ostatnie logowanie: {new Date(user.lastLogin).toLocaleString('pl-PL')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Szczegółowe informacje */}
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Szczegółowe informacje
                </Typography>
                
                <Tooltip title="Edytuj użytkownika">
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                    size="small"
                  >
                    Edytuj
                  </Button>
                </Tooltip>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      ID Użytkownika
                    </Typography>
                    <Typography variant="body1">
                      {user.id}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nazwa użytkownika
                    </Typography>
                    <Typography variant="body1">
                      {user.username}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Pełne imię i nazwisko
                    </Typography>
                    <Typography variant="body1">
                      {user.fullname}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Rola
                    </Typography>
                    <Chip 
                      label={user.role.toUpperCase()} 
                      color={getRoleColor(user.role)} 
                      size="small"
                    />
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Data utworzenia konta
                    </Typography>
                    <Typography variant="body1">
                      {new Date(user.createdAt).toLocaleString('pl-PL')}
                    </Typography>
                  </Paper>
                </Grid>
                
                {user.lastLogin && (
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Ostatnie logowanie
                      </Typography>
                      <Typography variant="body1">
                        {new Date(user.lastLogin).toLocaleString('pl-PL')}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog edycji użytkownika */}
      <Dialog open={isEditing} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edytuj dane użytkownika</DialogTitle>
        <DialogContent>
          {updateError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {updateError}
            </Alert>
          )}
          
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Pełne imię i nazwisko"
              name="fullname"
              value={editedUser?.fullname || ''}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Nazwa użytkownika"
              name="username"
              value={editedUser?.username || ''}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Rola</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={editedUser?.role || ''}
                onChange={handleSelectChange}
                label="Rola"
              >
                <MenuItem value="user">Użytkownik</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} disabled={isUpdating}>
            Anuluj
          </Button>
          <Button 
            onClick={handleUpdateUser} 
            variant="contained" 
            color="primary"
            disabled={isUpdating}
          >
            {isUpdating ? <CircularProgress size={24} /> : 'Zapisz zmiany'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Komunikat sukcesu */}
      <Snackbar
        open={updateSuccess}
        autoHideDuration={3000}
        onClose={() => setUpdateSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setUpdateSuccess(false)} severity="success">
          Dane użytkownika zostały zaktualizowane pomyślnie
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDetailsPage; 