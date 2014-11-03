
# Feide Connect Javascript klient


Sjekk [feide-connect-javascript-demo](https://github.com/andreassolberg/feide-connect-javascript-demo) for mer dokumentasjon.


Fremgangsmåte:

```shell
	cordova create suhsdemo no.uninett.suhsdemo SUHSdemo
	cd suhsdemo
	cp -r ../feide-connect-cordova-demo/* www/
	cordova platform add ios
	cordova plugin add org.apache.cordova.inappbrowser
	cordova plugin add https://github.com/EddyVerbruggen/LaunchMyApp-PhoneGap-Plugin.git --variable URL_SCHEME=suhs
	cordova emulate ios
```

Denne vil registrere custom url scheme ``suhs://`` til denne appen. Dette sammenfaller med `redirect_uri`-en konfigurert:

```javascript
	this.jso = new JSO({
		providerId: "feideconnect",
		client_id: "db26f286-afc8-49d6-8128-b774eac6432f",
		redirect_uri: "suhs://",
		authorization: "https://auth.uwap.uninettlabs.no/oauth/authorization"
	});
```









