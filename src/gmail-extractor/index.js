import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';


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
    console.log("TOKEN " + content)
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
  console.log("CREDENTIALS " + content);
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
  console.log("type of client " + typeof (client));
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEmails(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  // List messages
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 500,
    // Optional parameters
    q: 'from: "alerts@hdfcbank.net"'
  });
  const messages = res.data.messages;
  console.log("type of message is " + typeof (messages))
  for (let i = 0; i < messages.length; i++) {
    const messageDetails = await gmail.users.messages.get({
      userId: 'me',
      id: messages[i].id,
      format: 'FULL'
    })
    //console.log(messageDetails);
    // console.log(messageDetails);
    // console.log("\n");
    
    let snippet = messageDetails.data.snippet;
    
    // This part of the code is to get the bank account details from the snippet
    try {
      const regexBankAccount = /\*\*\d\d\d\d/g
      let bankAccount = snippet.match(regexBankAccount);
      console.log(bankAccount[0]);

    } catch {
      try{
      let regexBankAccount=/\X\X\d\d\d\d/g
      let bankAccount=snippet.match(regexBankAccount);
      console.log(bankAccount[0])}
      catch(error){
        console.log(error);
      }
    }

    // This part of the code is to get the date of transaction from the snippet
    try{
      const regexTransactionDate=/\d\d\-\d\d\-\d\d/g
      let transactionDate=snippet.match(regexTransactionDate);
      console.log(transactionDate[0]);
    }catch(error){
      console.log(error);
    }


    // This part of the code is to get the transaction amount from the snippet
    try{
      const regexTransactionAmount=/\d+\.\d+/g
      let transactionAmount=snippet.match(regexTransactionAmount);
      transactionAmount=(parseFloat(transactionAmount[0]));
      console.log(transactionAmount)
      console.log(typeof(transactionAmount));
    }catch(error){
      console.log(error);
    }

    // This part of the code is to get the transaction to details from the snippet
    try{
      const regexTransactionToDetail=/\w+([\.-]?\w+)*@\w+([\.-]?\w+)/g
      let transactionToDetail=snippet.match(regexTransactionToDetail);
      console.log(transactionToDetail[0]);
    }catch(error){
       console.log("this error is for transaction to detail");
    }

    //this part of the code is to get check if amount was debited or credited from the snippet
    try{
      const regexDebitedOrCredited=/debited/g
      let debitedOrCredited=snippet.match(regexDebitedOrCredited);
      console.log(debitedOrCredited[0]);
    }catch{
      try{
        const regexDebitedOrCredited=/credited/g
        let debitedOrCredited=snippet.match(regexDebitedOrCredited);
        console.log(debitedOrCredited[0]);
      }catch(error){
        console.log(error);
      }
    }



  }
  const messageDetails = await gmail.users.messages.get({
    userId: 'me',
    id: messages[0].id,
    format: 'FULL'
  });

  // Retrieve details for each message
  // for (const message of messages) {
  //   const messageDetails = await gmail.users.messages.get({
  //     userId: 'me',
  //     id: message.id,
  //     format: 'FULL' // Get the full message content
  //   });
  //   console.log(messageDetails);
  //   // Extract the desired content
  // }
}
// /\*\*\d\d\d\d/g-> this is for bank account details
// /\d\d\-\d\d\-\d\d/g -> this is for the date of the transaction
// /Rs\.\d+\.\d+/g -> this is to get the amount
// /\w+\.\@\w+/g -> this is to or from who the payment was made
// /debited/g ->debited
// /credited/g ->credited



authorize().then(listEmails).catch(console.error);