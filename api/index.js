const express = require('express');
const app = express();
const fs = require('fs');

// Create a simple in-memory database
const customers = [];
const loans = [];
const rejectedLoans = [];

// Define routes
app.post('/bank/customer', (req, res) => {
  const customer = {
    id: customers.length + 1,
    accounts: {
      checking: null,
      savings: null
    },
    loans: []
  };
  customers.push(customer);
  res.json({ message: 'Customer created', data: customer });
});

app.post('/bank/customer/:customerId/account/:accountType', (req, res) => {
  const customerId = parseInt(req.params.customerId);
  const accountType = req.params.accountType;
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  if (customer.accounts[accountType]) {
    return res.status(400).json({ error: 'Account already exists' });
  }
  customer.accounts[accountType] = { balance: 0 };
  res.json({ message: 'Account created', data: customer.accounts[accountType] });
});

app.post('/bank/customer/:customerId/deposit/:accountType', (req, res) => {
  const customerId = parseInt(req.params.customerId);
  const accountType = req.params.accountType;
  const amount = parseFloat(req.query.amount);
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  const account = customer.accounts[accountType];
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  account.balance += amount;
  res.json({ message: 'Deposit successful', data: account });
});

app.post('/bank/customer/:customerId/withdraw/:accountType', (req, res) => {
  const customerId = parseInt(req.params.customerId);
  const accountType = req.params.accountType;
  const amount = parseFloat(req.query.amount);
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  const account = customer.accounts[accountType];
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  account.balance += amount;
  res.json({ message: 'Deposit successful', data: account });
});