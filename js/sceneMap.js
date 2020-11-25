/**
 *针对目标:VR场景
 *作用:根据用户选择的场景进行基本场景的初始化
 *参数:选择的场景类型序号
 *限制：注意序号不能越界，即序号对应场景模版必须存在
 *返回值:无
 */
function selectFundamentalScene(scene_index) {
    switch (scene_index) {
        case 0:
            createClassroom();
    }
}