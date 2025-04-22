import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Toolbar,
  Typography,
  Menu as MuiMenu,
  MenuItem,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  Switch
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styles from './Layout.styles';
import pyrkonLogo from '../assets/images/p-logo.svg';
import { useThemeMode } from '../theme/ThemeContext';
import { jwtDecode } from 'jwt-decode';
import { useTokenValidation } from '../hooks/useTokenValidation';
import { useStorage } from '../hooks/useStorage';
import { useAnimationPreference } from '../hooks/useAnimationPreference';
import QuestBoardTransition from './animations/QuestBoardTransition';
import { LocationTransition } from './animations/LocationTransition';

// Lazy loading dla ikon
const MenuIcon = lazy(() => import('@mui/icons-material/Menu'));
const Home = lazy(() => import('@mui/icons-material/Home'));
const AutoAwesome = lazy(() => import('@mui/icons-material/AutoAwesome'));
const RocketLaunch = lazy(() => import('@mui/icons-material/RocketLaunch'));
const Quiz = lazy(() => import('@mui/icons-material/Quiz'));
const Castle = lazy(() => import('@mui/icons-material/Castle'));
const Inventory2 = lazy(() => import('@mui/icons-material/Inventory2'));
const AddTask = lazy(() => import('@mui/icons-material/AddTask'));
const Warehouse = lazy(() => import('@mui/icons-material/Warehouse'));
const EditLocationAlt = lazy(() => import('@mui/icons-material/EditLocationAlt'));
const Category = lazy(() => import('@mui/icons-material/Category'));
const People = lazy(() => import('@mui/icons-material/People'));
const AdminPanelSettings = lazy(() => import('@mui/icons-material/AdminPanelSettings'));
const Person = lazy(() => import('@mui/icons-material/Person'));
const ExpandMore = lazy(() => import('@mui/icons-material/ExpandMore'));
const AccountCircle = lazy(() => import('@mui/icons-material/AccountCircle'));
const LightMode = lazy(() => import('@mui/icons-material/LightMode'));
const DarkMode = lazy(() => import('@mui/icons-material/DarkMode'));
const Animation = lazy(() => import('@mui/icons-material/Animation'));
const BlockTwoTone = lazy(() => import('@mui/icons-material/BlockTwoTone'));
const Logout = lazy(() => import('@mui/icons-material/Logout'));
const Help = lazy(() => import('@mui/icons-material/Help'));

// Komponent do opakowywania lazy-loaded ikon
const LazyIcon = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Box sx={{ width: 24, height: 24 }} />}>
    {children}
  </Suspense>
);

interface JwtPayload {
  role: string;
  userID: number;
  exp: number;
}

// Stała określająca margines bezpieczeństwa w sekundach (5 minut)
const SAFETY_MARGIN = 5 * 60;

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path?: string;
  label: string;
  icon: React.ReactNode;
  type?: 'divider';
}

const Icons = {
  Home,
  AutoAwesome,
  RocketLaunch,
  Quiz,
  Castle,
  Inventory2,
  AddTask,
  Warehouse,
  EditLocationAlt,
  Category,
  People,
  AdminPanelSettings,
  Menu: MenuIcon,
  Person,
  ExpandMore,
  AccountCircle,
  LightMode,
  DarkMode,
  Animation,
  BlockTwoTone,
  Logout,
  Help
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isTokenValid } = useTokenValidation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const { themeMode, setThemeMode } = useThemeMode();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeItem, setActiveItem] = useState<string>('');
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollTimer, setScrollTimer] = useState<NodeJS.Timeout | null>(null);
  const SCROLL_THRESHOLD = 50; // Minimalny próg przewijania w pikselach
  const SCROLL_DELAY = 150; // Opóźnienie w milisekundach (tylko dla chowania paska)
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);
  const [showQuestTransition, setShowQuestTransition] = useState(false);
  const [showLocationTransition, setShowLocationTransition] = useState(false);
  const { prefersAnimations, toggleAnimations, isSystemReducedMotion } = useAnimationPreference();
  const { getToken, removeToken } = useStorage();

  const handleLogout = useCallback(() => {
    removeToken();
    navigate('/login');
  }, [navigate, removeToken]);

  // Walidacja tokenu
  useEffect(() => {
    const token = getToken();
    if (!token || !isTokenValid) {
      handleLogout();
      return;
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      
      // Dodajemy margines bezpieczeństwa - token jest uznawany za nieważny 5 minut przed faktycznym wygaśnięciem
      if (decodedToken.exp < currentTime + SAFETY_MARGIN) {
        handleLogout();
        return;
      }
      
      setUserRole(decodedToken.role);
      setUserId(decodedToken.userID);
    } catch (error) {
      console.error('Błąd dekodowania tokenu:', error);
      handleLogout();
    }
  }, [isTokenValid, handleLogout, getToken]);

  // Obsługa resize i scroll
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 600;
      setOpen(!mobile);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Sprawdź, czy przekroczono próg przewijania
      if (Math.abs(currentScrollY - lastScrollY) < SCROLL_THRESHOLD) {
        return;
      }

      // Przewijanie w górę - natychmiastowa reakcja
      if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
        setLastScrollY(currentScrollY);
        return;
      }

      // Przewijanie w dół - opóźniona reakcja
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }

      const newTimer = setTimeout(() => {
        setScrollDirection('down');
        setLastScrollY(currentScrollY);
      }, SCROLL_DELAY);

      setScrollTimer(newTimer);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
    };
  }, [lastScrollY, scrollTimer]);

  // Ustaw aktywny element na podstawie aktualnej ścieżki
  useEffect(() => {
    const path = window.location.pathname;
    setActiveItem(path);
  }, []);

  const toggleDrawer = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  // Jeśli token jest nieważny, nie renderuj komponentu
  if (!isTokenValid) {
    return null;
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    // Ustawiamy nowy tryb motywu bez zamykania menu
    setThemeMode(newMode);
  };

  const handleProfileClick = () => {
    if (userId) {
      navigate(`/users/${userId}`);
    }
  };

  // Funkcja sprawdzająca, czy użytkownik ma uprawnienia administratora
  const hasAdminAccess = () => {
    return userRole === 'admin' || userRole === 'moderator';
  };

  const handleMenuItemClick = (path: string): void => {
    if ((path === '/quests' || path === '/locations') && prefersAnimations && !isSystemReducedMotion) {
      if (path === '/quests') {
        setShowQuestTransition(true);
      } else {
        setShowLocationTransition(true);
      }
      window.setTimeout(() => {
        navigate(path);
      }, 500);
    } else {
      navigate(path);
    }
    setActiveItem(path);
    
    // Zamykamy sidebar na urządzeniach mobilnych po kliknięciu w element menu
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleTransitionComplete = (): void => {
    setShowQuestTransition(false);
    setShowLocationTransition(false);
  };

  const menuItems: MenuItem[] = [
    { path: '/home', label: 'Home', icon: <Icons.Home /> },
    { 
      type: 'divider',
      label: 'Questy',
      icon: <Icons.AutoAwesome sx={{ fontSize: '0.9rem' }} />
    },
    { path: '/transfers/create', label: 'Nowy quest', icon: <Icons.RocketLaunch /> },
    { path: '/transfers', label: 'Questy', icon: <Icons.Quiz /> },
    { path: '/quests', label: 'Quest Board', icon: <Icons.Castle /> },
    { 
      type: 'divider',
      label: 'Magazyn',
      icon: <Icons.Inventory2 sx={{ fontSize: '0.9rem' }} />
    },
    { path: '/add-item', label: 'Dodaj sprzęt', icon: <Icons.AddTask /> },
    { path: '/list', label: 'Stan Magazynowy', icon: <Icons.Warehouse /> },
    { path: '/locations', label: 'Lokalizacje', icon: <Icons.EditLocationAlt /> },
  ];

  const adminMenuItems = [
    { path: '/categories', label: 'Kategorie', icon: <Icons.Category /> },
    { path: '/users', label: 'Użytkownicy', icon: <Icons.People /> },
  ];

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      pt: 1
    }}>      
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item, index) => (
          item.type === 'divider' ? (
            <Box key={`divider-${index}`}>
              <Divider sx={{ my: 1.5, mx: 2 }} />
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                sx={{ 
                  px: 3, 
                  py: 0.8,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <LazyIcon>
                  {item.icon}
                </LazyIcon>
                {item.label}
              </Typography>
            </Box>
          ) : (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => item.path && handleMenuItemClick(item.path)}
                sx={{
                  borderRadius: '6px',
                  mx: 1.5,
                  my: 0.3,
                  backgroundColor: activeItem === item.path ? 'primary.light' : 'transparent',
                  color: activeItem === item.path ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: activeItem === item.path ? 'primary.main' : 'action.hover',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  py: 1.2,
                  pl: 2,
                  fontSize: '0.9rem',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: activeItem === item.path ? '70%' : '0%',
                    backgroundColor: 'primary.main',
                    borderRadius: '0 4px 4px 0',
                    transition: 'height 0.2s ease-in-out'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: activeItem === item.path ? 'primary.contrastText' : 'primary.main',
                  minWidth: '36px',
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.3rem'
                  }
                }}>
                  <LazyIcon>
                    {item.icon}
                  </LazyIcon>
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontWeight: activeItem === item.path ? 500 : 400,
                    fontSize: '0.9rem',
                    letterSpacing: '0.01em'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>

      {hasAdminAccess() && (
        <>
          <Divider sx={{ my: 1.5, mx: 2 }} />
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ 
              px: 3, 
              py: 0.8,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <LazyIcon>
              <Icons.AdminPanelSettings sx={{ fontSize: '1rem' }} />
            </LazyIcon>
            Admin
          </Typography>
          <List>
            {adminMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleMenuItemClick(item.path)}
                  sx={{
                    borderRadius: '6px',
                    mx: 1.5,
                    my: 0.3,
                    backgroundColor: activeItem === item.path ? 'primary.light' : 'transparent',
                    color: activeItem === item.path ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      backgroundColor: activeItem === item.path ? 'primary.main' : 'action.hover',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    py: 1.2,
                    pl: 2,
                    fontSize: '0.9rem',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: activeItem === item.path ? '70%' : '0%',
                      backgroundColor: 'primary.main',
                      borderRadius: '0 4px 4px 0',
                      transition: 'height 0.2s ease-in-out'
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: activeItem === item.path ? 'primary.contrastText' : 'primary.main',
                    minWidth: '36px',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.3rem'
                    }
                  }}>
                    <LazyIcon>
                      {item.icon}
                    </LazyIcon>
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: activeItem === item.path ? 500 : 400,
                      fontSize: '0.9rem',
                      letterSpacing: '0.01em'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={styles.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          ...styles.appBar,
          transform: isMobile && scrollDirection === 'down' && window.scrollY > 100 ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease-in-out',
          visibility: 'visible',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <LazyIcon>
              <Icons.Menu />
            </LazyIcon>
          </IconButton>

          <Box
            component="img"
            src={pyrkonLogo}
            alt="Pyrkon Logo"
            sx={{
              height: '40px',
              width: 'auto',
              mr: 0,
              mt: -1,
              filter: theme.palette.mode === 'light' 
                ? 'invert(1) brightness(1.2) drop-shadow(0px 0px 2px rgba(255,255,255,0.3))'
                : 'drop-shadow(0px 0px 2px rgba(0,0,0,0.3)) drop-shadow(0px 0px 4px rgba(0,0,0,0.2))',
              '&:hover': {
                filter: theme.palette.mode === 'light'
                  ? 'invert(1) brightness(1.3) drop-shadow(0px 0px 3px rgba(255,255,255,0.4))'
                  : 'drop-shadow(0px 0px 3px rgba(0,0,0,0.4)) drop-shadow(0px 0px 5px rgba(0,0,0,0.3))',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          />

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            yrhouse
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Ustawienia użytkownika">
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  padding: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LazyIcon>
                    <Icons.Person />
                  </LazyIcon>
                  <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {userId ? 'Użytkownik' : ''}
                  </Typography>
                  <LazyIcon>
                    <Icons.ExpandMore sx={{ fontSize: 20 }} />
                  </LazyIcon>
                </Box>
              </IconButton>
            </Tooltip>

            <MuiMenu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              onClick={(e) => {
                // Zamykamy menu tylko jeśli kliknięcie nie było na przełączniku motywu
                const target = e.target as HTMLElement;
                if (!target.closest('[data-theme-switch]')) {
                  handleUserMenuClose();
                }
              }}
              PaperProps={{
                sx: {
                  width: 320,
                  maxWidth: '100%',
                  mt: 1.5,
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LazyIcon>
                    <Icons.AccountCircle sx={{ fontSize: 40, color: 'primary.main' }} />
                  </LazyIcon>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {userId ? 'Użytkownik' : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userRole === 'admin' ? 'Administrator' : userRole === 'moderator' ? 'Moderator' : 'Użytkownik'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 1 }}>
                <MenuItem onClick={handleProfileClick} sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}>
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    <LazyIcon>
                      <Icons.AccountCircle />
                    </LazyIcon>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Mój profil"
                    secondary="Zarządzaj swoim kontem"
                    secondaryTypographyProps={{
                      sx: { color: 'primary.contrastText', opacity: 0.8 }
                    }}
                  />
                </MenuItem>

                <MenuItem 
                  onClick={() => navigate('/tutorial')} 
                  sx={{ 
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon>
                    <LazyIcon>
                      <Icons.Help sx={{ color: 'primary.main' }} />
                    </LazyIcon>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Przewodnik po systemie"
                    secondary="Poznaj podstawy obsługi aplikacji"
                    secondaryTypographyProps={{
                      sx: { color: 'text.secondary' }
                    }}
                  />
                </MenuItem>

                <Typography variant="overline" sx={{ px: 1, color: 'text.secondary', display: 'block', mt: 2 }}>
                  Wygląd
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}>
                  <LazyIcon>
                    <Icons.LightMode sx={{ color: themeMode === 'light' ? 'primary.main' : 'text.secondary' }} />
                  </LazyIcon>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'action.selected',
                    borderRadius: 2,
                    p: 0.5,
                    mx: 1,
                    position: 'relative'
                  }}>
                    <Box
                      onClick={() => handleThemeChange('light')}
                      data-theme-switch
                      sx={{
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 1,
                        bgcolor: themeMode === 'light' ? 'primary.main' : 'transparent',
                        color: themeMode === 'light' ? 'primary.contrastText' : 'text.secondary',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: themeMode === 'light' ? 'primary.dark' : 'action.hover'
                        }
                      }}
                    >
                      <Typography variant="body2">Jasny</Typography>
                    </Box>
                    <Box
                      onClick={() => handleThemeChange('system')}
                      data-theme-switch
                      sx={{
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 1,
                        bgcolor: themeMode === 'system' ? 'primary.main' : 'transparent',
                        color: themeMode === 'system' ? 'primary.contrastText' : 'text.secondary',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: themeMode === 'system' ? 'primary.dark' : 'action.hover'
                        }
                      }}
                    >
                      <Typography variant="body2">Auto</Typography>
                    </Box>
                    <Box
                      onClick={() => handleThemeChange('dark')}
                      data-theme-switch
                      sx={{
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 1,
                        bgcolor: themeMode === 'dark' ? 'primary.main' : 'transparent',
                        color: themeMode === 'dark' ? 'primary.contrastText' : 'text.secondary',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: themeMode === 'dark' ? 'primary.dark' : 'action.hover'
                        }
                      }}
                    >
                      <Typography variant="body2">Ciemny</Typography>
                    </Box>
                  </Box>
                  <LazyIcon>
                    <Icons.DarkMode sx={{ color: themeMode === 'dark' ? 'primary.main' : 'text.secondary' }} />
                  </LazyIcon>
                </Box>

                <Typography variant="overline" sx={{ px: 1, color: 'text.secondary', display: 'block', mt: 2 }}>
                  Animacje
                </Typography>
                <MenuItem sx={{ borderRadius: 1 }}>
                  <ListItemIcon>
                    {prefersAnimations ? <LazyIcon><Icons.Animation /></LazyIcon> : <LazyIcon><Icons.BlockTwoTone /></LazyIcon>}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Animacje interfejsu"
                    secondary={isSystemReducedMotion ? "Wyłączone przez system" : ""}
                  />
                  <Switch
                    edge="end"
                    checked={prefersAnimations}
                    onChange={toggleAnimations}
                    disabled={isSystemReducedMotion}
                  />
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem onClick={handleLogout} sx={{ 
                  borderRadius: 1,
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                  }
                }}>
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    <LazyIcon>
                      <Icons.Logout />
                    </LazyIcon>
                  </ListItemIcon>
                  <ListItemText primary="Wyloguj się" />
                </MenuItem>
              </Box>
            </MuiMenu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={() => isMobile && setOpen(false)}
        sx={{
          ...styles.navigation,
          '& .MuiDrawer-paper': {
            boxShadow: isMobile ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderRight: isMobile ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          ...styles.mainContent,
          marginLeft: open && !isMobile ? '240px' : '0px',
          width: open && !isMobile ? 'calc(100% - 240px)' : '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          '& > *': {
            maxWidth: '100%',
            overflowX: 'hidden'
          }
        }}
      >
        {children}
        {showQuestTransition && (
          <QuestBoardTransition onAnimationComplete={handleTransitionComplete} />
        )}
        {showLocationTransition && (
          <LocationTransition onAnimationComplete={handleTransitionComplete} />
        )}
      </Box>
    </Box>
  );
};

export default Layout;
