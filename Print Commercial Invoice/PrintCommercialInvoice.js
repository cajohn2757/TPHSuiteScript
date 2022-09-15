define(["N/ui/dialog","N/currentRecord","N/url"], function(dialog,cr,url) {
	/**
	 * Provides click handler for buttons
	 *
	 *
	 * @exports
	 *
	 * @NApiVersion 2.x
	 * @NScriptType ClientScript
	 *
	 *
	 */
	var exports = {};

	/**
	 * Provides click handler for buttons
	 *
	 *
	 * @gov XXX
	 *
	 * @param
	 * @return {void}
	 *
	 *
	 */
	function pageInit(context) {
		// TODO
	}
	
	function onButtonClickCI() {
      var currRec = cr.get().id;
      /*dialog.alert({
        title: "Internal ID",
        message: currRec
      })*/
		window.open("https://6915778.app.netsuite.com/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&formnumber=140&trantype=trnfrord&&id=" + currRec + "&label=Transfer+Order&printtype=transaction");
	}
  function onButtonClickBOLTO() {
      var currRec = cr.get().id;
      /*dialog.alert({
        title: "Internal ID",
        message: currRec
      })*/
		window.open("https://6915778.app.netsuite.com/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&formnumber=166&trantype=trnfrord&&id=" + currRec + "&label=Transfer+Order&printtype=transaction");
  }
    function onButtonClickBOLPO() {
      var currRec = cr.get().id;
      /*dialog.alert({
        title: "Internal ID",
        message: currRec
      })*/
		window.open("https://6915778.app.netsuite.com/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&formnumber=166&trantype=purchord&&id=" + currRec + "&label=Purchase+Order&printtype=transaction");
	}

    exports.onButtonClickBOLTO = onButtonClickBOLTO;
	exports.onButtonClickBOLPO = onButtonClickBOLPO;
	exports.onButtonClickCI = onButtonClickCI;
	exports.pageInit = pageInit;
	return exports;
});