function initCanvas(imageData) {
  const canvas = document.getElementById("imageCanvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    restoreRectangle();
  };

  img.src = `data:image/png;base64,${imageData}`;

  let isDown = false;
  let startX = 0;
  let startY = 0;

  function setCoordinatesAndRedraw(x1, y1, x2, y2) {
    document.getElementById("startX").value = x1;
    document.getElementById("startY").value = y1;
    document.getElementById("endX").value = x2;
    document.getElementById("endY").value = y2;
    drawRectangle(x1, y1, x2, y2);
  }

  canvas.onmousedown = function (e) {
    startX = e.offsetX;
    startY = e.offsetY;
    isDown = true;
  };

  canvas.onmousemove = function (e) {
    if (isDown) {
      setCoordinatesAndRedraw(startX, startY, e.offsetX, e.offsetY);
    }
  };

  canvas.onmouseup = function (e) {
    if (isDown) {
      setCoordinatesAndRedraw(startX, startY, e.offsetX, e.offsetY);
      saveRectangle(startX, startY, e.offsetX, e.offsetY);
      isDown = false;
    }
  };

  document.querySelectorAll("input[type='number']").forEach((input) => {
    input.onchange = function () {
      const x1 = parseInt(document.getElementById("startX").value) || 0;
      const y1 = parseInt(document.getElementById("startY").value) || 0;
      const x2 = parseInt(document.getElementById("endX").value) || 0;
      const y2 = parseInt(document.getElementById("endY").value) || 0;
      drawRectangle(x1, y1, x2, y2);
      saveRectangle(x1, y1, x2, y2);
    };
  });

  function drawRectangle(x1, y1, x2, y2) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.strokeStyle = "red";
    ctx.stroke();
  }

  function saveRectangle(x1, y1, x2, y2) {
    localStorage.setItem("startX", x1);
    localStorage.setItem("startY", y1);
    localStorage.setItem("endX", x2);
    localStorage.setItem("endY", y2);
  }

  function restoreRectangle() {
    const x1 = parseInt(localStorage.getItem("startX")) || 0;
    const y1 = parseInt(localStorage.getItem("startY")) || 0;
    const x2 = parseInt(localStorage.getItem("endX")) || 0;
    const y2 = parseInt(localStorage.getItem("endY")) || 0;
    if (x1 !== 0 || y1 !== 0 || x2 !== 0 || y2 !== 0) {
      setCoordinatesAndRedraw(x1, y1, x2, y2);
    }
  }

  document.querySelector("form").onsubmit = function (e) {
    const filename = document.getElementById("filename").value.trim();
    if (!filename) {
      showErrorToast("Please enter a file name.");
      e.preventDefault();
      return;
    }

    let startX = parseInt(document.getElementById("startX").value) || 0;
    let startY = parseInt(document.getElementById("startY").value) || 0;
    let endX = parseInt(document.getElementById("endX").value) || 0;
    let endY = parseInt(document.getElementById("endY").value) || 0;

    // Normalize coordinates
    if (startX > endX) {
      [startX, endX] = [endX, startX];
    }
    if (startY > endY) {
      [startY, endY] = [endY, startY];
    }

    document.getElementById("startX").value = startX;
    document.getElementById("startY").value = startY;
    document.getElementById("endX").value = endX;
    document.getElementById("endY").value = endY;

    if (startX == endX || startY == endY) {
      showErrorToast("Invalid rectangle coordinates.");
      e.preventDefault();
    }
  };
}

window.onload = function () {
  document.getElementById("updateImage").onclick = function () {
    const selectedImage = document.getElementById("imageList").value;
    localStorage.setItem("selectedImage", selectedImage);
    fetch("/update_image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: selectedImage }),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        fetchImage(selectedImage);
      } else {
        showErrorToast("Failed to update image.");
      }
    });
  };

  fetchImageList();

  const selectedImage = localStorage.getItem("selectedImage") || "input.png";
  fetchImage(selectedImage);
}

function fetchImageList() {
  fetch("/image_list")
    .then((response) => response.json())
    .then((data) => {
      const imageList = document.getElementById("imageList");
      const selectedImage = localStorage.getItem("selectedImage");
      data.images.forEach((image) => {
        const option = document.createElement("option");
        option.value = image;
        option.textContent = image;
        if (image === selectedImage) {
          option.selected = true;
        }
        imageList.appendChild(option);
      });
    });
}

function fetchImage(imageName) {
  fetch(`/get_image?image=${imageName}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.image) {
        initCanvas(data.image);
      } else {
        showErrorToast("Failed to load image.");
      }
    });
}

function showErrorToast(message) {
  const toast = document.getElementById("errorToast");
  toast.textContent = message;
  toast.className = "error-toast show";
  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}
