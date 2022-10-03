const {
	app,
	protocol,
	Menu,
	shell,
	BrowserWindow,
	ipcMain,
	nativeImage,
	NativeImage
} = require('electron')
const path = require('path')
const fs = require('fs');
const {
	exec,
	execFile
} = require('node:child_process');
const querystring = require('node:querystring');
const https = require('node:https')
const icon_backup_dir = `D:/ProgramData/Desktopicon_backup`

let win;

function createWindow() {
	Menu.setApplicationMenu(null)
	win = new BrowserWindow({
		width: 2520,
		height: 1032,
		frame: false,
		webPreferences: {
			preload: path.join(__dirname, './html/static/js/preload.js')
		}
	})

	win.loadURL(`file://${__dirname}/html/index.html`)
	// win.maximize();
	// win.setFullScreen(true);
	win.webContents.on('did-finish-load', () => {
		get_icon()
	})
	globalShortcut.register('ESC', () => {
		win.setFullScreen(false);
	})
	win.on('close', e => {
		e.preventDefault()
	})
}
//const bing_url = 'https://www.bing.com/th?id=OHR.Balsamroot_ZH-CN9456182640_UHD.jpg&rf=LaDigue_UHD.jpg&pid=hp&rs=1&c=4&qlt=100'
//

//https.get(bing_url, (res) => {
//console.log('statusCode:', res.statusCode);
//console.log('headers:', res.headers);
//
//res.on('data', (d) => {
//  process.stdout.write(d);
//});
//
//}).on('error', (e) => {
//console.error(e);
//});
// http.createServer((req, res) => {
//   let file_path = querystring.parse(req.url, null, null,);
//   file_path = file_path['/?exec']
//   console.log('file_path',file_path );
//   res.end()
//   let cmd = `explorer "${file_path.replaceAll("/","\\")}"`
//   exec(cmd);
//   return res.end()
//   try{
//     execFile(file_path)
//   }catch(e){
//     let cmd = `explorer "${file_path.replaceAll("/","\\")}"`
//     console.log(cmd)
//     exec(cmd);
//   }
// }).listen(18082)

// let file_name = "D:/Program Files/Adobe/Adobe Photoshop 2022/Photoshop.exe"
let exec_explorer = (file_path) => {
	let cmd = `explorer "${file_path.replaceAll("/", "\\")}"`
	console.log(cmd)
	exec(cmd);
}
let global_icons = []
let get_files_icon = () => {
	if (global_icons.length == 0) {
		console.log("get_file_icon end")
		return
	} else {
		let icon_object = global_icons.pop(),
			icons = icon_object.icons,
			group_count = icon_object.group_count,
			pareng_col = icon_object.pareng_col,
			id = icon_object.id,
			width = icon_object.width,
			name = icon_object.name,
			get_file_icon = () => {
				if (icons.length == 0) {
					return get_files_icon()
				}
				let icon_file = icons.pop()
				let icon_file_lnk

				try {
					icon_file_lnk = shell.readShortcutLink(icon_file)
				} catch (e) {
					get_file_icon()
					return
				}
				let execu_exe = icon_file_lnk.target
				let basename = path.basename(execu_exe, ".exe")
				app.getFileIcon(execu_exe).then((icon_file) => {

					let icon_img = icon_file.toDataURL()
					let icon_col = 1
					if (pareng_col == 1) {
						icon_col = 3
					}
					let icon_html = `
        <div class="col-${icon_col} text-center" style="-webkit-app-region: no-drag;padding:0px;min-width:${width}px;max-width:${width}px;margin: 0 5px;">
          <a href="javascript:;" data-exec="${execu_exe.replaceAll(/\\/g, "/")}" onclick="sendmessage(this)">
          <img src="${icon_img}" alt="" style="width: ${width}px;" class="user-img">
          <h6 class="font-size-12 mt-5" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${basename}</h6>
          </a>
        </div>
        `
					win.webContents.executeJavaScript(`
        window.$("#${id}").html(window.$("#${id}").html()+\`${icon_html}\`)
        `, true)
						.then((result) => {

						})
					get_file_icon()
				})
			};
		get_file_icon();
	}
}
let icon_backup_list = fs.readdirSync(icon_backup_dir);
icon_backup_list.sort()
let get_icon = () => {
	let card_html = ""
	for (let icon_dir of icon_backup_list) {
		let icons_dir = path.join(icon_backup_dir, icon_dir)
		let stat = fs.lstatSync(icons_dir);
		if (stat.isDirectory()) {
			let icons_files = fs.readdirSync(icons_dir);
			let icon_id = `${icon_dir}_selector`.replaceAll(/\s+/g, "")
			let group_count = icons_files.length
			let pareng_col = 1

			if (group_count > 8) {
				pareng_col = 2
			}
			if (group_count > 24) {
				pareng_col = 3
			}
			let cell = 50;
			let icons_object = {
				icons_dir: icons_dir,
				id: icon_id,
				icons: [],
				name: icon_dir,
				group_count: group_count,
				pareng_col: pareng_col,
				width: cell,
			}
			for (let icon of icons_files) {
				let icon_file = path.join(icons_dir, icon)
				icons_object.icons.push(icon_file)
			}
			global_icons.push(icons_object)
			let width = Math.ceil(group_count/2)
			if(width <1){
				width = 1;
			}
			width = width * cell + width * 10 + 20;
			card_html += `
          <div class="col-xl-${pareng_col} col-12" style="-webkit-app-region: no-drag;width:${width}px;max-width:${width}px;min-width:${width}px;padding: 0;margin-left: 20px;overflow: hidden;">
          <div class="box" style="padding: 0 10px;">
            <div class="box-header with-border" style="padding:2px 10px">
            <h4 class="box-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;color:#fff;"> <strong >${icon_dir}</strong></h4>
            <ul class="box-controls pull-right" style="top: 2px; right: 5px;">
              <li><a style="color:#ffffff;" class="box-btn-close" href="#"></a></li>
              <li><a style="color:#ffffff;" class="box-btn-slide" href="#"></a></li>	
              <li><a style="color:#ffffff;display:none;" class="box-btn-fullscreen" href="#"></a></li>
            </ul>
            </div>
            <div class="box-body">
            <div class="row mt-10" id="${icon_id}">
					</div>
				</div>
				</div>
			  </div>
          `;
		}
	}
	win.webContents.executeJavaScript(`
    window.$("#card_icons").html(\`${card_html}\`)
    `, true)
		.then((result) => { })
	global_icons = global_icons.sort((a, b) => {
		return a.length - b.length
	})
	get_files_icon()
}

ipcMain.on('ondragstart', (event, file_name) => {
	exec_explorer(file_name)
})

protocol.registerSchemesAsPrivileged([{
	scheme: 'demoapp',
	privileges: {
		secure: true,
		standard: true
	}
}])

app.on("open-url", async (event, url) => {
	console.log(url)
})
app.whenReady().then(() => {
	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})
app.on('close', e => {
	e.preventDefault()
})
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})