const utils = require("./ar-config");

module.exports = function (context) {
    const confs = utils.getConfigs();
    //const appId = utils.getAppIdentifier(context.opts.projectRoot + confs.configPathAndroid);

    utils.logAppFolders(context.opts.projectRoot + confs.androidPath);
    utils.generateUnityLibrary();
    utils.changeProjectProperties();
    utils.changeAndroidBuildGradle();
    utils.changeAppBuildGradle();
    //Removal of unused resources
    //utils.removeUnusedFolders(context.opts.projectRoot, context.opts.projectRoot + confs.androidPath, appId, true);

    //utils.moveGSFiles(context.opts.projectRoot + confs.androidPath + appId + confs.firebaseSuffix +'/google-services.json', context.opts.projectRoot + confs.androidAppPath + 'google-services.json')
}
