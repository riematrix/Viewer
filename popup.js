/**
 * Created by Stanley Zhou on 2015/1/2.
 */
document.addEventListener("DOMContentLoaded", function() {

    document.getElementById("start_view").addEventListener("click",function(){
        chrome.tabs.executeScript(null, {code: "startView();",allFrames: false});
    });

    var stop_view = document.getElementById("stop_view");
    if(stop_view){
        stop_view.addEventListener("click",function(){
            chrome.tabs.executeScript(null, {code: "stopView();",allFrames: false});
        });
    }
});