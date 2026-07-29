import * as XLSX from "xlsx";
import { parseGrid, findReportedTotal } from "/dev-server/supabase/functions/commission-ingest/parse.ts";

const grid = (wb:any,n:string)=>XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:true,blankrows:true,defval:null}) as any[][];

// Berridge: no header at top; header row 237; data 1..236
let wb = XLSX.read(new Uint8Array(await Bun.file("/mnt/user-uploads/Berridge_May26_Commissions.xlsx").arrayBuffer()),{type:"array",cellDates:true});
let g = grid(wb,"Sheet1");
let m:any = {headerRow:237,dataStartRow:1,dataEndRow:g.length-1,grain:"invoice",periodLabel:"May 2026",
 columns:{invoiceNumber:1,invoiceDate:0,customerName:2,customerNumber:null,orderReference:4,projectReference:null,projectName:null,salesAmount:5,commissionBase:6,commissionRate:7,commissionAmount:8,productCode:null,productName:null,quantity:null,unitPrice:null,lineType:null}};
let r = parseGrid(g,m);
console.log("BERRIDGE rows",r.rowsParsed,"invoices",r.invoices.length,"parsedTotal",r.parsedTotal,"reported",findReportedTotal(g,m));
console.log(JSON.stringify(r.invoices[0]),JSON.stringify(r.invoices.find(i=>i.documentType==="credit_memo")));
console.log("unpaid count",r.invoices.filter(i=>!i.commissionPaid).length);

wb = XLSX.read(new Uint8Array(await Bun.file("/mnt/user-uploads/1021_Conner-Legrand_Inc._Luke_Legrand.xlsx").arrayBuffer()),{type:"array",cellDates:true});
for (const s of ["January 2026","February 2026"]) {
  g = grid(wb,s);
  m = {headerRow:4,dataStartRow:5,dataEndRow:g.length-1,grain:"line",periodLabel:s,
   columns:{invoiceNumber:5,invoiceDate:6,customerName:4,customerNumber:3,orderReference:null,projectReference:7,projectName:8,salesAmount:13,commissionBase:null,commissionRate:14,commissionAmount:15,productCode:9,productName:10,quantity:11,unitPrice:12,lineType:0}};
  r = parseGrid(g,m);
  console.log(s,"rows",r.rowsParsed,"invoices",r.invoices.length,"parsedTotal",r.parsedTotal,"reported",findReportedTotal(g,m));
  console.log(JSON.stringify(r.invoices[0]).slice(0,600));
}
