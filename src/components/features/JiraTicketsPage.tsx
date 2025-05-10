import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  useTheme,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Avatar,
  Skeleton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  AccessTime as AccessTimeIcon,
  Print as PrintIcon,
  Computer as ComputerIcon,
  Build as BuildIcon,
  Help as HelpIcon,
  LocalShipping as ShippingIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useJiraTickets, JiraTicket } from '../../hooks/useJiraTickets';
import { useSnackbarMessage } from '../../hooks/useSnackbarMessage';
import { AppSnackbar } from '../ui/AppSnackbar';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

const getCategoryIcon = (summary: string) => {
  const lowerSummary = summary.toLowerCase();
  if (lowerSummary.includes('drukarka') || lowerSummary.includes('druk')) {
    return <PrintIcon />;
  }
  if (lowerSummary.includes('komputer') || lowerSummary.includes('pc') || lowerSummary.includes('laptop')) {
    return <ComputerIcon />;
  }
  if (lowerSummary.includes('napraw') || lowerSummary.includes('awaria')) {
    return <BuildIcon />;
  }
  if (lowerSummary.includes('sprzęt') || lowerSummary.includes('wyposażenie')) {
    return <ShippingIcon />;
  }
  if (lowerSummary.includes('konfiguracja') || lowerSummary.includes('ustawienia')) {
    return <SettingsIcon />;
  }
  return <HelpIcon />;
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'oczekiwanie na wsparcie':
      return 'warning';
    case 'w trakcie':
      return 'info';
    case 'zakończone':
      return 'success';
    case 'zamknięte':
      return 'default';
    default:
      return 'default';
  }
};

const SupportQuestCard: React.FC<{ 
  ticket: JiraTicket; 
  onOpenTicket: (ticket: JiraTicket) => void;
}> = ({ ticket, onOpenTicket }) => {
  const theme = useTheme();
  const status = ticket.currentStatus.status;
  const categoryIcon = getCategoryIcon(ticket.summary);
  
  return (
    <Card 
    sx={{ 
        mb: 2,
        transition: 'all 0.3s ease-in-out',
        transform: 'none',
        boxShadow: theme.shadows[1],
        '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
        },
        border: 'none',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        position: 'relative',
        overflow: 'visible',
        '&::before': {
        content: '""',
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        background: `linear-gradient(45deg, ${theme.palette.primary.main}33, ${theme.palette.secondary.main}33)`,
        zIndex: -1,
        borderRadius: theme.shape.borderRadius + 2,
        opacity: 0,
        transition: 'opacity 0.3s ease-in-out',
        },
    }}
    >
    <CardContent>
        <Grid container spacing={2}>
        <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar 
                sx={{ 
                    bgcolor: theme.palette.primary.main,
                    width: 40,
                    height: 40,
                }}
                >
                {categoryIcon}
                </Avatar>
                <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                }}
                >
                {ticket.summary}
                </Typography>
            </Box>
            <IconButton 
                size="small" 
                onClick={() => onOpenTicket(ticket)}
                sx={{ 
                color: 'primary.main',
                '&:hover': {
                    transform: 'scale(1.1)',
                },
                }}
            >
                <OpenInNewIcon />
            </IconButton>
            </Box>
        </Grid>
        
        <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Chip 
                label={ticket.issueKey} 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ 
                fontWeight: 600,
                borderWidth: 2,
                }}
            />
            <Chip 
                label={ticket.currentStatus.status} 
                size="small" 
                color={getStatusColor(status) as any}
                sx={{ 
                fontWeight: 600,
                }}
            />
            </Box>
        </Grid>
        <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar 
                src={ticket.reporter._links.avatarUrls['32x32']}
                alt={ticket.reporter.displayName}
                sx={{ 
                    width: 32, 
                    height: 32,
                    border: `2px solid ${theme.palette.primary.main}`,
                }}
                />
                <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {ticket.reporter.displayName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                    {ticket.createdDate.friendly}
                    </Typography>
                </Box>
                </Box>
            </Box>
            </Box>
        </Grid>
        </Grid>
        </CardContent>
    </Card>
  );
};

const QuestCardSkeleton: React.FC = () => {
  return (
    <Card sx={{ mb: 2, p: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width="60%" height={32} />
              </Box>
              <Skeleton variant="circular" width={24} height={24} />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Skeleton variant="rounded" width={100} height={24} />
              <Skeleton variant="rounded" width={120} height={24} />
              <Skeleton variant="rounded" width={100} height={24} />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Skeleton variant="rounded" width="100%" height={8} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={80} height={16} />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Box>
                  <Skeleton variant="text" width={120} height={20} />
                  <Skeleton variant="text" width={80} height={16} />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const JiraTicketsPage: React.FC = () => {
  const { 
    tickets, 
    loading, 
    error, 
    refreshTickets,
    lastUpdateTime,
  } = useJiraTickets();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbarMessage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    refreshTickets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (error) {
      showSnackbar('error', error);
    }
  }, [error, showSnackbar]);

  const handleOpenTicket = (ticket: JiraTicket) => {
    window.open(ticket._links.web, '_blank');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.issueKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.reporter.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (loading && tickets.length === 0) {
      return (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <QuestCardSkeleton />
            </Grid>
          ))}
        </Grid>
      );
    }

    return (
      <Grid container spacing={3}>
        {filteredTickets.map((ticket) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={ticket.issueId}>
            <SupportQuestCard
              ticket={ticket}
              onOpenTicket={handleOpenTicket}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ 
      margin: '0 auto', 
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: '1800px',
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <AppSnackbar
        open={snackbar.open}
        type={snackbar.type}
        message={snackbar.message}
        details={snackbar.details}
        onClose={closeSnackbar}
        autoHideDuration={snackbar.autoHideDuration}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        marginBottom: 3,
        gap: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2
      }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              mb: { xs: 1, sm: 0 },
              textShadow: `0 0 10px ${theme.palette.primary.main}33`,
            }}
          >
            🛠️ Service Desk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ostatnia aktualizacja: {formatDistanceToNow(lastUpdateTime, { addSuffix: true, locale: pl })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshTickets}
            disabled={loading}
            sx={{ 
              borderRadius: 1,
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
          >
            Odśwież
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{ 
              borderRadius: 1,
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
          >
            Filtry
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            mb: 2,
            '& .MuiTab-root': {
              fontWeight: 600,
            },
          }}
        >
          <Tab label="Wszystkie zgłoszenia" />
          <Tab label="Oczekujące" />
          <Tab label="W trakcie" />
          <Tab label="Zakończone" />
        </Tabs>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Szukaj po tytule zgłoszenia, ID lub zgłaszającym..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Znaleziono {filteredTickets.length} z {tickets.length} zgłoszeń
        </Typography>
      </Box>

      {renderContent()}
    </Box>
  );
};

export default JiraTicketsPage;
