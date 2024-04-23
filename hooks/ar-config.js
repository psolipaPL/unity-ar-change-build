const fs = require('fs'),
    path = require('path'),
    xml2js = require('xml2js'),
    os = require("os");

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


function indexJSChanger(indexJSPath) {
    let indexjs = readFile(indexJSPath);
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

function logFile(path) {
    let fileContent = fs.readFileSync(path, "utf8");
    console.log("---- Start " + path + " ----");
    console.log(fileContent);
    console.log("---- End " + path + " ----");
}

function changeFileContent(path, strToFind, replaceByStr) {
    let content = fs.readFileSync(path, "utf8");
    content = content.replace(strToFind, replaceByStr);
    fs.writeFileSync(path, content);
}

function changeProjectProperties() {
    let path = "platforms/android/project.properties";
    logFile(path);
    let strToFind = "android.library.reference.2=app";
    let replaceByStr = "android.library.reference.2=app" + os.EOL + "android.library.reference.3=unityLibrary" + os.EOL;
    changeFileContent(path,strToFind,replaceByStr);
    //Log the changed file
    logFile(path);
}

function changeAndroidBuildGradle() {
    let path = "platforms/android/build.gradle";
    logFile(path);
    let strToFind = 'apply from: ""${project.rootDir}/repositories.gradle""';
    let replaceByStr = strToFind + os.EOL + "}" + os.EOL + "repositories { " + os.EOL + "repos" + os.EOL + "{ flatDir { dirs \"${project(':unityLibrary').projectDir}/libs\" \\n }');" + os.EOL + "}";
    changeFileContent(path,strToFind,replaceByStr);
    //Log the changed file
    logFile(path);
}

function changeAppBuildGradle() {
    let path = "platforms/android/app/build.gradle";
    logFile(path);
    let strToFind = "dependencies {";
    let replaceByStr = "dependencies { \n implementation fileTree(dir: project(':unityLibrary').getProjectDir().toString() + ('\\\\libs'), include: ['*.jar'])" + os.EOL;
    changeFileContent(path,strToFind,replaceByStr);
    //Log the changed file
    logFile(path);
}


function logAppFolders(foldersPath) {
    const files = fs.readdirSync(foldersPath);
    let resources = [];
    files.forEach(folder => {
        console.log(folder);
    })
}


function generateUnityLibrary() {
    let dir = "platforms/android/unityLibrary/libs/";
    let res_path = "platforms/android/app/src/main/assets/www/libs/";
    fs.mkdirSync("platforms/android/unityLibrary/");
    fs.mkdirSync(dir);

    var oldPath1 = res_path + 'unity-classes.jar';
    var oldPath2 = res_path + 'VuforiaEngine.aar';
    var newPath1 = dir + '/unity-classes.jar';
    var newPath2 = dir + '/VuforiaEngine.aar';

    fs.rename(res_path, dir, function (err) {
        if (err) throw err
        console.log("Successfully renamed 'VuforiaEngine.aar' - AKA moved!");
    })

    let files = fs.readdirSync(dir);
    console.log("--- Reading files in " + dir + " ---");
    files.forEach(folder => {
        console.log(folder);
    })

}




module.exports = {
    getConfigs,
    logFile,
    changeProjectProperties,
    changeAndroidBuildGradle,
    changeAppBuildGradle,
    logAppFolders,
    generateUnityLibrary
}
