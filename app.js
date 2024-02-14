const express = require('express');
const { createCanvas, registerFont, loadImage } = require('canvas');
const { ethers } = require('ethers');
const path = require('path');   

const app = express();
const port = 3000;

// Sample function to fetch data from an Ethereum provider

const iface = new ethers.Interface([
    "function isIssued(uint256) external returns(tuple(uint256 time, bytes32 tcHash, string actionType, string note)[])"
  ]);
  

async function getTcHashes(id) {
    try {
        const provider = new ethers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/1SZikQsiTlSm9VJyxhFIsAfEXQ5RvzsB');
        const contractAddress = "0xb24d07CDD3bfef153c1cD3d8c9A948dC8379D0e7"
        const encodedData = iface.encodeFunctionData("isIssued", [id]);
        const result = await provider.call({to: contractAddress, data: encodedData});
        console.log(result)
        let decoded = iface.decodeFunctionResult("isIssued", result)
        console.log(decoded[0])
        return decoded[0]
    } catch (error) {
        console.error("Error retrieving encrypted data:", error);
    }
}


async function getNextContractAddress(walletAddress) {
    const provider = new ethers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/1SZikQsiTlSm9VJyxhFIsAfEXQ5RvzsB');
        
    // Get the current nonce for the wallet address
    const nonce = await provider.getTransactionCount(walletAddress);
    const rlpEncoded = ethers.encodeRlp([walletAddress, ethers.toBeHex(nonce)]);
    const contractAddress = ethers.keccak256(rlpEncoded);
    const address = `0x${contractAddress.substring(26)}`;
    console.log(address);
    return address;
}

async function createImageDimuto(text, id) {
    try {
        const fontPath = path.join(__dirname, 'Inter-SemiBold.ttf');
        registerFont(fontPath, { family: 'Inter', weight: 'semibold' });
        console.log('Font registered successfully.');
    } catch (e) {
        console.error('Font registration failed:', e);
    }

    const canvasWidth = 842;
    const canvasHeight = 526;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const context = canvas.getContext('2d');

    // Register a font
    const fontPath = path.join(__dirname, 'Inter-SemiBold.ttf');
    registerFont(fontPath, { family: 'Inter', weight: 'semibold' });

    // Draw the background
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the logo
    const logo = await loadImage(path.join(__dirname, 'dimuto-logo.png'));
    context.drawImage(logo, 48, 48, 300, 300 * logo.height / logo.width); // Adjust the size as needed

    
    // Set text styles
    context.fillStyle = '#0A3451';
    context.font = 'semibold 40px Inter';

    // Draw the certificate title
    context.fillText('Blockchain Digital Certificate', 48, 216); // Adjust positioning as needed
    
    // Draw the "Details" section heading
    context.fillStyle = '#454B4F';
    context.font = 'semibold 36px Inter';
    context.fillText('Details', 68, 296); // Adjust positioning as needed

    // Set styles for the top-right information
    context.fillStyle = '#687076';
    context.font = 'semibold 14px Inter';
    context.textAlign = 'right'; // Align text to the right
    context.fillText('Issued Date: Tuesday, 23 August 2022 at 07:29:02 SGT', canvasWidth - 48, 300 * logo.height / logo.width + 48);

    // Reset alignment for the remaining text
    context.textAlign = 'left';

    // Draw the content under "Details" section
    context.fillStyle = '#454B4F';
    context.font = 'semibold 24px Inter';
    
    context.fillText(`Trade Contract:`, 68, 344); // Adjust positioning as needed
    context.fillStyle = '#687076';
    context.font = 'semibold 14px Inter';
    context.fillText(`${text}`, 68, 372); // Adjust positioning as needed

    context.fillStyle = '#454B4F';
    context.font = 'semibold 24px Inter';
    context.fillText(`Stage:`, 68, 420); // Adjust positioning as needed
    context.fillStyle = '#687076';
    context.font = 'semibold 14px Inter';
    let display
    if(id == "initial") {
        display = `Created trade contract`
    } else {
        display = `Updated trade contract`
    }
    context.fillText(display, 68, 448); // Adjust positioning as needed

    // Continue adding more text and elements as needed...
    context.strokeStyle = '#F7AD1B';
    context.beginPath();
    // Start point for the line, slightly below "Details"
    context.moveTo(48, 266);
    // End point for the line, full width minus padding
    context.lineTo(48, 458);
    context.lineWidth = 1.5; // Line weight
    context.stroke();

    return canvas.toBuffer();
}
/*
// Endpoint for '/initial'
app.get('/initial', async (req, res) => {
    const image = await createImage('blue', 'white', 'Initial');
    res.type('png').send(image);
});

app.get('/changed', async (req, res) => {
    const image = await createImage('yellow', 'blue', 'changed');
    res.type('png').send(image);
});

app.get('/dynamic', async (req, res) => {
    const image = await createImage('blue', 'yellow');
    res.type('png').send(image);
});
*/

app.get('/dimuto-renderer', async (req, res) => {
    let id
    Object.keys(req.query).forEach(key => {
        id = req.query[key]
    });
    const hashesRegistered = getTcHashes(id)
    const image = await createImageDimuto('TCCO0013500295', id);
    res.type('png').send(image);
    //res.send('Query parameters logged to the console.');
});


app.listen(port, () => {
    console.log(`Server running at http://18.191.204.31:${port}`);
});

//getNextContractAddress("0x417101CFA66aC417840EDF6FA7c3003333BDF114")
//getTcHashes(0)
