const express = require('express');
const app = express();

let branchData = require("./data/branch_data");
let machineData = require("./data/branch_machines");
let roomData = require("./data/room");
let personalTrainerData = require("./data/branch_personalTrainer");

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

app.get('/populatemachine', (req, res) => {
	let createMachineQuery = 'CREATE TABLE Machine (mid INTEGER, date_bought DATE, condition CHAR(5), \n'+
	'last_maintenance DATE, cost INTEGER, type CHAR(20), branch_id INTEGER, PRIMARY KEY (mid), \n'+
	'FOREIGN KEY (branch_id) REFERENCES Branch ON DELETE SET NULL ON UPDATE CASCADE)';
	client.query(createMachineQuery, (err, result) => {
		if (err) {
			console.log(err.message);
		}
    });
    let insertMachine = 'INSERT INTO Machine(mid, date_bought, condition, last_maintenance, cost, type, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7)';
    machineData.forEach((machine) => {
		client.query(insertMachine, machine, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(result.rows[0]);
            }
        });
    });
    res.send('done');
});

app.get('/populateroom', (req, res) => {
	let createRoomQuery = 'CREATE TABLE IF NOT EXISTS Room(room_num INTEGER, capacity INTEGER,PRIMARY KEY (room_num))';
	client.query(createRoomQuery);
    let insertRoom = 'INSERT INTO Room(room_num, capacity) VALUES ($1, $2)';
    roomData.forEach((room) => {
        let arr = [room.room_num, room.capacity];
        client.query(insertRoom, arr, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(result.rows[0]);
            }
        });
    });
    res.send('done');
});

app.get('/populatepersonaltrainer', (req, res) => {
	let createPersonalTrainerQuery = 'CREATE TABLE PersonalTrainer(certification CHAR(5),sid INTEGER, PRIMARY KEY (sid),FOREIGN KEY (sid) REFERENCES Instructor ON DELETE CASCADE ON UPDATE CASCADE)';
	client.query(createPersonalTrainerQuery);
    let insertPersoanlTrainer = 'INSERT INTO PersonalTrainer(sid, certification) VALUES ($1, $2)';
    personalTrainerData.forEach((personTrainer) => {
        client.query(insertPersoanlTrainer, personTrainer, (err, result) => {
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

app.get('/Machine', async function (req, res) {
    let query = 'SELECT * FROM Machine';
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
app.get('/Room', async function (req, res) {
    let query = 'SELECT * FROM Room';
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

app.get('/PersonalTrainer', async function (req, res) {
    let query = 'SELECT * FROM PersonalTrainer';
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