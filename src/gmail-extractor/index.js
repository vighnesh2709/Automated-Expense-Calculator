import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import {insertData} from '../dist/database/database.js'


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH, { encoding: 'utf8' });
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH, { encoding: 'utf8' });
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEmails(auth) {
  let bankAccount=""
  let transactionDateFinal=""
  let transactionAmount=""
  let transactionToDetail=""
  let debitedOrCredited=""
  const gmail = google.gmail({ version: 'v1', auth });

  // List messages
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 500,
    // Optional parameters
    q: 'from: "alerts@hdfcbank.net"'
  });
  const messages = res.data.messages;
  for (let i = 0; i < messages.length; i++) {
    const messageDetails = await gmail.users.messages.get({
      userId: 'me',
      id: messages[i].id,
      format: 'FULL'
    })
    
    let snippet = messageDetails.data.snippet;
    
    // This part of the code is to get the bank account details from the snippet
    try {
      const regexBankAccount = /\*\*\d\d\d\d/g
      let bankAccountRegex = snippet.match(regexBankAccount);
      bankAccount=bankAccountRegex[0]
    } catch {
      try{
      let regexBankAccount=/\X\X\d\d\d\d/g
      let bankAccountRegex = snippet.match(regexBankAccount);
      bankAccount=bankAccountRegex[0]}
      catch(error){
        console.log(error);
      }
    }
   
    
    
    // This part of the code is to get the date of transaction from the snippet
    try{
      const regexTransactionDate=/\d\d\-\d\d\-\d\d/g
      let transactionDate=snippet.match(regexTransactionDate);
      transactionDateFinal=parseDate(transactionDate[0]);
      console.log(transactionDateFinal);
      // transactionDateFinal=new Date(transactionDate[0]);
      // console.log(transactionDateFinal,transactionDate[0]);

    }catch(error){
      console.log(error);
    }


    // This part of the code is to get the transaction amount from the snippet
    try{
      const regexTransactionAmount=/\d+\.\d+/g
      let transactionAmountRegex=snippet.match(regexTransactionAmount);
      transactionAmount=(parseFloat(transactionAmountRegex[0])+.00);
      //console.log(transactionAmount)
    }catch(error){
      console.log(error);
    }

    // This part of the code is to get the transaction to details from the snippet
    try{
      const regexTransactionToDetail=/\w+([\.-]?\w+)*@\w+([\.-]?\w+)/g
      let transactionToDetailRegex=snippet.match(regexTransactionToDetail);
      transactionToDetail=transactionToDetailRegex[0];
    }catch(error){
       console.log("this error is for transaction to detail");
    }

    //this part of the code is to get check if amount was debited or credited from the snippet
    try{
      const regexDebitedOrCredited=/debited/g
      let debitedOrCreditedRegex=snippet.match(regexDebitedOrCredited);
      debitedOrCredited=debitedOrCreditedRegex[0]
    }catch{
      try{
        const regexDebitedOrCredited=/credited/g
        let debitedOrCreditedRegex=snippet.match(regexDebitedOrCredited);
        debitedOrCredited=debitedOrCreditedRegex[0]
      }catch(error){
        console.log(error);
      }
    }
    console.log(transactionDateFinal+"These are the dates")
    insertData(bankAccount, transactionDateFinal, transactionAmount, transactionToDetail, debitedOrCredited);
  }
  const messageDetails = await gmail.users.messages.get({
    userId: 'me',
    id: messages[0].id,
    format: 'FULL'
  });

}

/**
 * now the error in this code is the format of the date thats being pushed into the database, its not of the correct format otherwise we all good.
 */



authorize().then(listEmails).catch(console.error);


function parseDate(dateString) {
  const [day, month, year] = dateString.split('-');
  const yearWithCentury = `20${year}`; // Assuming the year is in the 21st century
  return new Date(`${yearWithCentury}-${month}-${day}`);
}