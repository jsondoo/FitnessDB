const express = require('express');
const mysql = require('mysql');
const app = express();
const portNo = '3000';

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fitnessdb'
});

// Connect to db
db.connect((err) => {
    if (err) {
        console.log('Could not connect to database');
        return;
    }
    console.log('Successfully connected!');
});

// Route for creating a database
app.get('/createdb', (req, res) => {
   let query = 'CREATE DATABASE fitnessdb';
   db.query(query, (err, result) => {
       if (err) {
           console.log(err.sqlMessage);
           res.send(err.sqlMessage);
           return;
       }
       console.log(result);
       res.send('Database created!');
   });
});

// Creates BRANCH table and populates it with data
app.get('/createbranch', (req, res) => {
    let branch = 'CREATE TABLE Branch(\n' +
        'branch_id INTEGER,\n' +
        'address CHAR(50),\n' +
        'phone_no CHAR(10),\n' +
        'PRIMARY KEY(branch_id))\n';
    db.query(branch, (err, result) => {
        if (err) {
            console.log(err.sqlMessage);
            res.send(err.sqlMessage);
            return;
        }
        console.log('Created Branch Table');
    });

    let insertBranch = 'INSERT INTO Branch SET ?';
    // Mock data
    let branches = [
        {
            branch_id: 101,
            address: '420 Bubble Tea Street',
            phone_no: '7783121224'
        },
        {
            branch_id: 123,
            address: '6789 Muscular Drive',
            phone_no: '7789881234'
        },
        {
            branch_id: 103,
            address: '202-5122 North Avenue',
            phone_no: '7789801004'
        },
        {
            branch_id: 102,
            address: '9088 Protein Street',
            phone_no: '7789086565'
        },
    ];

    branches.forEach((branch) => {
        db.query(insertBranch, branch, (err, result) => {
            if (err) {
                console.log(err.sqlMessage);
                res.send(err.sqlMessage);
                return;
            }
            console.log('Branch ' + branch.branch_id + ' created');
        });
    });
});

app.get('/getbranches', (req, res) => {
    let query = 'SELECT * FROM Branch';
    db.query(query, (err, results) => {
        if (err) {
            console.log(err.sqlMessage);
            res.send(err.sqlMessage);
            return;
        }
        res.send(results);
    });
});

app.get('/getbranch/:id', (req, res) => {
   let query = `SELECT * FROM Branch WHERE branch_id = ${req.params.id}`;
    db.query(query, (err, result) => {
        if (err) {
            console.log(err.sqlMessage);
            res.send(err.sqlMessage);
            return;
        }
        res.send(result);
    });
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(portNo, () => {
    console.log('Server started on port ' + portNo);
});