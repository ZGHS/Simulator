/**
 *针对目标:指定class的物体
 *作用:对指定物体添加组件,使得鼠标移入时物体不透明度发生变化,移出时不透明度变回1
 *参数:指定物体的class属性,要达到的不透明度
 *限制:只能在场景已存在该物体的情况下添加组件
 *返回值:无
 */
function addOpacityChange_enter(obj_class, change_opacity = "0.5") {
    var objs = document.querySelectorAll("." + obj_class);
    console.log("当前拿到的物品列表:" + objs);
    for (i = 0; i < objs.length; i++) {
        previous_color = objs[i].getAttribute('material');
        objs[i].addEventListener('mouseenter', function () {
            this.setAttribute('material', 'opacity:' + change_opacity);
            console.log("不透明度变为0.5");
        });
        objs[i].addEventListener('mouseleave', function () {
            this.setAttribute('material', 'opacity: 1');
            console.log("不透明度变为1");
        })
    }
}


/**
 *针对目标:指定class的物体
 *作用:对指定物体添加组件,使得鼠标移入时物体scale变化,移出时停止变化
 *参数:指定物体的class属性,要达到的缩放比例(eg."0.1 0.1 0.1")
 *限制:只能在场景已存在该物体的情况下添加组件
 *返回值:无
 */
function addScaleChange_enter(obj_class, scaleTo) {
    var objs = document.querySelectorAll("." + obj_class);
    for (i = 0; i < objs.length; i++) {
        objs[i].setAttribute('animation', 'property:scale; dur:2000; to:' + scaleTo + ';startEvents:mouseenter;pauseEvents:mouseleave');
    }
}


/**
 *针对目标:有动作属性的具体物体
 *作用:对指定物体添加组件,使得在点击存在动作属性的物体时能够进行状态切换
 *参数:指定物体的class属性,目标状态id
 *限制:只能在场景已存在该物体的情况下添加组件
 *返回值:无
 */
function addStateChange_click(obj_class,target_state){
    var target_obj = document.getElementsByClassName(obj_class)[0];
    //var target_obj = document.querySelector("."+obj_class);
    console.log("拿到的target_obj如下");
    console.log(target_obj);
    target_obj.addEventListener('click', function () {
        reloadScene(target_state,points,rels);
    });
    console.log("为对应物体"+obj_class+"添加了click状态转换");
}