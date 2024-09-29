import * as database from '../database/database.js';
import express,{Request,Response} from 'express';

const app=express();

app.use(express.json());

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
    let bank_account_number=req.body.bank_account_number;
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

app.listen(3000);