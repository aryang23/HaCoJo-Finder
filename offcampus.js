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
        await cTab.goto("https://www.offcampusjobs4u.com/freshers-job/2022-batch/");
        let linksArr=await cTab.evaluate(consoleFn);
        console.log(linksArr);
        // await cTab.evaluate(getLink);
        // let currentPageUrl=await cTab.url();
        let allLinks=[];
        for(let i=0;i<linksArr.length;i++)
        {
            let cLink=linksArr[i];
            
            let finalLink=await getLink(cLink);
            allLinks.push(finalLink);
        }

        console.table(allLinks);

        let fp=__dirname+"\\OffCampus.xlsx";
        let fileName="OffCampus";
        let content=excelReader(fp,fileName);
        for(let i=0;i<allLinks.length;i++)
        {
            content.push(allLinks[i]);
        }
        excelWriter(fp,content,fileName);




        // await cTab.click(".menu-item.menu-item-type-taxonomy.menu-item-object-category.menu-item-has-children.tdb-menu-item-button.tdb-menu-item.tdb-normal-menu.menu-item-190",{visible:true});
        // await cTab.click(".menu-item.menu-item-type-taxonomy.menu-item-object-category.tdb-menu-item.tdb-normal-menu.menu-item-25296 .tdb-menu-item-text",{visible:true});
        // let jobSelector=".menu-item.menu-item-type-taxonomy.menu-item-object-category.current-category-ancestor.current-menu-ancestor.current-menu-parent.current-category-parent.menu-item-has-children.tdb-menu-item-button.tdb-menu-item.tdb-normal-menu.menu-item-190";
        // await cTab.click(jobSelector,{visible:true});
        // await cTab.evaluate(consoleFn,".close-popup.glyphicon.glyphicon-remove",".menu-item.menu-item-type-taxonomy.menu-item-object-category.current-category-ancestor.current-menu-ancestor.current-menu-parent.current-category-parent.menu-item-has-children.tdb-menu-item-button.tdb-menu-item.tdb-normal-menu.menu-item-190");
        // await cTab.evaluate(consoleFn,".close-popup.glyphicon.glyphicon-remove",".menu-item-190");



        //document.querySelectorAll(".entry-title.td-module-title a")[0].getAttribute("href")


        //document.querySelector("p strong a").getAttribute("href")

        //https://index.memebers.workers.dev/0:/%20%F0%9F%92%96%20EXCLUSIVE%20DRIVE%20%F0%9F%92%96%20/

        //https://index.memebers.workers.dev
        //sf, sf

        //
    }
    catch(err)
    {
        console.log(err);
    }
})();

 

function consoleFn(){
    let allElem=document.querySelectorAll(".entry-title.td-module-title");
    let linksArr=[];
    for(let i=0;i<allElem.length;i++)
    {
        let link=document.querySelectorAll(".entry-title.td-module-title a")[i].getAttribute("href");
        linksArr.push(link);
    }
    return linksArr;
}

async function getLink(link)
{
    await cTab.goto(link);
    await cTab.waitForSelector(".td-post-sharing-visible");
    let linkObj=await cTab.evaluate(getFinalLink);
    return linkObj;
}

function getFinalLink()
{
    let link=document.querySelector("p strong a").getAttribute("href");
    let name=document.querySelector(".tdb-title-text").innerText;
    let linkObj={
        Name:name,
        Link:link
    }
    return linkObj;
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


//.menu-item.menu-item-type-taxonomy.menu-item-object-category.current-category-ancestor.current-menu-ancestor.current-menu-parent.current-category-parent.menu-item-has-children.tdb-menu.item-button.tdb-menu-item.tdb-normal-menu.menu-item-190






// menu-item menu-item-type-custom menu-item-object-custom current-menu-item current_page_item menu-item-home menu-item-first tdb-menu-item-button tdb-menu-item tdb-normal-menu menu-item-189
// menu-item menu-item-type-taxonomy menu-item-object-category menu-item-has-children tdb-menu-item-button tdb-menu-item tdb-normal-menu menu-item-190