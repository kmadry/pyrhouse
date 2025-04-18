// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
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
  CardHeader,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Schedule,
  CheckCircle,
  Cancel,
  LocalShipping,
  LocationOn,
} from '@mui/icons-material';

interface Transfer {
  ID: number;
  FromLocationID: number;
  FromLocationName: string;
  ToLocationID: number;
  ToLocationName: string;
  TransferDate: string;
  Status: 'in_transit' | 'completed' | 'cancelled';
}

const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const canGoBack = location.state?.from === '/users';
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [transfersError, setTransfersError] = useState<string | null>(null);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl(`/users/${userId}`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Nie udało się pobrać danych użytkownika');
        }

        const data = await response.json();
        setUser(data);
        setEditedUser(data);
      } catch (err: any) {
        setError(err.message || 'Wystąpił nieoczekiwany błąd');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const fetchTransfers = async () => {
      if (!userId) return;
      
      setTransfersLoading(true);
      setTransfersError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Brak tokenu autoryzacji');
        }

        const status = tabValue === 0 ? 'in_transit' : 'completed';
                      
        const response = await fetch(
          getApiUrl(`/transfers/users/${userId}?status=${status}`),
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 400 || response.status === 401) {
            setTransfersError('Nie udało się pobrać transferów. Spróbuj odświeżyć stronę.');
            setTransfers([]);
            return;
          }
          throw new Error('Nie udało się pobrać transferów');
        }

        const data = await response.json();
        setTransfers(data);
      } catch (err) {
        setTransfersError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
        setTransfers([]);
      } finally {
        setTransfersLoading(false);
      }
    };

    fetchTransfers();
  }, [userId, tabValue]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'moderator':
        return 'warning';
      default:
        return 'info';
    }
  };

  const isAdmin = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const decoded = jwtDecode(token) as any;
      return decoded.role === 'admin';
    } catch {
      return false;
    }
  };

  const canChangePassword = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const decoded = jwtDecode(token) as any;
      return decoded.userID === Number(userId) || decoded.role === 'admin';
    } catch {
      return false;
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser(user);
    setUpdateError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setEditedUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/users/${userId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) {
        throw new Error('Nie udało się zaktualizować danych użytkownika');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      setUpdateSuccess(true);
    } catch (err: any) {
      setUpdateError(err.message || 'Wystąpił nieoczekiwany błąd');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordDialogOpen = () => {
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordDialogClose = () => {
    setIsPasswordDialogOpen(false);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setPasswordError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Hasła nie są identyczne');
      return;
    }

    setIsPasswordUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/users/${userId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passwordData.newPassword }),
      });

      if (!response.ok) {
        throw new Error('Nie udało się zmienić hasła');
      }

      handlePasswordDialogClose();
      setPasswordSuccess(true);
    } catch (err: any) {
      setPasswordError(err.message || 'Wystąpił nieoczekiwany błąd');
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorMessage message="Błąd podczas ładowania danych użytkownika" details={error} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Użytkownik nie został znaleziony
        </Typography>
      </Box>
    );
  }

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

      <Card sx={{ mt: 4 }}>
        <CardHeader 
          title="Questy użytkownika"
          action={
            <Tabs 
              value={tabValue} 
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                icon={<Schedule />} 
                iconPosition="start" 
                label="W trakcie" 
              />
              <Tab 
                icon={<CheckCircle />} 
                iconPosition="start" 
                label="Ukończone" 
              />
            </Tabs>
          }
        />
        <CardContent>
          {transfersLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : transfersError ? (
            <Alert severity="error">{transfersError}</Alert>
          ) : transfers.length === 0 ? (
            <Alert severity="info">
              Brak transferów o wybranym statusie
            </Alert>
          ) : (
            <List>
              {transfers.map((transfer) => {
                try {
                  const formattedDate = format(new Date(transfer.TransferDate), 'PPpp', { locale: pl });
                  return (
                    <ListItem 
                      key={transfer.ID}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 2,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <ListItemButton onClick={() => navigate(`/transfers/${transfer.ID}`)}>
                        <ListItemIcon>
                          <LocalShipping />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              Transfer #{transfer.ID}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Box display="flex" alignItems="center" gap={1} mt={1}>
                                <LocationOn fontSize="small" color="action" />
                                <Typography variant="body2">
                                  Z: {transfer.FromLocationName}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LocationOn fontSize="small" color="action" />
                                <Typography variant="body2">
                                  Do: {transfer.ToLocationName}
                                </Typography>
                              </Box>
                              <Typography variant="caption" display="block" mt={1}>
                                Utworzono: {formattedDate}
                              </Typography>
                            </>
                          }
                        />
                        <Box display="flex" alignItems="center" gap={2}>
                          <Chip
                            label={
                              transfer.Status === 'in_transit' ? 'Oczekujący' :
                              transfer.Status === 'completed' ? 'Potwierdzony' : 'Anulowany'
                            }
                            color={
                              transfer.Status === 'in_transit' ? 'warning' :
                              transfer.Status === 'completed' ? 'success' : 'error'
                            }
                            size="small"
                          />
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  );
                } catch (err) {
                  console.error('Błąd podczas formatowania daty:', err);
                  return null;
                }
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDetailsPage; 