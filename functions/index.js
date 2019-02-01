const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// const createexcel = require('./CreateExcel')
const mysql = require('mysql');
const express = require('express');
const bodyparser = require('body-parser');

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());



let connection = mysql.createPool({
  host: functions.config().webster.hostname,
    user: functions.config().webster.username,
    password: functions.config().webster.password,
    database: functions.config().webster.database

});

connection.getConnection((err) => {
    if (!err)
        console.log('Mysql connected');
    else
        console.log('connection failed');
});

app.get('/createexcel', (req, res) => {
    var Excel = require('exceljs');
    // A new Excel Work Book
    var workbook = new Excel.Workbook();


    // Some information about the Excel Work Book.
    workbook.creator = 'Mayank Sanghvi';
    workbook.lastModifiedBy = '';
    workbook.created = new Date(2018, 6, 19);
    workbook.modified = new Date();
    workbook.lastPrinted = new Date(2016, 9, 27);

    workbook.views = [
        {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
        }
    ]

    // Create a sheet
    var sheet = workbook.addWorksheet('Sheet1');
    // A table header
    sheet.columns = [
        { header: 'Id', key: 'id' },
        { header: 'Course', key: 'course' },
        { header: 'URL.', key: 'url' }
    ]

    // Add rows in the above header
    // sheet.addRow({id: 1, course: 'HTML', url:'https://vlemonn.com/tutorial/html' });
    // sheet.addRow({id: 2, course: 'Java Script', url: 'https://vlemonn.com/tutorial/java-script'});
    // sheet.addRow({id: 3, course: 'Electron JS', url: 'https://vlemonn.com/tutorial/electron-js'});
    // sheet.addRow({id: 4, course: 'Node JS', url: 'https://vlemonn.com/tutorial/node-js'});

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile("My First Excel.xlsx")
    // .then(function() {
    //     // Success Message
    //     alert("File Saved");
    // });
    res.send('excel created')


});


app.get('/ta', (req, res) => {
    connection.query('select userid, DATE_FORMAT(checktime, "%W, %M %e %Y") checkdate,  time(min(checktime)) checkintime, time(max(checktime)) checkouttime, serialno from webster.webster_checkinout group by userid, date(checktime)', (error, results, fields) => {
        // connection.query('select userid, date(checktime) checkdate,  time(min(checktime)) checkintime, time(max(checktime)) checkouttime, serialno from webster.webster_checkinout group by userid, date(checktime)', (error, results, fields)=>{
        // connection.query('SELECT * FROM webster_checkinout', (error, results, fields)=>{

        // 
        //             select   userid, date(checktime), time(checktime), min(checktime), max(checktime)
        //  from webster.webster_checkinout group by userid, date(checktime);

        if (!error)
            res.send(results);
        else
            res.send(error);
    })
});

app.get('/test', (req, res) => {
    res.send("Test pass");

});

app.get('/:serialno', (req, res) => {
    connection.query('SELECT * FROM webster_checkinout WHERE serialno = ?', [req.params.serialno], (error, results, fields) => {
        if (!error)
            res.send(results);
        else
            res.send(error);
    })
});

app.get('/:fromDate/:toDate', (req, res) => {
    const fromDate = new Date(req.params.fromDate);
    const toDate = new Date(req.params.toDate);
    connection.query('SELECT * FROM webster_checkinout WHERE checktime BETWEEN ? AND ?', [fromDate, toDate], (error, results, fields) => {
        if (!error)
            res.send(results);
        else
            res.send(error);
    })
});

exports.app = functions.https.onRequest(app);

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API server started on port ${port}... `)
});


