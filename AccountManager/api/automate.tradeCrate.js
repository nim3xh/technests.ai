const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require("axios");

const BaseURL = "http://localhost:3000/";

let combinedData = [];
let tradesData = [];

const tradesFolder = path.join(__dirname, 'dashboards', 'trades');

const mergeData = (users, accountDetails) => {
    return accountDetails.map((account) => {
      const user = users.find((u) => u.accountNumber === account.accountNumber);
      return {
        ...account,
        name: user ? user.name : "Unknown",
      };
    });
};

const fetchData = async (apexID) => {
    try {
      const [usersResponse, accountDetailsResponse] = await Promise.all([
        axios.get(`${BaseURL}users/index`, {  }),
        axios.get(`${BaseURL}accountDetails/accCrate/APEX-${apexID}`, {  }),
      ]);

      const mergedData = mergeData(
        usersResponse.data,
        accountDetailsResponse.data
      );
    //   console.log("Merged data:", mergedData);
      combinedData = mergedData;

    } catch (err) {
      console.error("Error fetching data:", err);
      console.error("Something went wrong while fetching data.");
    }
};

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
        
        // console.log("Reading file:", randomFile);
        
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

const test = async (apexID) => {
    console.log("Starting test",apexID);
    await fetchData(apexID);
    await printRandomFileContent();
};

module.exports = test;
