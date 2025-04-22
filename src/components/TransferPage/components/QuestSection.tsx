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
        },
        '&:hover': {
          backgroundColor: '#FFF8E7',
        }
      }}
    >
      <Box sx={{ mb: 1, color: '#54291E', fontFamily: '"Cinzel", serif' }}>
        <Typography variant="h6">
          Aktywny Quest
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          size="small"
          icon={<Person />}
          label={`Odbiorca: ${questData.recipient}`}
          sx={{ backgroundColor: '#E6CB99' }}
        />
        <Chip
          size="small"
          icon={<Event />}
          label={`Termin: ${new Date(questData.deliveryDate).toLocaleDateString()}`}
          sx={{ backgroundColor: '#E6CB99' }}
        />
        <Chip
          size="small"
          icon={<LocationOn />}
          label={`${questData.location} - ${questData.pavilion}`}
          sx={{ backgroundColor: '#E6CB99' }}
        />
      </Box>

      <Box sx={{ color: '#54291E', mb: 0.5 }}>
        <Typography variant="body2">
          Wymagane przedmioty:
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {questData.items.map((item, index) => (
          <Chip
            size="small"
            key={index}
            label={`${item.quantity}x ${item.item_name}${item.notes ? ` (${item.notes})` : ''}`}
            sx={{ 
              backgroundColor: '#E6CB99',
              '& .MuiChip-label': {
                color: '#54291E'
              }
            }}
          />
        ))}
      </Box>
    </Paper>
  );
}; 