define(['N/record','N/search','N/ui/dialog', 'N/log', 'N/currentRecord',"N/runtime" ], function (record, search, dialog, log, cr, runtime) {
  /**
    *@NApiVersion 2.0
    *@NScriptType ClientScript
    *@Author Corey Johnson
    *@Date: 2021-12-07
    */

  var IS_CONFIRMED;
  var TERMINATE_EVENT;

  function success(result) {
    switch(result){
      case '1':
        IS_CONFIRMED = false;
        TERMINATE_EVENT = result;
        getNLMultiButtonByName('multibutton_submitter').onMainButtonClick(this);
        break;
      case '2': // terminate sale
        IS_CONFIRMED = true;
        TERMINATE_EVENT = result;
        getNLMultiButtonByName('multibutton_submitter').onMainButtonClick(this);
        break;
      case '3': // terminate sale analysis
        IS_CONFIRMED = true;
        TERMINATE_EVENT = result;
        getNLMultiButtonByName('multibutton_submitter').onMainButtonClick(this);
        break;
      case '4': // confirm sale
        IS_CONFIRMED = true;
        TERMINATE_EVENT = result;
        //getNLMultiButtonByName('multibutton_submitter').onMainButtonClick(this);
        break;
    }
    console.log('Success with value ' + result);
    if(result == '4'){
      return true;
    }
  }
  function failure(reason) {
    console.log('Failure: ' + reason);
  }

  function pageInit(context) {
    var currentRecord = context.currentRecord;
    var PriceChangeType = context.currentRecord.getValue('custrecord_tph_pc_type');
    /*
       *
       * Fields
       *
       */
    var endDate = context.currentRecord.getField('custrecord_tph_pc_end_date');
    var endTime = context.currentRecord.getField('custrecord_tph_pc_end_time');
    var oldPrice = context.currentRecord.getField('custrecord_tph_pc_old_base_price');
    var newPrice = context.currentRecord.getField('custrecord_tph_pc_sale_price');
    var refFeeDuringSale = context.currentRecord.getField('custrecord_tph_pc_sale_price_ref_fee');
    var CPDuringSale = context.currentRecord.getField('custrecord_tph_pc_sale_price_cp');
    var CMDuringSale = context.currentRecord.getField('custrecord_tph_pc_sale_price_cm');
    var expSaleDuringSale = context.currentRecord.getField('custrecord_tph_pc_expt_sale_inc');
    var totSaleDisc = context.currentRecord.getField('custrecord_tph_pc_tot_disc_dollars');
    var totSaleDiscCP = context.currentRecord.getField('custrecord_tph_pc_tot_disc_cp_dollars');
    var DOCDuringSale = context.currentRecord.getField('custrecord_tph_pc_doc_during_sale');
    var DOCAfterSale = context.currentRecord.getField('custrecord_tph_pc_doc_after_sale');
    var saleDuration = context.currentRecord.getField('custrecord_tph_pc_sale_duration');
    var manuallySchedule = context.currentRecord.getField('custrecord_tph_pc_manual_entry');
    var duringSaleUpD = context.currentRecord.getField('custrecord_tph_pc_sale_price_exp_upd');
    var afterSaleUpD = context.currentRecord.getField('custrecord_tph_pc_after_sale_upd');
    /*
       *
       * Field Values
       *
       */
    var expSaleDuringSaleValue = context.currentRecord.getValue('custrecord_tph_pc_expt_sale_inc');

    /*
       *
       * Field Changes / Field Visibility
       *
       */
    switch(PriceChangeType) {
      case '1'://Base

        // field visibility
        endDate.isVisible = false;
        endDate.isMandatory = false;
        DOCAfterSale.isVisible = false;
        expSaleDuringSale.isVisible = false;
        expSaleDuringSale.isMandatory = false;
        saleDuration.isVisible = false;
        duringSaleUpD.isVisible = false;

        oldPrice.label = 'Old Base Price';
        newPrice.label = 'New Base Price';
        refFeeDuringSale.label = 'New Referral Fee';
        CPDuringSale.label = 'New CP ($)';
        CMDuringSale.label = 'New CM (%)';
        totSaleDisc.label = 'Daily Discount ($)';
        totSaleDiscCP.label = 'Daily Discount CP ($)';
        DOCDuringSale.label = 'New DOC';
        afterSaleUpD.label = 'New UpD';

        manuallySchedule.isDisabled = true;
        break;

      case '2'://Sale
        endDate.isVisible = true;
        endDate.isDisabled = false;
        endDate.isMandatory = true;
        DOCAfterSale.isVisible = true;
        expSaleDuringSale.isVisible = true;
        expSaleDuringSale.isMandatory = true;
        saleDuration.isVisible = true;
        duringSaleUpD.isVisible = true;

        oldPrice.label = 'Base Price'
        newPrice.label = 'Sale Price'
        refFeeDuringSale.label = 'Referral Fee During Sale';
        CPDuringSale.label = 'CP During Sale ($)';
        CMDuringSale.label = 'CM During Sale (%)';
        totSaleDisc.label = 'Total Sale Discount ($)';
        totSaleDiscCP.label = 'Total Sale Discount CP ($)';
        DOCDuringSale.label = 'DOC During Sale';
        afterSaleUpD.label = 'After Sale UpD';

        manuallySchedule.isDisabled = true;
        break;

      case '3'://Lightning Deal
        endDate.isVisible = true;
        endDate.isDisabled = false;
        endDate.isMandatory = true;
        DOCAfterSale.isVisible = true;
        expSaleDuringSale.isVisible = true;
        expSaleDuringSale.isMandatory = true;
        saleDuration.isVisible = true;
        duringSaleUpD.isVisible = true;
        //log.debug('switch',endDate.isDisabled)

        oldPrice.label = 'Base Price';
        newPrice.label = 'Lightning Deal Price';
        refFeeDuringSale.label = 'Referral Fee During Sale';
        CPDuringSale.label = 'CP During Sale ($)';
        CMDuringSale.label = 'CM During Sale (%)';
        totSaleDisc.label = 'Total Sale Discount ($)';
        totSaleDiscCP.label = 'Total Sale Discount CP ($)';
        DOCDuringSale.label = 'DOC During Sale';
        afterSaleUpD.label = 'After Sale UpD';

        manuallySchedule.isDisabled = false;
        break;

      case '4'://7 Day Deal
        endDate.isVisible = true;
        endDate.isDisabled = false;
        endDate.isMandatory = true;
        DOCAfterSale.isVisible = true;
        expSaleDuringSale.isVisible = true;
        expSaleDuringSale.isMandatory = true;
        saleDuration.isVisible = true;
        duringSaleUpD.isVisible = true;
        //log.debug('switch',endDate.isDisabled)

        oldPrice.label = 'Base Price';
        newPrice.label = '7 Day Deal Price';
        refFeeDuringSale.label = 'Referral Fee During Sale';
        CPDuringSale.label = 'CP During Sale ($)';
        CMDuringSale.label = 'CM During Sale (%)';
        totSaleDisc.label = 'Total Sale Discount ($)';
        totSaleDiscCP.label = 'Total Sale Discount CP ($)';
        DOCDuringSale.label = 'DOC During Sale';
        afterSaleUpD.label = 'After Sale UpD';

        manuallySchedule.isDisabled = false;
        break;

      case '5'://Coupon
        endDate.isVisible = true;
        endDate.isDisabled = false;
        endDate.isMandatory = true;
        DOCAfterSale.isVisible = true;
        expSaleDuringSale.isVisible = true;
        expSaleDuringSale.isMandatory = true;
        saleDuration.isVisible = true;
        duringSaleUpD.isVisible = true;
        //log.debug('switch',endDate.isDisabled)

        oldPrice.label = 'Base Price';
        newPrice.label = 'Coupon Price';
        refFeeDuringSale.label = 'Referral Fee During Sale';
        CPDuringSale.label = 'CP During Sale ($)';
        CMDuringSale.label = 'CM During Sale (%)';
        totSaleDisc.label = 'Total Sale Discount ($)';
        totSaleDiscCP.label = 'Total Sale Discount CP ($)';
        DOCDuringSale.label = 'DOC During Sale';
        afterSaleUpD.label = 'After Sale UpD';

        manuallySchedule.isDisabled = false;
        break;
      default:
    }
  }

  function saveRecord(context) {
    var currentRecord = context.currentRecord;
    var priceType = currentRecord.getValue('custrecord_tph_pc_type');
    //console.log(currentRecord.id)

    if(priceType == '2') {
      if(IS_CONFIRMED == true){
        if(TERMINATE_EVENT == '2') {
          currentRecord.setValue({fieldId:'custrecord_tph_pc_terminate_event',value:TERMINATE_EVENT});
        }
        if(TERMINATE_EVENT == '3') {
          currentRecord.setValue({fieldId:'custrecord_tph_pc_terminate_event',value:TERMINATE_EVENT});
        }
        IS_CONFIRMED = null;
        TERMINATE_EVENT = null;
        return true;
      }
      else if(IS_CONFIRMED == false){
        IS_CONFIRMED = null;
        TERMINATE_EVENT = null;
        return false;
      }

      var currentUser = runtime.getCurrentUser();
      var approvedDate = currentRecord.getValue('custrecord_tph_pc_date_approved');
      var approveddBy = currentRecord.getValue('custrecord_tph_pc_approved_by');
      //console.log(currentUser.id);


      var asin = currentRecord.getValue('custrecord_tph_pc_asin');
      var startDate = currentRecord.getValue('custrecord_tph_pc_start_date');
      var endDate = currentRecord.getValue('custrecord_tph_pc_end_date');

      var startDateMonth = startDate.getMonth()+1;
      var startDateString = startDate.getFullYear() +'-'+ startDateMonth +'-'+ startDate.getDate();
      if(endDate != ''){
        var endDateMonth = endDate.getMonth()+1;
        var endDateString = endDate.getFullYear() +'-'+ endDateMonth +'-'+ endDate.getDate();

        var endAnalyzeDate = currentRecord.getValue('custrecord_tph_pc_end_analyze');
        var endAnalyzeMonth = endAnalyzeDate.getMonth()+1;
        var endAnalyzeDateString = endAnalyzeDate.getFullYear() +'-'+ endAnalyzeMonth +'-'+ endAnalyzeDate.getDate();
        var approved = currentRecord.getValue('custrecord_tph_pc_approved');

        log.debug('start','of the save')

        if(approved == true) {
          var startDateAnalyzeWindow = endDate.addDays(-1 * (currentRecord.getValue('custrecord_tph_pc_eval_dur')));
          var startDateAnalyzeWindowMonth = startDateAnalyzeWindow.getMonth()+1;
          var startDateAnalyzeWindowString = startDateAnalyzeWindow.getFullYear() +'-'+ startDateAnalyzeWindowMonth +'-'+ startDateAnalyzeWindow.getDate();

          var salePriceCount = 0;
          if(currentRecord.id != '') {
            var customrecord_tph_base_price_changeSearchObj = search.create({
              type: "customrecord_tph_base_price_change",
              filters:
              [
                [["custrecord_tph_pc_start_date","within",startDateString,endDateString],"OR",["custrecord_tph_pc_end_date","within",startDateString,endDateString]], 
                "AND", 
                ["custrecord_tph_pc_asin","is",asin], 
                "AND", 
                ["custrecord_tph_pc_type","anyof","2"],
                "AND",
                ["internalid","noneof",currentRecord.id]
              ],
              columns:
              [
                search.createColumn({name: "internalid", label: "Internal ID"}),
                search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                search.createColumn({name: "custrecord_tph_pc_start_date", label: "First Day",sort: search.Sort.ASC}),
                search.createColumn({name: "custrecord_tph_pc_end_date", label: "Last Day"}),
                search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Eval Dur"}),
                search.createColumn({name: "custrecord_tph_pc_start_analyze", label: "First Eval Day"}),
                search.createColumn({name: "custrecord_tph_pc_end_analyze", label: "Last Eval Day"}),
              ]
            });
          }
          else{
            var customrecord_tph_base_price_changeSearchObj = search.create({
              type: "customrecord_tph_base_price_change",
              filters:
              [
                [["custrecord_tph_pc_start_date","within",startDateString,endDateString],"OR",["custrecord_tph_pc_end_date","within",startDateString,endDateString]], 
                "AND", 
                ["custrecord_tph_pc_asin","is",asin], 
                "AND", 
                ["custrecord_tph_pc_type","anyof","2"]
              ],
              columns:
              [
                search.createColumn({name: "internalid", label: "Internal ID"}),
                search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                search.createColumn({name: "custrecord_tph_pc_start_date", label: "First Day",sort: search.Sort.ASC}),
                search.createColumn({name: "custrecord_tph_pc_end_date", label: "Last Day"}),
                search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Eval Dur"}),
                search.createColumn({name: "custrecord_tph_pc_start_analyze", label: "First Eval Day"}),
                search.createColumn({name: "custrecord_tph_pc_end_analyze", label: "Last Eval Day"}),
              ]
            });
          }
          salePriceCount = customrecord_tph_base_price_changeSearchObj.runPaged().count;
          //console.log(salePriceCount);
          //console.log(currentRecord.id);
          var salePriceObj = customrecord_tph_base_price_changeSearchObj.run().getRange({
            start: 0,
            end: 1
          })[0];

          if(salePriceCount > 0) {
            var button1 = {
              label: 'Terminate Sale',
              value: '2'
            };
            var button2 = {
              label: 'Cancel',
              value: '1'
            };
            var options = {
              title:'Previous Sale Conflict',
              message:'A previous sale is scheduled for '+ salePriceObj.getValue(salePriceObj.columns[1]) + ' for the date range ' + salePriceObj.getValue(salePriceObj.columns[2]) + ' to ' + salePriceObj.getValue(salePriceObj.columns[3]) + '. Try another date range or disregard if you want to terminate the previous sale.',
              buttons:[button1,button2]
            };

            dialog.create(options).then(success).catch(failure);
            return false;
          }
          else{
            var button1 = {
              label: 'Terminate Analysis Period',
              value: '3'
            };
            var button2 = {
              label: 'Cancel',
              value: '1'
            };

            if(currentRecord.id != ''){
              var customrecord_tph_base_price_changeSearchObj = search.create({
                type: "customrecord_tph_base_price_change",
                filters:
                [
                  [["custrecord_tph_pc_start_analyze","within",startDateString,endDateString],"OR",["custrecord_tph_pc_end_analyze","within",startDateString,endDateString],"OR",
                   ["custrecord_tph_pc_end_analyze","within",endDateString,endAnalyzeDateString]], 
                  "AND", 
                  ["custrecord_tph_pc_asin","is",asin], 
                  "AND", 
                  ["custrecord_tph_pc_type","anyof","2"],
                  "AND",
                  ["internalid","noneof",currentRecord.id]
                ],
                columns:
                [
                  search.createColumn({name: "internalid", label: "Internal ID"}),
                  search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                  search.createColumn({name: "custrecord_tph_pc_start_date", label: "First Day",sort: search.Sort.ASC}),
                  search.createColumn({name: "custrecord_tph_pc_end_date", label: "Last Day"}),
                  search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Eval Dur"}),
                  search.createColumn({name: "custrecord_tph_pc_start_analyze", label: "First Eval Day"}),
                  search.createColumn({name: "custrecord_tph_pc_end_analyze", label: "Last Eval Day"}),
                ]
              });
            }
            else{
              var customrecord_tph_base_price_changeSearchObj = search.create({
                type: "customrecord_tph_base_price_change",
                filters:
                [
                  [["custrecord_tph_pc_start_analyze","within",startDateString,endDateString],"OR",["custrecord_tph_pc_end_analyze","within",startDateString,endDateString],"OR",
                   ["custrecord_tph_pc_end_analyze","within",endDateString,endAnalyzeDateString]], 
                  "AND", 
                  ["custrecord_tph_pc_asin","is",asin], 
                  "AND", 
                  ["custrecord_tph_pc_type","anyof","2"]
                ],
                columns:
                [
                  search.createColumn({name: "internalid", label: "Internal ID"}),
                  search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                  search.createColumn({name: "custrecord_tph_pc_start_date", label: "First Day",sort: search.Sort.ASC}),
                  search.createColumn({name: "custrecord_tph_pc_end_date", label: "Last Day"}),
                  search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Eval Dur"}),
                  search.createColumn({name: "custrecord_tph_pc_start_analyze", label: "First Eval Day"}),
                  search.createColumn({name: "custrecord_tph_pc_end_analyze", label: "Last Eval Day"}),
                ]
              });
            }
            salePriceCount = customrecord_tph_base_price_changeSearchObj.runPaged().count;
            //console.log(salePriceCount);
            var salePriceObj = customrecord_tph_base_price_changeSearchObj.run().getRange({
              start: 0,
              end: 1
            })[0];

            if(salePriceCount > 0){
              var options = {
                title:'Sale Analysis Period Conflict',
                message:'A previous sale\'s analysis period is in effect for '+ salePriceObj.getValue(salePriceObj.columns[1]) + ' from ' + salePriceObj.getValue(salePriceObj.columns[5]) + ' to ' + salePriceObj.getValue(salePriceObj.columns[6]) + '. Please select an option to proceed.',
                buttons:[button1,button2]
              };

              dialog.create(options).then(success).catch(failure);
              //return false;
            }
            else{
              /*var button1 = {
              label: 'Ok',
              value: '4'
            };
            var options = {
              title:'Confirm Sale Save',
              message:'Confirm to Save the sale',
              buttons:[button1]
            };
            dialog.create(options).then(success).catch(failure);*/
              var helper = success(4);
              return helper;
            }

          }
        }
        else if(approved == false) {
          return true;
        }

        //return true;
      }
    }
    else {
      return true;
    }
  }

  function validateField(context) {

    var currentRecord = context.currentRecord;
    var currentUser = runtime.getCurrentUser();
    console.log(currentUser);
    var approved = currentRecord.getValue('custrecord_tph_pc_approved');
    if(approved == true) {
      if(context.fieldId == 'custrecord_tph_pc_approved' || context.fieldId == 'custrecord_tph_pc_start_date' || context.fieldId == 'custrecord_tph_pc_end_date') {
        /*
     * 
     * Get Field Values
     * 
     * */
        var asin = currentRecord.getValue('custrecord_tph_pc_asin');
        var startDate = currentRecord.getValue('custrecord_tph_pc_start_date');

        // Check if start Date is in the past
        /*if(startDate < new Date()){
          dialog.alert({title:'Start Date Error',message: 'Start Date can not be on or prior to today.'});
          return false;
        }*/

        var endDate = currentRecord.getValue('custrecord_tph_pc_end_date');
        var priceType = currentRecord.getValue('custrecord_tph_pc_type');
        var startDateMonth = startDate.getMonth()+1;
        var startDateString = startDate.getFullYear() +'-'+ startDateMonth +'-'+ startDate.getDate();

        var startAnalyzeDate = currentRecord.getValue('custrecord_tph_pc_start_analyze');

        currentRecord.setValue({fieldId: 'custrecord_tph_pc_price_change_over_rec', value: ''});
        switch(priceType) {
          case '1':
            var startDateAnalyzeWindow = startDate.addDays(-1 * (currentRecord.getValue('custrecord_tph_pc_eval_dur')));
            var startDateAnalyzeWindowMonth = startDateAnalyzeWindow.getMonth()+1;
            var startDateAnalyzeWindowString = startDateAnalyzeWindow.getFullYear() +'-'+ startDateAnalyzeWindowMonth +'-'+ startDateAnalyzeWindow.getDate();

            var basePriceCount = 0;
            if(currentRecord.id != '') {
              var customrecord_tph_base_price_changeSearchObj = search.create({
                type: "customrecord_tph_base_price_change",
                filters:
                [
                  ["custrecord_tph_pc_start_date","on",startDateString], 
                  "AND", 
                  ["custrecord_tph_pc_asin","is",asin], 
                  "AND", 
                  ["custrecord_tph_pc_type","anyof","1"],
                  "AND",
                  ["internalid","noneof",currentRecord.id]
                ],
                columns:
                [
                  search.createColumn({name: "internalid", label: "Internal ID"}),
                  search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                ]
              });
            }
            else{
              var customrecord_tph_base_price_changeSearchObj = search.create({
                type: "customrecord_tph_base_price_change",
                filters:
                [
                  ["custrecord_tph_pc_start_date","on",startDateString], 
                  "AND", 
                  ["custrecord_tph_pc_asin","is",asin], 
                  "AND", 
                  ["custrecord_tph_pc_type","anyof","1"]
                ],
                columns:
                [
                  search.createColumn({name: "internalid", label: "Internal ID"}),
                  search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                ]
              });
            }
            basePriceCount = customrecord_tph_base_price_changeSearchObj.runPaged().count;
            var basePriceObj = customrecord_tph_base_price_changeSearchObj.run().getRange({
              start: 0,
              end: 1
            })[0];

            if(basePriceCount > 0) {
              dialog.alert({title:'Base Price Change Already Scheduled ',message:'There is already a scheduled Base Price Change for '+ basePriceObj.getValue(basePriceObj.columns[1]) + ' on '+ startDateString + '. Try another Start date.'});
              //currentRecord.setValue({fieldId:'custrecord_tph_pc_start_date',value:''});
              //return true;
            }
            else {
              if(currentRecord.id != '') {
                var customrecord_tph_base_price_changeSearchObj = search.create({
                  type: "customrecord_tph_base_price_change",
                  filters:
                  [
                    ["custrecord_tph_pc_start_date","within",startDateAnalyzeWindowString,startDateString], 
                    "AND", 
                    ["custrecord_tph_pc_asin","is",asin], 
                    "AND", 
                    ["custrecord_tph_pc_type","anyof","1"],
                    "AND",
                    ["internalid","noneof",currentRecord.id]
                  ],
                  columns:
                  [
                    search.createColumn({name: "internalid", label: "Internal ID"}),
                    search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                    search.createColumn({name: "custrecord_tph_pc_start_date", label: "First Day"}),
                    search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Eval Dur"})
                  ]
                });
              }
              else{
                var customrecord_tph_base_price_changeSearchObj = search.create({
                  type: "customrecord_tph_base_price_change",
                  filters:
                  [
                    ["custrecord_tph_pc_start_date","within",startDateAnalyzeWindowString,startDateString], 
                    "AND", 
                    ["custrecord_tph_pc_asin","is",asin], 
                    "AND", 
                    ["custrecord_tph_pc_type","anyof","1"]
                  ],
                  columns:
                  [
                    search.createColumn({name: "internalid", label: "Internal ID"}),
                    search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                    search.createColumn({name: "custrecord_tph_pc_start_date", label: "First Day"}),
                    search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Eval Dur"})
                  ]
                });
              }
              basePriceCount = customrecord_tph_base_price_changeSearchObj.runPaged().count;
              var basePriceObj = customrecord_tph_base_price_changeSearchObj.run().getRange({
                start: 0,
                end: 1
              })[0];

              if(basePriceCount > 0) {
                var startAnalyzeDate = new Date(basePriceObj.getValue(basePriceObj.columns[2]));
                var startAnalyzeDateMonth = startAnalyzeDate.getMonth()+1;
                var startAnalyzeDateString = startAnalyzeDate.getFullYear() +'-'+ startAnalyzeDateMonth +'-'+ startAnalyzeDate.getDate();
                var endAnalyzeDate = startAnalyzeDate.addDays(Number(basePriceObj.getValue(basePriceObj.columns[3])));
                var endAnalyzeDateMonth = endAnalyzeDate.getMonth()+1;
                var endAnalyzeDateDay = endAnalyzeDate.getDate()+1;
                var endAnalyzeDateString = endAnalyzeDate.getFullYear() +'-'+ endAnalyzeDateMonth +'-'+ endAnalyzeDateDay;
                dialog.alert({title:'Analysis Peroid Conflict',message:'A previous base price change is in it\'s analysis peroid on this day for '+ basePriceObj.getValue(basePriceObj.columns[1]) + '. Analysis Period Ends on ' + endAnalyzeDateString + '. Disregard if you want to override.'});
                currentRecord.setValue({fieldId: 'custrecord_tph_pc_price_change_over_rec', value: basePriceObj.getValue(basePriceObj.columns[0])});
                //currentRecord.setValue({fieldId:'custrecord_tph_pc_start_date',value:''});
                //return true;
              }
            }


            break;
          case '2':
            var endDateMonth = endDate.getMonth()+1;
            var endDateString = endDate.getFullYear() +'-'+ endDateMonth +'-'+ endDate.getDate();

            var endAnalyzeDate = currentRecord.getValue('custrecord_tph_pc_end_analyze');
            var endAnalyzeMonth = endAnalyzeDate.getMonth()+1;
            var endAnalyzeDateString = endAnalyzeDate.getFullYear() +'-'+ endAnalyzeMonth +'-'+ endAnalyzeDate.getDate();
            /*
            var endAnalyzeDateMonth = endAnalyzeDate.getMonth()+1;
            var endAnalyzeDateString = endAnalyzeDate.getFullYear() +'-'+ endAnalyzeDateMonth +'-'+ endAnalyzeDate.getDate();
*/
            var salePriceCount = 0;
            if(currentRecord.id != ''){
              var customrecord_tph_base_price_changeSearchObj = search.create({
                type: "customrecord_tph_base_price_change",
                filters:
                [
                  [["custrecord_tph_pc_start_date","within",startDateString,endDateString],"OR",["custrecord_tph_pc_end_date","within",startDateString,endDateString]], 
                  "AND", 
                  ["custrecord_tph_pc_asin","is",asin], 
                  "AND", 
                  ["custrecord_tph_pc_type","anyof","2"],
                  "AND",
                  ["internalid","noneof",currentRecord.id]
                ],
                columns:
                [
                  search.createColumn({name: "internalid", label: "Internal ID"}),
                  search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                  search.createColumn({name: "custrecord_tph_pc_start_date", label: "First Day"}),
                  search.createColumn({name: "custrecord_tph_pc_end_date", label: "Last Day"}),
                  search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Eval Dur"})
                ]
              });
            }
            else{
              var customrecord_tph_base_price_changeSearchObj = search.create({
                type: "customrecord_tph_base_price_change",
                filters:
                [
                  [["custrecord_tph_pc_start_date","within",startDateString,endDateString],"OR",["custrecord_tph_pc_end_date","within",startDateString,endDateString]], 
                  "AND", 
                  ["custrecord_tph_pc_asin","is",asin], 
                  "AND", 
                  ["custrecord_tph_pc_type","anyof","2"]
                ],
                columns:
                [
                  search.createColumn({name: "internalid", label: "Internal ID"}),
                  search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                  search.createColumn({name: "custrecord_tph_pc_start_date", label: "First Day"}),
                  search.createColumn({name: "custrecord_tph_pc_end_date", label: "Last Day"}),
                  search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Eval Dur"})
                ]
              });
            }
            salePriceCount = customrecord_tph_base_price_changeSearchObj.runPaged().count;
            var salePriceObj = customrecord_tph_base_price_changeSearchObj.run().getRange({
              start: 0,
              end: 1
            })[0];

            if(salePriceCount > 0) {
              dialog.alert({title:'Previous Sale Conflict', message: 'A previous sale is scheduled for '+ salePriceObj.getValue(salePriceObj.columns[1]) + ' for the date range ' + salePriceObj.getValue(salePriceObj.columns[2]) + ' to ' + salePriceObj.getValue(salePriceObj.columns[3]) + '. Try another date range or disregard if you want to terminate the previous sale.'});
              currentRecord.setValue({fieldId: 'custrecord_tph_pc_price_change_over_rec', value: salePriceObj.getValue(salePriceObj.columns[0])});
            }
            else{
              if(currentRecord.id != ''){
                var customrecord_tph_base_price_changeSearchObj = search.create({
                  type: "customrecord_tph_base_price_change",
                  filters:
                  [
                    [["custrecord_tph_pc_start_analyze","within",startDateString,endDateString],"OR",["custrecord_tph_pc_end_analyze","within",startDateString,endDateString],"OR",
                     ["custrecord_tph_pc_end_analyze","within",endDateString,endAnalyzeDateString]], 
                    "AND", 
                    ["custrecord_tph_pc_asin","is",asin], 
                    "AND", 
                    ["custrecord_tph_pc_type","anyof","2"],
                    "AND",
                    ["internalid","noneof",currentRecord.id]
                  ],
                  columns:
                  [
                    search.createColumn({name: "internalid", label: "Internal ID"}),
                    search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                    search.createColumn({name: "custrecord_tph_pc_start_date", label: "First Day"}),
                    search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Eval Dur"}),
                    search.createColumn({name: "custrecord_tph_pc_start_analyze", label: "Start Analysis"}),
                    search.createColumn({name: "custrecord_tph_pc_end_analyze", label: "End Analysis"})
                  ]
                });
              }
              else{
                var customrecord_tph_base_price_changeSearchObj = search.create({
                  type: "customrecord_tph_base_price_change",
                  filters:
                  [
                    [["custrecord_tph_pc_start_analyze","within",startDateString,endDateString],"OR",["custrecord_tph_pc_end_analyze","within",startDateString,endDateString],"OR",
                     ["custrecord_tph_pc_end_analyze","within",endDateString,endAnalyzeDateString]], 
                    "AND", 
                    ["custrecord_tph_pc_asin","is",asin], 
                    "AND", 
                    ["custrecord_tph_pc_type","anyof","2"]
                  ],
                  columns:
                  [
                    search.createColumn({name: "internalid", label: "Internal ID"}),
                    search.createColumn({name: "custrecord_tph_pc_asin_text", label: "Name"}),
                    search.createColumn({name: "custrecord_tph_pc_start_date", label: "First Day"}),
                    search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Eval Dur"}),
                    search.createColumn({name: "custrecord_tph_pc_start_analyze", label: "Start Analysis"}),
                    search.createColumn({name: "custrecord_tph_pc_end_analyze", label: "End Analysis"})
                  ]
                });
              }
              salePriceCount = customrecord_tph_base_price_changeSearchObj.runPaged().count;
              var salePriceObj = customrecord_tph_base_price_changeSearchObj.run().getRange({
                start: 0,
                end: 1
              })[0];
              console.log(salePriceCount)
              if(salePriceCount > 0) {
                var startAnalyzeDate = new Date(salePriceObj.getValue(salePriceObj.columns[4]));
                var startAnalyzeDateMonth = startAnalyzeDate.getMonth()+1;
                var startAnalyzeDateString = startAnalyzeDate.getFullYear() +'-'+ startAnalyzeDateMonth +'-'+ startAnalyzeDate.getDate();
                var endAnalyzeDate = new Date(salePriceObj.getValue(salePriceObj.columns[5]));
                var endAnalyzeDateMonth = endAnalyzeDate.getMonth()+1;
                var endAnalyzeDateDay = endAnalyzeDate.getDate()+1;
                var endAnalyzeDateString = endAnalyzeDate.getFullYear() +'-'+ endAnalyzeDateMonth +'-'+ endAnalyzeDateDay;
                dialog.alert({title:'Analysis Peroid Conflict',message:'A previous sale is in it\'s analysis peroid on this day for '+ salePriceObj.getValue(salePriceObj.columns[1]) + '. Analysis Period Ends on ' + endAnalyzeDateString + '. Disregard if you want to override.'});
                currentRecord.setValue({fieldId: 'custrecord_tph_pc_price_change_over_rec', value: salePriceObj.getValue(salePriceObj.columns[0])});
              }
            }

            break;
        }

      }
    }

    return true;
  }

  function fieldChanged(context) {
    var currentRecord = context.currentRecord;
    var currentfieldid = context.fieldId;

    var asin = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_asin'
    });

    var startDate = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_start_date'
    });

    var endDate = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_end_date'
    });

    var saleDuration = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_sale_duration'
    });

    var basePrice = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_old_base_price'
    });

    var salePrice = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_sale_price'
    });

    var referralFee = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_sale_price_ref_fee'
    });

    var fbaFee = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_fba_fee'
    });

    var avgCost = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_avg_cost'
    });

    var expectedSaleIncrease = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_expt_sale_inc'
    });

    var contributionProfitBasePrice = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_base_price_cp'
    });

    var contributionMarginBasePrice = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_base_price_cm'
    });

    var t30UPD = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_t30_upd'
    });

    var duringSaleUpD = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_sale_price_exp_upd'
    });

    var afterSaleUpD = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_after_sale_upd'
    });

    var dollarDiscount = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_price_change'
    });

    var discountCP = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_discount_cp'
    });

    var priceChangeType = context.currentRecord.getValue({
      fieldId:'custrecord_tph_pc_type'
    });

    var dayPart = context.currentRecord.getValue({
      fieldId: 'custrecord_tph_pc_time_block'
    });

    var evalDays = context.currentRecord.getValue({
      fieldId: 'custrecord_tph_pc_eval_dur'
    });

    var currDOC = context.currentRecord.getValue({
      fieldId: 'custrecord_tph_pc_current_doc'
    });

    var postExpectedSaleIncrease = context.currentRecord.getValue({
      fieldId: 'custrecord_tph_pc_exp_upd_after'
    });

    var newCP = context.currentRecord.getValue({
      fieldId: 'custrecord_tph_pc_sale_price_cp'
    });

    var totalSaleDiscountCP = context.currentRecord.getValue({
      fieldId: 'custrecord_tph_pc_tot_disc_cp_dollars'
    });

    var marketShareValue = context.currentRecord.getValue({
      fieldId: 'custrecord_tph_pc_current_market_share'
    });

    var approved = context.currentRecord.getValue({
      fieldId: 'custrecord_tph_pc_approved'
    });

    var rejected = context.currentRecord.getValue({
      fieldId: 'custrecord_tph_pc_rejected'
    });

    /*
     * 
     * Checking for Current Field
     * 
     * 
     * 
     * 
     * 
     * */

    if(currentfieldid === "custrecord_tph_pc_approved" || currentfieldid === "custrecord_tph_pc_rejected"){
      var approvalSetting = setApproval(context,approved,rejected);
    }

    if(currentfieldid === "custrecord_tph_pc_time_block"){
      var timeSet = dayPartTime(context,dayPart);
    }

    if(currentfieldid === "custrecord_tph_pc_type"){
      var typeFields = pricingType(context,priceChangeType);
    }
    if(asin == '530'){
      return true;
    }

    if(currentfieldid === "custrecord_tph_pc_start_date" || currentfieldid === "custrecord_tph_pc_end_date"){
      var saleDur = changeDuration(context, startDate, endDate, priceChangeType);
    }

    if(currentfieldid === "custrecord_tph_pc_sale_price"){
      var saleDiscount = changeDiscount(context, asin, salePrice, basePrice, avgCost, referralFee, fbaFee, t30UPD, saleDuration, expectedSaleIncrease, contributionProfitBasePrice);
    }

    if(currentfieldid === "custrecord_tph_pc_asin"){
      //log.debug({title: "asin: ", details: asin});
      var asinId = getAsinID(context,asin,salePrice,basePrice,avgCost,fbaFee,referralFee);
    }

    if(currentfieldid === "custrecord_tph_pc_expt_sale_inc"){
      //log.debug({title: "expectedSaleIncrease: ", details: expectedSaleIncrease});
      var expectedSale = expectedUpD(context,expectedSaleIncrease,t30UPD,dollarDiscount,discountCP,saleDuration,currDOC,priceChangeType);
      var saleDiscount = changeDiscount(context, asin, salePrice, basePrice, avgCost, referralFee, fbaFee, t30UPD, saleDuration, expectedSaleIncrease, contributionProfitBasePrice);
    }

    if(currentfieldid === "custrecord_tph_pc_exp_upd_after"){
      //log.debug({title: "expectedSaleIncrease: ", details: expectedSaleIncrease});
      if(priceChangeType == '1'){
        saleDuration = 1;
        var expectedSale = expectedUpD(context,postExpectedSaleIncrease,t30UPD,dollarDiscount,discountCP,saleDuration,currDOC,priceChangeType);
        var saleDiscount = changeDiscount(context, asin, salePrice, basePrice, avgCost, referralFee, fbaFee, t30UPD, saleDuration, postExpectedSaleIncrease, contributionProfitBasePrice);
      }
      totalSaleDiscountCP = context.currentRecord.getValue({
        fieldId: 'custrecord_tph_pc_tot_disc_cp_dollars'
      });
      var postExpectedSale = postExpectedUpD(context,priceChangeType,postExpectedSaleIncrease,t30UPD,afterSaleUpD,basePrice,salePrice,currDOC,newCP,contributionProfitBasePrice,totalSaleDiscountCP,marketShareValue);
    }
  }


  function expectedUpD(context,ExpectedSaleIncrease,T30UPD,DollarDiscount,DiscountCP,SaleDuration,CurrDOC,PriceType) {
    if(ExpectedSaleIncrease == '' || ExpectedSaleIncrease == null || T30UPD == '' || T30UPD == null) {
      //log.debug({title: "expectedSaleIncrease: ", details: ExpectedSaleIncrease});
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_sale_price_exp_upd',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_tot_disc_dollars',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_tot_disc_cp_dollars',
        value: ''
      });

    }
    else {
      //log.debug({title: "expectedSaleIncrease: ", details: ExpectedSaleIncrease});
      if(PriceType != '1'){
        var expectedSaleUPD = Math.round((1+(ExpectedSaleIncrease/100))*T30UPD);
        log.debug({title: "expectedSaleUPD: ", details: expectedSaleUPD});
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_sale_price_exp_upd',
          value: expectedSaleUPD
        });
      }
      else{
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_sale_price_exp_upd',
          value: ''
        });
      }

      var totalDiscountDollar = Math.round((DollarDiscount * T30UPD * SaleDuration * (1 + ExpectedSaleIncrease/100))*100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_tot_disc_dollars',
        value: totalDiscountDollar
      });

      var totalDiscountCPDollar = Math.round((DiscountCP * T30UPD * SaleDuration * (1 + ExpectedSaleIncrease/100))*100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_tot_disc_cp_dollars',
        value: totalDiscountCPDollar
      });

      var duringSaleDOC = Math.round(CurrDOC/(1+ExpectedSaleIncrease/100));
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_doc_during_sale',
        value: duringSaleDOC
      });
    }
    return true;
  }


  function postExpectedUpD(context,PriceChangeType,PostExpectedSaleIncrease,T30UPD,NewUpD,BasePrice,SalePrice,CurrDOC,NewCP,OldCP,TotalSaleDiscountCP,MarketShareValue) {
    //log.debug('postExpUPD',PriceChangeType)
    var afterSaleUPD = Math.round((1+(PostExpectedSaleIncrease/100))*T30UPD);
    context.currentRecord.setValue({
      fieldId:'custrecord_tph_pc_after_sale_upd',
      value: afterSaleUPD
    });
    var afterSaleDOC = Math.round(CurrDOC/(1+PostExpectedSaleIncrease/100));
    context.currentRecord.setValue({
      fieldId:'custrecord_tph_pc_doc_after_sale',
      value: afterSaleDOC
    });
    var weeklySalesDelta;
    var weeklyCPDelta;
    switch(PriceChangeType) {
      case '1':
        weeklySalesDelta = 7 * (SalePrice - BasePrice) * T30UPD * (1+PostExpectedSaleIncrease/100);
        weeklyCPDelta = 7 * (afterSaleUPD - OldCP) * T30UPD * (1+PostExpectedSaleIncrease/100);
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_weekly_sale_dollars',
          value: weeklySalesDelta
        });
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_weekly_cp_dollars',
          value: weeklyCPDelta
        });
        break;
      case '2':
        weeklySalesDelta = 7 * BasePrice * T30UPD * (1+PostExpectedSaleIncrease/100);
        weeklyCPDelta = 7 * BasePrice * T30UPD * (1+PostExpectedSaleIncrease/100);
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_weekly_sale_dollars',
          value: weeklySalesDelta
        });
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_weekly_cp_dollars',
          value: weeklyCPDelta
        });
        break;
    }
    var weeklyUnitsDelta = Math.round(7 * (afterSaleUPD - T30UPD) * (1+PostExpectedSaleIncrease/100));
    context.currentRecord.setValue({
      fieldId:'custrecord_tph_pc_weekly_units',
      value: weeklyUnitsDelta
    });

    var payback = Math.round(-TotalSaleDiscountCP / (weeklyCPDelta / 7));

    context.currentRecord.setValue({
      fieldId:'custrecord_tph_pc_payback_days',
      value: payback
    });

    var expMarketShare = Math.round(MarketShareValue * (1+PostExpectedSaleIncrease/100));
    context.currentRecord.setValue({
      fieldId:'custrecord_tph_pc_expected_market_share',
      value: expMarketShare
    });


    return true;
  }


  function getAsinID(context,ASIN,SalePrice,BasePrice,AVGCost,FBAFee,ReferralFee) {
    if(ASIN == '' || ASIN == null) {
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_fba_fee',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_sale_price_ref_fee',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_t30_upd',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_base_price_ref_fee',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_base_price_cp',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_base_price_cm',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_asin_text',
        value: ''
      });
    }
    else {
      var salesorderSearchObj = search.create({
        type: "salesorder",
        filters:
        [
          ["type","anyof","SalesOrd"],
          "AND", 
          ["item","anyof",ASIN],
          "AND", 
          ["custbody_tph_order_date_time","within","daysago30"]
        ],
        columns:
        [
          search.createColumn({
            name: "quantity",
            summary: "SUM",
            label: "Units Sold on Date"
          })
        ],
        isPublic: "true"
      });
      var unitSoldObj = salesorderSearchObj.run().getRange({
        start: 0,
        end: 1
      })[0];
      //log.debug("resultOBJ result ",resultObj);

      var t30UPD = Math.round((unitSoldObj.getValue(unitSoldObj.columns[0]))/30);
      //log.debug("t30UPD result ",t30UPD);
      console.log(t30UPD)
      if(t30UPD == 0){
        t30UPD = 1;
      }
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_t30_upd',
        value: t30UPD
      });


      var itemSearchObj = search.create({
        type: "item",
        filters:
        [
          ["internalidnumber","equalto",ASIN], 
          "AND", 
          ["custrecord_f3_item.custrecord_f3_marketplace","anyof","8"]
        ],
        columns:
        [
          search.createColumn({name: "externalid", label: "External ID"}),
          search.createColumn({
            name: "itemid",
            sort: search.Sort.ASC,
            label: "Name"
          }),
          search.createColumn({name: "salesdescription", label: "Description"}),
          search.createColumn({
            name: "custrecord_f3_referralfee",
            join: "CUSTRECORD_F3_ITEM",
            label: "% Referral Fee"
          }),
          search.createColumn({
            name: "custrecord_f3_fulfillmentfee",
            join: "CUSTRECORD_F3_ITEM",
            label: "Fulfillment Fee"
          }),
          search.createColumn({name: "baseprice", label: "Base Price"}),
          search.createColumn({name: "averagecost", label: "Average Cost"})
        ]
      });
      var resultObj = itemSearchObj.run().getRange({
        start: 0,
        end: 1
      })[0];
      try{
        var ext = resultObj.getValue(resultObj.columns[0]);
      }catch(error){
        log.debug({title:'Missing Fee', message:'Missing an Amazon Fee Record for this ASIN. ' + error});
      }

      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_asin_text',
        value: resultObj.getValue(resultObj.columns[1])
      });

      if(BasePrice == '' || BasePrice == null) {
        var basePrice = resultObj.getValue(resultObj.columns[5]);
        //log.debug("baseprice result ",basePrice);
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_old_base_price',
          value: basePrice
        });
      }
      else {
        var basePrice = BasePrice;
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_base_price',
          value: basePrice
        });
      }

      if(FBAFee == '' || FBAFee == null) {
        var fbaFee = resultObj.getValue(resultObj.columns[4]);
        //log.debug("fbaFee result ",fbaFee);
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_fba_fee',
          value: fbaFee
        });
      }
      else {
        var fbaFee = FBAFee;
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_fba_fee',
          value: fbaFee
        });
      }

      if(AVGCost == '' || AVGCost == null) {
        var avgCost = resultObj.getValue(resultObj.columns[6]);
        //log.debug("fbaFee result ",fbaFee);
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_avg_cost',
          value: avgCost
        });
      }
      else {
        var avgCost = AVGCost;
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_avg_cost',
          value: avgCost
        });
      }

      var referralFeeBasePrice = Math.round((basePrice*(((resultObj.getValue(resultObj.columns[3])).substring(0,4))/100)) * 100) / 100;
      //log.debug("feeObj result ",referralFeeBasePrice);
      //log.debug("feeObj result ",basePrice);
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_base_price_ref_fee',
        value: referralFeeBasePrice
      });

      var contributionProfitBasePrice = Math.round((basePrice-avgCost-fbaFee-referralFeeBasePrice) * 100) / 100;
      var contributionMarginBasePrice = Math.round((contributionProfitBasePrice/basePrice*100) * 100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_base_price_cp',
        value: contributionProfitBasePrice
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_base_price_cm',
        value: contributionMarginBasePrice
      });

      var fbaQtyAvailableSearch = search.create({
        type: "item",
        filters:
        [
          ["internalidnumber","equalto",ASIN],
          "AND",
          ["inventorylocation","anyof","3"]
        ],
        columns:
        [
          search.createColumn({
            name: "formulanumeric",
            formula: "CASE WHEN {inventorylocation} = 'FBAUS' THEN {locationquantityavailable} END",
            label: "FBAUS Available"
          })
        ]
      });
      var fbaQtyAvailableObj = fbaQtyAvailableSearch.run().getRange({
        start: 0,
        end: 1
      })[0];
      var fbaQtyAvailable = fbaQtyAvailableObj.getValue(fbaQtyAvailableObj.columns[0]);
      //console.log(fbaQtyAvailable);

      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_fba_quantity_available',
        value: fbaQtyAvailable
      });

      var fbaFCSearch = search.create({
        type: "item",
        filters:
        [
          ["internalidnumber","equalto",ASIN],
          "AND",
          ["inventorylocation","anyof","24"]
        ],
        columns:
        [
          search.createColumn({
            name: "formulanumeric",
            formula: "CASE WHEN {inventorylocation} = 'FC Transfer (FBAUS)' THEN {locationquantityavailable} END",
            label: "FBAUS FC Transfer"
          })
        ]
      });
      var fbaFCObj = fbaFCSearch.run().getRange({
        start: 0,
        end: 1
      })[0];
      var fbaFC = fbaFCObj.getValue(fbaFCObj.columns[0]);

      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_fba_qty_fc_transfer',
        value: fbaFC
      });


      var toQuantity = new Array;
      var transferorderSearchObj = search.create({
        type: "transferorder",
        filters:
        [
          ["type","anyof","TrnfrOrd"], 
          "AND", 
          ["mainline","is","F"], 
          "AND", 
          ["shipping","is","F"], 
          "AND", 
          ["taxline","is","F"], 
          "AND", 
          ["status","anyof","TrnfrOrd:B","TrnfrOrd:F"], 
          "AND", 
          ["item","anyof",ASIN]
        ],
        columns:
        [
          search.createColumn({
            name: "statusref",
            summary: "GROUP",
            sort: search.Sort.ASC,
            label: "Status"
          }),
          search.createColumn({
            name: "quantity",
            summary: "SUM",
            label: "Quantity"
          })
        ]
      });
      transferorderSearchObj.run().each(function(result){
        var value = Math.abs(result.getValue(result.columns[1]));
        toQuantity.push(value);
        return true;
      });
      //console.log(toQuantity)
      if(toQuantity[0] != undefined) {
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_fba_qty_to_pend_fulfil',
          value: toQuantity[0]
        });
      }
      if(toQuantity[1] != undefined) {
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_fba_qty_to_pend_recpt',
          value: toQuantity[1]
        });
      }


      var currDOC = Math.round(fbaQtyAvailable/t30UPD);
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_current_doc',
        value: currDOC
      });

      try{
        var customrecord_tph_asin_listing_dataSearchObj = search.create({
          type: "customrecord_tph_asin_listing_data",
          filters:
          [
            ["custrecord_tph_asin_listing_data_date","on","yesterday"], 
            "AND", 
            ["custrecord_tph_asin_listing_data_asin","anyof",ASIN]
          ],
          columns:
          [
            search.createColumn({name: "custrecord_tph_asin_listing_data_asin", label: "ASIN"}),
            search.createColumn({
              name: "formulapercent",
              formula: "CASE WHEN {custrecordtph_asin_listing_mkt_size} != 0 THEN {custrecord168}/{custrecordtph_asin_listing_mkt_size} ELSE 0 END",
              label: "Market Share"
            })
          ]
        });
        var marketShareObj = customrecord_tph_asin_listing_dataSearchObj.run().getRange({
          start: 0,
          end: 1
        })[0];
        var marketShare = marketShareObj.getValue(marketShareObj.columns[1]);
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_current_market_share',
          value: marketShare
        });
      }catch(error){
        log.debug('error',error)
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_pc_current_market_share',
          value: '10'
        });
      }
    }
    return true;
  }


  function changeDuration(context,StartDate,EndDate, PriceChangeType) {
    /*if(StartDate < new Date()){
      dialog.alert({title:'Start Date Error',message: 'Start Date can not be prior to today.'});
      return false;
    }*/
    if(StartDate != '' && PriceChangeType == '1') {
      var evalDuration = 7;
      var firstAnalyzeDay = StartDate;
      var lastAnalyzeDay = StartDate.addDays(Number(evalDuration-1));
      //console.log(firstAnalyzeDay);
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_start_analyze',
        value: firstAnalyzeDay
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_end_analyze',
        value: lastAnalyzeDay
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_eval_dur',
        value: evalDuration
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_sale_duration',
        value: ''
      });
    }
    else if(StartDate == '') {
      console.log('no start date lmao');
    }
    else {
      var saleDuration = Math.ceil((EndDate-StartDate)/(24*60*60*1000)) +1;
      console.log(saleDuration)
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_sale_duration',
        value: saleDuration
      });
      console.log(saleDuration)
      if(saleDuration < 7){
        var evalDuration = '7';
      }
      else{
        var evalDuration = saleDuration;
      }
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_eval_dur',
        value: evalDuration
      });
      var startAnalysis = EndDate.addDays(1);
      var endAnalysis = EndDate.addDays(Number(evalDuration));
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_start_analyze',
        value: startAnalysis
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_end_analyze',
        value: endAnalysis
      });
    }
    return true;
  }

  function changeDiscount(context,ASIN,SalePrice,BasePrice,AVGCost,ReferralFee,FBAFee,T30UPD,SaleDuration,ExpectedSaleIncrease,ContributionProfitBasePrice) {
    if(SalePrice == ''|| SalePrice == null || BasePrice == '' || BasePrice == null || AVGCost == '' || AVGCost == null) {
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_price_change',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_discount_perc',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_sale_price_cp',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_sale_price_cm',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_sale_price_ref_fee',
        value: ''
      });
    }
    else {
      var priceChange = SalePrice - BasePrice;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_price_change',
        value: priceChange
      });
      var percentDiscount = Math.round((((SalePrice-BasePrice)/BasePrice)*100) * 100) / 100;

      log.debug('name',percentDiscount)
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_discount_perc',
        value: percentDiscount
      });
      var feeSearchObj = search.create({
        type: "item",
        filters:
        [
          ["internalidnumber","equalto",ASIN], 
          "AND", 
          ["custrecord_f3_item.custrecord_f3_marketplace","anyof","8"]
        ],
        columns:
        [
          search.createColumn({
            name: "custrecord_f3_referralfee",
            join: "CUSTRECORD_F3_ITEM",
            label: "% Referral Fee"
          })
        ]
      });
      var feeObj = feeSearchObj.run().getRange({
        start: 0,
        end: 1
      })[0];
      //log.debug("resultOBJ result ",resultObj);

      var referralFee = SalePrice*(((feeObj.getValue(feeObj.columns[0])).substring(0,4))/100);
      //log.debug("feeObj result ",referralFee);
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_sale_price_ref_fee',
        value: referralFee
      });

      var contributionProfit = Math.round((SalePrice-AVGCost-FBAFee-referralFee) * 100) / 100;
      var contributionMargin = Math.round((contributionProfit/SalePrice*100) * 100) / 100;

      //log.debug('Ref',referralFee);
      //log.debug('FBA',FBAFee);
      //log.debug('AVG',AVGCost);
      //log.debug('Sale Price',SalePrice);
      //log.debug('Contribution Profit',contributionMargin);

      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_sale_price_cp',
        value: contributionProfit
      });
      //log.debug('name',contributionMargin)
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_sale_price_cm',
        value: contributionMargin
      });

      var discountCP = contributionProfit-ContributionProfitBasePrice;
      //log.debug('name',discountCP)
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_discount_cp',
        value: discountCP
      });

      var totalDiscountDollar = Math.round((priceChange * T30UPD * SaleDuration * (1 + ExpectedSaleIncrease/100))*100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_tot_disc_dollars',
        value: totalDiscountDollar
      });

      var totalDiscountCPDollar = Math.round((discountCP * T30UPD * SaleDuration * (1 + ExpectedSaleIncrease/100))*100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_tot_disc_cp_dollars',
        value: totalDiscountDollar
      });
    }
    return true;
  }


  function pricingType(context,PriceChangeType) {
    if(PriceChangeType == '') {
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_type',
        value: ''
      });
    }
    else{
      /*
       *
       * Fields
       *
       */
      var endDate = context.currentRecord.getField('custrecord_tph_pc_end_date');
      var endTime = context.currentRecord.getField('custrecord_tph_pc_end_time');
      var oldPrice = context.currentRecord.getField('custrecord_tph_pc_old_base_price');
      var newPrice = context.currentRecord.getField('custrecord_tph_pc_sale_price');
      var refFeeDuringSale = context.currentRecord.getField('custrecord_tph_pc_sale_price_ref_fee');
      var CPDuringSale = context.currentRecord.getField('custrecord_tph_pc_sale_price_cp');
      var CMDuringSale = context.currentRecord.getField('custrecord_tph_pc_sale_price_cm');
      var expSaleDuringSale = context.currentRecord.getField('custrecord_tph_pc_expt_sale_inc');
      var totSaleDisc = context.currentRecord.getField('custrecord_tph_pc_tot_disc_dollars');
      var totSaleDiscCP = context.currentRecord.getField('custrecord_tph_pc_tot_disc_cp_dollars');
      var DOCDuringSale = context.currentRecord.getField('custrecord_tph_pc_doc_during_sale');
      var DOCAfterSale = context.currentRecord.getField('custrecord_tph_pc_doc_after_sale');
      var saleDuration = context.currentRecord.getField('custrecord_tph_pc_sale_duration');
      var manuallySchedule = context.currentRecord.getField('custrecord_tph_pc_manual_entry');
      var duringSaleUpD = context.currentRecord.getField('custrecord_tph_pc_sale_price_exp_upd');
      var afterSaleUpD = context.currentRecord.getField('custrecord_tph_pc_after_sale_upd');
      /*
       *
       * Field Values
       *
       */
      var expSaleDuringSaleValue = context.currentRecord.getValue('custrecord_tph_pc_expt_sale_inc');

      /*
       *
       * Field Changes / Field Visibility
       *
       */
      switch(PriceChangeType) {
        case '1'://Base
          //log.debug('switch',PriceChangeType)
          context.currentRecord.setValue({
            fieldId:'custrecord_tph_pc_expt_sale_inc',
            value: expSaleDuringSaleValue
          });
          context.currentRecord.setValue({
            fieldId:'custrecord_tph_pc_end_date',
            value: ''
          });

          // field visibility
          endDate.isVisible = false;
          endDate.isMandatory = false;
          DOCAfterSale.isVisible = false;
          expSaleDuringSale.isVisible = false;
          expSaleDuringSale.isMandatory = false;
          saleDuration.isVisible = false;
          duringSaleUpD.isVisible = false;

          oldPrice.label = 'Old Base Price';
          newPrice.label = 'New Base Price';
          refFeeDuringSale.label = 'New Referral Fee';
          CPDuringSale.label = 'New CP ($)';
          CMDuringSale.label = 'New CM (%)';
          totSaleDisc.label = 'Daily Discount ($)';
          totSaleDiscCP.label = 'Daily Discount CP ($)';
          DOCDuringSale.label = 'New DOC';
          afterSaleUpD.label = 'New UpD';

          context.currentRecord.setValue({fieldId:'custrecord_tph_pc_manual_entry',value:false});
          manuallySchedule.isDisabled = true;
          break;

        case '2'://Sale
          endDate.isVisible = true;
          endDate.isDisabled = false;
          endDate.isMandatory = true;
          DOCAfterSale.isVisible = true;
          expSaleDuringSale.isVisible = true;
          expSaleDuringSale.isMandatory = true;
          saleDuration.isVisible = true;
          duringSaleUpD.isVisible = true;

          oldPrice.label = 'Base Price'
          newPrice.label = 'Sale Price'
          refFeeDuringSale.label = 'Referral Fee During Sale';
          CPDuringSale.label = 'CP During Sale ($)';
          CMDuringSale.label = 'CM During Sale (%)';
          totSaleDisc.label = 'Total Sale Discount ($)';
          totSaleDiscCP.label = 'Total Sale Discount CP ($)';
          DOCDuringSale.label = 'DOC During Sale';
          afterSaleUpD.label = 'After Sale UpD';

          context.currentRecord.setValue({fieldId:'custrecord_tph_pc_manual_entry',value:false});
          manuallySchedule.isDisabled = true;
          break;

        case '3'://Lightning Deal
          endDate.isVisible = true;
          endDate.isDisabled = false;
          endDate.isMandatory = true;
          DOCAfterSale.isVisible = true;
          expSaleDuringSale.isVisible = true;
          expSaleDuringSale.isMandatory = true;
          saleDuration.isVisible = true;
          duringSaleUpD.isVisible = true;
          //log.debug('switch',endDate.isDisabled)

          oldPrice.label = 'Base Price';
          newPrice.label = 'Lightning Deal Price';
          refFeeDuringSale.label = 'Referral Fee During Sale';
          CPDuringSale.label = 'CP During Sale ($)';
          CMDuringSale.label = 'CM During Sale (%)';
          totSaleDisc.label = 'Total Sale Discount ($)';
          totSaleDiscCP.label = 'Total Sale Discount CP ($)';
          DOCDuringSale.label = 'DOC During Sale';
          afterSaleUpD.label = 'After Sale UpD';

          //context.currentRecord.setValue({fieldId:'custrecord_tph_pc_manual_entry',value:true});
          manuallySchedule.isDisabled = false;
          break;

        case '4'://7 Day Deal
          endDate.isVisible = true;
          endDate.isDisabled = false;
          endDate.isMandatory = true;
          DOCAfterSale.isVisible = true;
          expSaleDuringSale.isVisible = true;
          expSaleDuringSale.isMandatory = true;
          saleDuration.isVisible = true;
          duringSaleUpD.isVisible = true;
          //log.debug('switch',endDate.isDisabled)

          oldPrice.label = 'Base Price';
          newPrice.label = '7 Day Deal Price';
          refFeeDuringSale.label = 'Referral Fee During Sale';
          CPDuringSale.label = 'CP During Sale ($)';
          CMDuringSale.label = 'CM During Sale (%)';
          totSaleDisc.label = 'Total Sale Discount ($)';
          totSaleDiscCP.label = 'Total Sale Discount CP ($)';
          DOCDuringSale.label = 'DOC During Sale';
          afterSaleUpD.label = 'After Sale UpD';

          //context.currentRecord.setValue({fieldId:'custrecord_tph_pc_manual_entry',value:true});
          manuallySchedule.isDisabled = false;
          break;

        case '5'://Coupon
          endDate.isVisible = true;
          endDate.isDisabled = false;
          endDate.isMandatory = true;
          DOCAfterSale.isVisible = true;
          expSaleDuringSale.isVisible = true;
          expSaleDuringSale.isMandatory = true;
          saleDuration.isVisible = true;
          duringSaleUpD.isVisible = true;
          //log.debug('switch',endDate.isDisabled)

          oldPrice.label = 'Base Price';
          newPrice.label = 'Coupon Price';
          refFeeDuringSale.label = 'Referral Fee During Sale';
          CPDuringSale.label = 'CP During Sale ($)';
          CMDuringSale.label = 'CM During Sale (%)';
          totSaleDisc.label = 'Total Sale Discount ($)';
          totSaleDiscCP.label = 'Total Sale Discount CP ($)';
          DOCDuringSale.label = 'DOC During Sale';
          afterSaleUpD.label = 'After Sale UpD';

          //context.currentRecord.setValue({fieldId:'custrecord_tph_pc_manual_entry',value:true});
          manuallySchedule.isDisabled = false;
          break;
        default:
      }
    }
  }


  function dayPartTime(context,DayPart){
    var dateStr;
    var timeStr
    if(DayPart == '') {
      dateStr = '00:00';
      timeStr = timeString(dateStr);
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_start_time',
        value: timeStr
      });
      dateStr = '23:59';
      timeStr = timeString(dateStr);
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_pc_end_time',
        value: timeStr
      });
    }
    else{
      switch(DayPart){
        case 1:
          dateStr = '00:00';
          timeStr = timeString(dateStr);
          context.currentRecord.setValue({
            fieldId:'custrecord_tph_pc_start_time',
            value: timeStr
          });
          dateStr = '23:59';
          timeStr = timeString(dateStr);
          context.currentRecord.setValue({
            fieldId:'custrecord_tph_pc_end_time',
            value: timeStr
          });
          break;
        case 2:
          dateStr = '06:00';
          timeStr = timeString(dateStr);
          context.currentRecord.setValue({
            fieldId:'custrecord_tph_pc_start_time',
            value: timeStr
          });
          dateStr = '05:59';
          timeStr = timeString(dateStr);
          context.currentRecord.setValue({
            fieldId:'custrecord_tph_pc_end_time',
            value: timeStr
          });
          break;
        case 3:
          dateStr = '12:00';
          timeStr = timeString(dateStr);
          context.currentRecord.setValue({
            fieldId:'custrecord_tph_pc_start_time',
            value: timeStr
          });
          dateStr = '11:59';
          timeStr = timeString(dateStr);
          context.currentRecord.setValue({
            fieldId:'custrecord_tph_pc_end_time',
            value: timeStr
          });
          break;
        case 4:
          dateStr = '18:00';
          timeStr = timeString(dateStr);
          context.currentRecord.setValue({
            fieldId:'custrecord_tph_pc_start_time',
            value: timeStr
          });
          dateStr = '17:59';
          timeStr = timeString(dateStr);
          context.currentRecord.setValue({
            fieldId:'custrecord_tph_pc_end_time',
            value: timeStr
          });
          break;
      }
    }
  }

  function setApproval(context,Approved,Rejected) {
    var approve = context.currentRecord.getField('custrecord_tph_pc_approved');
    var reject = context.currentRecord.getField('custrecord_tph_pc_rejected');

    if(Approved == true) {
      reject.isDisabled = true;
    }
    if(Rejected == true) {
      approve.isDisabled = true;
    }
    if(Approved == false) {
      reject.isDisabled = false;
    }
    if(Rejected == false) {
      approve.isDisabled = false;
    }
  }

  function timeString(DateStr){
    d = new Date();
    dateParts = DateStr.split(":");
    d.setHours(+dateParts[0]);
    d.setMinutes(+dateParts[1]);
    return d;
  }

  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }

  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    validateField: validateField,
    saveRecord: saveRecord
  }

});