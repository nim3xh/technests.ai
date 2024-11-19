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
} from "flowbite-react";
import { HiHome, HiPlusCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import axios from "axios";
import { FaUserEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

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
    StopLoss: "",
    Profit: "",
    UseBreakeven: "",
    BreakevenTrigger: "",
    BreakevenOffset: "",
    UseTrail: "",
    TrailTrigger: "",
    Trail : ""
  });

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
  }, [currentUser]);

  // Reset the form
  const resetForm = () => {
    setNewTrade({
      TradeName: "",
      Instrument: "",
      Quantity: "",
      StopLoss: "",
      Profit: "",
      UseBreakeven: "",
      BreakevenTrigger: "",
      BreakevenOffset: "",
      UseTrail: "",
      TrailTrigger: "",
      Trail : ""
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
        StopLoss: newTrade.StopLoss.toString(),
        Profit: newTrade.Profit.toString(),
        BreakevenTrigger: newTrade.BreakevenTrigger.toString(),
        BreakevenOffset: newTrade.BreakevenOffset.toString(),
        TrailTrigger: newTrade.TrailTrigger.toString(),
        Trail: newTrade.Trail.toString(),
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
      setError("Something went wrong while saving trade.");
    }
  };
  

  const handleAddClick = () => { 
    resetForm(); // Clear the form
    setShowModal(true); // Open the modal
  }
  
  // Function to open the edit modal and pre-fill form
  const handleEditClick = (trade) => {
    setNewTrade(trade); // Pre-fill with existing trade data
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

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="/dashboard?tab=dash" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Trades</Breadcrumb.Item>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-3">
        <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
          All Trades
        </h1>
        {currentUser.user.role === "admin" && (
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
            <TableHeadCell>Instrument</TableHeadCell>
            <TableHeadCell>Quantity</TableHeadCell>
            <TableHeadCell>Stop Loss</TableHeadCell>
            <TableHeadCell>Profit</TableHeadCell>
            <TableHeadCell>Use Breakeven</TableHeadCell>
            <TableHeadCell>Breakeven Trigger</TableHeadCell>
            <TableHeadCell>Breakeven Offset</TableHeadCell>
            <TableHeadCell>Use Trail</TableHeadCell>
            <TableHeadCell>Trail Trigger</TableHeadCell>
            <TableHeadCell>Trail</TableHeadCell>
            <TableHeadCell></TableHeadCell>
          </TableHead>
          <TableBody>
            {tradesData.map((trade, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{trade.TradeName}</TableCell>
                <TableCell>{trade.Instrument}</TableCell>
                <TableCell>{trade.Quantity}</TableCell>
                <TableCell>{trade.StopLoss}</TableCell>
                <TableCell>{trade.Profit}</TableCell>
                <TableCell>{trade.UseBreakeven ? "TRUE" : "FALSE"}</TableCell>
                <TableCell>{trade.BreakevenTrigger}</TableCell>
                <TableCell>{trade.BreakevenOffset}</TableCell>'
                <TableCell>{trade.UseTrail ? "TRUE" : "FALSE"}</TableCell>
                <TableCell>{trade.TrailTrigger}</TableCell>
                <TableCell>{trade.Trail}</TableCell>
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
          <div className="space-y-6">
            <div>
              <Label htmlFor="TradeName" value="TradeName">TradeName</Label>
              <TextInput
                id="TradeName"
                name="TradeName"
                placeholder="TradeName"
                value={newTrade.TradeName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="Instrument" value="Instrument">Instrument</Label>
              <TextInput
                id="Instrument"
                name="Instrument"
                placeholder="Instrument"
                value={newTrade.Instrument}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="Quantity" value="Quantity">Quantity</Label>
              <TextInput
                type="number"
                id="Quantity"
                name="Quantity"
                placeholder="Quantity"
                value={newTrade.Quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="StopLoss" value="StopLoss">StopLoss</Label>
              <TextInput
                type="number"
                id="StopLoss"
                name="StopLoss"
                placeholder="StopLoss"
                value={newTrade.StopLoss}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="Profit" value="Profit">Profit</Label>
              <TextInput
                type="number"
                id="Profit"
                name="Profit"
                placeholder="Profit"
                value={newTrade.Profit}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="UseBreakeven" value="UseBreakeven">UseBreakeven</Label>
              <TextInput
                id="UseBreakeven"
                name="UseBreakeven"
                placeholder="UseBreakeven"
                value={newTrade.UseBreakeven}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="BreakevenTrigger" value="BreakevenTrigger">BreakevenTrigger</Label>
              <TextInput
                type="number"
                id="BreakevenTrigger"
                name="BreakevenTrigger"
                placeholder="BreakevenTrigger"
                value={newTrade.BreakevenTrigger}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="BreakevenOffset" value="BreakevenOffset">BreakevenOffset</Label>
              <TextInput
                type="number"
                id="BreakevenOffset"
                name="BreakevenOffset"
                placeholder="BreakevenOffset"
                value={newTrade.BreakevenOffset}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="UseTrail" value="UseTrail">UseTrail</Label>
              <TextInput
                id="UseTrail"
                name="UseTrail"
                placeholder="UseTrail"
                value={newTrade.UseTrail}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="TrailTrigger" value="TrailTrigger">TrailTrigger</Label>
              <TextInput
                type="number"
                id="TrailTrigger"
                name="TrailTrigger"
                placeholder="TrailTrigger"
                value={newTrade.TrailTrigger}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="Trail" value="Trail">Trail</Label>
              <TextInput
                type="number"
                id="Trail"
                name="Trail"
                placeholder="Trail"
                value={newTrade.Trail}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button gradientMonochrome="success" onClick={handleSaveTrade}>
            {isEditMode ? "Save Changes" : "Add Trade"}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}
