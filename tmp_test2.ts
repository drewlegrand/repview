import * as XLSX from "xlsx";
const wb = XLSX.read(new Uint8Array(await Bun.file("/mnt/user-uploads/Berridge_May26_Commissions.xlsx").arrayBuffer()),{type:"array",cellDates:true});
const g:any[][] = XLSX.utils.sheet_to_json(wb.Sheets["Sheet1"],{header:1,raw:true,blankrows:true,defval:null});
let s=0, n=0; const seen=new Map<string,number>();
for(let r=1;r<=236;r++){const v=g[r][8]; if(typeof v==="number"){s+=v;n++;} const k=String(g[r][1]); seen.set(k,(seen.get(k)??0)+1);}
console.log("sum",s,"rows",n,"stated",g[238][8]);
console.log("dups",[...seen].filter(([,c])=>c>1));
