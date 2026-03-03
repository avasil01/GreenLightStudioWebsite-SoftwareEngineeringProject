const sha256 = require('./encrypt.js');
const Database = require('../db.js');
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
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();

async function main() {
    try {
        await db.connect();
        const sessionSecret = await db.getAccessKey();
        app.use(session({
            secret: sessionSecret,
            resave: false,
            saveUninitialized: true,
            cookie: { secure: !true } // Set to true in production with HTTPS
        }));

        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(express.static('public'));

        // Redirect root to login
        app.get('/', (req, res) => {
            res.redirect('/login');
        });

        // Route for the login page
        app.get('/login', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'login.html'));
        });

        function checkAuthentication(req, res, next) {
            if (req.session.authenticated) {
                next();
            } else {
                res.redirect('/login');
            }
        }

        app.use('/shared', express.static('../shared'));

        app.get('/calendar', checkAuthentication, (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'calendar.html'));
        });

        // Protected route for the manage page
        app.get('/manage', checkAuthentication, (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'manage.html'));
        });

        // Logout route
        app.get('/logout', (req, res) => {
            req.session.destroy();
            res.redirect('/login');
        });

        app.get('/reservations', async (req, res) => {
            try {
                const result = await db.getReservationDetails();
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

        app.post('/login', async (req, res) => {
            try {
                const hashedInput = await sha256(req.body.accessKey);
                if (hashedInput === sessionSecret) {
                    req.session.authenticated = true;
                    res.redirect('/calendar');
                } else {
                    res.status(403).send('Access Denied');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('An error occurred');
            }
        });

        app.post('/acceptReservation/:reservationID', async (req, res) => {
            try {
                const reservationID = req.params.reservationID;
                await db.verifyReservation(reservationID);
                res.status(200).send('Reservation verified');
            } catch (err) {
                console.error('Error verifying reservation:', err);
                res.status(500).send(err.message);
            }
        });

        app.post('/cancelReservation/:reservationID', async (req, res) => {
            try {
                const reservationID = req.params.reservationID;
                await db.cancelReservation(reservationID);
                res.status(200).send('Reservation cancelled');
            } catch (err) {
                console.error('Error cancelling reservation:', err);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/modifyReservation/:reservationID/:newStartTime/:newEndTime/:newRoomID/:newStaff/:newEquipment', async (req, res) => {
            try {
                const reservationID = req.params.reservationID;
                const newStartTime = req.params.newStartTime;
                const newEndTime = req.params.newEndTime;
                const newRoomID = req.params.newRoomID;
                const newStaff = req.params.newStaff;
                const newEquipment = req.params.newEquipment;
                await db.modifyReservation(reservationID, newStartTime, newEndTime, newRoomID, newStaff, newEquipment);
                res.status(200).send('Reservation modified successfully.');
            } catch (err) {
                console.error('Error modifying reservation:', err);
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

        app.post('/getReservation', async(req,res) =>{
            try{
                const reservationID = req.body.reservationId;
                const result = await db.getReservation(reservationID);
                res.json(result.recordset);
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
        }); 

        app.post('/getStaff', async(req,res) =>{
            try{
                const staffCode = req.body.staffCode;
                const result = await db.getStafflist(staffCode)
                res.json(result.recordset);
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/getContact', async(req,res) =>{
            try{
                const contactId = req.body.contactID;
                const result = await db.getContactDetails(contactId)
                res.json(result.recordset);
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/getEquipment', async(req,res) =>{
            try{
                const equipmentCode = req.body.equipmentCode;
                const result = await db.getEquipment(equipmentCode)
                res.json(result.recordset);
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
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

    } catch (err) {
        console.error(err);
    }
}

main();