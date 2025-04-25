import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px #E6CB99, 0 0 10px #E6CB99, 0 0 15px #CFA865; }
  50% { box-shadow: 0 0 10px #E6CB99, 0 0 20px #E6CB99, 0 0 25px #CFA865; }
  100% { box-shadow: 0 0 5px #E6CB99, 0 0 10px #E6CB99, 0 0 15px #CFA865; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const QuestLoadingBar = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#171713',
        backgroundImage: 'url("/wooden-texture.png")',
        backgroundBlend: 'multiply',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          width: '500px',
          maxWidth: '90%',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '100px',
            backgroundImage: 'url("/parchment-texture.png")',
            opacity: 0.1,
            animation: `${float} 3s ease-in-out infinite`,
          }
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#E6CB99',
            fontFamily: '"Cinzel", serif',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            mb: 2,
            position: 'relative',
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              width: '30px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #CFA865, transparent)',
            },
            '&::before': {
              left: -40,
            },
            '&::after': {
              right: -40,
            }
          }}
        >
          Odkrywanie Questów
        </Typography>

        <Box
          sx={{
            width: '100%',
            position: 'relative',
            padding: '4px',
            background: 'linear-gradient(145deg, #54291E, #A4462D)',
            borderRadius: '8px',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -1,
              left: -1,
              right: -1,
              bottom: -1,
              background: 'linear-gradient(145deg, #E6CB99, #CFA865)',
              borderRadius: '10px',
              zIndex: -1,
            }
          }}
        >
          <Box
            sx={{
              height: '24px',
              background: '#171713',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, #E6CB99, #CFA865, #E6CB99)',
                backgroundSize: '200% 100%',
                animation: `${shimmer} 2s infinite linear`,
                opacity: 0.8,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 2,
                left: 0,
                right: 0,
                height: '1px',
                background: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          />
        </Box>

        <Typography
          sx={{
            color: '#CFA865',
            fontFamily: '"Cinzel", serif',
            fontSize: '0.9rem',
            textAlign: 'center',
            fontStyle: 'italic',
            animation: `${glow} 2s infinite ease-in-out`,
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          Przygotowywanie listy zadań dla poszukiwaczy przygód...
        </Typography>
      </Box>
    </Box>
  );
};

export default QuestLoadingBar; 