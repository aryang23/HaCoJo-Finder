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
        await cTab.goto("https://www.massapply.com/jobs");
        await cTab.waitForSelector(".col-12.col-sm-6.col-lg-4.col-xl-3 .text-white.bg-primary.card",{visible:true});

        let list=await cTab.evaluate(mainFn);
        console.table(list);


        let fp=__dirname+"\\MultipleJobs.xlsx";
        let fileName="MultipleJobs";
        let content=excelReader(fp,fileName);
        for(let i=0;i<list.length;i++)
        {
            content.push(list[i]);
        }
        excelWriter(fp,content,fileName);


        list=await cTab.evaluate(mainFn2);
        console.table(list);

        fp=__dirname+"\\ColdEmails.xlsx";
        fileName="ColdEmails";

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



function mainFn()
{
    let allElements=document.querySelectorAll(".col-12.col-sm-6.col-lg-4.col-xl-3 .text-white.bg-primary.card");
    console.log(allElements);
    console.log(allElements.length);
    let allJobs=[];
    for(let i=0;i<allElements.length;i++)
    {
        
        let link=document.querySelectorAll(".card-header h2 a")[i].getAttribute("href");
        let name=document.querySelectorAll(".card-header h2 a")[i].innerText;
        let fullLink="https://www.massapply.com"+link;
        let obj={
            Name:name,
            Link:fullLink
        }
        allJobs.push(obj);
    }
    return allJobs;
}

function mainFn2(){
    let allElements=document.querySelectorAll(".col-12.col-sm-6.col-lg-4.col-xl-3");
    let susp=document.querySelectorAll(".text-white.bg-primary.card");
    let list=[];
    for(let i=0;i<allElements.length;i++)
    {
        let isSusp=allElements[i].querySelector(".text-white.bg-primary.card");
        
        if(isSusp==null)
        {
            let name=allElements[i].querySelector(".card .card-body h2 a").innerText;
            // let description=allElements[i].querySelector(".card .card-body p a i").innerText;
            let link=allElements[i].querySelector(".card .card-body p a").getAttribute("href");
            // let location=document.querySelectorAll(".col-12.col-sm-6.col-lg-4.col-xl-3 .fa.fa-map-marker.fa-md")[i].innerText;
            let location=document.querySelectorAll("p[style='font-size: 16px; margin-top: -10px;']")[i];
            // console.log(location);
            let mainObj={
                Name:name,
                // Location:location,
                Link:link,
            }
            list.push(mainObj);
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
