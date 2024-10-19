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
import { FaEye } from "react-icons/fa";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashTrades() {
  const { currentUser } = useSelector((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [tradesData, setTradesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTrade, setNewTrade] = useState({
    SL: "",
    TP: "",
    Instrument: "",
    Quantity: "",
    TrailingSL: "",
    Steps: "",
    BreakEven: "",
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
  }

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleAddTrade = async () => {
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      await axios.post(`${BaseURL}trades`, newTrade, { headers });
      fetchData();
      setNewTrade({
        SL: "",
        TP: "",
        Instrument: "",
        Quantity: "",
        TrailingSL: "",
        Steps: "",
        BreakEven: "",
      });
      setShowModal(false);
    } catch (err) { 
      setError("Something went wrong while adding trade.");
    }
  };

  const handleChange = (e) => {
    setNewTrade({
      ...newTrade,
      [e.target.name]: e.target.value,
    });
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
            onClick={() => setShowModal(true)}
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
            <TableHeadCell>SL</TableHeadCell>
            <TableHeadCell>TP</TableHeadCell>
            <TableHeadCell>Instrument</TableHeadCell>
            <TableHeadCell>Quantity</TableHeadCell>
            <TableHeadCell>TrailingSL</TableHeadCell>
            <TableHeadCell>Steps</TableHeadCell>
            <TableHeadCell>BreakEven</TableHeadCell>
          </TableHead>
          <TableBody>
            {tradesData.map((trade, index) => (
              <TableRow key={index}>
                <TableCell>{trade.id}</TableCell>
                <TableCell>{trade.SL}</TableCell>
                <TableCell>{trade.TP}</TableCell>
                <TableCell>{trade.Instrument}</TableCell>
                <TableCell>{trade.Quantity}</TableCell>
                <TableCell>{trade.TrailingSL}</TableCell>
                <TableCell>{trade.Steps}</TableCell>
                <TableCell>{trade.BreakEven}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Add Trade</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <Label htmlFor="SL" value="SL">
                SL
              </Label>
              <TextInput
                id="SL"
                name="SL"
                placeholder="SL"
                value={newTrade.SL}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="TP" value="TP">
                TP
              </Label>
              <TextInput
                id="TP"
                name="TP"
                placeholder="TP"
                value={newTrade.TP}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="Instrument" value="Instrument">
                Instrument
              </Label>
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
              <Label htmlFor="Quantity" value="Quantity">
                Quantity
              </Label>
              <TextInput
                id="Quantity"
                name="Quantity"
                placeholder="Quantity"
                value={newTrade.Quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="TrailingSL" value="TrailingSL">
                TrailingSL
              </Label>
              <TextInput
                id="TrailingSL"
                name="TrailingSL"
                placeholder="TrailingSL"
                value={newTrade.TrailingSL}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="Steps" value="Steps">
                Steps
              </Label>
              <TextInput
                id="Steps"
                name="Steps"
                placeholder="Steps"
                value={newTrade.Steps}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="BreakEven" value="BreakEven">
                BreakEven
              </Label>
              <TextInput
                id="BreakEven"
                name="BreakEven"
                placeholder="BreakEven"
                value={newTrade.BreakEven}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button gradientMonochrome="success" onClick={handleAddTrade}>
            Add Trade
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
