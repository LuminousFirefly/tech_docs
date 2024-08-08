document.getElementById('new-blog-btn').addEventListener('click', function() {
    window.location.href = 'upload.html';
});

var region = "us-east-1";
var accessKeyId = "*****";
var secretAccessKey = "*****";

AWS.config.update({
    region: region,
    credentials: new AWS.Credentials(accessKeyId, secretAccessKey)
});

var s3 = new AWS.S3();

console.log("AWS S3 instance created");

var originalHTML = document.querySelector('.container').innerHTML;

function refreshFileList(bucketname) {
    var tableBody = document.querySelector("#blog-table tbody");
    tableBody.innerHTML = "";
    s3.listObjectsV2({ Bucket: bucketname, Prefix: 'blogs/' }, (err, data) => {
        if (err) {
            console.log("Error fetching blogs.");
        } else {
            console.log("Data fetched:", data);
            data.Contents.forEach((object) => {
                console.log("Processing object:", object);

                var fileRow = document.createElement("tr");

                var fileTitleCell = document.createElement("td");
                fileTitleCell.textContent = "Loading...";
                fileRow.appendChild(fileTitleCell);

                var fileAuthorCell = document.createElement("td");
                fileAuthorCell.textContent = "Loading...";
                fileRow.appendChild(fileAuthorCell);

                var fileContentCell = document.createElement("td");
                fileContentCell.textContent = 'Loading...'; // Modify as needed
                fileRow.appendChild(fileContentCell);

                var fileDateCell = document.createElement("td");
                fileDateCell.textContent = object.LastModified.toISOString().split('T')[0];
                fileRow.appendChild(fileDateCell);

                fileTitleCell.classList.add('loading');
                fileAuthorCell.classList.add('loading');
                fileContentCell.classList.add('loading');

                tableBody.appendChild(fileRow);

                s3.getObject({ Bucket: bucketname, Key: object.Key }, (err, data) => {
                    if (err) {
                        console.error("Error fetching file content.", err);
                        fileTitleCell.textContent = "Error loading content";
                        fileAuthorCell.textContent = "Error loading content";
                        fileContentCell.textContent = "Error loading content";
                        fileTitleCell.classList.remove('loading');
                        fileAuthorCell.classList.remove('loading');
                        fileContentCell.classList.remove('loading');
                        fileAuthorCell.classList.add('error');
                        fileContentCell.classList.add('error');
                        fileTitleCell.classList.add('error')
                    } else {
                        var fileContent = data.Body.toString('utf-8');
                        console.log("File content:", fileContent);
                        var lines = fileContent.split('\n');

                        var title = lines[0] || "No title";
                        var author = lines[1] || "No author";
                        var content = lines.slice(2).join('\n') || "No content";

                        fileTitleCell.textContent = title;
                        fileAuthorCell.textContent = author;
                        fileContentCell.innerHTML = "<a href='#' class='read-more'>Read more</a>";

                        fileTitleCell.classList.remove('loading');
                        fileAuthorCell.classList.remove('loading');
                        fileContentCell.classList.remove('loading');

                        fileContentCell.querySelector('.read-more').addEventListener('click', function () {
                            showFullBlog(title, author, content, object.Key.split('/')[1].split('.')[0]);
                        });
                    }
                });

            });

        }
    })
}

function showFullBlog(title, author, content, uniqueId) {
    var container = document.querySelector('.container');
    container.innerHTML = `
        <div style="text-align: center;">
            <h1>${title}</h1>
            <h3>${author}</h3>
            <p>${content}</p>
            <div id="images-container"></div>
            <button id="back-btn" class="btn btn-primary">Back to List</button>
        </div>
    `;

    document.getElementById('back-btn').addEventListener('click', function () {
        container.innerHTML = originalHTML;
        refreshFileList("test-blog-list");
    });

    fetchImages(uniqueId);
}

function fetchImages(uniqueId) {
    var imagesContainer = document.getElementById('images-container');

    var region = "us-east-1";
    var accessKeyId = "*****";
    var secretAccessKey = "*****";

    AWS.config.update({
        region: region,
        credentials: new AWS.Credentials(accessKeyId, secretAccessKey)
    });

    var s3 = new AWS.S3();

    s3.listObjectsV2({ Bucket: 'test-blog-list', Prefix: `images/${uniqueId}` }, (err, data) => {
        if (err) {
            console.error("Error fetching images.", err);
        } else {
            data.Contents.forEach((object) => {
                s3.getObject({ Bucket: 'test-blog-list', Key: object.Key }, (err, data) => {
                    if (err) {
                        console.error("Error fetching image content.", err);
                    } else {
                        var img = document.createElement('img');
                        img.src = URL.createObjectURL(new Blob([data.Body], { type: 'image/jpeg' }));
                        img.style.width = '400px';  
                        img.style.height = 'auto';  // To maintain aspect ratio
                        img.style.margin = '10px 0';
                        imagesContainer.appendChild(img);
                    }
                });
            });
        }
    });
}

refreshFileList("test-blog-list");

