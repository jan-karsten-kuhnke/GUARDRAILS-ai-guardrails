import React, { useContext } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import  { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppRoutes } from '@/AppRoutes';
import { over } from 'lodash';
import { AuthContext, AuthService } from '@/services/AuthService';
import { styles } from '@/styles/styles';
import { SidebarItems } from '../SidebarItems/SidebarItems';

const drawerWidth = 280;
const applicationName=import.meta.env.VITE_APPLICATION_NAME as string;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export const MainLayout = () => {
  const theme = useTheme();
  const authContext = useContext(AuthContext)
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Router>
      <Box sx={{ display: 'flex', overflow: 'hidden' }}>
        <AppBar
          position="fixed"
          // open={open}
          sx={styles.appBarTheme}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, color: styles.textColor }}
            >
             {open? <ChevronLeft />:  <MenuIcon />}
            </IconButton>
            <img src={styles.appBarLogo} alt="logo" style={{height:'40px', width:'40px',marginLeft:'10px'}} />
            <Typography variant="h6" noWrap component="div" sx={{fontSize:'16px',
              fontWeight:'600'}}>
              {applicationName}
            </Typography>
            <Typography variant="subtitle2" component="span">
              <Chip
                label="Beta"
                variant="outlined"
                size="small"
                style={{ borderColor: '#F86F03', color: '#F86F03', marginLeft: '5px',marginRight:'5px' }}
              />
            </Typography>
            {/* <Divider orientation="vertical" variant="middle" flexItem sx={{ background: 'white' ,opacity:'50%'}} /> */}
            <Divider orientation="vertical" variant="middle" flexItem sx={{ background: 'white',marginLeft: 'auto',opacity:'50%' }} />
            <Button
              sx={{ position:'flex-end', border: '1px', marginLeft:"10px" }}
              onClick={authContext.logout}
            >
              <Typography noWrap component="div" sx={{color:styles.textColor,fontSize:'14px',textTransform:'capitalize',fontWeight:'600'}}>
                Logout
              </Typography>
            </Button>
          </Toolbar>
        </AppBar>

        <Drawer
          PaperProps={{ // Add PaperProps with top spacing
            sx: { marginTop: '64px'} // Adjust the top spacing value as needed
          }}
          
          sx={styles.drawerTheme}

          variant="persistent"
          anchor="left"
          open={open}
        >
          <Divider />
          <SidebarItems />
        </Drawer>

        <Main open={open} sx={{color:styles.textColor, backgroundColor:styles.mainBgColor ,flexGrow: 1,paddingTop:'64px',height: '100vh', width: '100vw', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {AppRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.component} />
            ))}
          </Routes>
        </Main>
      </Box>
    </Router>
  );
};