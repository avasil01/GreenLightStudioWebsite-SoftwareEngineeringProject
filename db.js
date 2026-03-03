const sql = require('mssql');
const moment = require('moment-timezone');

class Database {
    constructor(config) {
        this.config = config;
    }

    async connect() {
        try {
            // Create connection pool and connect
            this.pool = await sql.connect(this.config);
            console.log('Connected to MSSQL');
        } catch (err) {
            console.error('Database connection failed: ', err);
            throw err;
        }
    }

    async query(queryString) {
        try {
            const request = this.pool.request();
            var result = await request.query(queryString);
            return result;
        } catch (err) {
            console.error('Query failed: ', err);
            throw err;
        }
    }

    async getAccessKey() {
        try {
            const request = this.pool.request();
            const result = await this.query("EXEC GETACCESSKEY");
            return result.recordset[0].EncryptedKey;
        } catch (err) {
            console.error('Error executing GetAccessKey:', err);
            throw err;
        }
    }

    async cancelReservation(id) {
        try {
            const request = this.pool.request();
            request.input('reservationID', sql.Int, id);
            const result = request.query("EXEC cancelReservation @reservationID");
            return result; 
        } catch (err) {
            console.error('Error executing cancelReservation:', err);
            throw err;
        }
    }

    async getContactDetails(contactID) {
        try {
            const request = this.pool.request();
            request.input('CONTACTID', sql.Int, contactID);
            const result = request.query("EXEC getContactDetails @CONTACTID");
            return result; 
        } catch (err) {
            console.error('Error executing getContactDetails:', err);
            throw err;
        }
    }

    async getEquipment(equipmentCode) {
        try {
            const request = this.pool.request();
            request.input('EQUIPMENTCODE', sql.Int, equipmentCode);
            const result = request.query("EXEC getEquipment @EQUIPMENTCODE");
            return result; 
        } catch (err) {
            console.error('Error executing getEquipment:', err);
            throw err;
        }
    }

    async getReservation(reservationID) {
        try {
            const request = this.pool.request();
            request.input('RESERVATIONID', sql.Int, reservationID);
            const result = request.query("EXEC getReservation @RESERVATIONID");
            return result; 
        } catch (err) {
            console.error('Error executing getReservation:', err);
            throw err;
        }
    }

    async getReservationRangeOnRoom(startDate,endDate,roomID) {
        try {
            const request = this.pool.request();
            request.input('STARTDATE', sql.Date, startDate);
            request.input('ENDDATE', sql.Date, endDate);
            request.input('ROOMID', sql.Int, roomID);
            const result = request.query("EXEC getReservationRangeOnRoom @STARTDATE,@ENDDATE,@ROOMID");
            return result; 
        } catch (err) {
            console.error('Error executing getReservationRangeOnRoom:', err);
            throw err;
        }
    }

    async getReservationsRange(startDate,endDate) {
        try {
            const request = this.pool.request();
            request.input('STARTDATE', sql.Date, startDate);
            request.input('ENDDATE', sql.Date, endDate);
            const result = request.query("EXEC getReservationsRange @STARTDATE,@ENDDATE");
            return result; 
        } catch (err) {
            console.error('Error executing getReservationsRange:', err);
            throw err;
        }
    }

    async getRooms() {
        try {
            const request = this.pool.request();
            const result = request.query("EXEC getRooms");
            return result;
        } catch (err) {
            console.error('Error executing getRooms:', err);
            throw err;
        }
    }

    async getStafflist(staffCode) {
        try {
            const request = this.pool.request();
            request.input('STAFFCODE', sql.Int, staffCode);
            const result = request.query("EXEC getStafflist @STAFFCODE");
            return result; 
        } catch (err) {
            console.error('Error executing getStafflist:', err);
            throw err;
        }
    }

    async modifyReservation(reservationID, newStartTime, newEndTime, newRoomID, newStaff, newEquipment) {
        try {
            const request = this.pool.request();
            request.input('RESERVATIONID', sql.Int, reservationID);
            request.input('NEWSTARTTIME', sql.DateTime, moment.utc(newStartTime).add(2, 'hours').format('YYYY-MM-DD HH:mm:ss'));
            request.input('NEWENDTIME', sql.DateTime, moment.utc(newEndTime).add(2, 'hours').format('YYYY-MM-DD HH:mm:ss'));
            request.input('NEWROOMID', sql.Int, newRoomID);
            request.input('NEWSTAFF', sql.VarChar, newStaff);
            request.input('NEWEQUIPMENT', sql.VarChar, newEquipment);
            const result = request.query("EXEC modifyReservation @RESERVATIONID,@NEWSTARTTIME,@NEWENDTIME,@NEWROOMID,@NEWSTAFF,@NEWEQUIPMENT");
            return result;
        } catch (err) {
            console.error('Error executing modifyReservation:', err);
            throw err;
        }
    }

    async verifyReservation(reservationID) {
        try {
            const request = this.pool.request();
            request.input('RESERVATIONID', sql.Int, reservationID);
            const result = request.query("EXEC verifyReservation @RESERVATIONID");
            return result; 
        } catch (err) {
            console.error('Error executing verifyReservation:', err);
            throw err;
        }
    }

    async requestReservation(startTime, endTime, roomID, staff, equipment, email, first_name, last_name, phone_number, company_name) {
        try {
            const request = this.pool.request();
            request.input('STARTTIME', sql.DateTime,  moment.utc(startTime).add(2, 'hours').format('YYYY-MM-DD HH:mm:ss'));
            request.input('ENDTIME', sql.DateTime, moment.utc(endTime).add(2, 'hours').format('YYYY-MM-DD HH:mm:ss'));
            request.input('ROOMID', sql.Int, roomID);
            request.input('STAFF', sql.VarChar, staff);
            request.input('EQUIPMENT', sql.VarChar, equipment);
            request.input('EMAIL', sql.VarChar, email);
            request.input('FIRSTNAME', sql.VarChar, first_name);
            request.input('LASTNAME', sql.VarChar, last_name);
            request.input('PHONENUMBER', sql.VarChar, phone_number);
            request.input('COMPANYNAME', sql.VarChar, company_name);
            const result = request.query("EXEC requestReservation @STARTTIME,@ENDTIME,@ROOMID,@STAFF,@EQUIPMENT,@EMAIL,@FIRSTNAME,@LASTNAME,@PHONENUMBER,@COMPANYNAME");
            return result;
        } catch (err) {
            console.error('Error executing requestReservation:', err);
            throw err;
        }
    }

    async getReservationDetails() {
        try{
            const result = this.pool.request().query('EXEC getReservationDetails');
            return result;
        }
        catch(err) {
            console.error('Error executing getReservationDetails: ', err);
            throw err;
        }
    }

    // Method to close the database connection
    async close() {
        try {
            await sql.close();
            console.log('Connection closed.');
        } catch (err) {
            console.error('Error closing connection: ', err);
            throw err;
        }
    }
}

// Export the class
module.exports = Database;
