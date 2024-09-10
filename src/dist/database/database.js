import mysql from 'mysql2';
import dotenv from 'dotenv';
import findConfig from 'find-config';
dotenv.config({ path: findConfig('.env') });
const pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
}).promise();
// const reply=await pool.query(`select * from notes where id= ?`,[1])
export async function insertData(bankAccountNumber, transactionDate, transactionAmount, transactionTo, debitedCredited) {
    console.log(bankAccountNumber, transactionAmount, transactionDate, transactionTo, debitedCredited);
    const reply = await pool.query(`
      INSERT INTO transactions 
      (bank_account_number, transaction_date, transaction_amount, debited_credited, transaction_to) 
      VALUES (?, ?, ?, ?, ?)
    `, [bankAccountNumber, transactionDate, transactionAmount, debitedCredited, transactionTo]);
    //const checking = await pool.query(`SELECT * FROM transactions`);
    //console.log(reply);
    //console.log(checking[0]);
}
/*
    what are the functions we need the database to follow for now,
    1) insert the data into the databse (datafrom the email gets put into this).
    mysql> create table transactions(
    -> id integer PRIMARY KEY AUTO_INCREMENT,
    -> bank_account_number varchar(10),
    -> transaction_date timestamp,
    -> transaction_amount numeric,
    -> debited_credited varchar(8));

*/ 
