import { SxProps } from "@mui/material";

const navigation = {
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
        padding: '16px',
        '& .MuiListItemText-root': {
            margin: 0,
        },
    },
}
} as SxProps;

const mainContent = {
    width: '100%',
    marginTop: '84px',
    paddingX: '64px',
    transition: 'margin 0.3s, width 0.3s',
    '@media (max-width: 600px)': {
        marginTop: '56px',
        paddingX: '16px',
    }
} as SxProps;

export default {
    navigation,
    mainContent
}