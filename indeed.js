const puppeteer=require("puppeteer");
const fs = require('fs');
let xlsx = require("xlsx");
let cTab;

let links=[];

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
        var link="https://in.indeed.com/jobs?q=Software+Developer&l=India&fromage=7";
        await cTab.goto("https://in.indeed.com/jobs?q=Software+Developer&l=India&fromage=7");
        // await cTab.type("#text-input-what","Software Developer",{delay:200});
        // await cTab.keyboard.press("Enter");
        // await cTab.waitForSelector(".npl.advanced-search");
        // await cTab.click("#filter-dateposted .icl-Icon.icl-Icon--sm.icl-Icon--right.icl-Icon--darkgrey.arrow-drop-down",{delay:100},{visible:true});
        // await cTab.waitForSelector(".dd-menu-option");
        // let link="https://in.indeed.com/jobs?q=Software+Developer&l=India"+"/jobs?q=Software+Developer&l=India&fromage=7";
        // await cTab.goto(link);
        await cTab.waitForSelector(".npl.advanced-search");
        let list=await cTab.evaluate(consoleFn,".jobsearch-SerpJobCard.unifiedRow.row.result.clickcard");
        console.table(list);

        let fp=__dirname+"\\IndeedJobs.xlsx";
        let fileName="IndeedJobs";
        let content=excelReader(fp,fileName);
        for(let i=0;i<list.length;i++)
        {
            content.push(list[i]);
        }
        excelWriter(fp,content,fileName);
        var num=0;
        for(let i=1;i<5;i++)
        {
            num+=10;
            // console.log("Link bbbbb",link);
            link=updateLink(link,num);
            // console.log("link after",link);

            await cTab.goto(link);
            await cTab.waitForSelector(".npl.advanced-search");
            let list=await cTab.evaluate(consoleFn,".jobsearch-SerpJobCard.unifiedRow.row.result.clickcard");
            console.table(list);

            let content=excelReader(fp,fileName);
            for(let i=0;i<list.length;i++)
            {
                content.push(list[i]);
            }
            excelWriter(fp,content,fileName);
        }
        //All Blocks: - .jobsearch-SerpJobCard.unifiedRow.row.result.clickcard
    }
    catch(err)
    {
        console.log(err);
    }
})();

function consoleFn(selector)
{
    let allElements=document.querySelectorAll(selector);
    let list=[];
    for(let i=0;i<allElements.length;i++)
    {
        let name=document.querySelectorAll(".title a")[i].getAttribute("title");
        let link=document.querySelectorAll(".title a")[i].getAttribute("href");
        let companyName=document.querySelectorAll(".company")[i].innerText;
        let skills=document.querySelectorAll(".summary").innerText;
        let salaryElem=document.querySelectorAll(".salarySnippet.salarySnippetDemphasizeholisticSalary span span")[i];
        let salary;
        let fullLink="https://in.indeed.com"+link;
        if(salaryElem!=undefined)
        {
            salary=salaryElem.innerText;
        }
        else
        {
            salary="Not Given";
        }
        let obj={
            Name:name,
            Link:fullLink,
            "Company Name":companyName,
            // "Skills":skills,
            "Salary":salary,
        };
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

function updateLink(link,no)
{
    let linkSplit=link.split("&");
    let lastElem=linkSplit[linkSplit.length-1];
    
    if(lastElem[0]!='s')
    {
        // console.log("Iffff");
        link+="&start="+no;
        return link;
    }
    else
    {
        // console.log("Elseee");
        let newLink="";
        for(let i=0;i<linkSplit.length-1;i++)
        {
            // console.log("LinkSplit",i,",,,,,",linkSplit[i]);
            newLink+=linkSplit[i]+"&";
        }
        newLink+="start="+no;
        return newLink;
    }
}