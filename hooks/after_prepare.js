module.exports = function(context) {

    var path              = require('path'),
        fs                = require('fs'),
      //  Q                 = require('q'),
        cordova_util      = require('cordova-lib/src/cordova/util'),
        platforms         = require('cordova-lib/src/platforms/platforms');

    //var deferral = new Q.defer();
    var projectRoot = cordova_util.cdProjectRoot();

    var targetFiles = loadCryptFileTargets();
    //var value = 0;

    context.opts.platforms.filter(function(platform) {
        var pluginInfo = context.opts.plugin.pluginInfo;
        return pluginInfo.getPlatformsArray().indexOf(platform) > -1;
        
    }).forEach(function(platform) {
        var platformPath = path.join(projectRoot, 'platforms', platform);
        var platformApi = platforms.getPlatformApi(platform, platformPath);
        var platformInfo = platformApi.getPlatformInfo();
        var wwwDir = platformInfo.locations.www;
        console.log("Inicio ofuscacion")
        //var wwwDir = '/app/www'

        finObfuscationFiles(wwwDir).filter(function(file) {
            return isObfuscatedFile(file.replace(wwwDir, ''));
        }).forEach(function(file) {
            var content = fs.readFileSync(file, 'utf-8');
            console.log('Contenido del archivo ' + file + ':');
            //console.log(content); // Imprime el contenido del archivo en la consola
            //fs.writeFileSync(file, obfuscateData(content), 'utf-8');
            obfuscateData(content)
                .then(obfuscatedContent => {
                    fs.writeFileSync(file, obfuscatedContent, 'utf-8');
                    console.log('obfuscate: ' + file);
                })
                .catch(error => {
                    console.error('Error obfuscating file:', error);
                });
        });
    });

    //deferral.resolve();
    //return deferral.promise;


    function finObfuscationFiles(dir) {
        var fileList = [];
        var list = fs.readdirSync(dir);
        list.forEach(function(file) {
            fileList.push(path.join(dir, file));
        });
        // sub dir
        list.filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        }).forEach(function(file) {
            var subDir = path.join(dir, file)
            var subFileList = finObfuscationFiles(subDir);
            fileList = fileList.concat(subFileList);
        });

        return fileList;
    }

    function loadCryptFileTargets() {
        var xmlHelpers = require('cordova-common').xmlHelpers;

        var pluginXml = path.join(context.opts.plugin.dir, 'plugin.xml');

        var include = [];
        var exclude = [];

        var doc = xmlHelpers.parseElementtreeSync(pluginXml);
        var cryptfiles = doc.findall('cryptfiles');
        if (cryptfiles.length > 0) {
            cryptfiles[0]._children.forEach(function(elm) {
                elm._children.filter(function(celm) {
                    return celm.tag == 'file' && celm.attrib.regex && celm.attrib.regex.trim().length > 0;
                }).forEach(function(celm) {
                    if (elm.tag == 'include') {
                        include.push(celm.attrib.regex.trim());
                    } else if (elm.tag == 'exclude') {
                        exclude.push(celm.attrib.regex.trim());
                    }
                });
            })
        }

        return {'include': include, 'exclude': exclude};
    }

    function isObfuscatedFile(file) {
        if (!targetFiles.include.some(function(regexStr) { return new RegExp(regexStr).test(file); })) {
            return false;
        }
        if (targetFiles.exclude.some(function(regexStr) { return new RegExp(regexStr).test(file); })) {
            return false;
        }
        return true;
    }

    async function obfuscateData(input) {
        return new Promise((resolve, reject) => {
        const JavaScriptObfuscator = require('javascript-obfuscator');
        //var result = input;
        //console.log(input); // Imprime el contenido del archivo en la consola
        try{
            const obfuscationResult = JavaScriptObfuscator.obfuscate(input,{
                
		compact: false,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true,
                simplify: true,
                stringArrayShuffle: true,
                splitStrings: true,
                stringArrayThreshold: 1
                
                
            });
            //value++;
            console.log("obfuscated successfully!");
            resolve(obfuscationResult.getObfuscatedCode());
        }catch(error){
            console.log('File not obfuscated')
            //const obfuscatedCode = obfuscationResult.getObfuscatedCode();
            resolve(input);
            //result = input;
        }

        //return result;    
    });
    }

}
