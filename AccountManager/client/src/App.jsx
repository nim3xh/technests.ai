import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const BaseURL = import.meta.env.VITE_BASE_URL;

// Helper function to generate random colors
const generateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Helper function to calculate luminance and determine if the color is light or dark
const getLuminance = (hex) => {
  const rgb = parseInt(hex.substring(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance;
};

// Function to map account names to colors
const assignColorsToAccounts = (data) => {
  const accountColors = {};
  data.forEach((item) => {
    const accountName = item.name;
    if (!accountColors[accountName]) {
      accountColors[accountName] = generateRandomColor();
    }
  });
  return accountColors;
};

function App() {
  const [combinedData, setCombinedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountFilter, setAccountFilter] = useState("");
  const [csvFiles, setCsvFiles] = useState([]);
  const [accountColors, setAccountColors] = useState({});
  const [isAdminOnly, setIsAdminOnly] = useState(false);

  const [selectedProcessRange, setSelectedProcessRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const processRanges = [
    { label: "47000", min: 46750, max: 47249 },
    { label: "47500", min: 47250, max: 47749 },
    { label: "48000", min: 47750, max: 48249 },
    { label: "48500", min: 48250, max: 48749 },
    { label: "49000", min: 48750, max: 49249 },
    { label: "49500", min: 49250, max: 49749 },
    { label: "50000", min: 49750, max: 50249 },
    { label: "50500", min: 50500, max: 50749 },
    { label: "51000", min: 50750, max: 51249 },
    { label: "51500", min: 51250, max: 51749 },
    { label: "52000", min: 51750, max: 52249 },
    { label: "52500", min: 52250, max: 52749 },
    { label: "53000", min: 52750, max: 53249 },
    { label: "53500", min: 53250, max: 53749 },
    { label: "54000", min: 53750, max: 54249 },
    { label: "54500", min: 54250, max: 54749 },
    { label: "55000", min: 54750, max: 55249 },
  ];

  const mergeData = (users, accountDetails) => {
    return accountDetails.map((account) => {
      const user = users.find((u) => u.accountNumber === account.accountNumber);
      return {
        ...account,
        name: user ? user.name : "Unknown",
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, accountDetailsResponse] = await Promise.all([
          axios.get(`${BaseURL}users`),
          axios.get(`${BaseURL}accountDetails`),
        ]);

        const mergedData = mergeData(
          usersResponse.data,
          accountDetailsResponse.data
        );
        setCombinedData(mergedData);
        setFilteredData(mergedData);

        // Assign random colors to account names
        setAccountColors(assignColorsToAccounts(mergedData));
        setLoading(false);
      } catch (err) {
        setError("Something went wrong while fetching data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = combinedData;
    console.log(BaseURL);

    if (accountFilter) {
      filtered = filtered.filter(
        (item) => `${item.accountNumber} (${item.name})` === accountFilter
      );
    }

    // Filter by "admin only" status if checkbox is checked
    if (isAdminOnly) {
      filtered = filtered.filter((item) => item.status === "admin only");
    }

    if (selectedProcessRange) {
      const selectedRange = processRanges.find(
        (range) => range.label === selectedProcessRange
      );
      filtered = filtered.filter(
        (item) =>
          item.accountBalance >= selectedRange.min &&
          item.accountBalance <= selectedRange.max
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [accountFilter, selectedProcessRange, combinedData, isAdminOnly]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handleFileChange = (e) => {
    setCsvFiles(e.target.files);
  };

  const uploadCsvs = async () => {
    const formData = new FormData();
    for (const file of csvFiles) {
      formData.append("csvFiles", file);
    }

    try {
      await Promise.all([
        axios.post(`${BaseURL}accountDetails/add-accounts`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
        axios.post(`${BaseURL}users/add-users`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
      ]);
      alert("CSV uploaded successfully!");
      setCsvFiles([]);
    } catch (error) {
      console.error("Error uploading CSVs:", error);
      alert("Failed to upload CSV files.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const uniqueAccountNumbers = [
    ...new Set(
      combinedData.map((item) => `${item.accountNumber} (${item.name})`)
    ),
  ];

  return (
    <div className="App">
      <h1>Account Details</h1>

      <label htmlFor="accountFilter">Filter by Account: </label>
      <select
        id="accountFilter"
        value={accountFilter}
        onChange={(e) => setAccountFilter(e.target.value)}
      >
        <option value="">All</option>
        {uniqueAccountNumbers.map((account) => (
          <option key={account} value={account}>
            {account}
          </option>
        ))}
      </select>

      <label htmlFor="processCsv">Process CSV: </label>
      <select
        id="processCsv"
        value={selectedProcessRange}
        onChange={(e) => setSelectedProcessRange(e.target.value)}
      >
        <option value="">Select Range</option>
        {processRanges.map((range) => (
          <option key={range.label} value={range.label}>
            {range.label}
          </option>
        ))}
      </select>
      <br />
      {/* Checkbox to filter by "admin only" status */}
      <label>
        <input
          type="checkbox"
          checked={isAdminOnly}
          onChange={(e) => setIsAdminOnly(e.target.checked)}
        />
        Show Admin Only
      </label>

      <br />
      <br />
      <input type="file" accept=".csv" multiple onChange={handleFileChange} />
      <button onClick={uploadCsvs}>Fetch CSVs</button>

      <table border="1">
        <thead>
          <tr>
            <th>Account</th>
            <th>Account Balance</th>
            <th>Account Name</th>
            <th>Status</th>
            <th>Trailing threshold</th>
            <th>PnL</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((account) => {
            const backgroundColor = accountColors[account.name];
            const luminance = getLuminance(backgroundColor);
            const textColor = luminance > 160 ? "#000000" : "#FFFFFF"; // Dark text for light background, light text for dark background

            return (
              <tr
                key={account.id}
                style={{
                  backgroundColor,
                  color: textColor,
                }}
              >
                <td>{account.account}</td>
                <td>{account.accountBalance}</td>
                <td>{`${account.accountNumber} (${account.name})`}</td>
                <td>{account.status}</td>
                <td>{account.trailingThreshold}</td>
                <td>{account.PnL}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>

        {currentPage > 3 && (
          <>
            <button onClick={() => handlePageClick(1)}>1</button>
            <span>...</span>
          </>
        )}

        {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
          const pageNum = Math.max(1, currentPage - 2) + index;
          if (pageNum <= totalPages) {
            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                className={currentPage === pageNum ? "active" : ""}
              >
                {pageNum}
              </button>
            );
          }
          return null;
        })}

        {currentPage < totalPages - 2 && (
          <>
            <span>...</span>
            <button onClick={() => handlePageClick(totalPages)}>
              {totalPages}
            </button>
          </>
        )}

        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
