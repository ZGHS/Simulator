///实例example:BOX
function addExampleBox() {
    var sceneEl = document.querySelector('a-scene');
    var box = document.createElement('a-box');
    box.setAttribute('id', 'box');
    box.setAttribute('class', 'box');
    box.setAttribute('position', '0 2 -5');
    box.setAttribute('rotation', '0 45 45');
    box.setAttribute('scale', '2 2 2');
    box.setAttribute('src', 'asset/mYmmbrp.jpg');
    box.setAttribute('animation', 'property:position; dir:alternate; dur:2000; loop:true; to:0 2.2 -5');
    sceneEl.appendChild(box);
}

