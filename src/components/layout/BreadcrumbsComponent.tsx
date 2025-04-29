import React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

interface BreadcrumbsComponentProps {
  pathnames: string[];
  translations?: { [key: string]: string };
}

const defaultTranslations: { [key: string]: string } = {
  home: 'Strona Główna',
  quests: 'Quest Board',
  create: 'Utwórz',
  locations: 'Lokalizacje',
  categories: 'Kategorie',
  transfers: 'Questy',
  warehouses: 'Magazyny',
  users: 'Użytkownicy',
  list: 'Magazyn',
  'add-item': 'Nowy sprzęt'
};

const BreadcrumbsComponent: React.FC<BreadcrumbsComponentProps> = ({ pathnames, translations = {} }) => {
  const navigate = useNavigate();
  const combinedTranslations = { ...defaultTranslations, ...translations };

  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" onClick={() => navigate('/')}>Home</Link>
        {pathnames.length > 0 && pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const displayName = combinedTranslations[value.toLowerCase()] || (value.charAt(0).toUpperCase() + value.slice(1));
          return (
            <Link
              underline="hover"
              color="inherit"
              key={to}
              onClick={() => navigate(to)}
            >
              {displayName}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbsComponent;
