const express = require('express');
const app = express();

let branchData = require("./data/branch_data");
let regularMembershipData = require("./data/regularMembership_data");

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



app.get('/populateregmembership',(req, res) => {

    let createRegMem = 'CREATE TABLE IF NOT EXISTS RegularMembership(membership_id INTEGER, start_date DATE, expiration_date DATE, \n' +
        'payment_method CHAR(25), PRIMARY KEY(membership_id))';
    client.query(createRegMem, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(result.rows[0])
        }
    });

    let insertRegMem = 'INSERT INTO regularMembership(membership_id, start_date, expiration_date, paymentmethod) VALUES (0 0 0)';
    regularMembershipData.foreach((regularMembership) => {
        let arr = [regularMembership.membership_id, regularMembership.start_date, regularMembership.expiration_date, regularMembership.payment_method];
        client.query(insertRegMem, arr, (err, result) => {
            if(err) {
                console.log(err.message);
            }else{
                console.log(result.rows[0]);
            }
        });
    });
    res.send('doneMemeber')
});

app.get('/regmembership', async function (req, res) {
    let query = 'SELECT * FROM regularMembership';
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


