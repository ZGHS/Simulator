//进行全屏并适配各浏览器
function fullScreen() {
    var element = document.getElementById('myEmbeddedScene'), method = "RequestFullScreen";
    var prefixMethod;
    ["webkit", "moz", "ms", "o", ""].forEach(function (prefix) {
            if (prefixMethod)
                return;
            if (prefix === "") {
                // 无前缀，方法首字母小写
                method = method.slice(0, 1).toLowerCase() + method.slice(1);
            }
            var fsMethod = typeof element[prefix + method];
            if (fsMethod + "" !== "undefined") {
                // 如果是函数,则执行该函数
                if (fsMethod === "function") {
                    prefixMethod = element[prefix + method]();
                } else {
                    prefixMethod = element[prefix + method];
                }
            }
        }
    );

    // $('#changeToFullScreenBtn').hide();

    return prefixMethod;
}

var screen_flag = false;

function changeToFullScreen() {
    if (!screen_flag) {
        $('#myEmbeddedScene').css({
            'position': 'absolute',
            'top': '0',
            'z-index': '200',
        });
        //$('#myEmbeddedScene').width(screen.availWidth);
        // $('#myEmbeddedScene').height($('body').height()+'px');
        $('#myEmbeddedScene').width(document.body.scrollWidth);
        $('#myEmbeddedScene').height(document.body.clientHeight);
        screen_flag = true;
        $('#changeToFullScreenBtn').val('退出网页全屏');
    } else {
        // $('#myEmbeddedScene').width('49.9%');
        $('#myEmbeddedScene').width($('#myDiagramDiv').parent().width()/2-1);
        $('#myEmbeddedScene').css({
            'height': '510px',
            'border': 'solid 1px black',
            'background': 'whitesmoke',
            'padding': '0',
            'position': '',
            'top': '',
            'z-index': '',
            'float': 'right'
        });
        screen_flag = false;
        $('#changeToFullScreenBtn').val('网页全屏');
    }
}

