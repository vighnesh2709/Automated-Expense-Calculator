import mysql from 'mysql2';
import dotenv from 'dotenv';
import findConfig from 'find-config';
import fs from 'fs';
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
    }
    catch (error) {
        console.error("Error executing query:", error);
    }
}
export async function bankAccountNumbers() {
    const query = 'select distinct(bank_account_number) from transactionsl ;';
    try {
        const reply = await pool.query(query);
        console.log(reply);
    }
    catch (error) {
        console.log(error);
    }
}
//pieChartData("**1071");
export async function pieChartData(bank_account_number) {
    const query = ` select transaction_to, SUM(transaction_amount) as total from transactions where bank_account_number=? group by transaction_to;`;
    const values = [bank_account_number];
    try {
        const reply = await pool.query(query, values);
        fs.writeFileSync('text.txt', JSON.stringify(reply[0]));
        return (reply[0]);
    }
    catch (error) {
        console.log(error);
    }
}
export async function lineGraphData(bank_account_number) {
    const query = `select transaction_date,SUM(transaction_amount) from transactions where bank_account_number=? group by transaction_date order by transaction_date ASC;`;
    const value = [bank_account_number];
    console.log("printing");
    try {
        console.log("printing inside");
        const reply = await pool.query(query, value);
        fs.writeFileSync('text.txt', JSON.stringify(reply[0]));
        return reply[0];
    }
    catch (error) {
        console.log(error);
    }
}
export async function totalExpenditure(bank_account_number) {
    const query = `select SUM(transaction_amount) from transactions where bank_account_number=?;`;
    const value = [bank_account_number];
    try {
        const reply = await pool.query(query, value);
        fs.writeFileSync('text.txt', JSON.stringify(reply[0]));
        return reply[0];
    }
    catch (error) {
        console.log(error);
    }
}
export async function expenditureMonthly(bank_account_number) {
    const query = `select date_format(transaction_date,'%y-%m') as month, SUM(transaction_amount) as total from transactions where bank_account_number=? group by month order by month;`;
    const value = [bank_account_number];
    try {
        const reply = await pool.query(query, value);
        return reply[0];
    }
    catch (error) {
        console.log(error);
    }
}
/*
    now what sort of charts do we want?
    1. pie char so for tha we need to order by distinct people we have paid and gotten the moeny from
    2. line graph to show each month how the money has been spent
    3. total expenditure so thats just aggregate
    4. figuure how to link bankaccount to this so that every time money comes we get a mail

*/ 
