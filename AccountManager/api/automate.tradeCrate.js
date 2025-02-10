const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require("axios");

const BaseURL = "http://localhost:3000/";

const tradesFolder = path.join(__dirname, 'dashboards', 'trades');

const printRandomFileContent = async () => {
    try {
        const files = fs.readdirSync(tradesFolder).filter(file => file.endsWith('.csv'));
        if (files.length === 0) {
            console.log("No CSV files found in the trades folder.");
            return;
        }
        
        // Pick a random file
        const randomFile = files[Math.floor(Math.random() * files.length)];
        const filePath = path.join(tradesFolder, randomFile);
        
        console.log("Reading file:", randomFile);
        
        // Read and parse CSV file
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                console.log(JSON.stringify(row, null, 2));
            })
            .on('end', () => {
                console.log("Finished reading file.");
            });
    } catch (error) {
        console.error("Error accessing trade files:", error);
    }
};

const test = async () => {
    console.log("Starting test");
    await printRandomFileContent();
};

module.exports = test;
