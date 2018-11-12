const express = require('express');
const app = express();

let branchData = require("./data/branch_data");
let instructorData = require("./data/instructor_data");

const pg = require('pg');
const client = new pg.Client({
    user: "ldkazcmbjgsuwd",
    password: "5d89b5fd97cdf96343d3a97e34e3802890922b99e9198ae45b93fafdbaf3badb",
    database: "dd7dpk6dg5oidc",
    port: 5432,
    host: "ec2-50-19-127-158.compute-1.amazonaws.com",
    ssl: true
});
client.connect();

// CREATE TABLE FOR BRANCH
app.get('/', async function (req, res) {
    let query = 'CREATE TABLE IF NOT EXISTS Branch(branch_id INTEGER, address CHAR(50),\n' +
       'phone_no CHAR(12), PRIMARY KEY(branch_id))';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(result.rows[0])
        }
    });
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/populatebranch', (req, res) => {
    let insertBranch = 'INSERT INTO Branch(branch_id, address, phone_no) VALUES ($1, $2, $3)';
    branchData.forEach((branch) => {
        let arr = [branch.branch_id, branch.address, branch.phone_no];
        client.query(insertBranch, arr, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(result.rows[0]);
            }
        });
    });
    res.send('done');
});

// CREATE AND POPULATE TABLE FOR INSTRUCTOR
app.get('/populateinstructor', (req, res) => {
    // let query = "DROP TABLE INSTRUCTOR";
    let query = 'CREATE TABLE IF NOT EXISTS Instructor(sid INTEGER, name CHAR(20),\n' +
        'phone_no CHAR(12), email CHAR(40), date_joined DATE, hourly_wage INTEGER,\n' +
        'PRIMARY KEY(sid))';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message)
        } else {
            console.log(result.rows[0])
        }
    });

    let insertBranch = 'INSERT INTO Instructor(sid, name, phone_no, email, date_joined, hourly_wage) VALUES ($1, $2, $3, $4, $5, $6)';
    instructorData.forEach((instructor) => {
        let arr = [instructor.sid, instructor.name, instructor.phone_num, instructor.email, instructor.date_joined,
            instructor.hourly_wage];
        client.query(insertBranch, arr, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(result[0]);
            }
        });
    });
    res.send('done');
});

app.get('/instructors', async function (req, res) {
    let query = 'SELECT * FROM Instructor';
    client.query(query, (err, result) => {
        if (err) {
            res.send(err.message);
            return;
        } else {
            res.send(JSON.stringify(result.rows));
            return;
        }
    });
});
app.get('/branches', async function (req, res) {
    let query = 'SELECT * FROM Branch';
    client.query(query, (err, result) => {
        if (err) {
            res.send(err.message);
            return;
        } else {
            res.send(JSON.stringify(result.rows));
            return;
        }
    });
});

app.listen(process.env.PORT || 5000, () => {
    console.log('Server started succesfully.');
});