define(["N/record","N/log","N/error","N/search"], function(record,log,error,search) {
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
    var newRecObj = context.newRecord;
    if(newRecObj.getValue({fieldId:'_submit_field_mode'}) == 'RECORDPROCESSOR'){
      run = false;
      //log.debug('run status',run);
      return;
    }
    if ((context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT)) {
      log.debug({title: "Start", details: "Begin Record"});
      var internalId = context.newRecord.id;
      var asin = context.newRecord.getValue({fieldId: "custrecord_tph_sale_price_asin"});
      var startDate = context.newRecord.getValue({fieldId: "custrecord_tph_sale_price_start_date"});
      var startDateString = startDate.toISOString().split('T')[0];
      var endDate = context.newRecord.getValue({fieldId: "custrecord_tph_sale_price_end_date"});
      var endDateString = endDate.toISOString().split('T')[0];
      //log.debug({title: "asin", details: asin + " " + internalId});
      
      if(endDate + 1 < new Date()){
        throw error.create({
            message: "End Date is Prior to Today",
            name: "End Date is Prior to Today",}).message;
      }

      var customrecord_tph_sale_price_schedulerSearchObj = search.create({
        type: "customrecord_tph_sale_price_scheduler",
        filters:
        [
          ["custrecord_tph_sale_price_checkbox","is","F"], 
          "AND", 
          [["custrecord_tph_sale_price_end_date","within",startDateString,endDateString],"OR",["custrecord_tph_sale_price_start_date","within",startDateString,endDateString]],
          "AND",
          ["custrecord_tph_sale_price_asin","anyof",asin]
        ],
        columns:
        [
          search.createColumn({
            name: "custrecord_tph_sale_price_asin",
            label: "ASIN"
          }),
          search.createColumn({name: "custrecord_tph_sale_price_asin_text", label: "ASIN (Text)"}),
          search.createColumn({
            name: "baseprice",
            join: "CUSTRECORD_TPH_SALE_PRICE_ASIN",
            label: "BasePrice"
          }),
          search.createColumn({name: "custrecord_tph_sale_price_sale_price", label: "SalePrice"}),
          search.createColumn({
            name: "formulatext",
            formula: "TO_CHAR({custrecord_tph_sale_price_start_date},'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')",
            label: "StartDate"
          }),
          search.createColumn({
            name: "formulatext",
            formula: "TO_CHAR({custrecord_tph_sale_price_end_date},'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')",
            sort: search.Sort.ASC,
            label: "EndDate"
          })
        ]
      });
      var searchResultCount = customrecord_tph_sale_price_schedulerSearchObj.runPaged().count;
      var salePriceArr = new Array();
      var salePriceObj = customrecord_tph_sale_price_schedulerSearchObj.run().each(function(result){
        //log.debug("location array",result)
        var resultId = result['id'];
        salePriceArr.push(resultId);

        //log.debug("location array", resultId + " " + resultName);
        return true;
      });
      //log.debug("array",salePriceArr)
      for(var i in salePriceArr) {
        var salePriceId = salePriceArr[i];
        log.debug("name", salePriceId)
        if(salePriceId == context.newRecord.id){
          continue;
        }
        else if(searchResultCount > 0) {
          log.debug("count of results",searchResultCount);
          throw error.create({
            message: "Sale already exists for time period: " + startDateString + " to " + endDateString + " Please enter a Date range that a Sale does not exist or Edit an existing Sale.",
            name: "error",}).message;
        }
      }

      context.newRecord.setValue({
        fieldId: "custrecord_tph_sale_price_checkbox",
        value: false
      });
      context.newRecord.setValue({
        fieldId: "custrecord_tph_push_to_wal",
        value: false
      });
      //log.debug({title: "checkbox", details: recordID});
      log.debug({title: "Complete", details: "End Record"});
    }
    if(context.type == context.UserEventType.XEDIT) {
      context.newRecord.setValue({
        fieldId: "custrecord_tph_sale_price_checkbox",
        value: false
      });
      context.newRecord.setValue({
        fieldId: "custrecord_tph_push_to_wal",
        value: false
      });
    }
  }

  function afterSubmit(context) {
    var newRecObj = context.newRecord;
    if(newRecObj.getValue({fieldId:'_submit_field_mode'}) == 'RECORDPROCESSOR'){
      run = false;
      log.debug('run status',run);
      return;
    }
    log.debug({title: "Start", details: "Begin Record"});
    var internalId = context.newRecord.id;
    var asin = context.newRecord.getValue({fieldId: "custrecord_tph_sale_price_asin"});
    //log.debug({title: "asin", details: asin + " " + internalId});

    var itemRec = record.load({
      type: record.Type.ASSEMBLY_ITEM,
      id: asin,
      isDynamic: true
    });

    itemRec.setValue({
      fieldId: "custitemf3_customitem_synctomarketplac",
      value: false
    });

    var recordID = itemRec.save();

    log.debug({title: "checkbox", details: recordID});
    log.debug({title: "Complete", details: "End Record"});
  }

  exports.beforeSubmit = beforeSubmit;
  exports.afterSubmit = afterSubmit;
  return exports;
});