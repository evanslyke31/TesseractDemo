let dropArea = document.getElementById('file-upload')

dropArea.addEventListener('dragenter', handlerFunction, false)
dropArea.addEventListener('dragleave', handlerFunction, false)
dropArea.addEventListener('dragover', handlerFunction, false)
dropArea.addEventListener('drop', drop, false)

function handleFiles(files) {
    ([...files]).forEach(uploadFile)
  }

function handlerFunction(evt) {
    evt.preventDefault();
    //console.log(evt);
}

function drop(evt) {
    evt.preventDefault();
    let dt = evt.dataTransfer
    let files = dt.files

    handleFiles(files)
}

function handleFiles(files) {
    ([...files]).forEach(uploadFile)
}

function uploadFile(file) {
    console.log(file);
    uploading = true;
  }