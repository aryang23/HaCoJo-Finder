const puppeteer=require("puppeteer");
const fs = require('fs');
let xlsx = require("xlsx");
let cTab;

(async function fn(){
    try
    {
        let browserOpenPromise=puppeteer.launch({
            headless:false,
            defaultViewport:null,
            args:["--start-maximized"],
            ignoreDefaultArgs: ['--disable-extensions']
        });
        let browser=await browserOpenPromise;
        let allTabsArr=await browser.pages();
        cTab=allTabsArr[0];
        await cTab.goto("https://clist.by/");

        await cTab.waitForSelector(".small.text-muted",{delay:2000});
        let list=await cTab.evaluate(consoleFn,".row.contest.running.bg-success",".row.contest.running.bg-success .col-md-5.col-sm-4",".row.contest.running.bg-success .contest_title",".subcontest");
        console.table(list);
        
        let fp=__dirname+"\\Contests.xlsx";
        let fileName="Contests";
        let content=excelReader(fp,fileName);
        for(let i=0;i<list.length;i++)
        {
            content.push(list[i]);
        }
        // console.log(fp,"fpppp");
        // console.log(fileName,"fileNammmmmmm");
        excelWriter(fp,content,fileName);

        list=await cTab.evaluate(consoleFn,".row.contest.coming",".row.contest.coming .col-md-5.col-sm-4",".row.contest.coming .contest_title",".subcontest");
        console.table(list);
        let content2=excelReader(fp,fileName);
        for(let i=0;i<list.length;i++)
        {
            content2.push(list[i]);
        }
        excelWriter(fp,content2,fileName);
    }
    catch(err)
    {
        console.log(err);
    }
})();

function consoleFn(rowSelector,timeSelector,nameSelector,subSelector)
{
    let allElements=document.querySelectorAll(rowSelector);
    console.log(allElements);
    console.log(allElements.length);
    let list=[];
    for(let i=0;i<allElements.length;i++)
    {
        let isSub=allElements[i].querySelector(subSelector);
        if(isSub==null)
        {
            let name=document.querySelectorAll(nameSelector)[i].innerText;
            let time=document.querySelectorAll(timeSelector)[i].innerText.split("\n");
            let st=time[0];
            let duration=time[1];
            let timeLeft=time[2];
            // let link=document.querySelectorAll(".col-md-7.col-sm-8.event .resource a")[i].getAttribute("href");
            // console.log(name);
            // console.log(time);
            let obj={
                Name:name,
                StartingTime:st,
                Duration:duration,
                TimeLeft:timeLeft,
            }
            if(st!='')
            list.push(obj);

        }
    }
    return list;

}


function excelReader(filePath, name) {
    if (!fs.existsSync(filePath)) {
        return [];
    } else {
        // workbook => excel
        let wt = xlsx.readFile(filePath);
        // csk -> msd
        // get data from workbook
        let excelData = wt.Sheets[name];
        // convert excel format to json => array of obj
        let ans = xlsx.utils.sheet_to_json(excelData);
        // console.log(ans);
        return ans;
    }
}
function excelWriter(filePath, json, name) {
    // console.log(xlsx.readFile(filePath));
    let newWB = xlsx.utils.book_new();
    // console.log(json);
    let newWS = xlsx.utils.json_to_sheet(json);
    // msd.xlsx-> msd
    //workbook name as param
    xlsx.utils.book_append_sheet(newWB, newWS, name);
    //   file => create , replace
    //    replace
    xlsx.writeFile(newWB, filePath);
}