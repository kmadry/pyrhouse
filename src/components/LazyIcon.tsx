import React, { Suspense } from 'react';
import { Box } from '@mui/material';

interface LazyIconProps {
  children: React.ReactNode;
}

const LazyIcon: React.FC<LazyIconProps> = ({ children }) => (
  <Suspense fallback={<Box sx={{ width: 24, height: 24 }} />}>
    {children}
  </Suspense>
);

export default LazyIcon; 