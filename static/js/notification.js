var popupContainer = document.getElementById('popupContainer');
var popupQueue = [];

function showPopup(message, duration) {
  var popup = document.createElement('div');
  popup.className = 'popup';
  popup.textContent = message;

  if (popupQueue.length > 0) {
    var prevPopup = popupQueue[popupQueue.length - 1];
    prevPopup.style.transform = 'translate(-50%, -150%)';
  }

  popupQueue.push(popup);

  if (popupQueue.length > 5) {
    var removedPopup = popupQueue.shift();
    removedPopup.remove();
  }

  popupContainer.appendChild(popup);

  setTimeout(function() {
    popup.style.opacity = '0';
    popup.style.transform = 'translate(-50%, -150%)';
    setTimeout(function() {
      popup.remove();
      var index = popupQueue.indexOf(popup);
      if (index !== -1) {
        popupQueue.splice(index, 1);
      }
      if (popupQueue.length > 0) {
        var prevPopup = popupQueue[popupQueue.length - 1];
        prevPopup.style.transform = 'translate(-50%, -50%)';
      }
    }, 500);
  }, duration);
}
