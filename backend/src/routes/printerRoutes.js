const express = require('express');
const router = express.Router();
const { testPrinterConnection } = require('../utils/printerService');

router.get('/test', async (req, res) => {
  const result = await testPrinterConnection();
  res.json(result);
});

module.exports = router;
