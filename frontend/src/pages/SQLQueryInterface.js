import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress,
  Tabs, 
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardHeader,
  CardContent
} from '@mui/material';
import axios from 'axios';

// Use Material UI icons instead of react-icons/fa
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';
import ListIcon from '@mui/icons-material/List';

const API_URL = 'http://localhost:5000/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`query-tabpanel-${index}`}
      aria-labelledby={`query-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SQLQueryInterface = () => {
  const [customQuery, setCustomQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [predefinedQueries, setPredefinedQueries] = useState([]);
  const [selectedPredefinedQuery, setSelectedPredefinedQuery] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Fetch predefined queries from the server
  useEffect(() => {
    const fetchPredefinedQueries = async () => {
      try {
        const response = await axios.get(`${API_URL}/predefined-queries`);
        if (response.data.success) {
          setPredefinedQueries(response.data.queries);
        }
      } catch (err) {
        console.error('Error fetching predefined queries:', err);
        setError('Failed to load predefined queries');
      }
    };

    fetchPredefinedQueries();
  }, []);

  const handleQueryChange = (e) => {
    setCustomQuery(e.target.value);
    setError(null);
    setSuccess(false);
  };

  const executeQuery = async (query) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setQueryResults(null);
    setColumns([]);

    try {
      const response = await axios.post(`${API_URL}/execute-query`, { query });
      
      if (response.data.success) {
        setQueryResults(response.data.results);
        setColumns(response.data.columns);
        setSuccess(true);
      } else {
        setError(response.data.error || 'Failed to execute query');
      }
    } catch (err) {
      console.error('Error executing query:', err);
      setError(err.response?.data?.error || 'An error occurred while executing the query');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteCustomQuery = () => {
    if (!customQuery.trim()) {
      setError('Please enter a query to execute');
      return;
    }
    executeQuery(customQuery);
  };

  const handleSelectPredefinedQuery = (query) => {
    setSelectedPredefinedQuery(query);
    setCustomQuery(query.query);
  };

  const handleExecutePredefinedQuery = () => {
    if (selectedPredefinedQuery) {
      executeQuery(selectedPredefinedQuery.query);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 3 }}>
      <Typography variant="h4" gutterBottom>SQL Query Interface</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Execute SQL queries directly on the database and view results
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="query tabs">
          <Tab icon={<CodeIcon />} label="Custom Query" id="query-tab-0" />
          <Tab icon={<ListIcon />} label="Predefined Queries" id="query-tab-1" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <TextField
            label="Enter SQL Query (SELECT statements only)"
            multiline
            rows={5}
            value={customQuery}
            onChange={handleQueryChange}
            placeholder="SELECT * FROM BOOKING LIMIT 10;"
            fullWidth
            margin="normal"
            variant="outlined"
            helperText="For security reasons, only SELECT queries are allowed."
          />
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleExecuteCustomQuery}
            disabled={loading || !customQuery.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
            sx={{ mt: 2 }}
          >
            {loading ? 'Executing...' : 'Execute Query'}
          </Button>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ mb: 3 }}>
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">Predefined Queries</Typography>
              </Box>
              <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                <List>
                  {predefinedQueries.map((query) => (
                    <ListItem 
                      button 
                      key={query.id}
                      selected={selectedPredefinedQuery?.id === query.id}
                      onClick={() => handleSelectPredefinedQuery(query)}
                    >
                      <ListItemText primary={query.description} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            {selectedPredefinedQuery && (
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Selected Query</Typography>
                <TextField
                  label="Description"
                  value={selectedPredefinedQuery.description}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="SQL Query"
                  multiline
                  rows={5}
                  value={selectedPredefinedQuery.query}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleExecutePredefinedQuery}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Executing...' : 'Execute Query'}
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </TabPanel>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 3 }}>
          Query executed successfully!
        </Alert>
      )}

      {queryResults && (
        <Paper elevation={3} sx={{ mt: 4 }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.light', 
            color: 'primary.contrastText',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">Query Results</Typography>
            <Box sx={{ 
              bgcolor: 'rgba(0, 0, 0, 0.2)', 
              px: 1, 
              py: 0.5, 
              borderRadius: 1 
            }}>
              {queryResults.length} rows
            </Box>
          </Box>
          <Box sx={{ p: 2 }}>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((column, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                        {column}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {queryResults.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column, colIndex) => (
                        <TableCell key={`${rowIndex}-${colIndex}`}>
                          {row[column] !== null ? 
                            (typeof row[column] === 'object' 
                              ? JSON.stringify(row[column]) 
                              : String(row[column]))
                            : 'NULL'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default SQLQueryInterface; 