package com;

import android.net.Uri;
import org.apache.cordova.CordovaPlugin;

public class Obfuscate extends CordovaPlugin {

    @Override
    public Uri remapUri(Uri uri) {
        if (uri.toString().indexOf("/+++/") > -1) {
            return this.toPluginUri(uri);
        } else {
            return uri;
        }
    }
}