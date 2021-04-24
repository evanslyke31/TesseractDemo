let dropArea = document.getElementById('file-upload')

dropArea.addEventListener('dragenter', handlerFunction, false)
dropArea.addEventListener('dragleave', handlerFunction, false)
dropArea.addEventListener('dragover', handlerFunction, false)
dropArea.addEventListener('drop', drop, false)


function handlerFunction(evt) {
    evt.preventDefault();
    //console.log(evt);
}

function drop(evt) {
    evt.preventDefault();
    let dt = evt.dataTransfer
    let files = dt.files

    uploadFile(files[0])
}
function uploadFile(file) {
    console.log(file);
    uploading = true;

    let formData = new FormData();
    formData.append('pdf', file);
    fetch('http://192.168.1.6/api/PDFCompressor', { // Your POST endpoint
        method: 'POST',
        headers: {
        // Content-Type may need to be completely **omitted**
        // or you may need something
        "accept": "*/*"
        },
        mode: 'cors',
        body: formData // This is your file object
    }).then(response => {uploadComplete = true; return response.blob()})
    .then(data => window.open(URL.createObjectURL(data)))
    //$('.modal').modal('show');
  }