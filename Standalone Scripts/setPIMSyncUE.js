define(["N/record","N/log"], function(record,log) {
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
	function beforeSubmit(context) {
      try {
      log.debug({title: "Start", details: "Begin Record"});
      var oldRecObj = context.oldRecord;
      var newRecObj = context.newRecord;

      var internalId = context.newRecord.id;

      //oldRecObj.selectLine('price',0);
      var oldBasePrice = oldRecObj.getMatrixSublistValue({
        sublistId: 'price',
        fieldId: 'price',
        column: 0,
        line: 0
      });
      var basePrice = newRecObj.getMatrixSublistValue({
        sublistId: 'price',
        fieldId: 'price',
        column: 0,
        line: 0
      });
      //log.debug({title: "Base Price Comaprison", details: oldBasePrice});

      if(oldBasePrice != basePrice) {
        newRecObj.setValue({
          fieldId: "custitemf3_customitem_synctomarketplac",
          value: false
        });
        newRecObj.setValue({
          fieldId: "custitem_tph_fbm_price_complete",
          value: false
        });
        log.debug({title: "checkIf", details: "PIM Checkbox UnSet"});
      }

      //log.debug({title: "checkbox", details: recordID});
      log.debug({title: "Complete", details: "End Record"});
      }catch(error){
        log.debug("error",error)
      }
    }


	exports.beforeSubmit = beforeSubmit;
	return exports;
});