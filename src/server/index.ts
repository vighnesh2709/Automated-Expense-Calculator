import * as database from '../database/database.js';
import express,{Request,Response} from 'express';
import cors from 'cors';
const app=express();


app.use(express.json());
app.use(cors());

console.log("running.....");

app.get("/totalExpenditure",async(req:Request,res:Response)=>{
    let bank_account_number=req.body.bank_account_number;
    let ans=await database.totalExpenditure(bank_account_number);
    console.log(ans);
    res.json({
        ans
    })
})

app.get("/pieChartData",async(req:Request,res:Response)=>{
    let bank_account_number=req.query.bank_account_number as String;
    let ans=await database.pieChartData(bank_account_number);
    console.log(ans);
    res.json({
        ans
    })
})

app.get("/linegraphData",async(req:Request,res:Response)=>{
    let bank_account_number=req.body.bank_account_number;
    let ans=await database.lineGraphData(bank_account_number);
    console.log(ans);
    res.json({
        ans
    })
})

app.get("/monthlyExpenditureData",async(req:Request,res:Response)=>{
    let bank_account_number=req.query.bank_account_number as string;
    console.log(bank_account_number);
    let ans=await database.expenditureMonthly(bank_account_number);
    console.log(ans);
    res.json({
        ans
    })
})

app.listen(3003);