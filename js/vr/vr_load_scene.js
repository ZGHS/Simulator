var row_index = -2;//全局变量：用于在未指定物体位置时进行物体的position的z轴值的设定
var cur_state_index = -1;//全局变量：当前加载的状态
var states_num = 0;//全局变量：表示当前场景的现存状态数目，确定代表状态的id范围(0 -- 状态数目-1)


/**
 *针对目标:模型
 *作用:加载指定模型到场景中,并添加"鼠标移入透明"组件;并添加
 *参数:物品自定义名称,物体模型src,物体模型缩放比例,链接的目标状态，物体在points中的id，物体安放位置,动作目标状态(为-1则忽略)
 *全局变量使用: space_array（所有obj的空间信息数组）
 *返回值:无
 */
function loadModel(obj_name, src, obj_scale, target_state, id, space_on = false) {
    let position, rotation, scale;
    position = {x: "0", y: "0", z: row_index.toString()};
    rotation = {x: "0", y: "0", z: "0"};
    scale = {x: "1", y: "1", z: "1"};
    //如果用户设定了物体位置
    if (space_on === true) {
        //获取当前物体对应的空间信息
        var space_info = space_array[id - states_num];
        position.x = space_info["space"]["loc"]["loc_x"];
        position.y = space_info["space"]["loc"]["loc_y"];
        position.z = space_info["space"]["loc"]["loc_z"];
        rotation.x = space_info["space"]["rotate"]["rotate_h"];
        rotation.y = space_info["space"]["rotate"]["rotate_v"];
        scale.x = space_info["space"]["scale"]["scale_x"];
        scale.y = space_info["space"]["scale"]["scale_y"];
        scale.z = space_info["space"]["scale"]["scale_z"];
    }

    var sceneEl = document.querySelector('a-scene');
    var obj_model = document.createElement('a-obj-model');

    //设置物体的id，class和模型src
    obj_model.setAttribute('class', obj_name);
    obj_model.setAttribute('id', obj_name + "_" + id.toString());
    obj_model.setAttribute('src', src);
    //obj_model.setAttribute('mtl', '');//材质复原文件，似乎可以在src指定的obj文件中指定

    //设置物体的空间属性
    obj_model.setAttribute('scale', scale);
    obj_model.setAttribute('rotation', rotation);
    obj_model.setAttribute('position', position);

    //添加刚体性质
    obj_model.setAttribute("dynamic-body", "");

    //添加拖动、拖拽性质
    obj_model.setAttribute('hoverable', '');
    obj_model.setAttribute('grabbable', '');
    obj_model.setAttribute('stretchable', '');
    obj_model.setAttribute('draggable', '');
    obj_model.setAttribute('droppable', '');

    //鼠标移入时物体变0.7倍透明
    obj_model.setAttribute('event-set__hoveron', '_event: hover-start; material.opacity: 0.7; transparent: true');
    obj_model.setAttribute('event-set__hoveroff', '_event: hover-end; material.opacity: 1; transparent: false');

    //为有动作的物体添加状态链接
    if (target_state !== -1) {
        obj_model.addEventListener('click', function () {
            reloadScene(target_state);
        });
    }

    //将创建好的物体加入场景
    sceneEl.appendChild(obj_model);
}


/**
 *针对目标:当前选中状态
 *作用:从points和rels数组中找出当前状态下的所有物体id
 *参数:指定的状态id
 *全局变量使用: points全局数组,rels全局数组
 *返回值:指定状态下的物体id集合
 */
function analysePoints(state_id) {

    //当前指定ID的场景下的所有物体id
    let state_objs = [];
    states_num = 0;//先把状态清零
    for (i = 0; i < points.length; i++) {
        var point = points[i];
        var type = point["m_type"];
        if (type === "state")
            states_num++;
    }
    //确定当前场景所需要的物体的id
    for (i = 0; i < rels.length; i++) {
        var from = rels[i]["from"];
        //只判断from为所求场景状态的情形
        if (from === state_id) {
            var to = rels[i]["to"];
            //只判断to为场景中物体的情形,找出该状态存在的物体
            if (to >= states_num) {
                state_objs.push(to);
            }
        }
    }
    return state_objs;
}


/**
 *针对目标:场景
 *作用:与analysePoints函数联动，加载指定状态的场景物体
 *参数:当前状态下的物体id集合
 *全局变量使用: points全局数组,rels全局数组,maps全局数组
 *返回值:无
 */
function loadState(state_objs) {
    for (i = 0; i < state_objs.length; i++) {
        //根据id确定物体的类型名和用户设定的物品名(作为class进行设定)
        var id = state_objs[i];
        var point = points[id];
        var text = point['text'];
        var strs = text.split(':');
        var obj_type_name = strs[0];
        //obj_name作为class
        var obj_name = text.slice(obj_type_name.length + 1, text.length);
        //根据物体类型名匹配物体模型路径和物体的scale
        var src = maps[obj_type_name][0];
        var scale = maps[obj_type_name][1];
        var target_state = -1;
        for (j = 0; j < rels.length; j++) {
            if (rels[j]["object_id"] === id) {
                target_state = rels[j]["to"];
                break;
            }
        }
        //根据物品名来作为创建后物体的class
        loadModel(obj_name, src, scale, target_state, id, true);
        row_index -= 3;//将下一个物品的位置瞬移(暂时)
    }
}


/**
 *针对目标:场景
 *作用:刷新场景到指定的状态（调用analysePoints和loadState函数）
 *参数:指定跳转的状态id
 *全局变量使用: cur_state_index当前所在状态序号，row_index
 *返回值:无
 */
function reloadScene(state_index) {
    row_index = -2;//复原row_index
    //清除场景中原本的内容
    var previous_objs = document.querySelectorAll('a-obj-model');
    for (i = 0; i < previous_objs.length; i++)
        previous_objs[i].parentNode.removeChild(previous_objs[i]);
    //加载当前所选状态
    var input = analysePoints(state_index);
    loadState(input);
    //设置全局变量
    cur_state_index = state_index;
}


/**
 *针对目标:场景
 *作用:将摄像头对准状态图中选中的物体
 *参数:物体在状态图中对应的id
 *全局变量使用: points全局数组,rels全局数组
 *限制：如果点击的是未加载的状态中的物体，则先加载该状态，之后将摄像机对准物体
 *返回值:无
 */
function findTarget(obj_index) {
    //先通过obj_index找到state_id
    var state_id = -1;
    // 0:
    // from: 0
    // to: 1
    // text: "涉及"
    for (j = 0; j < rels.length; j++) {
        if (rels[j]["to"] === obj_index) {
            //找到选中的物体属于的state
            state_id = rels[j]["from"];
            break;
        }
    }

    if (cur_state_index !== state_id) {
        reloadScene(state_id);
    }
    var point = points[obj_index];
    var text = point['text'];
    var strs = text.split(':');
    var obj_type_name = strs[1];
    var obj_id = obj_type_name + "_" + obj_index;

    var target = document.querySelector("#" + obj_id);
    var position = target.getAttribute("position").clone();
    var camera = document.querySelector("#main_camera");
    position.y = 1.6;
    camera.setAttribute("position", position);
    target.setAttribute("material", "wireframe:true");
    target.setAttribute('event-set__click', 'material.wireframe: false;transparent: true');
}
