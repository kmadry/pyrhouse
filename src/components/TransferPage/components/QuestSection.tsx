import React from 'react';
import { Paper, Box, Typography, Chip } from '@mui/material';
import { Person, Event, LocationOn } from '@mui/icons-material';

interface QuestData {
  recipient: string;
  deliveryDate: string;
  location: string;
  pavilion: string;
  items: Array<{
    item_name: string;
    quantity: number;
    notes?: string;
  }>;
}

interface QuestSectionProps {
  questData: QuestData | null;
}

export const QuestSection: React.FC<QuestSectionProps> = ({ questData }) => {
  if (!questData) return null;

  const chipStyle = {
    backgroundColor: '#E6CB99',
    color: '#54291E',
    '& .MuiChip-icon': {
      color: '#54291E'
    },
    '& .MuiChip-label': {
      color: '#54291E'
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mb: 2,
        backgroundColor: '#FFF8E7',
        border: '1px solid #E6CB99',
        '& .MuiPaper-root': {
          transition: 'none',
        }
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ 
          color: '#54291E',
          fontFamily: '"Cinzel", serif',
          fontWeight: 500
        }}>
          Aktywny Quest
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          size="small"
          icon={<Person />}
          label={`Odbiorca: ${questData.recipient}`}
          sx={chipStyle}
        />
        <Chip
          size="small"
          icon={<Event />}
          label={`Termin: ${new Date(questData.deliveryDate).toLocaleDateString()}`}
          sx={chipStyle}
        />
        <Chip
          size="small"
          icon={<LocationOn />}
          label={`${questData.location} - ${questData.pavilion}`}
          sx={chipStyle}
        />
      </Box>

      <Box sx={{ mt: 2, mb: 0.5 }}>
        <Typography variant="body2" sx={{ color: '#54291E' }}>
          Wymagane przedmioty:
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {questData.items.map((item, index) => (
          <Chip
            size="small"
            key={index}
            label={`${item.quantity}x ${item.item_name}${item.notes ? ` (${item.notes})` : ''}`}
            sx={chipStyle}
          />
        ))}
      </Box>
    </Paper>
  );
}; 