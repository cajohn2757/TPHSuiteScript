define(["N/record","N/log","N/search","N/ui/dialog","N/runtime","N/task","SuiteScripts/Supply Planning/SupplyPlanningCreateWorkOrder"], function(record,log,search,dialog,runtime,task,WO) {
  /**
	 * Provides click handler for buttons
	 *
	 *
	 * @exports
	 *
	 * @NApiVersion 2.x
	 * @NScriptType ScheduledScript
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
  function execute() {
    var scriptObj = runtime.getCurrentScript();
    var lastCheckInternalId = scriptObj.getParameter({name:'custscript_tph_last_check_id'});
    var lastCheckPostedDate = scriptObj.getParameter({name:'custscript_tph_last_check_date'});
    log.debug(lastCheckInternalId);
    if(lastCheckInternalId == '-1'){
      var currInternalId = -1;
      lastCheckPostedDate = '2022-01-01'
    }
    else{
      var currInternalId = lastCheckInternalId;
      record.delete({
        type:'check',
        id:currInternalId
      });
      var lastDateYear = lastCheckPostedDate.getFullYear();
      var lastDateMonth = lastCheckPostedDate.getMonth() + 1;
      var lastDateDay = lastCheckPostedDate.getDate();
      if(lastDateMonth.toString().length == 1){
        lastDateMonth = '0'+lastDateMonth;
      }
      if(lastDateDay.toString().length == 1){
        lastDateDay = '0'+lastDateDay;
      }
      var lastCheckPostedDate = lastDateYear + '-' + lastDateMonth + '-' + lastDateDay;
    }

    /*
     * 
     * Main Function
     * 
     * 
     */

    //var SettlementSummaryArray = createSettlementSummarySearch();
    var FeeArray = createFeesSearch(lastCheckPostedDate);
    var prevExternalId;

    for (var i in FeeArray){
      try{
      //log.debug('prev',prevExternalId);
      var feeRec = FeeArray[i];
      var currExternalId = feeRec.settlementId + '-' + feeRec.postedDate;
      //log.debug('curr',currExternalId);
      var upc = feeRec.sku.split('.',1);
      if(upc[0] == 'amzn'){
        upc = feeRec.sku.split('.',3);
        var itemArray = createItemSearch(upc[2]);
      }
      else{
        var itemArray = createItemSearch(upc[0]);
      }
      var itemRec = itemArray[0]
      //log.debug('itemRec.market',itemRec.market);

      var date = feeRec.postedDate.split('-');
      var dateYear = date[0]
      var dateMonthIndex = Number(date[1]) - 1;
      var dateDay = date[2]
      //log.debug('title',new Date(dateYear,dateMonthIndex,dateDay));
      var sublistId = 'item';
      if(currInternalId == -1){
        currExternalId = feeRec.settlementId + '-' + feeRec.postedDate;
        log.debug('currExternalId',currExternalId);
        var feeCheck = record.create({
          type:'check',
          isDynamic:true
        });
        feeCheck.setValue({
          fieldId:'account',
          value:'446'
        });
        feeCheck.setValue({
          fieldId:'entity',
          value:'166'
        });
        feeCheck.setValue({
          fieldId:'memo',
          value:currExternalId
        });
        feeCheck.setValue({
          fieldId:'trandate',
          value: new Date(dateYear,dateMonthIndex,dateDay)
        });
        feeCheck.setValue({
          fieldId:'tobeprinted',
          value:true
        });
        feeCheck.setValue({
          fieldId:'externalid',
          value:currExternalId
        });
        if(feeRec.feeType == 'Commission'){
          feeCheck.selectNewLine({
            sublistId:sublistId
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'item',
            value:'1054'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'quantity',
            value:'1'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'rate',
            value:Math.abs(feeRec.amount)
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'department',
            value:'8'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'location',
            value:'3'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'class',
            value:itemRec.market
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'custcol_f3_tphitem',
            value:itemRec.internalid
          });
          feeCheck.commitLine({
            sublistId: sublistId
          });
        }
        else if(feeRec.feeType == 'FBAPerUnitFulfillmentFee'){
          feeCheck.selectNewLine({
            sublistId:sublistId
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'item',
            value:'1055'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'quantity',
            value:'1'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'rate',
            value:Math.abs(feeRec.amount)
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'department',
            value:'8'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'location',
            value:'3'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'class',
            value:itemRec.market
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'custcol_f3_tphitem',
            value:itemRec.internalid
          });
          feeCheck.commitLine({
            sublistId: sublistId
          });
        }
        currInternalId = feeCheck.save();
        prevExternalId = feeRec.settlementId + '-' + feeRec.postedDate;
        lastCheckInternalId = currInternalId;
        lastCheckPostedDate = feeRec.postedDate;
      }
      else if (currExternalId == prevExternalId){
        record.load({
          type:'check',
          id:currInternalId
        });
        if(feeRec.feeType == 'Commission'){
          feeCheck.selectNewLine({
            sublistId:sublistId
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'item',
            value:'1054'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'quantity',
            value:'1'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'rate',
            value:Math.abs(feeRec.amount)
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'department',
            value:'8'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'location',
            value:'3'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'class',
            value:itemRec.market
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'custcol_f3_tphitem',
            value:itemRec.internalid
          });
          feeCheck.commitLine({
            sublistId: sublistId
          });
        }
        else if(feeRec.feeType == 'FBAPerUnitFulfillmentFee'){
          feeCheck.selectNewLine({
            sublistId:sublistId
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'item',
            value:'1055'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'quantity',
            value:'1'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'rate',
            value:Math.abs(feeRec.amount)
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'department',
            value:'8'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'location',
            value:'3'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'class',
            value:itemRec.market
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'custcol_f3_tphitem',
            value:itemRec.internalid
          });
          feeCheck.commitLine({
            sublistId: sublistId
          });
        }
        currInternalId = feeCheck.save();
        lastCheckInternalId = currInternalId;
        lastCheckPostedDate = feeRec.postedDate;
      }
      else{
        currExternalId = feeRec.settlementId + '-' + feeRec.postedDate;
        log.debug('currExternalId',currExternalId + ' - Remaining Governace: ' + runtime.getCurrentScript().getRemainingUsage());
        var feeCheck = record.create({
          type:'check',
          isDynamic:true
        });
        feeCheck.setValue({
          fieldId:'account',
          value:'446'
        });
        feeCheck.setValue({
          fieldId:'entity',
          value:'166'
        });
        feeCheck.setValue({
          fieldId:'memo',
          value:currExternalId
        });
        feeCheck.setValue({
          fieldId:'trandate',
          value:new Date(dateYear,dateMonthIndex,dateDay)
        });
        feeCheck.setValue({
          fieldId:'tobeprinted',
          value:true
        });
        feeCheck.setValue({
          fieldId:'externalid',
          value:currExternalId
        });
        if(feeRec.feeType == 'Commission'){
          feeCheck.selectNewLine({
            sublistId:sublistId
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'item',
            value:'1054'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'quantity',
            value:'1'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'rate',
            value:Math.abs(feeRec.amount)
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'department',
            value:'8'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'location',
            value:'3'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'class',
            value:itemRec.market
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'custcol_f3_tphitem',
            value:itemRec.internalid
          });
          feeCheck.commitLine({
            sublistId: sublistId
          });
        }
        else if(feeRec.feeType == 'FBAPerUnitFulfillmentFee'){
          feeCheck.selectNewLine({
            sublistId:sublistId
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'item',
            value:'1055'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'quantity',
            value:'1'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'rate',
            value:Math.abs(feeRec.amount)
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'department',
            value:'8'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'location',
            value:'3'
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'class',
            value:itemRec.market
          });
          feeCheck.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'custcol_f3_tphitem',
            value:itemRec.internalid
          });
          feeCheck.commitLine({
            sublistId: sublistId
          });
        }
        currInternalId = feeCheck.save();
        prevExternalId = feeRec.settlementId + '-' + feeRec.postedDate;
        lastCheckInternalId = currInternalId;
        lastCheckPostedDate = feeRec.postedDate;
      }
      //log.debug('Script looping', 'Script is looping. Remaining Governance: ' + runtime.getCurrentScript().getRemainingUsage());
      if (runtime.getCurrentScript().getRemainingUsage() < 200) {
        log.debug('Rescheduling',"Rescheduling Script: customdeploy_tph_amz_setmnt_rep_trans_od");
        log.debug('lastcheckid',lastCheckInternalId);
        log.debug('lastcheckpostedDate',lastCheckPostedDate);
        var taskId = rescheduleCurrentScript(lastCheckPostedDate,lastCheckInternalId);
        //log.debug('Rescheduling','Rescheduling status: ' + task.checkStatus(taskId));
        return;
        log.debug('Script Complete', 'Script has been Completed. Remaining Governance: ' + runtime.getCurrentScript().getRemainingUsage());
      }
    }catch(error){
      log.debug('Error Occured', 'SKU ' + itemRec.displayname + ' was not successful. Error: ' + error);
    }
    }
    log.debug('Script Complete', 'Script has been Completed. Remaining Governance: ' + runtime.getCurrentScript().getRemainingUsage());
  }



  function createFeesSearch(LastCheckPostedDate) {
    // Searches for the Active Supply Planning Frequency Records

    var lastCheckPostedDateString;
    var customrecord_celigo_amzio_settle_transSearchObj = search.create({
      type: "customrecord_celigo_amzio_settle_trans",
      filters:
      [
        ["custrecord_celigo_amzio_set_tran_type","anyof","1"], 
      "AND", 
      /*["custrecord_celigo_amzio_set_summary.custrecord_celigo_amzio_set_sum_settl_sd","after","daysago21"],*/
        ["custrecord_celigo_amzio_set_settlemnt_id","contains","8941"],
      "AND", 
      ["custrecord_celigo_amzio_set_f_par_trans.custrecord_celigo_amzio_set_f_fee_type","isnot","ShippingChargeBack"],
        "AND", 
        ["custrecord_celigo_amzio_set_posted_date","onorafter",LastCheckPostedDate]
      ],
      columns:
      [
        search.createColumn({
          name: "custrecord_celigo_amzio_set_settlemnt_id",
          summary: "GROUP",
          sort: search.Sort.ASC,
          label: "Settlement Id"
        }),
        search.createColumn({
          name: "custrecord_celigo_amzio_set_posted_date",
          summary: "GROUP",
          sort: search.Sort.ASC,
          label: "Posted Date"
        }),
        search.createColumn({
          name: "custrecord_celigo_amzio_set_ip_ord_sku",
          join: "CUSTRECORD_CELIGO_AMZIO_SET_IP_PAR_TRANS",
          summary: "GROUP",
          sort: search.Sort.ASC,
          label: "SKU"
        }),
        search.createColumn({
          name: "custrecord_celigo_amzio_set_f_fee_type",
          join: "CUSTRECORD_CELIGO_AMZIO_SET_F_PAR_TRANS",
          summary: "GROUP",
          label: "Fee Type"
        }),
        search.createColumn({
          name: "custrecord_celigo_amzio_set_f_amount",
          join: "CUSTRECORD_CELIGO_AMZIO_SET_F_PAR_TRANS",
          summary: "SUM",
          label: "Amount"
        }),
        search.createColumn({
          name: "custrecord_celigo_amzio_set_summary",
          summary: "MAX",
          label: "Settlement Summary Parent"
        }),
        search.createColumn({
          name: "custrecord_celigo_amzio_set_marketplace",
          summary: "MAX",
          label: "Marketplace Name"
        })
      ]
    });
    var searchResultCount = customrecord_celigo_amzio_settle_transSearchObj.runPaged().count;

    var feeArray = new Array();
    customrecord_celigo_amzio_settle_transSearchObj.run().each(function(result){
      //log.debug('nine',result.getValue({name:"custrecord_celigo_amzio_set_posted_date"}));
      feeArray.push({
        settlementId:result.getValue({name:"custrecord_celigo_amzio_set_settlemnt_id",summary:"GROUP"}),
        postedDate:result.getValue({name:"custrecord_celigo_amzio_set_posted_date",summary:"GROUP"}),
        sku:result.getValue({name:"custrecord_celigo_amzio_set_ip_ord_sku",summary:"GROUP",join:"CUSTRECORD_CELIGO_AMZIO_SET_IP_PAR_TRANS"}),
        feeType:result.getValue({name:"custrecord_celigo_amzio_set_f_fee_type",summary:"GROUP",join:"CUSTRECORD_CELIGO_AMZIO_SET_F_PAR_TRANS"}),
        amount:result.getValue({name:"custrecord_celigo_amzio_set_f_amount",summary:"SUM",join:"CUSTRECORD_CELIGO_AMZIO_SET_F_PAR_TRANS"}),
        setSummary:result.getValue({name:"custrecord_celigo_amzio_set_summary",summary:"MAX"}),
        marketplace:result.getValue({name:"custrecord_celigo_amzio_set_marketplace",summary:"MAX"})
      });
      return true;
    });
    return feeArray;
  }


  function createItemSearch(UPC) {
    // Searches for the Active Supply Planning Frequency Records

    var itemSearchObj = search.create({
      type: "item",
      filters:
      [
        ["isinactive","is","F"], 
        "AND", 
        ["upccode","is",UPC]
      ],
      columns:
      [
        search.createColumn({name: "internalid", label: "Internal ID"}), 
        search.createColumn({name: "externalid", label: "External ID"}),
        search.createColumn({name: "displayname", label: "Display Name"}),
        search.createColumn({name: "class", label: "Market"})
      ]
    });
    var searchResultCount = itemSearchObj.runPaged().count;
    //log.debug("itemSearchObj result count",searchResultCount);
    var itemObj = itemSearchObj.run().getRange({
      start:0,
      end:1
    })[0];

    //log.debug('itemRec',itemObj);
    var itemRec = new Array();
    itemRec.push({
      internalid:itemObj.getValue(itemObj.columns[0]),
      externalid:itemObj.getValue(itemObj.columns[1]),
      displayname:itemObj.getValue(itemObj.columns[2]),
      market:itemObj.getValue(itemObj.columns[3])
    });
    return itemRec;
  }



  /*
 * 
 * 
 * Helper Functions
 * DO NOT REMOVE
 * 
 */
  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }

  if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
      targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
      padString = String((typeof padString !== 'undefined' ? padString : ' '));
      if (this.length > targetLength) {
        return String(this);
      }
      else {
        targetLength = targetLength-this.length;
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
        }
        return padString.slice(0,targetLength) + String(this);
      }
    };
  }

  function rescheduleCurrentScript(LastCheckPostedDate,LastCheckInternalId) {
    var scheduledScriptTask = task.create({
      taskType: task.TaskType.SCHEDULED_SCRIPT
    });
    scheduledScriptTask.scriptId = runtime.getCurrentScript().id;
    scheduledScriptTask.deploymentId = 'customdeploy_tph_amz_setmnt_rep_trans_od'
    scheduledScriptTask.params = {
      'custscript_tph_last_check_date' : LastCheckPostedDate,
      'custscript_tph_last_check_id' : LastCheckInternalId
    };
    return scheduledScriptTask.submit();
  }


  exports.execute = execute;
  return exports;
});