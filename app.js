const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000; // Change to a different port

const BASE_URL = 'https://jsonplaceholder.typicode.com/posts/'; // Example URL for testing
const numbers = [];
const WINDOW_SIZE = 10; // Set the window size

// Define the route for the REST API endpoint
app.get('/numbers/:numberid', async(req, res) => {
    const numberId = req.params.numberid;

    try {
        // Fetch the number from the third-party server with a timeout of 500ms
        const response = await axios.get(`${BASE_URL}${numberId}`, { timeout: 500 });
        const number = response.data.id; // Assuming 'id' is the number for testing

        // Ensure uniqueness and manage window size
        if (!numbers.includes(number)) {
            if (numbers.length >= WINDOW_SIZE) {
                numbers.shift(); // Remove the oldest number
            }
            numbers.push(number);
        }

        // Calculate the average
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        const average = sum / numbers.length;

        // Create the response object
        const responseObject = {
            windowPrevState: numbers.slice(0, -1), // All except the last one
            windowCurrState: numbers, // All numbers in the current state
            numbers, // The numbers array
            avg: average.toFixed(2) // Average to 2 decimal places
        };

        res.json(responseObject); // Send JSON response
    } catch (error) {
        console.error('Error occurred:', error.message); // Log detailed error
        if (error.code === 'ECONNABORTED') {
            res.status(500).send('Request timed out');
        } else {
            res.status(500).send(`An error occurred: ${error.message}`);
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});