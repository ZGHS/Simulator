var fov = 80,//全局变量:拍摄距离，视野角值越大，场景中的物体越小
    near = 0.005,//全局变量:相机离视体积最近的距离
    far = 10000;//全局变量:相机离视体积最远的距离

/**
 *针对目标:未初始化的场景
 *作用:初始化场景的a-scene，camera;添加针对场景的滚轮事件，在firefox浏览器下可以对场景进行“缩放”
 *参数:无
 *限制:必须在第一次加载场景时使用，之后不能使用
 *返回值:无
 */
function initiateScene() {
    var place = document.getElementById('myEmbeddedScene');
    var scene = document.createElement('a-scene');

    //右上角锁定视角button
    var button = document.createElement('input');
    button.setAttribute('id', 'lock_screen_btn');
    button.setAttribute('style', "position:absolute;right:1px;top:1px;z-index: 200");
    button.setAttribute('class', "btn btn-default");
    button.setAttribute('type', 'button');
    button.setAttribute('value', '锁定视角');
    button.addEventListener("click", lockScene);
    scene.appendChild(button);

    //左上角全屏button
    var button_1 = document.createElement('input');
    button_1.setAttribute('id', 'full_screen_btn');
    button_1.setAttribute('style', "position:absolute;left:1px;top:1px;z-index: 200");
    button_1.setAttribute('class', "btn btn-default");
    button_1.setAttribute('type', 'button');
    button_1.setAttribute('value', '全屏浏览');
    button_1.addEventListener("click", fullScreen);
    scene.appendChild(button_1);

    //左下角网页全屏button
    var button_2 = document.createElement('input');
    button_2.setAttribute('id', 'web_full_screen_btn');
    button_2.setAttribute('style', "position:absolute;left:1px;bottom:1px;z-index: 200");
    button_2.setAttribute('class', "btn btn-default");
    button_2.setAttribute('id', "changeToFullScreenBtn");
    button_2.setAttribute('type', 'button');
    button_2.setAttribute('value', '网页全屏');
    button_2.addEventListener("click", changeToFullScreen);
    scene.appendChild(button_2);

    var camera = document.createElement('a-entity');
    camera.setAttribute('id', 'main_camera');
    camera.setAttribute('camera', '');
    camera.setAttribute('look-controls', '');
    camera.setAttribute('wasd-controls', '');
    camera.setAttribute('position', '0 1 1.6');
    camera.setAttribute('static-body', 'shape: sphere; sphereRadius: 0.001');
    camera.setAttribute('cursor', 'rayOrigin:mouse');
    camera.setAttribute('super-hands', 'colliderEvent: raycaster-intersection;colliderEventProperty: els;colliderEndEvent:raycaster-intersection-cleared;colliderEndEventProperty: clearedEls;');
    camera.setAttribute('fov', 80);

    scene.appendChild(camera);

    place.appendChild(scene);

    //Firefox使用addEventListener添加滚轮事件
    if (document.querySelector('a-scene').addEventListener) {//firefox
        document.querySelector('a-scene').addEventListener('DOMMouseScroll', updateHeight, false);
    }
}

/**
 *针对目标:当前网页
 *作用:根据鼠标滚轮操作，将a-frame场景中的摄像机的y轴坐标增大或缩小进而实现对场景的缩放效果
 *参数:事件e
 *限制:该函数当前仅在firefox下测试完成
 *返回值:无
 */
function updateHeight(e) {
    var camera = document.querySelector("#main_camera");
    position = camera.getAttribute('position');
    e.preventDefault();
    if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
        if (e.wheelDelta > 0 && position.y <= 20) { //当滑轮向上滚动时
            position.y += 0.05;
        }
        if (e.wheelDelta < 0 && position.y >= 0.1) { //当滑轮向下滚动时
            position.y -= 0.05;
        }
    } else if (e.detail) {  //Firefox滑轮事件
        if (e.detail > 0 && position.y <= 20) { //当滑轮向上滚动时
            position.y += 0.05;
        }
        if (e.detail < 0 && position.y >= 0.1) { //当滑轮向下滚动时
            position.y -= 0.05;
        }
    }
    camera.setAttribute('position', position);
}

/**
 *针对目标:已存在的场景
 *作用:为场景添加基本的asset，方便后续修改使用
 *参数:无
 *限制:添加贴图时使用img;添加模型时使用a-asset-item
 *返回值:无
 */
function createAsset() {

    var scene = document.querySelector('a-scene');
    var assets = document.createElement('a-assets');

    //添加天空盒贴图
    var asset_item = document.createElement('img');
    asset_item.setAttribute('id', 'blue_sky');
    asset_item.setAttribute('src', "asset/blue_sky.jpg");
    assets.appendChild(asset_item);

    //添加木地板
    var asset_item_1 = document.createElement('img');
    asset_item_1.setAttribute('id', 'wood_floor');
    asset_item_1.setAttribute('src', "asset/wood_floor.jpg");
    assets.appendChild(asset_item_1);

    // <a-mixin id="cube" geometry="primitive: box; width: 0.5; height: 0.5; depth: 0.5"
    //          hoverable grabbable stretchable draggable droppable
    //          shadow
    //          dynamic-body="shape:box"
    //          event-set__hoveron="_event: hover-start; material.opacity: 0.7; transparent: true"
    //          event-set__hoveroff="_event: hover-end; material.opacity: 1; transparent: false"
    //          event-set__dragon="_event: dragover-start; material.wireframe: true"
    //          event-set__dragoff="_event: dragover-end; material.wireframe: false">
    // </a-mixin>
    //添加可拖拽box（示例）
    var asset_mixin = document.createElement('a-mixin');
    asset_mixin.setAttribute('id', 'cube');
    asset_mixin.setAttribute('geometry', 'primitive: box; width: 0.5; height: 0.5; depth: 0.5');
    asset_mixin.setAttribute('hoverable', '');
    asset_mixin.setAttribute('grabbable', '');
    asset_mixin.setAttribute('stretchable', '');
    asset_mixin.setAttribute('draggable', '');
    asset_mixin.setAttribute('droppable', '');
    asset_mixin.setAttribute('shadow', '');
    asset_mixin.setAttribute('dynamic-body', 'shape:box');
    asset_mixin.setAttribute('event-set__hoveron', '_event: hover-start; material.opacity: 0.7; transparent: true');
    asset_mixin.setAttribute('event-set__hoveroff', '_event: hover-end; material.opacity: 1; transparent: false');
    assets.appendChild(asset_mixin);

    scene.appendChild(assets);
}

/**
 *针对目标:初始化后的场景
 *作用:创建一个教室（地板、灯光、天空盒）
 *参数:无
 *限制:需要初始化场景，或净化场景后再调用
 *返回值:无
 */
function createClassroom() {
    var scene = document.querySelector("a-scene");
    scene.setAttribute('inspector', '');
    scene.setAttribute('id', 'myVRScene');
    scene.setAttribute('embedded', "");
    var sky = document.createElement("a-sky");
    sky.setAttribute("color", "#DDDDDD");
    var floor = document.createElement("a-plane");
    floor.setAttribute("static-body", "");
    floor.setAttribute("rotation", "-90 0 0");
    floor.setAttribute("width", "30");
    floor.setAttribute("height", "30");
    floor.setAttribute("src", "#wood_floor");
    floor.setAttribute("repeat", "10 10");
    var light = document.createElement("a-light");
    light.setAttribute("type", "ambient");
    light.setAttribute("color", "#445451");
    var light2 = document.createElement("a-light");
    light2.setAttribute("type", "point");
    light2.setAttribute("intensity", "0.5");
    light2.setAttribute("position", "2 2 4");
    scene.appendChild(sky);
    scene.appendChild(floor);
    scene.appendChild(light);
    scene.appendChild(light2);
}

/**
 *针对目标:已经构建好的场景
 *作用:将场景还原初始状态，即initiateScene后的状态
 *参数:无
 *限制:无，即使场景空无一物也可以使用，不会出现越界问题
 *返回值:无
 */
function purifyScene() {
    //移除模型
    var objs = document.querySelectorAll('a-obj-model');
    for (i = 0; i < objs.length; i++) {
        objs[i].parentNode.removeChild(objs[i]);
    }
    //移除地板
    var floors = document.querySelectorAll('a-plane');
    for (i = 0; i < floors.length; i++) {
        floors[i].parentNode.removeChild(floors[i]);
    }
    //移除灯光
    var lights = document.querySelectorAll('a-light');
    for (i = 0; i < lights.length; i++) {
        lights[i].parentNode.removeChild(lights[i]);
    }
    //移除天空盒
    var skys = document.querySelectorAll('a-sky');
    for (i = 0; i < skys.length; i++) {
        skys[i].parentNode.removeChild(skys[i]);
    }
    //还原默认值
    row_index = -2;
}

/**
 *针对目标:当前视角的场景
 *作用:固定（或解除）视角限制，去除（或恢复）摄像机的look-controls组件，使鼠标无法（或重新能够）操作旋转视野
 *参数:视野控制tag（全局变量）
 *限制:无
 *返回值:
 */
function lockScene() {
    var camera = document.querySelector("#main_camera");
    console.log(camera);
    if (isLocked) {
        camera.setAttribute("look-controls", "enabled:true");
        isLocked = false;
        console.log("视角解除限制！");
    } else {
        camera.setAttribute("look-controls", "enabled:false");
        isLocked = true;
        console.log("视角限制启动！");
    }

}

