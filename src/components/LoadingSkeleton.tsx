import { Box, Skeleton } from '@mui/material';
import { keyframes } from '@mui/system';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const LoadingSkeleton = () => {
  return (
    <Box sx={{ width: '100%', height: '100vh', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Skeleton variant="text" width={200} height={32} />
      </Box>

      {/* Main content */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Left panel */}
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </Box>

        {/* Right panel */}
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </Box>
      </Box>

      {/* Loading bar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '2000px 100%',
          animation: `${shimmer} 2s infinite linear`,
        }}
      />
    </Box>
  );
};

export default LoadingSkeleton; 