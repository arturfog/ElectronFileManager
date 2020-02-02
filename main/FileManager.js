const fs = require('fs');

let CWD = ["/", "home"];

async function genFSTree(rootPath) {
  let fileEnts = await fs.promises.readdir(rootPath, { withFileTypes: true });
  let dirNames = fileEnts.filter(fileEnt => fileEnt.isDirectory()).map(fileEnt => fileEnt.name);
  dirNames.forEach(dir => {
    let li = $("<li class=\"nav-item\"><a class=\"nav-link text-truncate\" href=\"#\" onclick=fm.getFolderContent(\"" + "/" + dir + "\")><i class=\"fas fa-folder-open fa-lg\"></i> <span class=\"d-none d-sm-inline\">" + "/"+dir + "</span></a></li>");
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

function getItemType(itemPath) {
  let Magic = require('mmmagic').Magic;

  let magic = new Magic();
  magic.detectFile(itemPath, function(err, result) {
    if (err) throw err;
    $("#info_type").text(result);
  });
}

function openPDF(filePath){
  let pdfWindow = new electron.remote.BrowserWindow({
      icon: './build/icon.png',
      width: 1200,
      height: 800,
      webPreferences: {
          plugins: true
      }
  });

  pdfWindow.loadURL(url.format({
      pathname: filePath,
      protocol: 'file:',
      slashes: true
  }));

  pdfWindow.setMenu(null);

  pdfWindow.on("closed", function () {
      pdfWindow = null
  });
}

function getItemInfo(itemPath) {
  fs.promises.stat(itemPath).then((stats) => {
    console.log("ip:" + itemPath)
    let fileSizeInBytes = stats["size"];
    let lastModified = stats["mtime"];
    let created = stats["birthtime"];
    let perm = stats["mode"];
    let uid = stats["uid"];
    let group = stats["gid"];
    getItemType(itemPath);

    $("#info_name").text(itemPath.split("/").pop());
    $("#info_mtime").text(lastModified);
    $("#info_ctime").text(created);
    let ret = convertSize(fileSizeInBytes);
    $("#info_size").text(ret["size"] + ret["unit"]);
    $("#info_owner").text(convertUid(uid));
    $("#info_group").text(convertGid(group));
    $("#info_perm").text(convertPermissions(perm));
  });
}

function convertPermissions(perm) {
  let iother = perm & 0x7;
  let iuser = (perm >> 3) & 0x7;
  let iowner = (perm >> 6) & 0x7;
  let isuid = (perm >> 9) & 0x7;

  let converted = [isuid,iowner,iuser,iother];

  return converted.join("");
}

function convertGid(uid) {
  if(uid === 0) {
    return "root"
  }
  return "artur";
}

function convertUid(uid) {
  if(uid === 0) {
    return "root"
  }
  return "artur";
}

function convertSize(size) {
  let unit = " B";
  let convertedSize = size;
  if(convertedSize > 1024) {
    convertedSize = convertedSize / 1024;
    unit = " KB";
  }
  if(convertedSize > 1024) {
    convertedSize = convertedSize / 1024;
    unit = " MB";
  }

  return {"size": convertedSize.toFixed(2), "unit": unit};
}

function goUp() {
  if(CWD.length > 1) {
    CWD.pop();
  }
  getFolderContent(getCurrentPath());
}

function goHome() {
  CWD = ["/","home"];
  getFolderContent(getCurrentPath());
}

function getCurrentPath() {
  if(CWD === null || CWD.length <= 1) {
    CWD = ["/"];
    return CWD.join("");
  }
  return CWD.join("/");
}

function updateTopPath() {
  let olOuter = $("ol.breadcrumb");
  console.log(olOuter);
  olOuter.empty();
  CWD.forEach((item, index) => {
    if(index == CWD.length) {
      let li_item = $("<li class=\"breadcrumb-item\"><a href=\"#\">" + item + "</a></li>");  
    }
    let li_item = $("<li class=\"breadcrumb-item\"><a href=\"#\" aria-current=\"page\">" + item + "</a></li>");
    olOuter.append(li_item);
  });
}

async function getFolderContent(folderName) {
  CWD = folderName.split("/");
  updateTopPath();
  console.log("folderName: " + CWD);
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
            let perm = stats["mode"];
            let uid = stats["uid"];
            let icon = stats.isDirectory() ? "far fa-folder-open" : "far fa-file";
            let size = convertSize(fileSizeInBytes)
            let content = $("<tr><th scope=\"row\"><i class=\"fa-lg " + icon+ "\"></i></th><td class=\"bla\"><a onclick=fm.handleClick(\"" + folderName + "/" + files[index] + "\") href=\"#\">" + files[index] + "</a></td><td>" + size["size"] + "" + size["unit"] + "</td><td>" + convertPermissions(perm) + "</td><td>" + convertUid(uid) + "</td></tr>");
            
            body.append(content);

            if(index == files.length - 1) {
            let noContext = document.getElementsByClassName("bla");
              if(noContext != null) {
                for(index = 0; index < noContext.length; index++) {
                  noContext[index].addEventListener('contextmenu', (e) => {
                  e.preventDefault()
                  menu.popup({ window: remote.getCurrentWindow() })
                }, false);
              };
            }
            }
          });
          $("div.fm").append(divOuter);
        }
        /**/
      });
}

exports.getFolderContent = getFolderContent;
exports.genFSTree = genFSTree;
exports.handleClick = handleClick;
exports.goHome = goHome;
exports.goUp = goUp;
exports.getCurrentPath = getCurrentPath;