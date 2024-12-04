import { React, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Spinner,
  Breadcrumb,
  Button,
  Modal,
  Label,
  TextInput,
  Select,
  Checkbox,
  Dropdown,
} from "flowbite-react";
import { HiHome, HiPlusCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import axios from "axios";
import { FaUserEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import useRealTimeDate from '../hooks/useRealTimeDate';

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashTrades() {
  const { currentUser } = useSelector((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState(null);
  const [tradesData, setTradesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTrade, setNewTrade] = useState({
    TradeName: "",
    Instrument: "",
    Quantity: "",
    Time: "",
    StopLoss: "",
    Profit: "",
    UseBreakeven: "false",
    BreakevenTrigger: "",
    BreakevenOffset: "",
    UseTrail: "false",
    TrailTrigger: "",
    Trail : "",
    ApexId: "",
  });
  const [combinedData, setCombinedData] = useState([]);
  const [selectedApexId, setSelectedApexId] = useState("");

  // Call the custom hook to get the real-time date
  const formattedTodayDate = useRealTimeDate();
  
   // Function to merge users and account details data
   const mergeData = (users, accountDetails) => {
    return accountDetails.map((account) => {
      const user = users.find((u) => u.accountNumber === account.accountNumber);
      return {
        ...account,
        name: user ? user.name : "Unknown",
      };
    });
  };

  const filteredTrades = selectedApexId
  ? tradesData.filter(
      (trade) => Number(trade.ApexId) === Number(selectedApexId.split(" ")[0])
    )
  : tradesData;

  const uploadCsvs = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx";
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const token = currentUser.token;
        const headers = {
          Authorization: `Bearer ${token}`,
        };
  
        const response = await axios.post(`${BaseURL}trades/upload`, formData, {
          headers,
        });
  
        if (response.status === 201) {
          alert("File uploaded successfully!");
          fetchData(); // Refresh trades
        }
      } catch (err) {
        console.error("File upload error:", err.response || err);
        alert("Error: "+ err.response.data.message);
      }
    };
    input.click();
  };
  

  const fetchAccountDetails = async() => {
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const [usersResponse, accountDetailsResponse] = await Promise.all([
        axios.get(`${BaseURL}users`, { headers }),
        axios.get(`${BaseURL}accountDetails`, { headers }),
      ]);

      const mergedData = mergeData(
        usersResponse.data,
        accountDetailsResponse.data
      );
      
      setCombinedData(mergedData);
    }catch(err) {
      console.error("Error fetching account details:", err);
    }
  }
  
  const encounteredAccounts = new Set();

  const uniqueAccountNumbers = combinedData
    .map((item) => {
      // Match and extract the account number pattern APEX-245360
      const match = item.accountNumber.match(/^(APEX-\d+)/);
      if (match) {
        const accountNumber = match[1];
        if (!encounteredAccounts.has(accountNumber)) {
          encounteredAccounts.add(accountNumber);
          return `${accountNumber} (${item.name})`;
        }
      }
      return null; // Skip if already encountered or no match
    })
    .filter(Boolean); // Filter out null values
  

  const fetchData = async () => {
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const tradesResponse = await axios.get(`${BaseURL}trades`, {
        headers,
      });
      setTradesData(tradesResponse.data);
      setLoading(false);
    } catch (err) {
      setError("Something went wrong while fetching data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAccountDetails();
  }, [currentUser]);

  // Reset the form
  const resetForm = () => {
    setNewTrade({
      TradeName: "",
      Instrument: "",
      Quantity: "",
      Time: "",
      StopLoss: "",
      Profit: "",
      UseBreakeven: "false",
      BreakevenTrigger: "",
      BreakevenOffset: "",
      UseTrail: "false",
      TrailTrigger: "",
      Trail : "",
      ApexId: "",
    });
    setIsEditMode(false);
    setSelectedTradeId(null);
  };

  // Function to handle both add and update
  const handleSaveTrade = async () => {
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      // Convert numeric fields to strings
      const formattedTrade = {
        ...newTrade,
        Quantity: newTrade.Quantity.toString(),
        // Time: newTrade.Time.toString(),
        StopLoss: newTrade.StopLoss.toString(),
        Profit: newTrade.Profit.toString(),
        BreakevenTrigger: newTrade.BreakevenTrigger.toString(),
        BreakevenOffset: newTrade.BreakevenOffset.toString(),
        TrailTrigger: newTrade.TrailTrigger.toString(),
        Trail: newTrade.Trail.toString(),
        // ApexId: newTrade.ApexId.toString(),
      };
  
      if (isEditMode) {
        // Update trade via PATCH
        await axios.patch(`${BaseURL}trades/${selectedTradeId}`, formattedTrade, {
          headers,
        });
      } else {
        // Add new trade via POST
        await axios.post(`${BaseURL}trades`, formattedTrade, { headers });
      }
  
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert("Something went wrong while saving trade.");
    }
  };
  

  const handleAddClick = () => { 
    resetForm(); // Clear the form
    setShowModal(true); // Open the modal
  }
  
  // Function to open the edit modal and pre-fill form
  const handleEditClick = (trade) => {
    setNewTrade({
      ...trade,
      UseBreakeven: trade.UseBreakeven === true || trade.UseBreakeven === "true" ? "true" : "false",
      UseTrail: trade.UseTrail === true || trade.UseTrail === "true" ? "true" : "false",
    });
    setSelectedTradeId(trade.id); // Save the trade ID
    setIsEditMode(true); // Set to edit mode
    setShowModal(true); // Open the modal
  };
  
  const handleChange = (e) => {
    setNewTrade({
      ...newTrade,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeTradeName = (event) => {
    const { name, value } = event.target;
    setNewTrade((prevTrade) => ({
      ...prevTrade,
      [name]: value,
    }));
  };
  

  // Delete a trade with confirmation
  const handleDeleteTrade = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trade?"
    );

    if (!confirmDelete) {
      return; // If user cancels, exit function
    }

    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      await axios.delete(`${BaseURL}trades/${id}`, { headers });
      fetchData(); // Refresh the data after deletion
    } catch (err) {
      console.error(
        "Error deleting trade:",
        err.response ? err.response.data : err.message
      );
      setError("Something went wrong while deleting trade.");
    }
  };


  const convertTo12HourFormat = (time) => {
    const [hours, minutes, seconds] = time.split(":");
    let hour = parseInt(hours, 10);
    const modifier = hour >= 12 ? "PM" : "AM";
    if (hour === 0) hour = 12; 
    else if (hour > 12) hour -= 12;
    return `${hour.toString().padStart(2, "0")}:${minutes} ${modifier}`;
  };

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="/dashboard?tab=dash" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Trades</Breadcrumb.Item>
      </Breadcrumb>
      <p className="text-lg font-semibold text-gray-600 dark:text-white">{formattedTodayDate}</p> 
      <div className="flex items-center justify-between mb-3">
          <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
            All Trades
          </h1>
          <div className="ml-auto flex space-x-3">
          
            {currentUser.user.role !== "user" && (
              <Button
                gradientDuoTone="greenToBlue"
                onClick={uploadCsvs}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="pl-3">Loading...</span>
                  </>
                ) : (
                  <>Upload New Configuration</>
                )}
              </Button>
            )}
            {currentUser.user.role !== "user" && (
              <Button
                gradientDuoTone="greenToBlue"
                onClick={() => handleAddClick()}
                className="ml-3"
              >
                <HiPlusCircle className="mr-2 h-6 w-4" />
                Add Trade
              </Button>
            )}
          </div>
        </div>
    
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spinner size="xl" />
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <Table hoverable className="shadow-md w-full">
          <TableHead>
            <TableHeadCell>#</TableHeadCell>
            <TableHeadCell>Trade Name</TableHeadCell>
            {/* <TableHeadCell>Time</TableHeadCell> */}
            <TableHeadCell>Stop Loss</TableHeadCell>
            <TableHeadCell>Profit</TableHeadCell>
            <TableHeadCell>Use Breakeven</TableHeadCell>
            <TableHeadCell>Breakeven Trigger</TableHeadCell>
            <TableHeadCell>Breakeven Offset</TableHeadCell>
            <TableHeadCell>Use Trail</TableHeadCell>
            <TableHeadCell>Trail Trigger</TableHeadCell>
            <TableHeadCell>Trail</TableHeadCell>
            <TableHeadCell>Instrument</TableHeadCell>
            <TableHeadCell>Quantity</TableHeadCell>
            {/* <TableHeadCell>Apex ID</TableHeadCell> */}
            <TableHeadCell></TableHeadCell>
          </TableHead>
          <TableBody>
            {filteredTrades.map((trade, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{trade.TradeName}</TableCell>
                {/* <TableCell>{trade.Time ? convertTo12HourFormat(trade.Time) : "-"}</TableCell> */}
                <TableCell>{trade.StopLoss}</TableCell>
                <TableCell>{trade.Profit}</TableCell>
                <TableCell>{trade.UseBreakeven === true ? "Yes" : "No"}</TableCell>
                <TableCell>{trade.BreakevenTrigger}</TableCell>
                <TableCell>{trade.BreakevenOffset}</TableCell>
                <TableCell>{trade.UseTrail === true ? "Yes" : "No"}</TableCell>
                <TableCell>{trade.TrailTrigger}</TableCell>
                <TableCell>{trade.Trail}</TableCell>
                <TableCell>{trade.Instrument}</TableCell>
                <TableCell>{trade.Quantity}</TableCell>
                {/* <TableCell>{trade.ApexId}</TableCell> */}
                <TableCell>
                  <Button.Group>
                    <Button
                      outline
                      gradientDuoTone="greenToBlue"
                      onClick={() => handleEditClick(trade)}
                    >
                      <FaUserEdit className="mr-3 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      outline
                      gradientDuoTone="pinkToOrange"
                      onClick={() => handleDeleteTrade(trade.id)}
                    >
                      <MdDeleteForever className="mr-3 h-4 w-4" />
                      Delete
                    </Button>
                  </Button.Group>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>{isEditMode ? "Edit Trade" : "Add Trade"}</Modal.Header>
        <Modal.Body>
          <form className="space-y-6">
          <div>
              <Label htmlFor="TradeName" value="Trade Name" />
              <Dropdown
                label={newTrade.TradeName || "Select Trade Name"}
                className="ml-2"
                inline
                disabled ={isEditMode}
              >
                <Dropdown.Item 
                  onClick={() => setNewTrade((prevTrade) => ({ ...prevTrade, TradeName: "EVAL STD" }))}
                  title="Account balance between 49,500 and 52,799"
                >
                  EVAL STD
                </Dropdown.Item>
                
                <Dropdown.Item 
                  onClick={() => setNewTrade((prevTrade) => ({ ...prevTrade, TradeName: "EVAL Mini" }))}
                  title="Account balance greater than 52,800"
                >
                  EVAL Mini
                </Dropdown.Item>
                
                <Dropdown.Item 
                  onClick={() => setNewTrade((prevTrade) => ({ ...prevTrade, TradeName: "EVAL MAX" }))}
                  title="Account balance less than 49,500"
                >
                  EVAL MAX
                </Dropdown.Item>
                
                <Dropdown.Item 
                  onClick={() => setNewTrade((prevTrade) => ({ ...prevTrade, TradeName: "PA STD" }))}
                  title="Account balance between 49,000 and 52,799"
                >
                  PA STD
                </Dropdown.Item>
                
                <Dropdown.Item 
                  onClick={() => setNewTrade((prevTrade) => ({ ...prevTrade, TradeName: "PA Mini" }))}
                  title="Account balance greater than 52,800"
                >
                  PA Mini
                </Dropdown.Item>
                
                <Dropdown.Item 
                  onClick={() => setNewTrade((prevTrade) => ({ ...prevTrade, TradeName: "PA Max" }))}
                  title="Account balance less than 49,000"
                >
                  PA Max
                </Dropdown.Item>
              </Dropdown>
            </div>
            {/* <div>
              <Label htmlFor="Time" value="Time" />
              <TextInput
                type="time"
                id="Time"
                name="Time"
                placeholder="Enter Time"
                value={newTrade.Time}
                onChange={handleChange}
                required
              />
            </div> */}
            <div>
              <Label htmlFor="StopLoss" value="Stop Loss" />
              <TextInput
                type="number"
                id="StopLoss"
                name="StopLoss"
                placeholder="Enter Stop Loss"
                value={newTrade.StopLoss}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="Profit" value="Profit" />
              <TextInput
                type="number"
                id="Profit"
                name="Profit"
                placeholder="Enter Profit"
                value={newTrade.Profit}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="UseBreakeven"
                name="UseBreakeven"
                checked={newTrade.UseBreakeven === "true"}
                onChange={(e) =>
                  setNewTrade({
                    ...newTrade,
                    UseBreakeven: e.target.checked ? "true" : "false",
                  })
                }
              />
              <Label htmlFor="UseBreakeven">Enable Breakeven</Label>
            </div>
            <div>
              <Label htmlFor="BreakevenTrigger" value="Breakeven Trigger" />
              <TextInput
                type="number"
                id="BreakevenTrigger"
                name="BreakevenTrigger"
                placeholder="Enter Breakeven Trigger"
                value={newTrade.BreakevenTrigger}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="BreakevenOffset" value="Breakeven Offset" />
              <TextInput
                type="number"
                id="BreakevenOffset"
                name="BreakevenOffset"
                placeholder="Enter Breakeven Offset"
                value={newTrade.BreakevenOffset}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="UseTrail"
                name="UseTrail"
                checked={newTrade.UseTrail === "true"}
                onChange={(e) =>
                  setNewTrade({
                    ...newTrade,
                    UseTrail: e.target.checked ? "true" : "false",
                  })
                }
              />
              <Label htmlFor="UseTrail">Enable Trail</Label>
            </div>
            <div>
              <Label htmlFor="TrailTrigger" value="Trail Trigger" />
              <TextInput
                type="number"
                id="TrailTrigger"
                name="TrailTrigger"
                placeholder="Enter Trail Trigger"
                value={newTrade.TrailTrigger}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="Trail" value="Trail" />
              <TextInput
                type="number"
                id="Trail"
                name="Trail"
                placeholder="Enter Trail"
                value={newTrade.Trail}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="Instrument" value="Instrument" />
              <TextInput
                id="Instrument"
                name="Instrument"
                placeholder="Enter Instrument"
                value={newTrade.Instrument}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="Quantity" value="Quantity" />
              <TextInput
                type="number"
                id="Quantity"
                name="Quantity"
                placeholder="Enter Quantity"
                value={newTrade.Quantity}
                onChange={handleChange}
                required
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button gradientMonochrome="success" onClick={handleSaveTrade}>
            {isEditMode ? "Save Changes" : "Add Trade"}
          </Button>
          <Button gradientMonochrome="failure" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>


    </div>
  );
}