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
    fetch('https://localhost:44385/api/PDFCompressor', { // Your POST endpoint
        method: 'POST',
        headers: {
        // Content-Type may need to be completely **omitted**
        // or you may need something
        "accept": "*/*"
        },
        mode: 'cors',
        body: formData // This is your file object
    }).then(response =>  {
        uploadComplete = true;
        response.text().then((text) => {
            var link = document.createElement('a');
            link.href = text;
            link.download = "invoice_"+"_" + new Date() + ".pdf";
            link.click();
            link.remove()
        });
    }
    ).then(
        success => console.log(success) // Handle the success response object
    ).catch(
        error => console.log(error) // Handle the error response object
    );
    //$('.modal').modal('show');
  }