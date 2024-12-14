import { SxProps } from "@mui/material";

const navigation = {
position: 'fixed',
top: '64px',
height: 'calc(100% - 64px)',
width: 240,
'& .MuiPaper-root': {
    position: 'relative',
}
} as SxProps;

const mainContent = {
    width: 'calc(100% - 240px)',
    marginTop: '84px',
    marginLeft: '240px',
    paddingX: '64px',
} as SxProps;

export default {
    navigation,
    mainContent
}