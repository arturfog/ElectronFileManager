const fs = require('fs');

async function genFSTree(rootPath) {
  let fileEnts = await fs.promises.readdir(rootPath, { withFileTypes: true });
  let dirNames = fileEnts.filter(fileEnt => fileEnt.isDirectory()).map(fileEnt => fileEnt.name);
  dirNames.forEach(dir => {
    let li = $("<li class=\"nav-item\"><a class=\"nav-link text-truncate\" href=\"#\" onclick=fm.getFolderContent(\"" + "/" + dir + "\")><i class=\"fa fa-folder fa-lg\"></i> <span class=\"d-none d-sm-inline\">" + "/"+dir + "</span></a></li>");
    $("li.nav-item a").hover(function() {
      $(this).addClass("active");
    }, function() {
      $(this).removeClass("active");
    })
    $("ul.root").append(li);
  });
}

function getItemInfo(itemPath) {

}

async function getFolderContent(folderName) {
  console.log("folderName: " + folderName);
    let divOuter = $("<table class=\"table table-hover\">");
    let divInner = $("<thead><tr><th scope=\"col\"></th><th scope=\"col\">Name</th><th scope=\"col\">Size</th><th scope=\"col\">Date</th></tr></thead>");
    divOuter.append(divInner);
    let body = $("<tbody></tbody>");
    divOuter.append(body);
    fs.readdir(folderName, (err, files) => {
        $("div.fm").empty();
        for (let index = 0; index < files.length; index++) {
          fs.promises.stat(folderName + "/" + files[index]).then((stats) => {
            let fileSizeInBytes = stats["size"];
            let lastModified = stats["mtime"];
            let icon = stats.isDirectory() ? "fa-folder" : "fa-file";
            let content = $("<tr><th scope=\"row\"><i class=\"fa fa-lg " + icon+ "\"></i></th><td><a onclick=fm.getFolderContent(\"" + folderName + "/" + files[index] + "\") href=\"#\">" + files[index] + "</a></td><td>" + (fileSizeInBytes / 1024).toFixed(2) + " KB</td><td>" + lastModified + "</td></tr>");
            
            body.append(content);
          });
          $("div.fm").append(divOuter);
        }
      });
}

exports.getFolderContent = getFolderContent;
exports.genFSTree = genFSTree;