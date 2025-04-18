import React from 'react';
import { Box } from '@mui/material';

interface PinProps {
  background: string;
  glyphColor: string;
  borderColor: string;
}

const Pin: React.FC<PinProps> = ({ background, glyphColor, borderColor }) => {
  return (
    <Box
      sx={{
        width: '24px',
        height: '36px',
        position: 'relative',
        cursor: 'pointer',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '70%',
          backgroundColor: background,
          borderRadius: '50% 50% 0 0',
          border: `2px solid ${borderColor}`,
          boxSizing: 'border-box',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `12px solid ${background}`,
        },
        '& .glyph': {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -80%)',
          width: '8px',
          height: '8px',
          backgroundColor: glyphColor,
          borderRadius: '50%',
        }
      }}
    >
      <div className="glyph" />
    </Box>
  );
};

export default Pin; 