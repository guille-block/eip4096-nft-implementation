const express = require('express');
const { createCanvas } = require('canvas');
const { ethers } = require('ethers');

const app = express();
const port = 3000;

// Sample function to fetch data from an Ethereum provider

const iface = new ethers.Interface([
    "function message() external returns(string)"
  ]);

async function message() {
    try {
        const provider = new ethers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/1SZikQsiTlSm9VJyxhFIsAfEXQ5RvzsB');
        const contractAddress = "0xe1274c1b4533bc526140f9fdf86bd757286d4553"
        const encodedData = iface.encodeFunctionData("message", []);
        const result = await provider.call({to: contractAddress, data: encodedData});
        let decoded = iface.decodeFunctionResult("message", result)
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

async function createImage(background, textColor, text) {
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.fillStyle = textColor;
    context.font = '50px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const data = text || await message();
    context.fillText(data, width / 2, height / 2);

    return canvas.toBuffer();
}

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


app.listen(port, () => {
    console.log(`Server running at http://18.191.204.31:${port}`);
});

//getNextContractAddress("0x417101CFA66aC417840EDF6FA7c3003333BDF114")