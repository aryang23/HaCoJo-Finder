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
        await cTab.goto("https://remoteok.io/remote-dev-jobs");
        let list=await cTab.evaluate(consoleFn,".job");
        console.table(list);

        let fp=__dirname+"\\RemoteOk.xlsx";
        let fileName="RemoteOk";
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

function consoleFn(allElemSelector)
{
    let allElements=document.querySelectorAll(allElemSelector);
    let list=[];
    let j=0;
    for(let i=0;i<allElements.length;i++)
    {
        let link=document.querySelectorAll(".job")[i].getAttribute("data-url");
        let companyName=document.querySelectorAll(".job .companyLink h3")[i].innerText;
        let name=document.querySelectorAll(".job .preventLink h2")[j].innerText;
        let fullLink="https://remoteok.io/"+link;
        j+=2;

        let obj={
            Link:fullLink,
            "Company Name":companyName,
            "Name":name
        }
        list.push(obj);
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
