import { SxProps } from "@mui/material";

const styles: {
  root: SxProps;
  navigation: SxProps;
  mainContent: SxProps;
  appBar: SxProps;
} = {
  root: {
    display: 'flex',
    minHeight: '100vh',
  },
  navigation: {
    position: 'fixed',
    top: '64px',
    height: 'calc(100% - 64px)',
    width: 240,
    '& .MuiPaper-root': {
        position: 'relative',
    },
    '& .MuiListItem-root': {
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
        '&:active': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
        },
    },
    '@media (max-width: 600px)': {
        width: '100%',
        top: '56px',
        height: 'calc(100% - 56px)',
        '& .MuiListItem-root': {
            padding: '12px 16px',
            '& .MuiListItemText-root': {
                margin: 0,
            },
        },
    }
  },
  mainContent: {
    width: '100%',
    marginTop: '64px',
    padding: '24px',
    transition: 'margin 0.3s, width 0.3s',
    boxSizing: 'border-box',
    '@media (max-width: 600px)': {
        marginTop: '56px',
        padding: '16px',
        '& > *': {
            maxWidth: '100%',
            boxSizing: 'border-box'
        }
    }
  },
  appBar: {
    zIndex: (theme: any) => theme.zIndex.drawer + 1,
    transition: 'box-shadow 0.3s ease',
    '@media (max-width: 600px)': {
        top: 0,
    }
  }
};

export default styles;