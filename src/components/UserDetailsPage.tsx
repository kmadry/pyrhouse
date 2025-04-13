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
  IconButton,
} from '@mui/material';
import { ErrorMessage } from './ErrorMessage';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';
import { jwtDecode } from 'jwt-decode';
import { getApiUrl } from '../config/api';

interface JwtPayload {
  role: string;
  exp: number;
  userID: number;
}

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
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    // Pobierz rolę i ID zalogowanego użytkownika z tokenu JWT
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        setCurrentUserRole(decodedToken.role);
        setCurrentUserId(decodedToken.userID);
      } catch (error) {
        console.error('Błąd dekodowania tokenu:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Sprawdź, czy użytkownik przybył z listy użytkowników
    const state = location.state as { from?: string } | null;
    setCanGoBack(state?.from === '/users' || false);
  }, [location]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl(`/users/${userId}`), {
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
      const response = await fetch(getApiUrl(`/users/${userId}`), {
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

  const handlePasswordDialogOpen = () => {
    setIsPasswordDialogOpen(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
  };

  const handlePasswordDialogClose = () => {
    setIsPasswordDialogOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordUpdate = async () => {
    // Walidacja hasła
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Nowe hasła nie są identyczne');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Nowe hasło musi mieć co najmniej 6 znaków');
      return;
    }

    setIsPasswordUpdating(true);
    setPasswordError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/users/${userId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się zaktualizować hasła');
      }

      setPasswordSuccess(true);
      handlePasswordDialogClose();
      
      // Ukryj komunikat sukcesu po 3 sekundach
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Wystąpił nieoczekiwany błąd podczas aktualizacji hasła');
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  // Funkcja sprawdzająca, czy zalogowany użytkownik jest administratorem
  const isAdmin = () => {
    return currentUserRole === 'admin';
  };

  // Funkcja sprawdzająca, czy użytkownik może zmienić hasło
  const canChangePassword = () => {
    return isAdmin() || (currentUserId && currentUserId.toString() === userId);
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Ostatnie logowanie: {new Date(user.lastLogin).toLocaleString('pl-PL')}
                    </Typography>
                  </Box>
                )}

                {/* Wyświetl punkty tylko dla administratorów */}
                {isAdmin() && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="body1" fontWeight="bold">
                      Punkty: {user.points || 0}
                    </Typography>
                  </Box>
                )}

                {/* Przycisk zmiany hasła */}
                {canChangePassword() && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={handlePasswordDialogOpen}
                      color="primary"
                    >
                      Zmień hasło
                    </Button>
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
                <Typography variant="h6" gutterBottom>
                  Szczegółowe informacje
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  disabled={isEditing}
                >
                  Edytuj
                </Button>
              </Box>

              {isEditing ? (
                <Box component="form" sx={{ mt: 2 }}>
                  <TextField
                    label="Imię i nazwisko"
                    name="fullname"
                    value={editedUser.fullname}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Nazwa użytkownika"
                    name="username"
                    value={editedUser.username}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="role-label">Rola</InputLabel>
                    <Select
                      labelId="role-label"
                      name="role"
                      value={editedUser.role}
                      onChange={handleSelectChange}
                      label="Rola"
                    >
                      <MenuItem value="user">Użytkownik</MenuItem>
                      <MenuItem value="moderator">Moderator</MenuItem>
                      <MenuItem value="admin">Administrator</MenuItem>
                    </Select>
                  </FormControl>

                  {updateError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {updateError}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                    <Button variant="outlined" onClick={handleCancelEdit}>
                      Anuluj
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateUser}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <CircularProgress size={24} /> : 'Zapisz'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Imię i nazwisko
                      </Typography>
                      <Typography variant="body1">{user.fullname}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nazwa użytkownika
                      </Typography>
                      <Typography variant="body1">{user.username}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Rola
                      </Typography>
                      <Chip label={user.role.toUpperCase()} color={getRoleColor(user.role)} size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Data utworzenia konta
                      </Typography>
                      <Typography variant="body1">
                        {new Date(user.createdAt).toLocaleString('pl-PL')}
                      </Typography>
                    </Grid>
                    {user.lastLogin && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ostatnie logowanie
                        </Typography>
                        <Typography variant="body1">
                          {new Date(user.lastLogin).toLocaleString('pl-PL')}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={updateSuccess}
        autoHideDuration={3000}
        onClose={() => setUpdateSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setUpdateSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Dane użytkownika zostały zaktualizowane pomyślnie!
        </Alert>
      </Snackbar>

      {/* Dialog zmiany hasła */}
      <Dialog open={isPasswordDialogOpen} onClose={handlePasswordDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Zmiana hasła</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nowe hasło"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Potwierdź nowe hasło"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose} disabled={isPasswordUpdating}>
            Anuluj
          </Button>
          <Button 
            onClick={handlePasswordUpdate} 
            variant="contained" 
            color="primary"
            disabled={isPasswordUpdating}
          >
            {isPasswordUpdating ? <CircularProgress size={24} /> : 'Zmień hasło'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Komunikat sukcesu dla zmiany hasła */}
      <Snackbar
        open={passwordSuccess}
        autoHideDuration={3000}
        onClose={() => setPasswordSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setPasswordSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Hasło zostało zmienione pomyślnie!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDetailsPage; 