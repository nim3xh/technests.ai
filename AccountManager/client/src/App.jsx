import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [combinedData, setCombinedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountFilter, setAccountFilter] = useState("");
  const [csvFiles, setCsvFiles] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Change this to the number of items per page you want

  // Function to merge user and account details based on accountNumber
  const mergeData = (users, accountDetails) => {
    return accountDetails.map((account) => {
      const user = users.find((u) => u.accountNumber === account.accountNumber);
      return {
        ...account,
        name: user ? user.name : "Unknown", // Handle case where user might not exist
      };
    });
  };

  // Fetch data from both APIs and merge them
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, accountDetailsResponse] = await Promise.all([
          axios.get("http://localhost:3000/users"),
          axios.get("http://localhost:3000/accountDetails"),
        ]);

        const mergedData = mergeData(
          usersResponse.data,
          accountDetailsResponse.data
        );
        setCombinedData(mergedData);
        setFilteredData(mergedData); // Set filtered data to full dataset initially
        setLoading(false);
      } catch (err) {
        setError("Something went wrong while fetching data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle filtering by accountNumber
  useEffect(() => {
    let filtered = combinedData;

    if (accountFilter) {
      filtered = filtered.filter(
        (item) => `${item.accountNumber} (${item.name})` === accountFilter
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to page 1 when filter changes
  }, [accountFilter, combinedData]);

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination controls
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

  // Function to handle file input change
  const handleFileChange = (e) => {
    setCsvFiles(e.target.files);
  };

  // Function to upload CSV files
  const uploadCsvs = async () => {
    const formData = new FormData();
    for (const file of csvFiles) {
      formData.append("csvFiles", file);
    }

    try {
      await Promise.all([
        axios.post(
          "http://localhost:3000/accountDetails/add-accounts",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        ),
        axios.post("http://localhost:3000/users/add-users", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
      ]);
      alert("CSV uploaded successfully!");
      setCsvFiles([]); // Clear the files input
      // Optionally fetch data again after upload
    } catch (error) {
      console.error("Error uploading CSVs:", error);
      alert("Failed to upload CSV files.");
    }
  };

  // Conditionally render loading, error, or table
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Get unique values for accountNumber for dropdown filters
  const uniqueAccountNumbers = [
    ...new Set(
      combinedData.map((item) => `${item.accountNumber} (${item.name})`)
    ),
  ];

  return (
    <div className="App">
      <h1>Account Details</h1>

      {/* Dropdown to filter by Account Number */}
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

      {/* File upload for accounts and users */}
      <h2>Upload CSVs</h2>
      <input type="file" accept=".csv" multiple onChange={handleFileChange} />
      <button onClick={uploadCsvs}>Upload Accounts and Users</button>

      {/* Display filtered data */}
      <table border="1">
        <thead>
          <tr>
            <th>Account</th>
            <th>Account Balance</th>
            <th>Account Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((account) => (
            <tr key={account.id}>
              <td>{account.account}</td>
              <td>{account.accountBalance}</td>
              <td>{`${account.accountNumber} (${account.name})`}</td>
              <td>{account.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
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

      <style>{`
        .pagination {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }
        .pagination button {
          margin: 0 5px;
          padding: 5px 10px;
          cursor: pointer;
        }
        .pagination button.active {
          font-weight: bold;
          background-color: #ddd;
        }
        .pagination button:disabled {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default App;
