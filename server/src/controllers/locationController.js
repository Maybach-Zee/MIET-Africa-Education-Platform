const path = require('path');
const fs = require('fs');

exports.getLocations = (req, res) => {
  const filePath = path.join(__dirname, '../../data/locations.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to load location data' });
    }
    res.json(JSON.parse(data));
  });
};