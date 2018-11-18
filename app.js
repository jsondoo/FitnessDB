const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded());

let branchData = require("./data/branch_data");
let machineData = require("./data/branch_machines");
let roomData = require("./data/room");
let personalTrainerData = require("./data/branch_personalTrainer");
let customerData = require("./data/customer_data");
let regularMembershipData = require("./data/regularMembership_data");
let instructorData = require("./data/instructor_data");
let premiumMemberData = require("./data/premiumMember_data");
let memberData = require("./data/member_data");
let classData = require("./data/class_data");
let attendData = require("./data/attend_data");
let bodyProfileData = require("./data/bodyprofile_data");


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

// Below endpoints serve HTML files
app.get('/', async function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/employee', function (req, res) {
    res.sendFile(__dirname + '/public/employee.html');
});

app.get('/customerhub', function (req, res) {
    res.sendFile(__dirname + '/public/customerhub.html');
});

app.get('/attend', function (req, res) {
    res.sendFile(__dirname + '/public/attend.html');
});

app.get('/machine', function (req, res) {
    res.sendFile(__dirname + '/public/machine.html');
});

app.get('/class', function (req, res) {
    res.sendFile(__dirname + '/public/class.html');
});

app.get('/bodyprofile', function (req, res) {
    res.sendFile(__dirname + '/public/bodyprofile.html');
});

app.get('/membership', function (req, res) {
    res.sendFile(__dirname + '/public/membership.html');
});

app.get('/branch', function (req, res) {
    res.sendFile(__dirname + '/public/branch.html');
});

app.get('/customer', function (req, res) {
    res.sendFile(__dirname + '/public/customer.html');
});

// Below are endpoints for populating data
app.get('/populatecustomer', (req, res) => {
    client.query('DROP TABLE Customer', (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log('Dropped customer table');
        }
    });
    let queryA = 'CREATE TABLE IF NOT EXISTS Customer(email CHAR(40), name CHAR(20), date_of_birth DATE, address CHAR(50), phone_no CHAR(12), last_visit_date DATE, PRIMARY KEY (email))';
    // Create Customer table
    client.query(queryA, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log('Created Customer table');
        }
    });
    let insertCustomer = 'INSERT INTO Customer(email, name, date_of_birth, address, phone_no, last_visit_date) VALUES ($1, $2, $3, $4, $5, $6)';
    customerData.forEach((c) => {
        let arr = [c.email, c.name, c.date_of_birth, c.address, c.phone_no, c.last_visit_date];
        client.query(insertCustomer, arr, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(c.email + " succesfully added.");
            }
        });
    });
    res.send('done inserting customers rows');
});

app.get('/populateclass', (req, res) => {
    let dropClass = 'DROP TABLE Class';
    client.query(dropClass, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(result.rows[0])
        }
    });

    let createClass = 'CREATE TABLE IF NOT EXISTS Class(time DATE, room_num INTEGER, sid INTEGER, \n' +
        'class_type CHAR(20), PRIMARY KEY(time, room_num), FOREIGN KEY (sid) REFERENCES Instructor ON DELETE SET NULL \n' +
        'ON UPDATE CASCADE)';
    client.query(createClass, (err, result) => {
        if (err) {
            console.log(err.message)
        } else {
            console.log(result.rows[0])
        }
    });

    let insertClasses = 'INSERT INTO Class(time, room_num, sid, class_type) VALUES ($1, $2, $3, $4)';
    classData.forEach((singleClass) => {
        let arr = [singleClass.time, singleClass.room_num, singleClass.sid, singleClass.course_type];
        client.query(insertClasses, arr, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(result.rows[0]);
            }
        });
    });
    res.send('doneMember');
});

app.get('/populateregmembership', (req, res) => {
    let dropTable = 'DROP TABLE RegularMembership';
    client.query(dropTable, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(result.rows[0])
        }
    });

    let createRegMem = 'CREATE TABLE IF NOT EXISTS RegularMembership(membership_id INTEGER, start_date DATE, expiration_date DATE, \n' +
        'payment_method CHAR(25), PRIMARY KEY(membership_id))';
    client.query(createRegMem, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(result.rows[0])
        }
    });

    let insertRegMem = 'INSERT INTO regularMembership(membership_id, start_date, expiration_date, payment_method) VALUES ($1, $2, $3, $4)';
    regularMembershipData.forEach((regularMembership) => {
        let arr = [regularMembership.membership_id, regularMembership.start_date, regularMembership.expiration_date, regularMembership.payment_method];
        client.query(insertRegMem, arr, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(result.rows[0]);
            }
        });
    });
    res.send('doneMember');
});

app.get('/populatepremiummember', (req, res) => {
    let createPremiumMemberQuery = 'CREATE TABLE PremiumMembership( membership_id INTEGER, sid INTEGER, PRIMARY KEY (membership_id), \n' +
        'FOREIGN KEY (membership_id) REFERENCES regularMembership ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (sid) REFERENCES PersonalTrainer \n' +
        'ON DELETE CASCADE ON UPDATE CASCADE)';
    client.query(createPremiumMemberQuery, (err, result) => {
        if (err) {
            console.log(err.message);
        }
    });

    let insertPremiumMember = 'INSERT INTO PremiumMembership(sid, membership_id) VALUES ($1, $2)';
    premiumMemberData.forEach((premiumMember) => {
        client.query(insertPremiumMember, premiumMember, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(result.rows[0]);
            }
        });
    });

    res.send('done');
});

app.get('/populatemember', (req, res) => {
    let createMemberQuery = 'CREATE TABLE Member (membership_id INTEGER, email CHAR(40), member_points INTEGER),' +
        'PRIMARY KEY(email),' +
        'FOREIGN KEY(email) REFERENCES Customer ON UPDATE CASCADE,' +
        'FOREIGN KEY(membership_id) REFERENCES RegularMembership ON DELETE CASCADE ON UPDATE CASCADE)';
    client.query(createMemberQuery, (err, result) => {
        if (err) {
            console.log(err.message);
        }
    });

    let insertMember = 'INSERT INTO Member(membership_id, email, member_points) VALUES ($1, $2, $3)';
    memberData.forEach((member) => {
        let arr = [member.membership_id, member.email, member.memberpoints];
        client.query(insertMember, arr, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(result.rows[0]);
            }
        });
    });
    res.send('done');
});

app.get('/populatebranch', (req, res) => {
    client.query('DROP TABLE Branch', (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(result.rows[0])
        }
    });

    let query = 'CREATE TABLE IF NOT EXISTS Branch(branch_id INTEGER, address CHAR(50),\n' +
        'phone_no CHAR(12), PRIMARY KEY(branch_id))';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(result.rows[0])
        }
    });

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
    let createMachineQuery = 'CREATE TABLE Machine (mid INTEGER, date_bought DATE, condition CHAR(5), \n' +
        'last_maintenance DATE, cost INTEGER, type CHAR(20), branch_id INTEGER, PRIMARY KEY (mid), \n' +
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
    let dropQuery = 'DROP TABLE Room';
    client.query(dropQuery, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log('dropped room');
        }
    });

    let createRoomQuery = 'CREATE TABLE IF NOT EXISTS Room(room_num INTEGER, capacity INTEGER,PRIMARY KEY (room_num))';
    client.query(createRoomQuery, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log('created room');
        }
    });
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


app.get('/populateAttend', async function (req, res) {
    let dropTable = 'DROP Table ATTEND';
    client.query(dropTable, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(result.rows[0])
        }
    });

    let createAttendTable = 'CREATE TABLE ATTEND(email CHAR(40), room_num INTEGER, time DATE,' +
        'PRIMARY KEY(email, room_num, time),' +
        'FOREIGN KEY(email) REFERENCES Customer ON DELETE CASCADE ON UPDATE CASCADE,' +
        'FOREIGN KEY(time, room_num) REFERENCES Class ON DELETE CASCADE ON UPDATE CASCADE)';
    client.query(createAttendTable, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(result.rows[0])
        }
    });

    let insertAttend = 'INSERT INTO Attend(email, time, room_num) VALUES ($1, $2, $3)';
    attendData.forEach((attend) => {
        let arr = [attend.email, attend.time, attend.room_num];
        client.query(insertAttend, arr, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(result.rows[0]);
            }
        });
    });
});


app.get('/populategoesto', async function (req, res) {
    let dropGoesTo = 'DROP TABLE GoesTo';
    client.query(dropGoesTo, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log('Dropped GoesTo Table');
        }
    });

    let createGoesTo = 'CREATE TABLE GoesTo(\n' +
        'branch_id INTEGER,\n' +
        'email_address CHAR(40),\n' +
        'PRIMARY KEY (branch_id, email_address),\n' +
        'FOREIGN KEY (branch_id) REFERENCES Branch\n' +
        'ON DELETE CASCADE\n' +
        'ON UPDATE CASCADE,\n' +
        'FOREIGN KEY (email_address) REFERENCES Customer\n' +
        'ON DELETE CASCADE\n' +
        'ON UPDATE CASCADE)\n';
    client.query(createGoesTo, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log('Created GoesTo Table');
        }
    });

    let insertQuery = 'INSERT INTO GoesTo(branch_id, email_address) VALUES ($1, $2)';
    let branchIDs = [177, 494, 904];
    // Randomly generate branchID for a given customer for mock data
    customerData.forEach((c, index) => {
        let arr = [branchIDs[index % branchIDs.length], c.email];
        client.query(insertQuery, arr, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log('Added ' + JSON.stringify(arr));
            }
        });
    });
    res.send('done');
});

app.get("/dropbodyprofile", (req, res) => {
    let dropClass = 'DROP TABLE BodyProfile';
    client.query(dropClass, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(result.rows[0])
        }
    });
});

app.get('/populatebodyprofile', (req, res) => {
    let createClass = 'CREATE TABLE IF NOT EXISTS BodyProfile(membership_id INTEGER NOT NULL, pid INTEGER NOT NULL, BMI INTEGER, weight INTEGER, \n' +
        'age INTEGER, height INTEGER, date DATE, PRIMARY KEY(membership_id, pid), FOREIGN KEY (membership_id) REFERENCES RegularMembership ON DELETE CASCADE \n' +
        'ON UPDATE CASCADE)';
    client.query(createClass, (err, result) => {
        if (err) {
            console.log(err.message)
        } else {
            console.log(result.rows[0])
        }
    });

    let insertBodyProfiles = 'INSERT INTO BodyProfile(membership_id, pid, BMI, weight, age, height, date) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7)';
    bodyProfileData.forEach((bodyProfile) => {
        let arr = [bodyProfile.membership_id, bodyProfile.pid, bodyProfile.BMI, bodyProfile.weight, bodyProfile.age, bodyProfile.height, bodyProfile.date];
        client.query(insertBodyProfiles, arr, (err, result) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(result.rows[0]);
            }
        });
    });
    res.send('doneMember');
});

// Below are endpoints for getting data (SELECT * FROM <TABLE>)
app.get('/getcustomers', (req, res) => {
    client.query('SELECT * FROM Customer', (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/getinstructors', async function (req, res) {
    let query = 'SELECT * FROM Instructor';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/getbranches', async function (req, res) {
    let query = 'SELECT * FROM Branch';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/getmachines', async function (req, res) {
    let query = 'SELECT * FROM Machine';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});
app.get('/getrooms', async function (req, res) {
    let query = 'SELECT * FROM Room';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/getclasses', async function (req, res) {
    let query = 'SELECT * FROM Class';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/getbodyprofiles', async function (req, res) {
    let query = 'SELECT * FROM BodyProfile';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/getregmemberships', async function (req, res) {
    let query = 'SELECT * FROM regularMembership';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/getmembershipswithpoints', async function (req, res) {
    let query = 'SELECT DISTINCT reg.membership_id AS MembershipId, reg.start_date AS StartDate, reg.expiration_date AS ExpirationDate,' +
        'reg.payment_method AS paymentMethod, mem.email AS Email, mem.member_points AS points FROM RegularMembership reg, Member mem WHERE reg.membership_id = mem.membership_id';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});


app.get('/getPMs', async function (req, res) {
    let query = 'SELECT * FROM PremiumMembership';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/getmembers', async function (req, res) {
    let query = 'SELECT * FROM Member';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/getattend', async function (req, res) {
    let query = 'SELECT * FROM Attend';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.post('/updatecustomer', async function (req, res) {
    // data from the form
    let email = req.body.email;
    let name = req.body.name;
    let date_of_birth = req.body.dob;
    let address = req.body.address;
    let phone_no = req.body.phoneno;
    let last_visit_date = req.body.lvd;

    // use the data to perform a query
    let updateCustomer = "UPDATE Customer SET name=($2), date_of_birth=($3), address=($4), phone_no=($5), last_visit_date=($6) WHERE email=($1);"
    let arr = [email, name, date_of_birth, address, phone_no, last_visit_date];
    client.query(updateCustomer, arr, (err, result) => {
        if (err) {
            console.log('Something went wrong...');
            res.sendStatus(400);
            return;
        } else {
            console.log('Updated customer!');
            res.redirect("/customerhub");
            return;
        }
    });
});

app.post('/updatebodyprofile', async function (req, res) {
    // data from the form
    let membership_id = req.body.membership_id;
    let pid = req.body.pid;
    let bmi = req.body.bmi;
    let weight = req.body.weight;
    let age = req.body.age;
    let height = req.body.height;
    let date = req.body.date;

    // use the data to perform a query
    let updateBodyProfile = "UPDATE BodyProfile SET BMI=($3), weight=($4), age=($5), height=($6), date=($7) WHERE membership_id=($1) AND pid=($2);";
    let arr = [membership_id, pid, bmi, weight, age, height, date];
    client.query(updateBodyProfile, arr, (err, result) => {
        if (err) {
            console.log('Something went wrong...');
            res.sendStatus(400);
        } else {
            console.log('Updated body profile!');
            res.redirect("/bodyprofile");
        }
    });
});

app.post('/insertbodyprofile', async function (req, res) {
    // data from the form
    let membership_id = req.body.membership_id;
    let pid = req.body.pid;
    let bmi = req.body.bmi;
    let weight = req.body.weight;
    let age = req.body.age;
    let height = req.body.height;
    let date = req.body.date;

    let insertBodyProfiles = 'INSERT INTO BodyProfile(membership_id, pid, BMI, weight, age, height, date) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7)';
    let bodyProfile = [membership_id, pid, bmi, weight, age, height, date];
    client.query(insertBodyProfiles, bodyProfile, (err, result) => {
        if (err) {
            console.log(err.message);
            res.sendStatus(400);
        } else {
            console.log('Added a new body profile!');
            res.redirect("/bodyprofile");
        }
    });
});

app.post('/deletebodyprofile', async function (req, res) {
    // data from the form
    let membership_id = req.body.membership_id;
    let pid = req.body.pid;

    let insertBodyProfiles = 'DELETE FROM BodyProfile WHERE membership_id=($1) AND pid=($2)';
    let bodyProfile = [membership_id, pid];
    client.query(insertBodyProfiles, bodyProfile, (err, result) => {
        if (err) {
            console.log(err.message);
            res.sendStatus(400);
        } else {
            console.log(`Deleted body profile with membership id: ${membership_id} and pid: ${pid}`);
            res.redirect("/bodyprofile");
        }
    });
});

app.post('/updatemembership', async function (req, res) {
    // data from the form
    let membership_id = req.body.membership_id;
    let startDate = req.body.start_date;
    let expirationDate = req.body.expiration_date;
    let paymentMethod = req.body.payment_method;
    let email = req.body.email;
    let points = req.body.points;
    let action = req.body.action;

    switch (action) {
        case "Insert":
            let insertMembership = "INSERT INTO RegularMembership(membership_id, start_date, expiration_date, payment_method)" +
                "VALUES ($1, $2, $3, $4);";
            let insertMembershipArr = [membership_id, startDate, expirationDate, paymentMethod];
            client.query(insertMembership, insertMembershipArr, (err, result) => {
                if (err) {
                    console.log(err);
                    console.log('Something went wrong...');
                    res.sendStatus(400);
                }
            });

            let insertMember = "INSERT INTO Member VALUES ($1, $2, $3);";
            let insertMemberArr = [membership_id, email, points];
            client.query(insertMember, insertMemberArr, (err, result) => {
                if (err) {
                    console.log(err);
                    console.log('Something went wrong...');
                    res.sendStatus(400);
                } else {
                    console.log('Added a new membership!');
                    res.redirect("/membership");
                }
            });
            break;
        case "Delete":
            let deleteMembership = "DELETE FROM RegularMembership WHERE membership_id = ($1);";
            let deleteMembershipArr = [membership_id];
            client.query(deleteMembership, deleteMembershipArr, (err, result) => {
                if (err) {
                    console.log(err);
                    console.log('Something went wrong...');
                    res.sendStatus(400);
                } else {
                    console.log(`Deleted a membership with the id: ${membership_id}`);
                    res.redirect("/membership");
                }
            });
            break;
        case "Update":
            let updateMembership = "UPDATE RegularMembership SET start_date=($2), expiration_date=($3), payment_method=($4)" +
                "WHERE membership_id=($1);";
            let membershipArr = [membership_id, startDate, expirationDate, paymentMethod];
            client.query(updateMembership, membershipArr, (err, result) => {
                if (err) {
                    console.log(err);
                    console.log('Something went wrong...');
                    res.sendStatus(400);
                }
            });

            let updateMember = "UPDATE Member SET email=($2), member_points=($3) WHERE membership_id=($1);";
            let memberArr = [membership_id, email, points];
            client.query(updateMember, memberArr, (err, result) => {
                if (err) {
                    console.log(err);
                    console.log('Something went wrong...');
                    res.sendStatus(400);
                } else {
                    console.log('Updated membership information!');
                    res.redirect("/membership");
                }
            });
    }
});

app.post('/updatemachines', async function(req,res){
    let mid = req.body.mid;
    let date_bought = req.body.date_bought;
    let condition = req.body.condition;
    let last_maintenance = req.body.last_maintenance;
    let cost = req.body.cost;
    let type = req.body.type;
    let branch_id = req.body.branch_id;

    let updateMachines = "UPDATE Machine SET date_bought=($2), condition=($3), last_maintenance=($4), cost=($5), type=($6), branch_id=($7) WHERE mid=($1);";
    let arr = [mid, date_bought, condition, last_maintenance, cost, type, branch_id];
    client.query(updateMachines, arr, (err, result) => {
        if (err){
            console.log(err);
            console.log('Ooooops...');
            res.sendStatus(400);
        }else{
            console.log('Update Machine Information!!!');
            res.redirect("/machine");
        }
    });
});

app.post('/insertMachine', async function(req, res) {
    // data from the form
    let mid = req.body.mid;
    let date_bought =  req.body.date_bought;
    let condition = req.body.condition;
    let last_maintenance = req.body.last_maintenance;
    let cost = req.body.cost;
    let type = req.body.type;
    let branch_id = req.body.branch_id;

    let insertMachine = 'INSERT INTO Machine(mid, date_bought, condition, last_maintenance, cost, type, branch_id)'+
        'VALUES ($1, $2, $3, $4, $5, $6, $7)';
    let arr = [mid, date_bought, condition, last_maintenance, cost, type, branch_id];
    client.query(insertMachine, arr, (err, result) => {
        if (err) {
            console.log(err.message);
            res.sendStatus(400);
        } else {
            console.log('Added a new machine!!!');
            res.redirect("/machine");
        }
    });
});


app.post('/deletemachine', async function(req,res){
    let mid = req.body.mid;

    let insertmachine = 'DELETE FROM machine WHERE mid=($1)';
    let machine = [mid];
    client.query(insertmachine, machine,(err,result) => {
        if(err){
            console.log(err.message);
            res.sendStatus(400);
        }else{
            console.log('Deleted machine with machine id: ${mid}');
            res.redirect("/machine");
        }
    });
});



app.post('/class', async function(req, res) {
    // data from the form
    let classTime = req.body.classTime;
    let room = req.body.classRoom;
    let sid = req.body.sid;
    let type = req.body.classType;
    let action = req.body.action;
    let arr = [classTime, room, sid, type];
    let arr2 = [classTime, room];

	if (action == 'Update') {
        let updateClass = 'UPDATE Class SET sid=($3), class_type=($4) where time=($1) and room_num=($2);'
		client.query(updateClass, arr, (err, result) => {
			if (err) {
				console.log('Something went wrong... in updating class');
				res.sendStatus(400);
				return;
			} else {
				console.log('Updated class!');
				res.redirect("/class");
				return;
			}
		});
	} else if (action== 'Insert') {
		let insertClass = 'INSERT INTO Class(time, room_num, sid, class_type) VALUES ($1, $2, $3, $4);'
		client.query(insertClass, arr, (err, result) => {
			if (err) {
				console.log('Something went wrong... in inserting');
				res.sendStatus(400);
				return;
			} else {
				console.log('Inserted class!');
				res.redirect("/class");
				return;
			}
		});

	} else if (action == 'Delete'){
		let deleteClass = 'DELETE FROM Class WHERE room_num=($2) AND time=($1);'
		client.query(deleteClass, arr2, (err, result) => {
			if (err) {
				console.log('Something went wrong...in delete');
				console.log(err);
				res.sendStatus(400);
				return;
			} else {
				console.log('Deleted class!');
				res.redirect("/class");
				return;
			}
		});


	}else {
				console.log('Something went wrong...');
				res.sendStatus(400);
	}

});


app.get('/dropAttend', (req, res) => {
    let dropAttend = 'DROP TABLE Attend';
    client.query(dropAttend, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(result.rows[0])
        }
    });
});

app.get('/studentsInClass/:type', (req, res) => {
    let type = req.params.type;
    let arr2 = [type];
    let studentClass = 'SELECT distinct (customer.name) from Customer customer, Class class, Attend attend where class.time = attend.time and class.room_num = attend.room_num and customer.email = attend.email AND lower(class.class_type) like lower(($1))';
    client.query(studentClass, arr2, (err, result) => {
        console.log('succeeed');
        console.log(result.rows);
        res.status(200).send(result.rows);
    });
});

app.get('/getcustomerinfo/:email', (req, res) => {
    // get customer info with a given email
    let email = req.params.email;
    let arr2 = [email];
    let query = 'SELECT name, date_of_birth, address, phone_no, last_visit_date from Customer where email=($1)';
    client.query(query, arr2, (err, result) => {
        console.log('succeeed');
        console.log(result.rows);
        res.status(200).send(result.rows);
    });
});

app.get('/getmemberinfo/:email', (req, res) => {
    // get customer info with a given email
    let email = req.params.email;
    let arr2 = [email];
    let query = 'SELECT membership_id, member_points from Member where email=($1)';
    client.query(query, arr2, (err, result) => {
        if (result) {
            res.status(200).send([result.rows[0]]);
        } else {
            console.log('not a member');
        }
    });
});

app.get('/getbodyprofiles/:email', (req, res) => {
    // get customer info with a given email
    let email = req.params.email;
    let arr2 = [email];
    let query = 'SELECT DISTINCT b.pid, b.BMI, b.weight, b.age, b.height, b.date from BodyProfile b, Member m WHERE m.email = ($1) and m.membership_id = b.membership_id';
    client.query(query, arr2, (err, result) => {
        if (result) {
            res.status(200).send(result.rows);
        } else {
            console.log('not a member');
        }
    });
});



app.get('/getAddressMachine/:month', async function (req, res) {
	let month = req.params.month;
    let query = "SELECT distinct( b.address) FROM Branch b, Machine m WHERE m.branch_id = b.branch_id and m.date_bought >= date_trunc('month', current_date- interval '" + month + "' month)";
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/getCostMachine', async function (req, res) {
    let query = 'Select sum(cost) as Total_Cost , branch_id from Machine group by branch_id';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});


app.get('/getCustBranch', async function (req, res) {
	//let query = ' drop view custBranch';
    //let query = 'create or replace view custBranch as Select count(email_address) as CustomersInBranch, branch_id From GoesTo group by branch_id';
	let query = 'SELECT * FROM custBranch';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});


app.get('/getmembers', async function (req, res) {
    let query = 'SELECT * FROM Member';
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/performdivision', async function (req, res) {
    let query = "SELECT DISTINCT A1.email FROM Attend as A1 WHERE NOT EXISTS (" +
        "(SELECT room_num FROM Room) EXCEPT (SELECT A2.room_num FROM Attend as A2 WHERE A2.email = A1.email)" +
        ")";
    client.query(query, (err, result) => {
        if (err) {
            console.log(err.message);
            res.status(400);
        } else {
            console.log('in division');
            res.status(200).send(result.rows);
        }
    });
});

app.post('/deleteFromAttend', async function(req, res) {
    let action = req.body.action;
    if (action === 'delete') {
        let query ="DELETE FROM Attend WHERE email='nhussell1@redcross.org' AND room_num='101'";
        client.query(query, (err, result) => {
            if (err) {
                console.log('Oops');
                res.sendStatus(400);
                return;
            } else {
                console.log('done deleting from attend!');
                res.redirect('/attend');
                return;
            }
        });
    }
});

app.listen(process.env.PORT || 5000, () => {
    console.log('Server started succesfully.');
});


