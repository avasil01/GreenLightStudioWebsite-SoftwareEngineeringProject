const express = require('express');
const path = require('path');
const app = express();
const Database = require('../db');
const config = {
  user: 'greenlight',
  password: 'Bzep3qnA',
  server: 'mssql.cs.ucy.ac.cy',
  database: 'greenlight',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const db = new Database(config);

async function main() {
  await db.connect();
  app.use(express.static(path.join(__dirname, '/')));
  app.use(express.json());

  //Route for home page
  app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
  });

  app.get('/aboutus', (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
  });

  // Route for Room info page
  app.get('/rooms', (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'rooms.html'));
  });

  // Route for bookings page
  app.get('/bookings', (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'bookings.html'));
  });

  app.post('/reservation', async (req, res) => {
    db.connect();
    var eTime, sTime;
    if (req.body.startTime.length == 4) {
      sTime = req.body.date + "T0" + req.body.startTime + ":00";
    }
    else {
      sTime = req.body.date + "T" + req.body.startTime + ":00";
    }
    if (req.body.endTime.length == 4) {
      eTime = req.body.date + "T0" + req.body.endTime + ":00";
    }
    else {
      eTime = req.body.date + "T" + req.body.endTime + ":00";
    }

    let roomID;
    if (req.body.roomSelect === "pink") {
      roomID = 1;
    }
    else if (req.body.roomSelect === "lightblue") {
      roomID = 2;
    }
    else if (req.body.roomSelect === "lightgreen") {
      roomID = 3;
    }
    else if (req.body.roomSelect === "lightsalmon") {
      roomID = 4;
    }

    try {
      await db.requestReservation(sTime, eTime, roomID, req.body.staff, req.body.equipment, req.body.email, req.body.firstName, req.body.lastName, req.body.phoneNumber, req.body.company);
      res.status(200).send();
    }
    catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.get('/getReservationsRange', async (req, res) => {
    try {
      function incrementMonthInDate(dateStr) {
        const dateParts = dateStr.split('-'); 
        let year = parseInt(dateParts[0]);
        let month = parseInt(dateParts[1]);
        let day = parseInt(dateParts[2]);
        if (month > 12) {
          month = 1; 
          year++;
        }

        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      let { startDate, endDate } = req.query;
      startDate = incrementMonthInDate(startDate);
      endDate = incrementMonthInDate(endDate);

      if (!startDate || !endDate) {
        return res.status(400).send('startDate and endDate query parameters are required');
      }

      const result = await db.getReservationsRange(startDate, endDate); 
      res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
  });

  // Start the server
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

main(); 
