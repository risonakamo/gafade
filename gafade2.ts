async function main():Promise<void>
{
    document.head.insertAdjacentHTML("beforeend",
        `<link rel="stylesheet" href="${chrome.runtime.getURL("gafade.css")}">`);

    var storageAccess:StorageAccess=new StorageAccess();

    var fadenames:Set<string>=await storageAccess.getFadeNames();

    doFade(fadenames);
}

// target all items and fade them if they are in the given fade names set
function doFade(fadeNames:Set<string>):void
{
    var showItems:NodeListOf<HTMLElement>=document.querySelectorAll(".items li");

    var showname;
    for (var x=0,l=showItems.length;x<l;x++)
    {
        showname=(showItems[x].children[1] as HTMLElement).innerText;
        if (fadeNames.has(showname))
        {
            showItems[x].classList.add("faded");
        }

        showItems[x].insertAdjacentElement(
            "afterbegin",
            createFadeButton(showItems[x],showname)
        );
    }
}

// create a fade button element
// parentShowBox: element that gets faded when this element is clicked
// showname: name of the show of the box
function createFadeButton(parentShowBox:HTMLElement,showname:string):HTMLElement
{
    var element:HTMLElement=document.createElement("div");
    element.innerHTML=`
        <div class="set-fade">toggle fade</div>
    `;

    element=element.firstElementChild as HTMLElement;

    element.addEventListener("click",(e)=>{
        e.preventDefault();
        parentShowBox.classList.toggle("faded");

        // if (_fadeNames.has(showname))
        // {
        //     _fadeNames.delete(showname);
        // }

        // else
        // {
        //     _fadeNames.add(showname);
        // }

        // updateStorageFadeNames();
    });

    return element;
}

class StorageAccess
{
    // get fade names
    async getFadeNames():Promise<Set<string>>
    {
        return new Promise(resolve=>{
            chrome.storage.local.get("fadeNames",(x:LocalStorage)=>{
                resolve(new Set(x.fadeNames || []));
            });
        });
    }
}

main();