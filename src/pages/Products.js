import { Container, Grid, Card, CardMedia, CardContent, Typography, Button } from '@mui/material';

const Products = () => {
  const products = [
    {
      id: 1,
      name: "Moisturizer for Dry Skin",
      price: 29.99,
      image: "/images/moisturizer.jpg",
      skinType: "dry"
    },
    // Add more products
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Recommended Products
      </Typography>
      <Grid container spacing={3}>
        {products.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Suitable for {product.skinType} skin
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ${product.price}
                </Typography>
                <Button variant="contained" color="primary" sx={{ mt: 1 }}>
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Products; 