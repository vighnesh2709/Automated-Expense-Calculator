import mysql from 'mysql2';
const pool = mysql.createPool({
    host: "127.0.0.1",
    user: 'vighnesh',
    password: 'testing123',
    database: 'test'
}).promise();
// const reply=await pool.query(`select * from notes where id= ?`,[1])
const reply = await pool.query(`insert into notes (name,content) values ('third note','this is to check if its working')`);
const checking = await pool.query(`select * from notes`);
console.log(reply);
console.log(checking[0]);
/*
    what are the functions we need the database to follow for now,
    1) insert the data into the databse (datafrom the email gets put into this).
*/ 
