async function main():Promise<void>
{
    document.head.insertAdjacentHTML("beforeend",
        `<link rel="stylesheet" href="${chrome.runtime.getURL("/gafade.css")}">`);

    var storageAccess:StorageAccess=new StorageAccess();

    // -- initial fade --
    var fadenames:Set<string>=await storageAccess.getFadeNames();
    var focusnames:Set<string>=await storageAccess.getFocusNames();
    doFade(fadenames,focusnames,storageAccess.toggleFade,storageAccess.toggleFocus);

    // -- setting up page change observer --
    var observer:MutationObserver=new MutationObserver(async ()=>{
        fadenames=await storageAccess.getFadeNames();
        focusnames=await storageAccess.getFocusNames();
        doFade(fadenames,focusnames,storageAccess.toggleFade,storageAccess.toggleFocus);
    });
    observer.observe(document.querySelector("#load_recent_release") as Node,{
        childList:true
    });
}

// target all items and fade them if they are in the given fade names set,
// or focus if they are in the focus set
function doFade(
    fadeNames:Set<string>,
    focusNames:Set<string>,
    fadeAction:(name:string)=>void, //callback to fade the selected name
    focusAction:(name:string)=>void //callback to focus the selected name
):void
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

        if (focusNames.has(showname))
        {
            showItems[x].classList.add("focused");
        }

        showItems[x].insertAdjacentElement(
            "afterbegin",
            createFadeButton(showItems[x],showname,fadeAction,focusAction)
        );
    }
}

// create a fade button element
// parentShowBox: element that gets faded when this element is clicked
// showname: name of the show of the box
// fadeAction: callback to call with name that is being fade-toggled
function createFadeButton(
    parentShowBox:HTMLElement,
    showname:string,
    fadeAction:(name:string)=>void,
    focusAction:(name:string)=>void
):HTMLElement
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

    element.addEventListener("contextmenu",(e)=>{
        e.preventDefault();
        parentShowBox.classList.toggle("focused");

        focusAction(showname);
    });

    return element;
}

class StorageAccess
{
    cachedFadeNames?:Set<string>
    updateFadeNamesDebounce:number=0

    cachedFocusNames?:Set<string>
    updateFocusNamesDebounce:number=0

    constructor()
    {
        this.toggleFade=this.toggleFade.bind(this);
        this.toggleFocus=this.toggleFocus.bind(this);
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

    async getFocusNames():Promise<Set<string>>
    {
        return new Promise(resolve=>{
            chrome.storage.local.get("focusNames",(x:LocalStorage)=>{
                resolve(new Set(x.focusNames || []));
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

    // toggle the given name in the fadenames list
    async toggleFocus(name:string):Promise<void>
    {
        if (!this.cachedFocusNames)
        {
            this.cachedFocusNames=await this.getFocusNames();
        }

        if (this.cachedFocusNames.has(name))
        {
            this.cachedFocusNames.delete(name);
        }

        else
        {
            this.cachedFocusNames.add(name);
        }

        this.updateFocusNames(this.cachedFocusNames);
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

    updateFocusNames(focusnames:Set<string>):void
    {
        clearTimeout(this.updateFocusNamesDebounce);
        this.updateFocusNamesDebounce=setTimeout(()=>{
            chrome.storage.local.set({focusNames:Array.from(focusnames)});
            this.cachedFocusNames=undefined;
        },300);
    }
}

main();