import { Box, Typography } from '@mui/material';

const AdminSettings = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 3 }}>
        Admin Settings
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
        Configure system settings and preferences. (Coming soon)
      </Typography>
    </Box>
  );
};

export default AdminSettings;

