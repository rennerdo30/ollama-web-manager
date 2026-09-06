import { ReactNode, useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Link as MuiLink,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  Chat as ChatIcon,
  Api as ApiIcon,
  SmartToy as BotIcon,
  AutoFixHigh as CreateIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import ThemeModeToggle from './ThemeModeToggle';
import {
  CONTENT_MAX_WIDTH,
  DRAWER_WIDTH,
  EASING,
  MOBILE_APPBAR_HEIGHT,
  MOTION,
  PAGE_GUTTER,
  RADIUS,
} from '../theme';
import { APP_NAME, APP_TAGLINE } from '../constants/app';

const NAV_ITEM_FONT_SIZE = '0.9375rem';
const NAV_ITEM_FONT_WEIGHT = 500;
const NAV_ITEM_FONT_WEIGHT_ACTIVE = 600;
const NAV_ICON_MIN_WIDTH = 38;
const MAIN_CONTENT_ID = 'main-content';

interface LayoutProps {
  children: ReactNode;
}

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Models', icon: <StorageIcon />, path: '/models' },
  { text: 'Create Model', icon: <CreateIcon />, path: '/create-model' },
  { text: 'Deploy Models', icon: <CodeIcon />, path: '/deploy' },
  { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
  { text: 'API Endpoints', icon: <ApiIcon />, path: '/api-endpoints' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
] as const;

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen((open) => !open);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar disableGutters sx={{ px: 2.5, py: 2.5, gap: 1.5, minHeight: 'auto' }}>
        <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <BotIcon />
        </Avatar>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography component="p" noWrap sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>
            {APP_NAME}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="p">
            {APP_TAGLINE}
          </Typography>
        </Box>
      </Toolbar>

      <Box sx={{ px: 1.5, pb: 2, flexGrow: 1, overflowY: 'auto' }}>
        <List disablePadding>
          {MENU_ITEMS.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isSelected}
                  aria-current={isSelected ? 'page' : undefined}
                  // Dismiss the temporary drawer on navigation so it does not
                  // stay open on top of the page the user just chose.
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: RADIUS.md,
                    py: 1.25,
                    px: 1.5,
                    transition: `background-color ${MOTION.base}ms ${EASING}, color ${MOTION.base}ms ${EASING}`,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'inherit',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: NAV_ICON_MIN_WIDTH,
                    color: isSelected ? 'inherit' : 'text.secondary'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: isSelected ? NAV_ITEM_FONT_WEIGHT_ACTIVE : NAV_ITEM_FONT_WEIGHT,
                          fontSize: NAV_ITEM_FONT_SIZE
                        }
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Appearance
        </Typography>
        <ThemeModeToggle size="small" />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <MuiLink
        href={`#${MAIN_CONTENT_ID}`}
        sx={{
          position: 'absolute',
          left: 8,
          top: -100,
          zIndex: (theme) => theme.zIndex.tooltip + 1,
          px: 2,
          py: 1,
          borderRadius: RADIUS.sm,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 600,
          textDecoration: 'none',
          '&:focus-visible': { top: 8 },
        }}
      >
        Skip to main content
      </MuiLink>

      {/* Mobile header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ display: { sm: 'none' } }}
      >
        <Toolbar sx={{ minHeight: MOBILE_APPBAR_HEIGHT, gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="p" noWrap sx={{ fontWeight: 700, flexGrow: 1 }}>
            {APP_NAME}
          </Typography>
          <ThemeModeToggle size="small" />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
        aria-label="Main navigation"
      >
        {/* Mobile drawer */}
        <Drawer
          id="mobile-navigation"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          slotProps={{
            root: {
              keepMounted: true, // Better open performance on mobile.
            },
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        id={MAIN_CONTENT_ID}
        sx={{
          flexGrow: 1,
          minWidth: 0,
          px: PAGE_GUTTER,
          py: PAGE_GUTTER,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: `${MOBILE_APPBAR_HEIGHT}px`, sm: 0 },
          overflowX: 'hidden'
        }}
      >
        <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, mx: 'auto', width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
