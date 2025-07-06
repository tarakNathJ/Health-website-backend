// import  axios from 'axios';

// export const getFoodDetails = async (req, res) => {
//   const { BarcodeNumber } = req.body;
//     try {
//         const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${BarcodeNumber}.json`);
//         if (response.data.status === 1) {
//             res.status(200).json(response.data.product);
//         } else {
//             res.status(404).json({ message: 'Product not found' });
//         }
//     } catch (error) {
//         console.error('Error fetching food details:', error);
//         res.status(500).json({ message: 'Internal server error' }); 
//     }

// }
  