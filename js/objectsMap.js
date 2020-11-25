//物品种类名：【"模型src","模型缩放"】
// {
// "桌子":["model/table_01/Table art 159320.obj",{"x":0.002,"y":0.002,"z":0.002}],
// "椅子":["model/armchair/Armchair cls N060120.obj",{"x":0.01,"y":0.01,"z":0.01}],
// "床":["model/bed/bed.obj",{"x":0.05,"y":0.05,"z":0.05}],
// "厕所":["",{"x":0,"y":0,"z":0}],
// "病床":["",{"x":0,"y":0,"z":0}],
// "病房":["",{"x":0,"y":0,"z":0}]
// }

var maps = {};

function getAllMaps(scenes) {
    maps = {};
    for (let i = 0; i < scenes.length; i++) {
        for (let k = 0; k < scenes[i].object_kinds.length; k++) {

            let temp_kind = scenes[i].object_kinds[k];
            let key = temp_kind.name;
            maps[key] = [temp_kind.mFileUrl, temp_kind.scale];
        }
    }
    //console.log(JSON.stringify(maps));
}
