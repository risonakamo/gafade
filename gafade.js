const fadeNames=new Set([
    "Bokutachi wa Benkyou ga Dekinai 2",
    "Sword Art Online: Alicization - War of Underworld"
]);

function main()
{
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
    }
}

main();