// 休眠
function sleep(delay) {
    var start = (new Date()).getTime();
    while ((new Date()).getTime() - start < delay) {
        continue;
    }
}

// 发送get请求
function sendRequest(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {

        }
    }
    xhr.send();
}


while (true) {
    // 获取表格
    let table = document.getElementById("tbody");
    let sign = 1;
    if (!table) {
        continue;
    }
    // 获取表格内容数组
    let rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
        (function(i) {
            let row = rows[i];
            let str = row.innerHTML;
            let tmp = str.replace(/\s/g, "");
            let pattern = /<td>[0-9]+<\/td>[\s\S]*\(([0-9]{1,2}%|0)\)[\s\S]*/

            // 如果存在没学完的课，并且课程未被隐藏
            if (pattern.test(tmp) && row.style.display != "none") {

                // 标识是否学完，若为0则存在没学完的课
                sign = 0;
                let href = row.children[3].children[0].href
                let url = href.match(/\?(.*)/g);
                url = url[0]

                // 解析URL参数
                let theRequest = new Object();
                if (url.indexOf("?") != -1) {
                    let ss = url.substr(1);
                    strs = ss.split("&");
                    for (let j = 0; j < strs.length; j++) {
                        theRequest[strs[j].split("=")[0]] = unescape(strs[j].split("=")[1]);
                    }
                }

                let ahb510 = theRequest.ahb510;
                let ahc510 = theRequest.ahc510;
                let ahb590 = theRequest.ahb590;
                let learnTime = 1;
                let thisUrl = 'http://218.94.85.5:8315/wt/g/c/wtgc_learn_time.html?' +
                    'ahb510=' + ahb510 +
                    '&ahc510=' + ahc510 +
                    '&ahb590=' + ahb590 +
                    '&learnTime=1';

                // 发送请求
                sendRequest(thisUrl);

                // 休眠100毫秒
                sleep(100);
            }

        })(i);
    }

    // 若学习完毕，则退出
    if (sign) {
        chrome.runtime.sendMessage({ "method": "end" });
        break;
    }

    // 休眠5秒
    sleep(5000);

    // 刷新页面
    window.location.reload();

}