// so to make it cli, we can use inquirer.js, looks like the best option
// and to display tables and all that, we can use the inbult funciton i.e console.table() or a library thats lightweight called Asciitable(table looks nice).

//index.js will have all the cli calling functions in it and then well need to make subordinate fucntion to
/*
 1) get gmail access
 2) calcualte and store the data in the database
 3) display the database
*/ 

//not to calculate the data, we need to find some fast Datascience libraries that will do that orelse it will be really slow.
// TO FIND
// 1. Datascience libaray(or there is alwasy GNUCache) 
// 2. to retrieve the data faster and pass it through the data filtering process to display it.


// Mongodb is the way because its faster. 


//for secutiry 
/*
    we will encrypt the gmail password suing sha and aes
    we will also use jwt to authenticate
    if there is 2step authentication we need to find that out as well.
*/