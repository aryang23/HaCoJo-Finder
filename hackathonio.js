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
        await cTab.goto("https://www.hackathon.io/events");
        let list=await cTab.evaluate(consoleFn,".event-teaser");
        console.table(list);

        let fp=__dirname+"\\HackathonIO.xlsx";
        let fileName="HackathonIO";
        let content=excelReader(fp,fileName);
        for(let i=0;i<list.length;i++)
        {
            content.push(list[i]);
        }
        excelWriter(fp,content,fileName);
    }
    catch(err)
    {
        console.log(err);
    }
})();

function consoleFn(selector)
{
    let allHacks=[];
    let allElements=document.querySelectorAll(selector);
    for(let i=0;i<allElements.length;i++)
    {
        let time=document.querySelectorAll(".two.columns.time")[i].innerText;
        let name=document.querySelectorAll(".seven.columns.description h4 a")[i].innerText;
        let link=document.querySelectorAll(".seven.columns.description h4 a")[i].getAttribute("href");
        let desc=document.querySelectorAll(".seven.columns.description h5 a")[i].innerText;
        let locationElem=document.querySelectorAll(".two.columns.location a")[i];
        let fullLink="https://www.hackathon.io"+link;
        let location;
        if(locationElem!=undefined)
        {
            location=locationElem.innerText;
        }
        else
        {
            location="Not Given";
        }

        let obj={
            Time:time,
            Name:name,
            link:fullLink,
            Description:desc,
            Location:location,
        }

        allHacks.push(obj);
    }
    return allHacks;


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
