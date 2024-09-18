import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { insertData } from '../dist/database/database.js'
import { getBankAccount,getTransactionDate,getTransactionAmount,getTransactionToDetails,getDebitedOrCredited} from './text-extractior.js';


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
  let bankAccount = ""
  let transactionDateFinal = ""
  let transactionAmount = ""
  let transactionToDetail = ""
  let debitedOrCredited = ""
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

    bankAccount = getBankAccount(snippet);
    // console.log(bankAccount);

    // This part of the code is to get the date of transaction from the snippet
    transactionDateFinal=getTransactionDate(snippet);
    // console.log(transactionDateFinal);

    // This part of the code is to get the transaction amount from the snippet
    transactionAmount=getTransactionAmount(snippet);
    // console.log(transactionAmount);

    // This part of the code is to get the transaction to details from the snippet
    transactionToDetail=getTransactionToDetails(snippet);
    // console.log(transactionToDetail);

    //this part of the code is to get check if amount was debited or credited from the snippet
    debitedOrCredited=getDebitedOrCredited(snippet);
    // console.log(debitedOrCredited);
   
    insertData(bankAccount, transactionDateFinal, transactionAmount, transactionToDetail, debitedOrCredited);
  }
  const messageDetails = await gmail.users.messages.get({
    userId: 'me',
    id: messages[0].id,
    format: 'FULL'
  });

}

authorize().then(listEmails).catch(console.error);






