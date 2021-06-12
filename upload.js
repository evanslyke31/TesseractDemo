let dropArea = document.getElementById('file-upload');
var token = '';
var file;
var originalSize = 0;
var compressedSize = 0;

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

    file = files[0];

    uploading = true;

    $('#recaptchaModal').css({"display":"block"});
    $('#recaptchaModal').animate({top:'25vh',opacity:'1'});
}
function uploadFile() {
    console.log(file);
    uploading = true;

    $('#recaptchaModal').animate({top:'0vh',opacity:'0'});

    let formData = new FormData();
    formData.append('pdf', file);
    fetch('https://compressor-api.vslyke.com/api/PDFCompressor/free?token=' + token, { // Your POST endpoint
        method: 'POST',
        headers: {
        // Content-Type may need to be completely **omitted**
        // or you may need something
        "accept": "*/*"
        },
        mode: 'cors',
        body: formData // This is your file object
    }).then(response => {
        uploadComplete = true;
        failed = false;
        response.blob().then(data => file = data);
        $('#downloadModal').css({"display":"block"});
        $('#downloadModal').animate({top:'25vh',opacity:'1'});
    })
    .catch((error) => {
        uploading = false;
        failed = true;
    });
  }

function download() {
    var fileURL = window.URL.createObjectURL(file);
    let tab = window.open();
    tab.location.href = fileURL;
}

var onloadCallback = function() {
    grecaptcha.render('recaptcha', {
        'sitekey' : '6LfKaBcbAAAAAKneWwv0GYFF0xkU-pMzDGfdJM-C',
        'callback': function (val) {
            token = val;
            setTimeout(function() {
                uploadFile();
            }, 1000);
        }
      });

}

$(document).ready(function() {
    // $('.test').click(function () {
    //     $('#recaptchaModal').css({"display":"block"})
    //     $('#recaptchaModal').animate({top:'25vh',opacity:'1'});
    // })

    $('.close-recaptcha').click(function () {
        uploading = false;
        $('#recaptchaModal').animate({top:'0vh',opacity:'0'});
        setTimeout(function() {
            $('#recaptchaModal').css("display","none")
        }, 1000);
    });

    $('.close-download').click(function () {
        uploading = false;
        $('#downloadModal').animate({top:'0vh',opacity:'0'});
        setTimeout(function() {
            $('#downloadModal').css("display","none")
        }, 1000);
        uploadComplete = false;
        uploading = false;
    })
});