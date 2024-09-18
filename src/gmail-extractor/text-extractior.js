export function getBankAccount(snippet) {
    const regexBankAccount = /\*\*\d\d\d\d/g;
    const bankAccountRegex = snippet.match(regexBankAccount);

    if (bankAccountRegex && bankAccountRegex.length > 0) {
        return bankAccountRegex[0];
    } else {
        // If the first regex doesn't match, try a different one
        const alternativeRegex = /\X\X\d\d\d\d/g; // Matches any four digits
        const alternativeMatch = snippet.match(alternativeRegex);

        if (alternativeMatch && alternativeMatch.length > 0) {
            return alternativeMatch[0];
        } else {
            console.log("No bank account information found.");
            return null;
        }
    }
}

export function getTransactionDate(snippet){
    try {
        const regexTransactionDate = /\d\d\-\d\d\-\d\d/g
        let transactionDate = snippet.match(regexTransactionDate);
        let transactionDateFinal = parseDate(transactionDate[0]);
        return transactionDateFinal;
        // transactionDateFinal=new Date(transactionDate[0]);
        // console.log(transactionDateFinal,transactionDate[0]);
  
      } catch (error) {
        console.log(error);
      }
}
function parseDate(dateString) {
    const [day, month, year] = dateString.split('-');
    const yearWithCentury = `20${year}`; // Assuming the year is in the 21st century
    return new Date(`${yearWithCentury}-${month}-${day}`);
}

export function getTransactionAmount(snippet){
    try {
        const regexTransactionAmount = /\d+\.\d+/g
        let transactionAmountRegex = snippet.match(regexTransactionAmount);
        let transactionAmount = (parseFloat(transactionAmountRegex[0]) + .00);
        return transactionAmount;
        //console.log(transactionAmount)
      } catch (error) {
        console.log(error);
      }
}

export function getTransactionToDetails(snippet){
    try {
        const regexTransactionToDetail = /\w+([\.-]?\w+)*@\w+([\.-]?\w+)/g
        let transactionToDetailRegex = snippet.match(regexTransactionToDetail);
        let transactionToDetail = transactionToDetailRegex[0];
        return transactionToDetail;
      } catch (error) {
        console.log(error);
      }
}

export function getDebitedOrCredited(snippet) {
    const regexDebited = /debited/g;
    const debitedMatch = snippet.match(regexDebited);
  
    if (debitedMatch && debitedMatch.length > 0) {
      return debitedMatch[0];
    } else {
      const regexCredited = /credited/g;
      const creditedMatch = snippet.match(regexCredited);
  
      if (creditedMatch && creditedMatch.length > 0) {
        return creditedMatch[0];
      } else {
        console.log("Neither 'debited' nor 'credited' found.");
        return null;
      }
    }
  }