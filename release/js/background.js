let scoreTabId = 0,
    scoreWindowId = 0;
let windowWidth = 360 + Math.floor(Math.random() * 120);
let windowHeight = 360 + Math.floor(Math.random() * 120);
let chromeVersion = (/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [0, 0])[1];
let firefoxVersion = (/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [0, 0])[1];
let isMobile = !!(/Mobile/.exec(navigator.userAgent));
let urlMap = {
    "login": "http://218.94.85.5:8315/ww/login.html",
    "index": "http://218.94.85.5:8315/ww/u/a/wwua_cont.html",
    "course": "http://218.94.85.5:8315/wt/g/c/wtgc_cont.html"
};

//通知
function notice(title, message = "") {
    if (!isMobile) {
        chrome.notifications.create({
            "type": "basic",
            "iconUrl": "img/128.png",
            "title": title,
            "message": message
        }, function(notificationId) {
            setTimeout(function() {
                chrome.notifications.clear(notificationId);
            }, 5000);
        });
    } else {
        alert(title + (message ? "\n" + message : ""));
    }
}

//创建窗口
function createWindow(url, callback) {
    chrome.windows.create({
        "url": url,
        "type": "popup",
        "top": 0,
        "left": 0,
        "width": windowWidth,
        "height": windowHeight
    }, function(window) {
        if (firefoxVersion) {
            chrome.windows.update(window.id, {
                "top": 0,
                "left": 0,
            });
        }
        chrome.tabs.update(window.tabs[window.tabs.length - 1].id, { "muted": true });
        if (typeof callback === "function") {
            callback(window);
        }
    })
}

//关闭窗口
function closeWindow(windowId) {
    if (windowId) {
        chrome.windows.get(windowId, function(window) {
            if (window) {
                chrome.windows.remove(windowId);
            }
        });
    } else {
        if (scoreWindowId) {
            chrome.windows.remove(scoreWindowId);
        }
        notice(chrome.i18n.getMessage("extFinish"));
    }
}

//扩展按钮点击事件
chrome.browserAction.onClicked.addListener(function(tab) {
    if (chromeVersion < 45 && firefoxVersion < (isMobile ? 55 : 48)) {
        notice(chrome.i18n.getMessage("extVersion"));
    } else {
        if (!isMobile) {
            if (scoreTabId) {
                notice(chrome.i18n.getMessage("extWorking"));
            } else {
                createWindow(urlMap.course, function(window) {
                    scoreWindowId = window.id;
                    scoreTabId = window.tabs[window.tabs.length - 1].id;
                });
            }
        } else {
            if (scoreTabId) {
                notice(chrome.i18n.getMessage("extWorking"));
            } else {
                chrome.tabs.create({ "url": urlMap.course }, function(tab) {
                    scoreTabId = tab.id;
                });
            }
        }
    }
});

//标签页移除事件
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if (tabId === scoreTabId) {
        scoreTabId = 0;
    }
});

//窗口移除事件
// if (!isMobile) {
//     chrome.windows.onRemoved.addListener(function (windowId) {
//         if (windowId === scoreWindowId) {
//             scoreWindowId = 0;
//             chrome.browserAction.setBadgeText({"text": ""});
//         }
//     });
// }


//通信事件
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.method) {
        case "end":
            closeWindow();
            scoreWindowId = 0;
            scoreTabId = 0;
            break;
    }
});