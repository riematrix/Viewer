/**
 * Created by Administrator on 2014/9/4.
 */
var searchResultTab;
var tabController = {
    urlTag: "chrome_auto_viewer",
    tabs: {},
    activeTabsLimit: 10,
    activeTabsCount: 0,
    pendingTabs: [],
    closedTabs: [],
    continueView: true,
    wait: function(){
        this.continueView = false;
    },
    goon: function(){
        this.continueView = true;
        this.viewNext();
    },
    viewNext: function(){
        if(this.continueView && this.activeTabsCount<this.activeTabsLimit){
            var link = this.pendingTabs.shift();
            if(link){
                chrome.tabs.create({ url: link });
                this.activeTabsCount ++;
                var self = this;
                setTimeout(function(){
                    self.viewNext();
                },1000);
            }
            else{
                executeTabFunction(searchResultTab,"stopView");
            }
        }
    },
    addTab: function(link){
        link += "#" + this.urlTag;
        if(!this.tabs[encodeURI(link)]){
            this.pendingTabs.push(link);
            this.tabs[encodeURI(link)] = true;
        }
    },
    tabChange: function(activity, link ){
        switch (activity)
        {
            case "open" :

                break;
            case "close" :
                this.activeTabsCount --;
                this.viewNext();
                break;
            default : break;
        }
    },
    reset: function(){
        this.tabs = {};
        this.activeTabsCount = 0;
        this.pendingTabs = [];
        this.wait();
    }
};
// Handler
MsgHandler = {
    profilesUpdated: function(profiles, sender, sendResponse){
        for(var i=0;i<profiles.length;i++){
            tabController.addTab(profiles[i].viewPage);
        }
    },
    batchView: function(profiles,sender,sendResponse){
        tabController.reset();
        this.profilesUpdated(profiles);
        searchResultTab = sender.tab.id;
        tabController.goon();
    },
    stopView: function(){
        tabController.reset();
    },
    viewThisLink:function(profileLink,sender,sendResponse){
        searchResultTab = sender.tab.id;
        chrome.tabs.create({ url: profileLink });
    },
    linkViewed: function(actualLink,sender,sendResponse){
        if(sender.tab && searchResultTab){
            executeTabFunction(searchResultTab,"viewComplete",[actualLink],function() {
                if(actualLink.indexOf(tabController.urlTag)>=0){
                    chrome.tabs.remove(sender.tab.id);
                    tabController.tabChange("close", actualLink);
                    sendResponse();
                }
            });
        }
    }
};
// Wire up the listener.
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if(message.method)MsgHandler[message.method](message.data,sender,sendResponse);
});


function executeTabFunction(tabId, functionName, params,sendResponse){
    chrome.tabs.executeScript(tabId,{
        code: functionName + "('" + params.join("','") + "')"
    },function(){
        if(sendResponse) sendResponse();
    });
}
