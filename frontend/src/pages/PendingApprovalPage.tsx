import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import { HourglassEmpty as HourglassIcon } from '@mui/icons-material';

const PendingApprovalPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <HourglassIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Pending Approval
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Your account is waiting for administrator approval. You'll receive access once an admin reviews your request.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }} color="textSecondary">
            Please check back later or contact your administrator.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default PendingApprovalPage;
