const express = require('express');
const { createCanvas } = require('canvas');

const app = express();
const port = 3000;

// Function to create an image with specified background and text
function createImage(background, textColor, text) {
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Set background color
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    // Set text properties
    context.fillStyle = textColor;
    context.font = '50px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Draw text
    context.fillText(text, width / 2, height / 2);

    return canvas.toBuffer();
}

// Endpoint for '/initial'
app.get('/initial', (req, res) => {
    const image = createImage('blue', 'white', 'Initial');
    res.type('png').send(image);
});

// Endpoint for '/changed'
app.get('/changed', (req, res) => {
    const image = createImage('yellow', 'blue', 'Changed');
    res.type('png').send(image);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
