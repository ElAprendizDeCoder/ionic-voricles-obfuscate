package com;

import java.net.URI;

public class Obfuscate {

    public URI remapUri(URI uri) {
        if (uri.toString().contains("/+++/")) {
            return toPluginUri(uri);
        } else {
            return uri;
        }
    }

    private URI toPluginUri(URI uri) {
        return uri;
    }
}
