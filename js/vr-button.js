/**
 * Create a button that when clicked will enter into stereo-rendering mode for VR.
 *
 * Structure: <div><button></div>
 *
 * @param {function} onClick - click event handler
 * @returns {Element} Wrapper <div>.
 */
function createEnterVRButton (onClick) {
    var vrButton;
    var wrapper;

    // Create elements.
    wrapper = document.createElement('div');
    vrButton = document.createElement('button');

    vrButton.setAttribute('geometry', {
        primitive: 'box',
        height: 3,
        width: 1
    });



    // Insert elements.
    wrapper.appendChild(vrButton);
    vrButton.addEventListener('click', function (evt) {
        onClick();
        evt.stopPropagation();
    });
    return wrapper;
}