const fadeNames=new Set([
    "Bokutachi wa Benkyou ga Dekinai 2",
    "Sword Art Online: Alicization - War of Underworld"
]);

function main()
{
    document.head.insertAdjacentHTML("beforeend",`<link rel="stylesheet" href="${chrome.runtime.getURL("gafade.css")}">`);
    doFade();

    var observer=new MutationObserver(doFade);

    observer.observe(document.querySelector("#load_recent_release"),{
        childList:true
    });
}

//look for all show items and fade out the ones from the fadenames
function doFade()
{
    var showItems=document.querySelectorAll(".items li");

    for (var x=0,l=showItems.length;x<l;x++)
    {
        if (fadeNames.has(showItems[x].children[1].innerText))
        {
            showItems[x].style.opacity=.2;
        }

        showItems[x].insertAdjacentElement("afterbegin",createFadeButton(showItems[x]));
    }
}

//create a fade button element
//parentShowBox: element that gets faded when this element is clicked
function createFadeButton(parentShowBox)
{
    var element=document.createElement("div");
    element.innerHTML=`
        <div class="set-fade">toggle fade</div>
    `;

    element=element.firstElementChild;

    element.addEventListener("click",(e)=>{
        e.preventDefault();
        parentShowBox.classList.toggle("faded");
    });

    return element;
}

main();