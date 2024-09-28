import mysql from 'mysql2'
import dotenv from 'dotenv'
import findConfig from 'find-config';
import fs from 'fs'
dotenv.config({ path: findConfig('.env') as string });

const pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
}).promise()

// const reply=await pool.query(`select * from notes where id= ?`,[1])
export async function insertData(
    bankAccountNumber: string,
    transactionDate: string,
    transactionAmount: number,
    transactionTo: string,
    debitedCredited: string
) {
    console.log(bankAccountNumber, transactionAmount, transactionDate, transactionTo, debitedCredited);

    const query = `
        INSERT INTO transactions 
        (bank_account_number, transaction_date, transaction_amount, debited_credited, transaction_to) 
        VALUES (?, ?, ?, ?, ?)
      `;

    const values = [
        bankAccountNumber,
        transactionDate,
        transactionAmount,
        debitedCredited,
        transactionTo
    ];

    try {
        const reply = await pool.query(query, values);
        console.log(reply);
    } catch (error) {
        console.error("Error executing query:", error);
    }
}

export async function getDataAccountNum(
    bank_account_number: String
){

    const query=`SELECT * FROM transactions where bank_account_number=?`
    const values=[bank_account_number];

    try {
        const reply=await pool.query(query,values);
        fs.writeFileSync('text.txt',JSON.stringify(reply[0]))
    }catch(error){
        console.log(error);
    }
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