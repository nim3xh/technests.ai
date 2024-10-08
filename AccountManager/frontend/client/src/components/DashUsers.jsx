import { React, useState, useEffect } from "react";
import { HiHome } from "react-icons/hi";
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
import { useSelector } from "react-redux";
import {
  HiOutlineExclamationCircle,
  HiPlusCircle,
  HiUserAdd,
} from "react-icons/hi";
import axios from "axios";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
      firstName: "",
      lastName: "",
      apexAccountNumber: "",
      email: "",
      password: "",
      role: "admin", // Default role
    });

  const fetchData = async () => {
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const usersResponse = await axios.get(`${BaseURL}userCredentials`, {
        headers,
      });
      setUserData(usersResponse.data);
      setLoading(false);
    } catch (err) {
      setError("Something went wrong while fetching data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleAddUser = async () => {
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      await axios.post(`${BaseURL}userCredentials`, newUser, { headers });
      setShowModal(false); // Close modal on success
      fetchData(); // Refresh user data after adding a new user
    } catch (err) {
      setError("Error adding user.");
    }
  };

  const handleChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteUser = async (id) => {
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      await axios.delete(`${BaseURL}userCredentials/${id}`, { headers });
      // Refresh user data after deletion
      fetchData();
    } catch (err) {
      setError("Error deleting user.");
    }
  };
  
  function getUserRoleDisplay(role) {
    switch (role) {
      case "admin":
        return "Admin";
      case "user":
        return "User";
      case "super-user":
        return "Super User";
      default:
        return "Unknown Role";
    }
  }

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="#" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Users</Breadcrumb.Item>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-3">
        <h1 className="mt-3 mb-3 text-left font-semibold text-xl">All Users</h1>
        {currentUser.user.role === "admin" && (
          <Button
            gradientDuoTone="greenToBlue"
            onClick={() => setShowModal(true)}
            className="ml-3"
          >
            <HiPlusCircle className="mr-2 h-6 w-4" />
            Add New User
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
            <TableHeadCell>First Name</TableHeadCell>
            <TableHeadCell>Last Name</TableHeadCell>
            <TableHeadCell>Account Number</TableHeadCell>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>Role</TableHeadCell>
          </TableHead>
          <TableBody>
            {userData.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.FirstName}</TableCell>
                <TableCell>{user.LastName}</TableCell>
                <TableCell>{user.ApexAccountNumber}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getUserRoleDisplay(user.role)}</TableCell>
                <TableCell>
                  {currentUser.user.role === "admin" && (
                    <Button
                      gradientMonochrome="failure"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={!!(currentUser.user.email === user.email)}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Add New User</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <Label htmlFor="firstName" value="First Name" />
              <TextInput
                id="firstName"
                name="firstName"
                value={newUser.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" value="Last Name" />
              <TextInput
                id="lastName"
                name="lastName"
                value={newUser.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="apexAccountNumber" value="Apex Account Number" />
              <TextInput
                id="apexAccountNumber"
                name="apexAccountNumber"
                value={newUser.apexAccountNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" value="Email" />
              <TextInput
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password" value="Password" />
              <TextInput
                id="password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="role" value="Role" />
              <Select
                id="role"
                name="role"
                value={newUser.role}
                onChange={handleChange}
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="super-user">Super User</option>
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAddUser}>Add User</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
