var isLocked = false;//全局变量：管理视角锁定
//保存json文件，data表示对象，在方法中验证data对象是否为object，若为，则转化为json
function saveJSON(data, filename) {
    if (!data) {
        alert('保存的数据为空');
        return;
    }
    if (!filename)
        filename = 'json.json';
    if (typeof data === 'object') {
        data = JSON.stringify(data, undefined, 4);
    }
    var blob = new Blob([data], {type: 'text/json'}),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a');
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
}


//建立一個可存取到該file的url
function getObjectURL(file) {
    var url = null;
    if (window.createObjectURL != undefined) { // basic
        url = window.createObjectURL(file);
    } else if (window.URL != undefined) { // mozilla(firefox)
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL != undefined) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}

let temp_pic_dir = '';
$(function () {
// 绑定change事件
    $("#scene-object-kind-pic-input").change(function () {
        var objUrl = getObjectURL(this.files[0]);
        temp_pic_dir = objUrl;
        console.log("objUrl = " + objUrl);
        if (objUrl) {
            //img标签通过id显示图片的内容
            // $("#look_img").attr("src", objUrl);
            $("#small_look_img").attr("src", objUrl);

            // scene_detail_div_app.img_src=objUrl;


        }
    });
});

var alert_app = new Vue({
    el: '#alert_app',
    data: {
        isHidden: '',
        alert_info: ''
    },
    methods: {
        close: function () {
            this.isHidden = '';
        }
    },
    watch: {
        isHidden: function () {
            //定时消失事件
            if (this.isHidden !== '') {
                $('html, body').animate({scrollTop: $('#m_menu').offset().top}, 500);

                let myVar = setInterval(function () {
                    alert_app.isHidden = '';
                    clearInterval(myVar);
                }, 1200);
            }
        }
    },
});
//初始化“状态构建”模块
var init_all = function () {
    choice_scene_app.init();
    state_app.init();
    target_state_app.init();
    object_kind_app.init();
    object_app.init();
    action_app.init();
};


Vue.component('scene-item', {
    template: '\
    <div>\
      <button type=\'button\' class=\'btn btn-default\'\
                                        style=\'width:200px;margin-bottom: 10px\' v-on:click="$emit(\'show-scene-detail\')">{{ scene.name }}</button>\
      <button type=\'button\' class=\'btn btn-danger\'\
                                        style=\'margin-bottom: 10px\' v-on:click="$emit(\'remove\')">删除</button>\
    </div>\
  ',
    props: ['scene']
});

var scene_app = new Vue({
    el: '#scene-app',
    data: {
        newSceneName: '',
        currentSceneIndex: -1,
        scenes: [
            {
                id: 0,
                name: '教室',
                object_kinds: [
                    {
                        id: 0,
                        name: '桌子',
                        pic: '',
                        scale: {
                            scale_x: 0.002,
                            scale_y: 0.002,
                            scale_z: 0.002
                        },
                        mFileUrl: 'model/table_01/Table art 159320.obj'
                    },
                    {
                        id: 1,
                        name: '椅子',
                        pic: '',
                        scale: {
                            scale_x: 0.01,
                            scale_y: 0.01,
                            scale_z: 0.01
                        },
                        mFileUrl: 'model/armchair/Armchair cls N060120.obj'
                    },
                    {
                        id: 2,
                        name: '床',
                        pic: '',
                        scale: {
                            scale_x: 0.05,
                            scale_y: 0.05,
                            scale_z: 0.05
                        },
                        mFileUrl: 'model/bed/bed.obj'
                    }
                ],
                all_states: []
            },
            {
                id: 1,
                name: '车站',
                object_kinds: [
                    {
                        id: 0,
                        name: '厕所',
                        pic: '',
                        scale: {
                            scale_x: 0,
                            scale_y: 0,
                            scale_z: 0
                        },
                        mFileUrl: ''
                    }
                ]
                ,
                all_states: []
            },
            {
                id: 2,
                name: '医院',
                object_kinds: [
                    {
                        id: 0,
                        name: '病床',
                        pic: '',
                        scale: {
                            scale_x: 0,
                            scale_y: 0,
                            scale_z: 0
                        },
                        mFileUrl: ''
                    },
                    {
                        id: 1,
                        name: '病房',
                        pic: '',
                        scale: {
                            scale_x: 0,
                            scale_y: 0,
                            scale_z: 0
                        },
                        mFileUrl: ''
                    },
                ],
                all_states: []
            }
        ],
        nextSceneId: 3
    },
    watch: {
        // 如果 `scenes` 发生改变，这个函数就会运行
        scenes: function () {
            init_all();
            create_state_chart();
            getAllMaps(this.scenes);
        }
    },
    methods: {
        init: function () {
            this.newSceneName = '';
            this.currentSceneIndex = -1;
        },
        addNewScene: function () {
            this.scenes.push({
                id: this.nextSceneId++,
                name: this.newSceneName,
                object_kinds: [],
                all_states: []
            });
            this.init();
            $("#look_img").attr("src", "");
            $("#scenes_div").children().each(function (index, domEle) {
                $(domEle).children().first().removeClass("btn-info");
            });

            scene_detail_div_app.init();
            scene_object_kind_app.init();
        },
        removeScene: function (index) {
            this.scenes.splice(index, 1);
            this.init();
            scene_object_kind_app.init();
            $("#look_img").attr("src", "");
            $("#scenes_div").children().each(function (index, domEle) {
                $(domEle).children().first().removeClass("btn-info");
            });
            scene_detail_div_app.init();
            scene_object_kind_app.init();
        },
        test: function (scene, index) {
            this.currentSceneIndex = index;
            scene_object_kind_app.scene_object_kinds = scene.object_kinds;
            $("#look_img").attr("src", "");
            $("#scenes_div").children().each(function (index, domEle) {
                $(domEle).children().first().removeClass("btn-info");
            });
            $("#scenes_div").children().eq(index).children().first().addClass("btn-info");


            $("#scene_object_kinds_div").children().each(function (index, domEle) {
                $(domEle).children().first().removeClass("btn-info");
            });

            scene_detail_div_app.init();

        }
    }
});

getAllMaps(scene_app.scenes);


Vue.component('scene_object_kind_item', {
    template: '\
    <div>\
      <button type=\'button\' class=\'btn btn-default\'\
                                        style=\'width:200px;margin-bottom: 10px\' v-on:click="$emit(\'show-scene-object-kind-detail\')">{{ scene_object_kind.name }}</button>\
      <button type=\'button\' class=\'btn btn-danger\'\
                                        style=\'margin-bottom: 10px\' v-on:click="$emit(\'remove\')">删除</button>\
    </div>\
  ',
    props: ['scene_object_kind']
});

var scene_object_kind_app = new Vue({
    el: '#scene-object-kind-app',
    data: {
        newObjectKindName: '',
        scene_object_kinds: [],
        nextSceneObjectKindId: 500,
    },
    watch: {
        scene_object_kinds: function () {
            init_all();
            if (scene_app.currentSceneIndex !== -1) {
                scene_app.scenes[scene_app.currentSceneIndex].all_states = [];
            }
            create_state_chart();

            getAllMaps(scene_app.scenes);
        }
    },
    methods: {
        init: function () {
            this.scene_object_kinds = [];
        },
        addNewObjectKind: function () {
            if (scene_app.currentSceneIndex !== -1) {
                this.scene_object_kinds.push({
                    id: this.nextSceneObjectKindId++,
                    name: this.newObjectKindName,
                    pic: temp_pic_dir,
                    scale: {
                        scale_x: 0,
                        scale_y: 0,
                        scale_z: 0
                    },
                    mFileUrl: ''
                });
                scene_app.scenes[scene_app.currentSceneIndex].object_kinds = this.scene_object_kinds;
                this.newObjectKindName = '';
                $("#scene_object_kinds_div").children().each(function (index, domEle) {
                    $(domEle).children().first().removeClass("btn-info");
                });

                $("#small_look_img").attr("src", '');
                $("#scene-object-kind-pic-input").val('');


                scene_detail_div_app.init();
            } else {
                alert_app.isHidden = 'truthy';
                alert_app.alert_info = '添加类别前，请先选择一个场景!';
            }


        },
        removeSceneObjectKind: function (index) {
            this.scene_object_kinds.splice(index, 1);
            $("#look_img").attr("src", "");
            $("#scene_object_kinds_div").children().each(function (index, domEle) {
                $(domEle).children().first().removeClass("btn-info");
            });

            scene_detail_div_app.init();
        },
        test: function (scene_object_kind, index) {
            // $("#look_img").attr("src", scene_object_kind.pic);

            scene_detail_div_app.img_src = scene_object_kind.pic;
            scene_detail_div_app.scale = scene_object_kind.scale;


            $("#scene_object_kinds_div").children().each(function (index, domEle) {
                $(domEle).children().first().removeClass("btn-info");
            });
            $("#scene_object_kinds_div").children().eq(index).children().first().addClass("btn-info");


        }
    }
});

var scene_detail_div_app = new Vue({
    el: '#detail_div',
    data: {
        img_src: '',
        scale: {
            scale_x: 0,
            scale_y: 0,
            scale_z: 0
        }
    },
    methods: {
        init: function () {
            this.img_src = '';
            this.scale = {
                scale_x: 0,
                scale_y: 0,
                scale_z: 0
            };
        }
    },
    watch: {
        scale: function () {
            getAllMaps(scene_app.scenes);
        }
    }
});


//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------

Vue.component('choice_scene_item', {
    template: '\
    <li style=\'width: 230px;overflow: hidden;text-align: center;border-bottom: gainsboro 2px dashed\'>\
      <a href="#" type=\'button\'\
       v-on:click="$emit(\'choose-scene\')">{{ scene.name }}</a>\
    </li>\
  ',
    props: ['scene']
});
var choice_scene_app = new Vue({
    el: '#choice_scenes',
    data: {
        scenes: scene_app.scenes,
        object_kinds_num: 0,
        chosenSceneIndex: -1
    },
    methods: {
        init: function () {
            this.chosenSceneIndex = -1;
            this.scenes = scene_app.scenes;
        },
        test: function (scene, index) {
            //场景选择以后进行场景初始化
            if (this.chosenSceneIndex === -1) {
                initiateScene();
                createAsset();
            }
            if (this.chosenSceneIndex !== -1)
                purifyScene();

            //根据用户选择的选项来选择场景
            selectFundamentalScene(index);

            this.chosenSceneIndex = index;
            this.object_kinds_num = scene.object_kinds.length;

            state_app.states = scene_app.scenes[this.chosenSceneIndex].all_states;
            state_app.currentStateIndex = -1;

            target_state_app.currentTargetStateIndex = -1;
            target_state_app.target_states = scene_app.scenes[this.chosenSceneIndex].all_states;


            object_kind_app.init();
            object_app.init();
            action_app.init();
            space_app.init();
        }
    }
});


Vue.component('state-item', {
    template: '\
    \ <div class=\'input-group\' style=\'margin-bottom:20px\'>\
                                        \  <label   class=\'input-group-addon\'> {{ state.sceneName }}</label>\
     <div style=\'width: 240px\'><button type=\'button\' class=\'btn btn-default  form-control\'\
                                        style=\'width:160px;overflow: hidden;\' v-on:click="$emit(\'show-state-detail\')">{{ state.name }}</button>\
      <button type=\'button\' class=\'btn btn-danger\'\
                                        style=\'margin-left: 10px\' v-on:click="$emit(\'remove\')">删除</button></div>\
                                        \</div>\
  ',
    props: ['state']
});


var state_app = new Vue({
    el: '#state_app',
    data: {
        newStateName: '',
        currentStateIndex: -1,
        states: [],
        nextStateId: 0
    },
    watch: {
        states: function () {
            create_state_chart();
        }
    },
    methods: {
        init: function () {
            this.currentStateIndex = -1;
            this.states = [];
        },
        addNewState: function () {
            if (choice_scene_app.chosenSceneIndex != -1) {
                let temp = [];
                for (let i = 0; i < choice_scene_app.object_kinds_num; i++) {
                    temp.push([]);
                }
                this.states.push({
                    id: this.nextStateId++,
                    name: this.newStateName,
                    sceneIndex: choice_scene_app.chosenSceneIndex,
                    sceneName: choice_scene_app.scenes[choice_scene_app.chosenSceneIndex].name,
                    all_objects: temp
                });

                this.currentStateIndex = -1;
                object_app.init();
                object_kind_app.currentObjectKindIndex = -1;
                this.newStateName = '';

                $("#states_div").children().each(function (index, domEle) {
                    $(domEle).children().children().eq(0).removeClass("btn-info");
                });
                action_app.init();
                space_app.init();
                target_state_app.init();
                scene_app.scenes[choice_scene_app.chosenSceneIndex].all_states = this.states;
            } else {
                alert_app.isHidden = 'truthy';
                alert_app.alert_info = '请选择场景!';
            }
        },
        removeState: function (index) {
            this.states.splice(index, 1);
            this.currentStateIndex = -1;
            object_app.init();
            object_kind_app.init();
            action_app.init();
            space_app.init();
            target_state_app.init();
            scene_app.scenes[choice_scene_app.chosenSceneIndex].all_states = this.states;
            $("#states_div").children().each(function (index, domEle) {
                $(domEle).children().children().eq(0).removeClass("btn-info");
            });
        },
        test: function (state, index) {
            this.currentStateIndex = index;
            object_app.objects = [];
            let temp_all_objects = [];
            for (let i = 0; i < this.states[this.currentStateIndex].all_objects.length; i++) {
                for (let j = 0; j < this.states[this.currentStateIndex].all_objects[i].length; j++) {
                    temp_all_objects.push(this.states[this.currentStateIndex].all_objects[i][j]);
                }
            }
            object_app.objects = temp_all_objects;
            object_kind_app.object_kinds = choice_scene_app.scenes[state.sceneIndex].object_kinds;
            object_kind_app.currentObjectKindIndex = -1;
            $("#states_div").children().each(function (index, domEle) {
                $(domEle).children().children().eq(0).removeClass("btn-info");
            });
            $("#states_div").children().eq(index).children().children().eq(0).addClass("btn-info");
            $("#objects_div").children().each(function (index, domEle) {
                $(domEle).children().children().eq(0).removeClass("btn-info");
            });
            action_app.init();
            space_app.init();
            object_app.currentObjectIndex = -1;
            target_state_app.init();
        }
    }
});


Vue.component('object_kind_item', {
    template: '\
    <li  style=\'width: 230px;overflow: hidden;text-align: center;border-bottom: gainsboro 2px dashed\'>\
      <a href="#" type=\'button\' \
       v-on:click="$emit(\'choose-object-kind\')">{{ object_kind.name }}</a>\
    </li>\
  ',
    props: ['object_kind']
});

var object_kind_app = new Vue({
    el: '#object_kind_app',
    data: {
        currentObjectKindIndex: -1,
        object_kinds: [],
    },
    methods: {
        init: function () {
            this.currentObjectKindIndex = -1;
            this.object_kinds = [];
        },
        test: function (object_kind, index) {
            this.currentObjectKindIndex = index;
        }
    }
});

Vue.component('object-item', {
    template: '\
    \ <div class=\'input-group\' style=\'margin-bottom:20px\'>\
                                        \  <label   class=\'input-group-addon\'> {{ object.object_kind_name }}</label>\
    <div style=\'width: 240px\'><button type=\'button\' class=\'btn btn-default form-control\'\
                                        style=\'width:160px;overflow: hidden;\' v-on:click="$emit(\'show-object-detail\')">{{ object.name }}</button>\
      <button type=\'button\' class=\'btn btn-danger\'\
                                        style=\'margin-left: 10px;\' v-on:click="$emit(\'remove\')">删除</button></div>\
    </div>\
  ',
    props: ['object']
});


var get_true_object_index = function (index) {
    let location_index = 0;
    for (let i = 0; i < object_app.objects[index].object_kind_index; i++) {
        location_index += state_app.states[state_app.currentStateIndex].all_objects[i].length;
    }

    return index - location_index;
};


var object_app = new Vue({
    el: '#object_app',
    data: {
        newObjectName: '',
        currentObjectIndex: -1,
        objects: [],
        nextObjectId: 0
    },
    watch: {
        // 如果 `objects` 发生改变，这个函数就会运行
        objects: function (newQuestion, oldQuestion) {
            create_state_chart();
        }
    },
    methods: {
        init: function () {
            this.currentObjectIndex = -1;
            this.objects = [];
        },
        addNewObject: function () {
            if (state_app.currentStateIndex == -1) {
                alert_app.isHidden = 'truthy';
                alert_app.alert_info = '请选择状态!';
            } else if (object_kind_app.currentObjectKindIndex == -1) {
                alert_app.isHidden = 'truthy';
                alert_app.alert_info = '请选择物体类别!';
            } else {

                let location_index = 0;
                for (let i = 0; i <= object_kind_app.currentObjectKindIndex; i++) {
                    location_index += state_app.states[state_app.currentStateIndex].all_objects[i].length;
                }


                this.objects.splice(location_index, 0, {
                    id: this.nextObjectId++,
                    name: this.newObjectName,
                    actions: [],
                    space: {
                        loc: {
                            loc_x: 0,
                            loc_y: 0,
                            loc_z: 0
                        },
                        rotate: {
                            rotate_h: 0,
                            rotate_v: 0
                        },
                        scale: object_kind_app.object_kinds[object_kind_app.currentObjectKindIndex].scale,
                    },
                    object_kind_index: object_kind_app.currentObjectKindIndex,
                    object_kind_name: object_kind_app.object_kinds[object_kind_app.currentObjectKindIndex].name
                });


                for (let j = 0; j < state_app.states[state_app.currentStateIndex].all_objects.length; j++) {
                    let temp_array = [];
                    for (let i = 0; i < this.objects.length; i++) {
                        let x = this.objects[i];
                        if (x.object_kind_index === j) {
                            temp_array.push(x);
                        }
                    }
                    state_app.states[state_app.currentStateIndex].all_objects[j] = temp_array;
                }
                this.currentObjectIndex = -1;
                this.newObjectName = '';
                $("#objects_div").children().each(function (index, domEle) {
                    // domEle == this
                    $(domEle).children().children().eq(0).removeClass("btn-info");
                });
                action_app.actions = [];
                space_app.init();
                target_state_app.currentTargetStateIndex = -1;


            }
        },
        removeObject: function (object, index) {

            // let location_index = 0;
            // for (let i = 0; i < this.objects[index].object_kind_index; i++) {
            //     location_index += state_app.states[state_app.currentStateIndex].all_objects[i].length;
            // }
            let true_object_index = get_true_object_index(index);

            // state_app.states[state_app.currentStateIndex].all_objects[object.object_kind_index].splice(index - location_index, 1);
            state_app.states[state_app.currentStateIndex].all_objects[object.object_kind_index].splice(true_object_index, 1);
            action_app.actions = [];
            space_app.init();
            target_state_app.currentTargetStateIndex = -1;
            $("#objects_div").children().each(function (index, domEle) {
                $(domEle).children().children().eq(0).removeClass("btn-info");
            });


            this.objects.splice(index, 1);
            this.currentObjectIndex = -1;
        },
        test: function (object, index) {
            this.currentObjectIndex = index;
            target_state_app.currentTargetStateIndex = -1;
            action_app.actions = object.actions;
            space_app.space = object.space;
            $("#objects_div").children().each(function (index, domEle) {
                $(domEle).children().children().eq(0).removeClass("btn-info");
            });
            $("#objects_div").children().eq(index).children().children().eq(0).addClass("btn-info");
        }
    }
});


Vue.component('target_state_item', {
    template: '\
    <li style=\'width: 230px;overflow: hidden;text-align: center;border-bottom: gainsboro 2px dashed\'>\
      <a href="#" type=\'button\' \
       v-on:click="$emit(\'choose-target-state\')">{{ target_state.name }}</a>\
    </li>\
  ',
    props: ['target_state']
});

var target_state_app = new Vue({
    el: '#target_state_app',
    data: {
        currentTargetStateIndex: -1,
        target_states: state_app.states,
    },
    methods: {
        test: function (target_state, index) {
            this.currentTargetStateIndex = index;
        },
        init: function () {
            this.currentTargetStateIndex = -1;
            this.target_states = state_app.states;
        }
    }
});


Vue.component('action_item', {
    template: '\
    <div style="border:gainsboro 1px solid;margin-bottom: 20px;padding: 5px">\
    <div class="input-group">\
    <label  class=\'input-group-addon\'> 目标状态:</label>\
                                            <input style=\'width:180px;overflow: hidden;\' \
                                                   class="form-control"\
                                                    type="button"\
                                                  v-bind:value="action.target_state_name">\
                                        </div>\
                                        \<div class="input-group" style="margin-top:20px">\
                                            <label  class="input-group-addon"\
                                                   >动作内容:</label>\
                                            <input style=\'width:180px;overflow: hidden;\' \
                                                   type="button"\
                                             v-bind:value="action.name"       \
                                                   class="form-control" >\
                                        </div>\
<button type=\'button\' class=\'btn btn-danger\'\
style=\'margin-top: 20px;\' v-on:click="$emit(\'remove\')">删除</button>\
</div>\
  ',
    props: ['action']
});

var action_app = new Vue({
    el: '#action_app',
    data: {
        newActionName: '',
        actions: [],
        nextActionId: 0,
    },
    watch: {
        actions: function () {
            create_state_chart();
            //滚动到页面底部
            // $('html, body').animate({scrollTop: $('#myDiagramDiv').offset().top}, 1000);
        }
    },
    methods: {
        addNewAction: function () {

            if (object_app.currentObjectIndex == -1) {
                alert_app.isHidden = 'truthy';
                alert_app.alert_info = '请选择物体!';
            } else if (target_state_app.currentTargetStateIndex == -1) {

                alert_app.isHidden = 'truthy';
                alert_app.alert_info = '请选择目标状态!';
            } else {

                // if (state_app.currentStateIndex !== -1 && object_kind_app.currentObjectKindIndex !== -1 && object_app.currentObjectIndex !== -1) {

                this.actions.push({
                    id: this.nextActionId++,
                    name: this.newActionName,
                    target_state_name: target_state_app.target_states[target_state_app.currentTargetStateIndex].name,
                    target_state_index: target_state_app.currentTargetStateIndex,
                    source_state_name: state_app.states[state_app.currentStateIndex].name,
                    source_state_index: state_app.currentStateIndex
                });


                state_app.states[state_app.currentStateIndex].all_objects[object_app.objects[object_app.currentObjectIndex].object_kind_index][get_true_object_index(object_app.currentObjectIndex)].actions = this.actions;
                this.newActionName = '';


            }
        },
        removeAction: function (index) {
            this.actions.splice(index, 1);
        },
        init: function () {
            this.actions = [];
            this.newActionName = '';
        }
    }
});


var space_app = new Vue({
    el: '#space_app',
    data: {
        space: {
            loc: {
                loc_x: 0,
                loc_y: 0,
                loc_z: 0
            },
            rotate: {
                rotate_h: 0,
                rotate_v: 0
            },
            scale: {
                scale_x: 0,
                scale_y: 0,
                scale_z: 0
            },
        },
    },
    watch: {
        space: function () {

        }
    },
    methods: {
        // saveSpace: function () {
        //
        //     if (object_app.currentObjectIndex === -1) {
        //         alert_app.isHidden = 'truthy';
        //         alert_app.alert_info = '请选择物体!';
        //     } else {
        //         state_app.states[state_app.currentStateIndex].all_objects[object_app.objects[object_app.currentObjectIndex].object_kind_index][get_true_object_index(object_app.currentObjectIndex)].space = this.space;
        //         alert_app.isHidden = 'truthy';
        //         alert_app.alert_info = '空间信息保存成功!';
        //     }
        // },
        init: function () {
            this.space = {
                loc: {
                    loc_x: 0,
                    loc_y: 0,
                    loc_z: 0
                },
                rotate: {
                    rotate_h: 0,
                    rotate_v: 0
                },
                scale: {
                    scale_x: 0,
                    scale_y: 0,
                    scale_z: 0
                },
            };
        }
    }
});


//----------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------------------
var m_fullScreen = new Vue({
    data: {

        // style="float: right;border: solid 1px black;width: 49.5%;height: 510px;"
        styleObject: {
            border: 'solid 1px black',
            height: '510px'
        }
    },
    methods: {}
});


//----------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------------------
points = [];
let space_array = [];
//获取物体节点
get_point = function (state, state_index) {
    for (j = 0; j < state.all_objects.length; j++) {
        if (state.all_objects[j].length === 0)
            continue;
        for (k = 0; k < state.all_objects[j].length; k++) {
            var point = {
                'id': 0,
                'text': '',
                cord: [state_index, 0, 0],
                space: {},
                m_type: ''
            };
            point.id = points.length;

            point.text = choice_scene_app.scenes[state.sceneIndex].object_kinds[j].name + ':' + state.all_objects[j][k].name;
            point.cord[0] = state_index;
            point.cord[1] = j;
            point.cord[1] = k;
            point.space = state.all_objects[j][k].space;
            point.m_type = 'object';

            points.push(point);
            space_array.push(point);
        }

    }
};
//获取物体关系
rels = [];
get_obj_rel = function (states) {

    var xx = state_app.states.length;

    for (var i = 0; i < states.length; i++) {
        state = states[i];
        for (j = 0; j < state.all_objects.length; j++) {
            if (state.all_objects[j].length === 0)
                continue;
            for (k = 0; k < state.all_objects[j].length; k++) {
                var rel = {
                    'from': 0,
                    'to': 0,
                    'text': ''
                };
                rel.from = i;
                rel.to = xx;
                rel.text = "涉及";
                rels.push(rel);
                xx += 1;
            }
        }
    }


};

//获取所有节点
get_all_points = function (all_states) {
    for (i = 0; i < all_states.length; i++) {
        var point = {
            'id': 0,
            'text': '',
            m_type: ''
        };
        temp_state = all_states[i];
        point.id = i;
        point.text = temp_state.sceneName + ':' + temp_state.name;
        point.m_type = 'state';
        points.push(point);
    }
    for (i = 0; i < all_states.length; i++) {
        get_point(all_states[i], i);
        get_action_rel(all_states[i], i);
    }
    return points;
};

get_loaction = function (x_i, x_j, x_k) {
    let all_states = state_app.states;
    let temp_current_state = all_states[x_i];
    let m_count_a = 0;
    let m_count_b = 0;
    let m_count_c = 0;
    for (let i = 0; i < x_i; i++) {
        let temp_state = all_states[i];
        for (let j = 0; j < temp_state.all_objects.length; j++) {
            if (temp_state.all_objects[j].length === 0)
                continue;
            for (let k = 0; k < temp_state.all_objects[j].length; k++) {
                m_count_a += 1;
            }
        }
    }
    for (let j = 0; j < x_j; j++) {
        if (temp_current_state.all_objects[j].length === 0)
            continue;
        for (let k = 0; k < temp_current_state.all_objects[j].length; k++) {
            m_count_b += 1;
        }
    }
    m_count_c = m_count_a + m_count_b + all_states.length;
    return m_count_c;
};


//获取action关系
get_action_rel = function (state, i) {
    let temp_current_object_id = 0;
    for (j = 0; j < state.all_objects.length; j++) {
        if (state.all_objects[j].length === 0)
            continue;
        for (k = 0; k < state.all_objects[j].length; k++) {
            if (state.all_objects[j][k].actions.length === 0)
                continue;
            temp_current_object_id = get_loaction(i, j, k);
            for (m = 0; m < state.all_objects[j][k].actions.length; m++) {
                var action = state.all_objects[j][k].actions[m];
                var rel = {
                    object_id: 0,
                    'from': 0,
                    'to': 0,
                    'text': ''
                };
                rel.object_id = temp_current_object_id;
                rel.from = action.source_state_index;
                rel.to = action.target_state_index;
                rel.text = state.all_objects[j][k].name + ":" + action.name;
                rels.push(rel);
            }
        }
    }
};

create_state_chart = function () {
    points = [];
    rels = [];
    space_array = [];
    get_obj_rel(state_app.states);
    res_points = get_all_points(state_app.states);

    console.log(JSON.stringify(space_array));
    result_json = {
        "class": "go.GraphLinksModel",
        "nodeKeyProperty": "id",
        "nodeDataArray": res_points,
        "linkDataArray": rels
    };
    load(result_json);
};