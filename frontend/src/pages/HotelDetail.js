// ... existing imports ...
import { 
  Rating, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';

function HotelDetail() {
  // ... existing state ...
  const [reviews, setReviews] = useState([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comments: ''
  });

  useEffect(() => {
    // ... existing fetch hotel data ...
    
    // Fetch hotel reviews
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/hotels/${hotelId}/reviews`);
        setReviews(response.data);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };
    
    fetchReviews();
  }, [hotelId]);

  const handleReviewClick = () => {
    setReviewDialogOpen(true);
  };

  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData({
      ...reviewData,
      [name]: value
    });
  };

  const handleRatingChange = (event, newValue) => {
    setReviewData({
      ...reviewData,
      rating: newValue
    });
  };

  const handleReviewSubmit = async () => {
    try {
      // Get customer ID from localStorage or context
      const customerId = 1; // Replace with actual customer ID
      
      await axios.post('http://localhost:5000/api/reviews', {
        customer_id: customerId,
        hotel_id: hotelId,
        rating: reviewData.rating,
        comments: reviewData.comments
      });
      
      setReviewDialogOpen(false);
      
      // Refresh reviews
      const response = await axios.get(`http://localhost:5000/api/hotels/${hotelId}/reviews`);
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  // ... existing render code ...

  return (
    <div>
      {/* ... existing JSX ... */}
      
      {/* Hotel Reviews Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Guest Reviews</Typography>
          <Button variant="contained" color="primary" onClick={handleReviewClick}>
            Write a Review
          </Button>
        </Box>
        
        {reviews.length === 0 ? (
          <Typography>No reviews yet. Be the first to review this hotel!</Typography>
        ) : (
          <List>
            {reviews.map((review, index) => (
              <React.Fragment key={review.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1">
                          {review.first_name} {review.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {review.review_date}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Rating value={review.rating} readOnly size="small" sx={{ mt: 1 }} />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {review.comments}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < reviews.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography component="legend">Your Rating</Typography>
            <Rating
              name="rating"
              value={reviewData.rating}
              onChange={handleRatingChange}
              size="large"
            />
          </Box>
          
          <TextField
            name="comments"
            label="Your Review"
            value={reviewData.comments}
            onChange={handleReviewInputChange}
            fullWidth
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReviewSubmit} color="primary">Submit Review</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}