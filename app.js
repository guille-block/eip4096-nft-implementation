const express = require('express');
const { createCanvas, registerFont, loadImage } = require('canvas');
const { ethers } = require('ethers');
const path = require('path');

const app = express();
const port = 3000;

// Ethereum interface
const iface = new ethers.Interface([
    "function isIssued(uint256) external returns(tuple(string actionType, uint256 time, bytes32 tcHash, string note)[])"
]);

async function getTcHashes(id, contractAddress) {
    try {
        const provider = new ethers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/1SZikQsiTlSm9VJyxhFIsAfEXQ5RvzsB');
        const encodedData = iface.encodeFunctionData("isIssued", [id]);
        const result = await provider.call({ to: contractAddress, data: encodedData });
        let decoded = iface.decodeFunctionResult("isIssued", result);
        return decoded[0];
    } catch (error) {
        console.error("Error retrieving encrypted data:", error);
        throw error; // Rethrow the error to be caught by the caller
    }
}


async function createImageDimuto(id, contract) {
    let stagesData
    try {
        stagesData = await getTcHashes(id, contract);
        const fontPath = path.join(__dirname, 'Inter-SemiBold.ttf');
        registerFont(fontPath, { family: 'Inter', weight: 'semibold' });
        console.log('Font registered successfully.');
    } catch (e) {
        console.error('Font registration failed:', e);
    }

    // Calculate everything for a 3000x3000 png
    const canvasWidth = 3000;
    const canvasHeight = 3000;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const context = canvas.getContext('2d');

    // Draw the background
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the logo
    const logo = await loadImage(path.join(__dirname, 'dimuto-logo.png'));
    const logoWidth = canvasWidth * 0.50; // 25% of canvas width
    const logoHeight = logo.height * (logoWidth / logo.width);
    let startingHeight = canvasHeight * 0.1
    context.drawImage(logo, (canvasWidth - logoWidth) / 2, startingHeight, logoWidth, logoHeight); // Center the logo
    startingHeight = startingHeight + logoHeight
    // Draw the certificate title
    context.textAlign = 'left';
    context.fillStyle = '#0A3451';
    context.font = 'bold 5rem Inter';
    context.fillText('Blockchain Digital Certificate',canvasWidth * 0.1, startingHeight * 1.5);
    startingHeight = (startingHeight * 1.5)

    context.textAlign = 'center';
    context.fillStyle = '#454B4F';
    context.font = 'bold 4rem Inter';
    context.fillText(`Receipt ID #${id}`, canvasWidth / 2, startingHeight * 1.22);
    startingHeight = (startingHeight * 1.22)

    context.textAlign = 'left';
    context.fillStyle = '#0A3451';
    context.font = 'bold 5rem Inter';
    context.fillText('Stages', canvasWidth * 0.1, startingHeight * 1.23);

    /// Draw the vertical line to the left of the stages
    context.strokeStyle = '#F7AD1B';
    context.beginPath();
    context.moveTo(canvasWidth * 0.1, startingHeight * 1.4);
    context.lineTo(canvasWidth * 0.9, startingHeight * 1.4);
    context.lineWidth = 15; // Make the line thicker for visibility
    context.stroke();

    startingHeight = (startingHeight * 1.5)
    //let initLineYPosition =  startingHeight
    
    // Iterate over stagesData to display each stage
    context.textAlign = 'left';
    context.fillStyle = '#687076';
    context.font = `bold 4em Inter`;

// Draw the stages dynamically
    stagesData.forEach((item, index) => {
        startingHeight += 150; // Increment the height for the next stage

        // Draw the blue circle
        const circleX = canvasWidth * 0.15; // X position for the circle
        const circleY = startingHeight; // Y position for the circle (aligned with the text)
        const radius = 50; // Radius of the circle
        context.beginPath();
        context.arc(circleX, circleY - (radius / 2), radius, 0, Math.PI * 2, true);
        context.fillStyle = '#27ABE2';
        context.fill();

        // Draw the white text (index + 1) inside the circle
        context.fillStyle = 'white';
        context.font = `bold 3em Inter`; // Smaller font size for the number inside the circle
        context.textAlign = 'center'; // Center text inside the circle
        context.fillText(`${index + 1}`, circleX, circleY);

        // Reset styles for actionType text
        context.textAlign = 'left';
        context.fillStyle = '#454B4F';
        context.font = `bold 4em Inter`;
        context.fillText(`${item.actionType}`, canvasWidth * 0.2, startingHeight);
    });

    

    return canvas.toBuffer();
}
app.get('/dimuto-renderer', async (req, res) => {
    // Extract 'id' and 'contract' from query parameters
    const id = req.query.id
    const contractAddress = req.query.contract;

    // Check if 'id' is a number
    if (isNaN(id)) {
        return res.status(400).send('Invalid ID provided.');
    }

    // Check if 'contractAddress' is provided
    if (!contractAddress) {
        return res.status(400).send('No contract address provided.');
    }

    try {
        const image = await createImageDimuto(id, contractAddress);
        res.type('png').send(image);
    } catch (error) {
        console.error('Error generating the image:', error);
        res.status(500).send('Error generating the image.');
    }
});
/*
app.get('/dimuto-renderer', async (req, res) => {
    let contractAddress;
    let id = 0; // Use a query parameter for the id

    if (isNaN(id)) {
        return res.status(400).send('Invalid ID provided.');
    }

    contractAddress = "0x2149FD3F9839CD8233401bccE1DC795fC425C659"; // Use a query parameter for the contract address

    if (!contractAddress) {
        return res.status(400).send('No contract address provided.');
    }

    try {
        const image = await createImageDimuto(id, contractAddress);
        res.type('png').send(image);
    } catch (error) {
        res.status(500).send('Error generating the image.');
    }
});
*/
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
