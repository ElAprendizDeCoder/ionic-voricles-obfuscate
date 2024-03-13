package com;

import android.net.Uri;

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
