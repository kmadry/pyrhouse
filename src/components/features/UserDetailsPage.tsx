// @ts-nocheck
import React, { useState, useEffect, Suspense, lazy } from 'react';
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
import { jwtDecode } from 'jwt-decode';
import { getApiUrl } from '../../config/api';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Schedule,
  CheckCircle,
  Cancel,
  LocalShipping,
  LocationOn,
} from '@mui/icons-material';
import { AppSnackbar } from '../ui/AppSnackbar';
import { useSnackbarMessage } from '../../hooks/useSnackbarMessage';

interface Transfer {
  ID: number;
  FromLocationID: number;
  FromLocationName: string;
  ToLocationID: number;
  ToLocationName: string;
  TransferDate: string;
  Status: 'in_transit' | 'completed' | 'cancelled';
}

const ArrowBackIcon = lazy(() => import('@mui/icons-material/ArrowBack'));
const EditIcon = lazy(() => import('@mui/icons-material/Edit'));
const PersonIcon = lazy(() => import('@mui/icons-material/Person'));
const CalendarTodayIcon = lazy(() => import('@mui/icons-material/CalendarToday'));
const AccessTimeIcon = lazy(() => import('@mui/icons-material/AccessTime'));
const BadgeIcon = lazy(() => import('@mui/icons-material/Badge'));
const EmailIcon = lazy(() => import('@mui/icons-material/Email'));
const StarIcon = lazy(() => import('@mui/icons-material/Star'));
const LockIcon = lazy(() => import('@mui/icons-material/Lock'));

const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const canGoBack = location.state?.from === '/users';
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbarMessage();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl(`/users/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Nie udało się pobrać danych użytkownika');
        }

        const data = await response.json();
        setUser(data);
        setEditedUser(data);
      } catch (err: any) {
        showSnackbar('error', 'Błąd podczas ładowania danych użytkownika', err.message || 'Wystąpił nieoczekiwany błąd');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  useEffect(() => {
    const fetchTransfers = async () => {
      if (!id) return;
      
      setTransfersLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Brak tokenu autoryzacji');
        }

        const status = tabValue === 0 ? 'in_transit' : 'completed';
                      
        const response = await fetch(
          getApiUrl(`/transfers/users/${id}?status=${status}`),
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 400 || response.status === 401) {
            showSnackbar('error', 'Nie udało się pobrać transferów. Spróbuj odświeżyć stronę.', 'Nie udało się pobrać transferów. Spróbuj odświeżyć stronę.');
            setTransfers([]);
            return;
          }
          throw new Error('Nie udało się pobrać transferów');
        }

        const data = await response.json();
        setTransfers(data);
      } catch (err) {
        showSnackbar('error', 'Błąd podczas pobierania transferów', err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
        setTransfers([]);
      } finally {
        setTransfersLoading(false);
      }
    };

    fetchTransfers();
  }, [id, tabValue]);

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
      return decoded.userID === Number(id) || decoded.role === 'admin';
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setEditedUser((prev: any) => ({ ...prev, [name]: value }));
  };

  // Zwraca tylko te pola, które zostały zmienione względem oryginału
  const getChangedFields = (original: any, edited: any) => {
    const diff: any = {};
    Object.keys(edited).forEach((key) => {
      if (edited[key] !== original[key]) {
        diff[key] = edited[key];
      }
    });
    return diff;
  };

  const handleUpdateUser = async () => {
    setIsUpdating(true);
    try {
      const changedFields = getChangedFields(user, editedUser);
      if (Object.keys(changedFields).length === 0) {
        showSnackbar('info', 'Nie wprowadzono żadnych zmian.');
        setIsUpdating(false);
        setIsEditing(false);
        return;
      }
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/users/${id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changedFields),
      });

      if (!response.ok) {
        throw new Error('Nie udało się zaktualizować danych użytkownika');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      showSnackbar('success', 'Dane użytkownika zostały zaktualizowane pomyślnie!');
    } catch (err: any) {
      showSnackbar('error', 'Nie udało się zaktualizować danych użytkownika', err.message || 'Wystąpił nieoczekiwany błąd');
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
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSnackbar('error', 'Hasła nie są identyczne', 'Hasła nie są identyczne');
      return;
    }

    setIsPasswordUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/users/${id}`), {
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
      showSnackbar('success', 'Hasło zostało zmienione pomyślnie!', 'Hasło zostało zmienione pomyślnie!');
    } catch (err: any) {
      showSnackbar('error', 'Nie udało się zmienić hasła', err.message || 'Wystąpił nieoczekiwany błąd');
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

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Użytkownik nie został znaleziony
        </Typography>
        <AppSnackbar
          open={snackbar.open}
          type={snackbar.type}
          message={snackbar.message}
          details={snackbar.details}
          onClose={closeSnackbar}
          autoHideDuration={snackbar.autoHideDuration}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 2,
        mb: 3 
      }}>
        {canGoBack && (
          <Suspense fallback={null}>
            <ArrowBackIcon />
          </Suspense>
        )}
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'medium' }}>
          Profil użytkownika
        </Typography>
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
                {user.fullname ? user.fullname.charAt(0).toUpperCase() : <Suspense fallback={null}><PersonIcon /></Suspense>}
              </Avatar>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {user.fullname}
              </Typography>
              
              <Chip 
                label={user.role.toUpperCase()} 
                color={getRoleColor(user.role)} 
                sx={{ mb: 2 }}
                icon={<Suspense fallback={null}><BadgeIcon /></Suspense>}
              />
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Box sx={{ width: '100%', mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Suspense fallback={null}>
                    <EmailIcon />
                  </Suspense>
                  <Typography variant="body1">{user.username}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Suspense fallback={null}>
                    <CalendarTodayIcon />
                  </Suspense>
                  <Typography variant="body2" color="text.secondary">
                    Dołączył: {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                  </Typography>
                </Box>
                
                {user.lastLogin && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Suspense fallback={null}>
                      <AccessTimeIcon />
                    </Suspense>
                    <Typography variant="body2" color="text.secondary">
                      Ostatnie logowanie: {new Date(user.lastLogin).toLocaleString('pl-PL')}
                    </Typography>
                  </Box>
                )}

                {/* Wyświetl punkty tylko dla administratorów */}
                {isAdmin() && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Suspense fallback={null}>
                      <StarIcon />
                    </Suspense>
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
                      startIcon={<Suspense fallback={null}><LockIcon /></Suspense>}
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
                <Suspense fallback={null}>
                  <EditIcon />
                </Suspense>
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

      <Card sx={{ mt: 4 }}>
        <CardHeader 
          title="Questy użytkownika"
          sx={{
            pb: { xs: 1, sm: 2 },
            '& .MuiCardHeader-title': {
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }
          }}
        />
        <Box sx={{ px: 2, pb: 1 }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{ 
              '& .MuiTab-root': {
                minWidth: 0,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                py: { xs: 1, sm: 1.5 },
                px: { xs: 1, sm: 2 }
              }
            }}
          >
            <Tab 
              icon={<Schedule />} 
              iconPosition="start" 
              label="W trakcie" 
              sx={{
                '& .MuiTab-iconWrapper': {
                  mr: { xs: 0.5, sm: 1 }
                }
              }}
            />
            <Tab 
              icon={<CheckCircle />} 
              iconPosition="start" 
              label="Ukończone" 
              sx={{
                '& .MuiTab-iconWrapper': {
                  mr: { xs: 0.5, sm: 1 }
                }
              }}
            />
          </Tabs>
        </Box>
        <CardContent sx={{ pt: { xs: 1, sm: 2 } }}>
          {transfersLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : transfers.length === 0 ? (
            <Alert severity="info">
              Brak transferów o wybranym statusie
            </Alert>
          ) : (
            <List sx={{ p: 0 }}>
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
                        p: 0,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <ListItemButton 
                        onClick={() => navigate(`/transfers/${transfer.ID}`)}
                        sx={{
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          p: 2
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          width: '100%',
                          mb: { xs: 1, sm: 0 }
                        }}>
                          <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 } }}>
                            <LocalShipping />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                Transfer #{transfer.ID}
                              </Typography>
                            }
                            sx={{ m: 0 }}
                          />
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
                            sx={{ ml: { xs: 'auto', sm: 2 } }}
                          />
                        </Box>
                        
                        <Box sx={{ 
                          width: '100%', 
                          mt: { xs: 1, sm: 0 },
                          pl: { xs: 0, sm: 7 }
                        }}>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2">
                              Z: {transfer.FromLocationName}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2">
                              Do: {transfer.ToLocationName}
                            </Typography>
                          </Box>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Utworzono: {formattedDate}
                          </Typography>
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

      <Dialog open={isPasswordDialogOpen} onClose={handlePasswordDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Zmiana hasła</DialogTitle>
        <DialogContent>
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

      <AppSnackbar
        open={snackbar.open}
        type={snackbar.type}
        message={snackbar.message}
        details={snackbar.details}
        onClose={closeSnackbar}
        autoHideDuration={snackbar.autoHideDuration}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default UserDetailsPage; 