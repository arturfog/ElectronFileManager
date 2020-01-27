const fs = require('fs');

let CWD = ["/", "home"];

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

function handleClick(itemPath) {
  if (fs.statSync(itemPath).isDirectory()) {
    getFolderContent(itemPath);
  } else {
    getItemInfo(itemPath);
  }
}

function getItemInfo(itemPath) {
  fs.promises.stat(itemPath).then((stats) => {
    let fileSizeInBytes = stats["size"];
    let lastModified = stats["mtime"];
    let perm = stats["mode"];
  });
}

function convertPermissions(perm) {
  other = perm & 0x3;
  user = (perm >> 2) & 0x3;
  owner = (perm >> 4) & 0x3;
}

function goUp() {
  if(CWD.length > 1) {
    CWD.pop();
  }
  getFolderContent(getCurrentPath());
}

function goHome() {
  CWD = ["/", "home"];
  getFolderContent(getCurrentPath());
}

function getCurrentPath() {
  return CWD.join("/");
}

async function getFolderContent(folderName) {
  console.log("folderName: " + folderName);
    let divOuter = $("<table class=\"table table-hover\">");
    let divInner = $("<thead><tr><th scope=\"col\"></th><th scope=\"col\">Name</th><th scope=\"col\">Size</th><th scope=\"col\">Perm</th><th scope=\"col\">Owner</th></tr></thead>");
    divOuter.append(divInner);
    let body = $("<tbody></tbody>");
    divOuter.append(body);
    fs.readdir(folderName, (err, files) => {
        $("div.fm").empty();
        for (let index = 0; index < files.length; index++) {
          fs.promises.stat(folderName + "/" + files[index]).then((stats) => {
            let fileSizeInBytes = stats["size"];
            let lastModified = stats["mtime"];
            let perm = stats["mode"];
            let uid = stats["uid"];
            let icon = stats.isDirectory() ? "fa-folder" : "fa-file";
            let content = $("<tr><th scope=\"row\"><i class=\"fa fa-lg " + icon+ "\"></i></th><td class=\"bla\"><a onclick=fm.handleClick(\"" + folderName + "/" + files[index] + "\") href=\"#\">" + files[index] + "</a></td><td>" + (fileSizeInBytes / 1024).toFixed(2) + " KB</td><td>" + perm + "</td><td>" + uid + "</td></tr>");
            
            body.append(content);
          });
          $("div.fm").append(divOuter);
        }
      });
}

exports.getFolderContent = getFolderContent;
exports.genFSTree = genFSTree;
exports.handleClick = handleClick;
exports.goHome = goHome;
exports.goUp = goUp;
exports.getCurrentPath = getCurrentPath;