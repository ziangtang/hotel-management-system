import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  // Fetch customers data
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Fetch data when component mounts or location changes
  useEffect(() => {
    console.log('Customers component mounted or location changed');
    fetchCustomers();
  }, [location]); // Re-fetch when location changes (after navigation)

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customers</h2>
        <Link to="/customers/new" className="btn btn-primary">Add New Customer</Link>
      </div>
      
      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.first_name} {customer.last_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.address}</td>
                  <td>
                    <Link to={`/customers/${customer.id}`} className="btn btn-sm btn-info me-2">View</Link>
                    <Link to={`/customers/edit/${customer.id}`} className="btn btn-sm btn-warning me-2">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;