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
        await cTab.goto("https://www.hackerearth.com/companies/",{delay:100});
        let list=await cTab.evaluate(consoleFn,".company-card-container",".light.openings",".company-card-container .name.ellipsis");
        console.table(list);

        let fp=__dirname+"\\HackerearthJobs.xlsx";
        let fileName="HackerearthJobs";
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

function consoleFn(allSelector,availSelector,nameSelector){
    let list=[];
    let allElements=document.querySelectorAll(allSelector);
    for(let i=0;i<allElements.length;i++)
    {
        let isAvailable=allElements[i].querySelector(availSelector);
        if(isAvailable!=null)
        {
            let nameElem=allElements[i].querySelector(nameSelector).innerText;
            let linkSelector=allElements[i].getAttribute("link");
            let totalLink="https://www.hackerearth.com"+linkSelector+"jobs";
            // console.log(linkSelector);
            console.log(totalLink);
            // let url="https://www.hackerearth.com/companies/"+
            console.log(nameElem);
            let obj={
                Name:nameElem,
                Link:totalLink
            }
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