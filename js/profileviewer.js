/**
 * Created by Stanley Zhou on 2015/1/22.
 */
function Profile(options) {
    this.viewPage = options.viewPage;
    this.name = options.name;
    this.status = "notViewed";
}
Profile.prototype = {
    view: function(){
        var link = this.viewPage;
        this.status = "Pending";
        chrome.runtime.sendMessage({
            method: "viewThisLink",
            data: link
        },function(){
            console.log("content..complete")
        });
    }
};

var ProfilePool = {
    count :0 ,
    profiles: [],
    add: function(profile){
        this.profiles.push(profile);
        this.count ++;
        return this;
    },
    reset: function(){
        this.count = 0;
        this.profiles = [];
        return this;
    },
    notify: function(){
        chrome.runtime.sendMessage({
            method: "profilesUpdated",
            data: this.profiles
        },function(){
            console.log("update..complete")
        });
    }
};

function nextPage(){
    $("#results-pagination").find(".page-link[rel=next]")[0].click();
}

var autoRoll = false;
var viewStarted = false;
function init(){
    if(location.href.indexOf("vsearch")>=0){
        var refreshProfilePool = function(){
            ProfilePool.reset();
            var people = $(".mod.people");//,.mod.company
            people.each(function(i, el){
                var link = $(el).find("a")[1];
                ProfilePool.add(new Profile({
                    viewPage: link.href,
                    name: link.innerText
                }))
            });
            ProfilePool.notify();
            if(autoRoll){
                setTimeout(function(){
                    nextPage();
                },3000);
            }
        };
        refreshProfilePool();

        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        var observer = new MutationObserver(function(mutations, observer) {
            // fired when a mutation occurs
            refreshProfilePool();
            // ...
        });

        // define what element should be observed by the observer
        // and what types of mutations trigger the callback
        observer.observe(document.getElementById("results-container"), {
            subtree: true,
            attributes: true,
            childList: true
            //...
        });
    }
    else if(location.href.indexOf("profile")>=0){
        setTimeout(function(){
            chrome.runtime.sendMessage({
                method: "linkViewed",
                data: location.href
            },function(){
                window.close();
            });
        },10000);
    }
}
init();

function startView(){
    if(location.href.indexOf("vsearch")>=0){
        /*$.each(ProfilePool.profiles, function(i,profile){
         profile.view();
         })*/
        chrome.runtime.sendMessage({
            method: "batchView",
            data: ProfilePool.profiles
        },function(){
        });
        autoRoll = true;
        nextPage();
    }
}

function stopView(){
    autoRoll = false;
    chrome.runtime.sendMessage({
        method: "stopView"
    },function(){
    });
}

function viewComplete(link){
    console.log("complete: "+link);
}