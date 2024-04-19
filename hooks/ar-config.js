const fs = require('fs'),
    path = require('path'),
    xml2js = require('xml2js');

//Initial configs
const configs = {
    androidPath: "/platforms/android/app/src/main/assets/www/",
    androidMainPath: "/platforms/android/app/src/main/",
    androidAppPath: "/platforms/android/app/",
    configPathAndroid: "/platforms/android/app/src/main/res/xml/config.xml",
    configPathIos: "/platforms/ios/PLUS/config.xml",
    androidManifest: "AndroidManifest.xml",
    iosPath: "/platforms/ios/www/",
    iosMainPath: "/platforms/ios/",
    indexFile: 'index.html',
    urlPath: 'ARUnity_Sample',
    pluginId: 'cordova-unity-ar-config-plugin'
};

function getConfigs() {
    return configs;
}

function readFile(filePath) {
    return fs.readFileSync(filePath, "utf-8");
}


function indexReplacer(indexPath, content) {
    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsManifestLoader.js', '<script async type="text/javascript" src="scripts/OutSystemsManifestLoader.js');
    console.log('OutSystemsManifestLoader async')
    //content = content.replace('<script type="text/javascript" src="scripts/OutSystems.js', '<script async type="text/javascript" src="scripts/OutSystems.js');

    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsReactView.js', '<script async type="text/javascript" src="scripts/OutSystemsReactView.js');
    console.log('OutSystemsReactView async')

    content = content.replace('<script type="text/javascript" src="scripts/cordova.js', '<script async type="text/javascript" src="scripts/cordova.js');
    console.log('cordova async')

    content = content.replace('<script type="text/javascript" src="scripts/Debugger.js', '<script async type="text/javascript" src="scripts/Debugger.js');
    console.log('Debugger async')

    content = content.replace('<script type="text/javascript" src="scripts/ECOP_Mobile.appDefinition.js', '<script async type="text/javascript" src="scripts/ECOP_Mobile.appDefinition.js');
    console.log('appDefinition async')

    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsReactWidgets.js', '<script async type="text/javascript" src="scripts/OutSystemsReactWidgets.js');
    console.log('OutSystemsReactWidgets async')

    content = content.replace('<script type="text/javascript" src="scripts/ECOP_Mobile.index.js', '<script async type="text/javascript" src="scripts/ECOP_Mobile.index.js')
    console.log('index async')

    //content = content.substr(0, content.indexOf('<script type="text/javascript" src="scripts/NullDebugger.js')) + content.substr(content.indexOf('</script>', content.indexOf('<script type="text/javascript" src="scripts/NullDebugger.js')) + 9)
    //console.log("Index: " + content);

    fs.writeFileSync(indexPath, content, "utf-8");
}

function indexJSChanger(indexJSPath) {
    let indexjs = readFile(indexJSPath);
    //indexjs = indexjs.replace(', NullDebugger', "");
    //indexjs = indexjs.replace(', "OutSystems/ClientRuntime/NullDebugger"', "");
    fs.writeFileSync(indexJSPath, indexjs, 'utf-8');
}



function removeManifestResources(manifestPath, resources) {
    let manifest = readFile(manifestPath);
    manifest = JSON.parse(manifest);
    console.log(manifest)

    resources.forEach(resource => {
        let key = '/ECOP_Mobile/' + resource;

        switch(true) {
            case resource.endsWith(configs.notificareSuffix):
                key = key + '/notificare-services.zip';
                console.log(key);
                delete manifest.manifest.urlVersions[key];
                break;
            case resource.endsWith(configs.firebaseSuffix):
                let firebaseKeys = ['/google-services.json', '/GoogleService-Info.plist'];
                firebaseKeys.forEach(firebaseKey => {
                    let tmpKey = key;
                    tmpKey = tmpKey + firebaseKey;
                    console.log(key);
                    delete manifest.manifest.urlVersions[tmpKey];
                }) 
                break;
            default:
                break;

        }
        console.log(key);
        delete manifest.manifest.urlVersions[key];
    })
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
}

function removeUnusedFolders(root, foldersPath, appId, isAndroid) {
    const files = fs.readdirSync(foldersPath);
    let resources = [];
    files.forEach(folder => {
        if (folder.includes(configs.notificareSuffix) || folder.includes(configs.firebaseSuffix)) {
            if (!folder.includes(appId)) {
                console.log(folder)
                resources.push(folder);
                const dirFiles = fs.readdirSync(foldersPath + folder);
                dirFiles.forEach(file => {
                    fs.unlinkSync(foldersPath + folder + "/" + file);
                    console.log(`${file} is deleted!`)
                })

                fs.rmdir(foldersPath + folder, err => {
                    if (err) {
                        throw err;
                    }

                    console.log(`${foldersPath + folder} is deleted!`);
                });
            }

        }
    })
    removeManifestResources(root + (isAndroid ? configs.androidPath : configs.iosPath) + 'manifest.json', resources);
}

function moveGSFiles(oldPath, newPath){
    fs.copyFileSync(oldPath, newPath);
}

function replaceFileRegex(filePath, regex, replacer, callback) {

    if (!fs.existsSync(filePath)) {
        console.log(filePath + " not found!")
        return;
    }
    let content = fs.readFileSync(filePath, "utf-8")
    content = content.replace(regex, replacer);
    fs.writeFile(filePath, content, callback);
}


module.exports = {
    getConfigs,
    readFile,
    errorFileReplacer,
    indexReplacer,
    indexJSChanger,
    minifier,
    minifyImages,
    getAppIdentifier,
    removeUnusedFolders,
    minSDKChangerAndroid,
    replaceFileRegex,
    deepMinifier,
    performanceLogcatAdd,
    moveGSFiles
}
