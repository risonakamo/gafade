async function main():Promise<void>
{
    document.head.insertAdjacentHTML("beforeend",
        `<link rel="stylesheet" href="${chrome.runtime.getURL("/gafade.css")}">`);

    var storageAccess:StorageAccess=new StorageAccess();

    // -- initial fade --
    var fadenames:Set<string>=await storageAccess.getFadeNames();
    doFade(fadenames,storageAccess.toggleFade);

    // -- setting up page change observer --
    var observer:MutationObserver=new MutationObserver(async ()=>{
        fadenames=await storageAccess.getFadeNames();
        doFade(fadenames,storageAccess.toggleFade);
    });
    observer.observe(document.querySelector("#load_recent_release") as Node,{
        childList:true
    });
}

// target all items and fade them if they are in the given fade names set
function doFade(fadeNames:Set<string>,fadeAction:(name:string)=>void):void
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
            createFadeButton(showItems[x],showname,fadeAction)
        );
    }
}

// create a fade button element
// parentShowBox: element that gets faded when this element is clicked
// showname: name of the show of the box
// fadeAction: callback to call with name that is being fade-toggled
function createFadeButton(parentShowBox:HTMLElement,showname:string,
    fadeAction:(name:string)=>void):HTMLElement
{
    var element:HTMLElement=document.createElement("div");
    element.innerHTML=`
        <div class="set-fade">toggle fade</div>
    `;

    element=element.firstElementChild as HTMLElement;

    element.addEventListener("click",(e)=>{
        e.preventDefault();
        parentShowBox.classList.toggle("faded");

        fadeAction(showname);

    });

    return element;
}

class StorageAccess
{
    cachedFadeNames?:Set<string>
    updateFadeNamesDebounce:number=0

    constructor()
    {
        this.toggleFade=this.toggleFade.bind(this);
    }

    // get fade names
    async getFadeNames():Promise<Set<string>>
    {
        return new Promise(resolve=>{
            chrome.storage.local.get("fadeNames",(x:LocalStorage)=>{
                resolve(new Set(x.fadeNames || []));
            });
        });
    }

    // toggle the given name in the fadenames list
    async toggleFade(name:string):Promise<void>
    {
        if (!this.cachedFadeNames)
        {
            this.cachedFadeNames=await this.getFadeNames();
        }

        if (this.cachedFadeNames.has(name))
        {
            this.cachedFadeNames.delete(name);
        }

        else
        {
            this.cachedFadeNames.add(name);
        }

        this.updateFadeNames(this.cachedFadeNames);
    }

    // set the fade names in the database. debounced. clears the
    // cached fade names
    updateFadeNames(fadenames:Set<string>):void
    {
        clearTimeout(this.updateFadeNamesDebounce);
        this.updateFadeNamesDebounce=setTimeout(()=>{
            chrome.storage.local.set({fadeNames:Array.from(fadenames)});
            this.cachedFadeNames=undefined;
        },300);
    }
}

main();