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
        await cTab.goto("https://devfolio.co/hackathons");
        // await cTab.waitAndClick(".sc-1kmq71w-5.hjJQd")
        let allHacks=await cTab.evaluate(consoleFn);
        console.table(allHacks);

        let fp=__dirname+"\\DevFolio.xlsx";
        let fileName="Devfolio";
        let content=excelReader(fp,fileName);
        for(let i=0;i<allHacks.length;i++)
        {
            content.push(allHacks[i]);
        }
        excelWriter(fp,content,fileName);
        //allBlocks=  .style__Inner-sc-19afmba-7.jcKWGN
        //
    }
    catch(err)
    {
        console.log(err);
    }
})();

function consoleFn()
{
    let allElems=[];
    let allHacks=document.querySelectorAll(".style__Inner-sc-19afmba-7.jcKWGN");
    console.log(allHacks.length);
    let j=0;
    for(let i=0;i<allHacks.length;i++)
    {
        let link=document.querySelectorAll(".style__Flex-sc-19afmba-5.gwHgou a")[i].getAttribute("href");
        let name=document.querySelectorAll(".sc-fzqNJr.kwhLPe")[i].innerText;
        let startDate=document.querySelectorAll(".sc-fzqNJr.esEXVk")[j].innerText;
        let endDate=document.querySelectorAll(".sc-fzqNJr.esEXVk")[j+1].innerText;
        j+=2;
        let obj={
            Name:name,
            Link:link,
            "Start Date":startDate,
            "End Date":endDate
        }
        
        allElems.push(obj);
    }
    console.table(allElems);
    return allElems;
}

async function waitAndClick(selector)
{
    //wait click -> promise
    try{
        await cTab.waitForSelector(selector, { visible: true });
        await cTab.click(selector);
        console.log("done");
    }
    catch(err)
    {
        return new Error(err);
    }
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
