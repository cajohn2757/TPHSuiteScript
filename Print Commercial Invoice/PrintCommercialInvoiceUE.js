define(["N/record"], function(record) {
	/**
	 * Provides click handler for buttons
	 *
	 *
	 * @exports
	 *
	 * @NApiVersion 2.x
	 * @NScriptType UserEventScript
	 *
	 *
	 */
	var exports = {};
	 
	/**
	 * Provides buttons in view mode
	 *
	 *
	 * @gov XXX
	 *
	 * @param
	 * @return {void}
	 *
	 *
	 */
	function beforeLoad(context) {
      var internalId = context.newRecord.id;
		if(context.newRecord.getValue({fieldId: "type"}) == 'trnfrord') {
        context.form.addButton({
			id: "custpage_print_com_invoice_to",
			label: "Print Commercial Invoice",
			functionName: "onButtonClickCI"
		})
      context.form.addButton({
			id: "custpage_print_bol_to",
			label: "Print BOL",
			functionName: "onButtonClickBOLTO"
		})
      }
      if(context.newRecord.getValue({fieldId: "type"}) == 'purchord') {
      context.form.addButton({
			id: "custpage_print_bol_po",
			label: "Print BOL",
			functionName: "onButtonClickBOLPO"
		})
      }
        context.form.clientScriptModulePath = "SuiteScripts/printButtons/PrintCommercialInvoice.js"
	}
	
	exports.beforeLoad = beforeLoad;
	return exports;
});