define(["N/record","N/log","N/search","N/ui/dialog","N/runtime"], function(record,log,search,dialog,runtime) {
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
    //var recObj = context.oldRecord;
    /*
      try{

      }catch(error){
        log.dedug('error',error);
      }
    */
  }

  function beforeSubmit(context) {
    try{
      var currentRecord = context.newRecord;
      var currentUser = runtime.getCurrentUser();

      var approved = currentRecord.getValue('custrecord_tph_pc_approved');
      var approvedBy = currentRecord.getValue('custrecord_tph_pc_approved_by');
      var approvedDate = currentRecord.getValue('custrecord_tph_pc_date_approved');
      var manual = currentRecord.getValue('custrecord_tph_pc_manual_entry');
      var manualBy = currentRecord.getValue('custrecord_tph_pc_schedule_by');
      var manualDate = currentRecord.getValue('custrecord_tph_pc_date_scheduled');

      if(approved == true && approvedBy == '' && approvedDate == '') {
        currentRecord.setValue({
          fieldId: 'custrecord_tph_pc_date_approved',
          value: new Date()
        });
        currentRecord.setValue({
          fieldId: 'custrecord_tph_pc_approved_by',
          value: currentUser.id
        });
      }
      if(manual == true && manualBy == '' && manualDate == ''){
        currentRecord.setValue({
          fieldId: 'custrecord_tph_pc_date_scheduled',
          value: new Date()
        });
        currentRecord.setValue({
          fieldId: 'custrecord_tph_pc_schedule_by',
          value: currentUser.id
        });
      }
    }catch(error){
      log.dedug('error',error);
    }
  }


  function afterSubmit(context) {
    try{
      var currentRecord = context.newRecord;
      var terminateEvent = currentRecord.getValue('custrecord_tph_pc_terminate_event');
      var priceOverlap = currentRecord.getValue('custrecord_tph_pc_price_change_over_rec');

      if(priceOverlap != '' && terminateEvent == '2') {
        var startDate = currentRecord.getValue('custrecord_tph_pc_start_date');
        var terminateRecordEndDate = startDate - (24*60*60*1000);
        var terminateRecordEndDateString = startDate.addDays(-1);
        var priceOverlapRecord = record.load({
          type: 'customrecord_tph_base_price_change',
          id: priceOverlap
        });

        var OVRecStartDate = priceOverlapRecord.getValue('custrecord_tph_pc_start_date');
        var saleDuration = (terminateRecordEndDate-OVRecStartDate)/(24*60*60*1000);

        record.submitFields({
          type: 'customrecord_tph_base_price_change',
          id: priceOverlap,
          values: {
            'custrecord_tph_pc_end_date': terminateRecordEndDateString,
            'custrecord_tph_pc_sale_duration': Math.round(Number(saleDuration)),
            'custrecord_tph_pc_start_analyze': '',
            'custrecord_tph_pc_end_analyze': '',
            'custrecord_tph_pc_eval_dur': '0',
            'custrecord_tph_pc_terminated_by': currentRecord.id,
            'custrecord_tph_pc_push_amz': false,
            'custrecord_tph_pc_push_walmart': false
          }
        });

      }
      else if(priceOverlap != '' && terminateEvent == '3') {
        var startDate = currentRecord.getValue('custrecord_tph_pc_start_date');
        var terminateRecordEndDate = startDate - (24*60*60*1000);
        var terminateRecordEndDateString = startDate.addDays(-1);
        var priceOverlapRecord = record.load({
          type: 'customrecord_tph_base_price_change',
          id: priceOverlap
        });

        var OVRecStartDate = priceOverlapRecord.getValue('custrecord_tph_pc_start_analyze');
        var saleDuration = (terminateRecordEndDate-OVRecStartDate)/(24*60*60*1000);

        record.submitFields({
          type: 'customrecord_tph_base_price_change',
          id: priceOverlap,
          values: {
            'custrecord_tph_pc_end_analyze': terminateRecordEndDateString,
            'custrecord_tph_pc_eval_dur': saleDuration,
            'custrecord_tph_pc_terminated_by': currentRecord.id
          }
        });

      }

    }catch(error){
      log.dedug('error',error);
    }
  }


  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }

  exports.beforeLoad = beforeLoad;
  exports.beforeSubmit = beforeSubmit;
  exports.afterSubmit = afterSubmit;
  return exports;
});