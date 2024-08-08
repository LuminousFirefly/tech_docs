document.getElementById('new-blog-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    var unique_id = generateTimestampId();

    var title = document.getElementById('title').value;
    var author = document.getElementById('author').value;
    var img = false; 
    const imageInput = document.getElementById('image-upload');
    const imageFile = imageInput.files[0];
    if(imageFile)
    {
        img = true;
        console.log("Image present!");
        try {
            await upload_to_s3_img(unique_id, imageFile);
        } catch (err) {
            console.error("Failed to upload image:", err);
            return;  // Exit if image upload fails
        }
    }

    
    
    const contentOption = document.getElementById('content-option').value;

    if (contentOption === 'textarea') {
        const content = document.getElementById('content').value;
        console.log('Title:', title);
        console.log('Author:', author);
        console.log('Content:', content);
        var blogContent = `${title}\n${author}\n${content}`;
        var blob = new Blob([blogContent], { type: 'text/plain' });
        var fileName = `blogs/${unique_id}.txt`;

        var s3 = configure_s3();
        upload_to_s3(s3,'test-blog-list',fileName,blob);

        // Add your form submission logic for typed content here
    } else if (contentOption === 'file') {
        const fileInput = document.getElementById('file-upload');
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileContent = e.target.result;
                const combinedContent = `${title}\n${author}\n${fileContent}`;
                var blob = new Blob([combinedContent], { type: 'text/plain' });
                var fileName = `blogs/${unique_id}.txt`;
               
                var s3 = configure_s3();
                upload_to_s3(s3,'test-blog-list',fileName,blob);
            };
            reader.readAsText(file);
        } else {
            console.log('No file selected');
        }
    }

});


function generateTimestampId() {
    return new Date().toISOString().replace(/[-:.]/g, "");
}


function configure_s3()
{
    var region = "us-east-1";
    var accessKeyId = "****";
    var secretAccessKey = "****";

    AWS.config.update({
    region:region,
    credentials:new AWS.Credentials(accessKeyId,secretAccessKey)
    });

    var s3 = new AWS.S3();
    return s3;
}


async function upload_to_s3_img(uniqueId, imageFile) {
    console.log("Uploading...");

    var s3 = configure_s3();

    var params = {
        Bucket: 'test-blog-list',
        Key: `images/${uniqueId}_${imageFile.name}`,
        Body: imageFile,
        ContentType: imageFile.type
    };

    console.log("Params!");

    return new Promise((resolve, reject) => {
        s3.putObject(params, function(err, data) {
            if (err) {
                console.error("Error uploading image", err);
                reject(err);
            } else {
                console.log("Successfully uploaded image", data);
                resolve(data);
            }
        });
    });

    console.log("Put object!");
}


function upload_to_s3(s3,bucketname,fileName,blob)
{
    var params = {
        Bucket: bucketname,
        Key: fileName,
        Body: blob,
        ContentType: 'text/plain'
    };


    s3.putObject(params, function(err, data) {
        if (err) {
            console.error("Error uploading blog post", err);
            console.log("Error uploading blog post");
        } else {
            console.log("Successfully uploaded blog post", data);
            console.log("Blog post created successfully!");
            window.location.href = 'index.html';
        }
    });

}

