define(["N/record","N/log","N/search","N/ui/dialog","N/runtime","N/task","SuiteScripts/Supply Planning/SupplyPlanningCreateWorkOrder","SuiteScripts/Supply Planning/SupplyPlanningCreateTransferOrder","SuiteScripts/Supply Planning/SupplyPlanningCreatePurchaseOrder"], function(record,log,search,dialog,runtime,task,WO,TO,PO) {
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
    var lastSupplyFreqRecID = scriptObj.getParameter({name:'custscript_tph_last_sup_freq_rec'});
    var lastDOCRecID = scriptObj.getParameter({name:'custscript_tph_last_doc_rec'});
    var lastEDOCRecID = scriptObj.getParameter({name:'custscript_tph_last_edoc_rec'});
    var skipRunDate = scriptObj.getParameter({name:'custscript_tph_skip_run_date'});
    var skipCancelWO = scriptObj.getParameter({name:'custscript_tph_skip_cancel_wo'});
    //var skipCancelWO = true;
    //log.debug('lastDOCRecID',lastDOCRecID);
    //log.debug('lastEDOCRecID',lastEDOCRecID);
    //log.debug('lastSupplyFreqRecID',lastSupplyFreqRecID);
    //log.debug('skipRunDate',skipRunDate);
    //log.debug('skipCancelWO',skipCancelWO);
    //var parameterEDOC = scriptObj.getParameter({name:"custscript_tph_e_wo_doc_id"});

    /*
     * 
     * Main Function
     * 
     * 
     */

    // Loads All Supply Planning Frequency Record
    var supplyFreqRecArray = createSupplyFreqSearch(lastSupplyFreqRecID);

    // Loops through Supply Planning Frequency Records
    for(var i in supplyFreqRecArray) {
      var supplyFreqRec = supplyFreqRecArray[i];

      // Date Check
      if(skipRunDate == false){
        var runDate = dateCheck(supplyFreqRec.id,supplyFreqRec.planningCycle,supplyFreqRec.nextRun);
      }
      if(runDate == true || skipRunDate == true) {
        skipRunDate = 'T';

        var locationArr = search.lookupFields({
          type:'location',
          id:supplyFreqRec.location,
          columns:['custrecord_tph_loc_dft_prod_time','custrecord_f3_lotsizemethod']
        });
        var locationProdTime = locationArr[0];
        var locationLotSizeMethod = locationArr[1];

        if(supplyFreqRec.orderType == '2') {

          var cancelCount = 1;
          if(skipCancelWO == false){
            var reSche = false;
            skipCancelWO = 'F';

            // Cancel all Planned WOs
            var plannedWOSearch = search.create({
              type: "workorder",
              filters:
              [
                ["type","anyof","WorkOrd"], 
                "AND", 
                ["status","anyof","WorkOrd:A"],
                "AND",
                ["mainline","is","T"]
              ],
              columns:
              [
                search.createColumn({
                  name: "internalid",
                  label: "Internal Id"
                })
              ]
            });
            log.debug('Cancelling Planned WOs','Planned WOs are being Cancelled.');
            plannedWOSearch.run().each(function(result){
              var oldPlanRec = record.load({
                type:'workorder',
                id:result.getValue({name:'internalid'})
              });
              //log.debug('oldPlanRec',oldPlanRec)
              oldPlanRec.setValue({
                fieldId:'orderstatus',
                value:'C'
              });
              oldPlanRec.save();
              cancelCount++;
              if (runtime.getCurrentScript().getRemainingUsage() < 500) {
                //log.debug('lastDOCRecID',lastDOCRecID);
                //log.debug('lastEDOCRecID',lastEDOCRecID);
                //log.debug('lastSupplyFreqRecID',lastSupplyFreqRecID);
                //log.debug('skipRunDate',skipRunDate);
                //log.debug('Rescheduling',"Rescheduling Script: customdeploy_tph_supply_plan_main_od");
                //var taskId = rescheduleCurrentScript(lastSupplyFreqRecID,lastEDOCRecID,lastDOCRecID,skipRunDate,skipCancelWO);
                //log.debug('Rescheduling','Rescheduling status: ' + task.checkStatus(taskId));
                reSche = true; 
                return false;
              }
              return true;
            });
            if(reSche == true){
              log.debug('Rescheduling - Cancelling',"Rescheduling Script: customdeploy_tph_supply_plan_main_od. Cancel Count: " + cancelCount);
              var taskId = rescheduleCurrentScript(lastSupplyFreqRecID,lastEDOCRecID,lastDOCRecID,skipRunDate,skipCancelWO);
              return;
            }
            else{
              log.debug('Cancelling Planned WOs Complete','Planned WOs have been Cancelled.');
              skipCancelWO = 'T';
              var taskId = rescheduleCurrentScript(lastSupplyFreqRecID,lastEDOCRecID,lastDOCRecID,skipRunDate,skipCancelWO);
              return;
            }
            //Finshed Cancelling Planned WOs
          }
          skipCancelWO = 'T';

          var EDOCArray = createEDOCSearch(supplyFreqRec,lastEDOCRecID);

          for(var j in EDOCArray){
            var EWOID = WO.createEWorkOrder(supplyFreqRec,EDOCArray[j]);
            lastEDOCRecID = EDOCArray[j].id
          }

          var DOCArray = createDOCSearch(supplyFreqRec,lastDOCRecID);
          for(var j in DOCArray){
            var WOIDs = WO.createCycleWOs(supplyFreqRec,DOCArray[j]);

            if(WOIDs == false){
              log.debug('Complete', 'No WOs Created - Replen Frequency ID: ' + supplyFreqRec.id + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
            }
            else{
              log.debug('Complete', 'Success - Replen Frequency ID: ' + supplyFreqRec.id + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
              for(var k in WOIDs){
                log.debug('WOIDs', 'Work Order ID ' + WOIDs[k]);
              }
            }
            lastDOCRecID = DOCArray[j].id
            if (runtime.getCurrentScript().getRemainingUsage() < 1500) {
              //log.debug('lastDOCRecID',lastDOCRecID);
              //log.debug('lastEDOCRecID',lastEDOCRecID);
              //log.debug('lastSupplyFreqRecID',lastSupplyFreqRecID);
              //log.debug('skipRunDate',skipRunDate);
              log.debug('Rescheduling',"Rescheduling Script: customdeploy_tph_supply_plan_main_od");
              var taskId = rescheduleCurrentScript(lastSupplyFreqRecID,lastEDOCRecID,lastDOCRecID,skipRunDate,skipCancelWO);
              //log.debug('Rescheduling','Rescheduling status: ' + task.checkStatus(taskId));
              return;
            }
          }
          skipRunDate = 'F';
          lastDOCRecID = 0;
          lastEDOCRecID = 0;
          skipCancelWO = 'F';
          lastSupplyFreqRecID = supplyFreqRec.id;
          log.debug('Rescheduling',"Rescheduling Script: " + runtime.getCurrentScript().deploymentId);
          var taskId = rescheduleCurrentScript(lastSupplyFreqRecID,lastEDOCRecID,lastDOCRecID,skipRunDate);
          return;
        }

        // Start of WIP TOs Creation/Deletion
        else if(supplyFreqRec.orderType == '101') {
          // Remove Unfirmed TOs
          if(skipCancelWO == false){
            var removedTOs = TO.deleteTOs(supplyFreqRec);
            switch(removedTOs){
              case true:
                log.debug('Complete', 'Unfirmed TOs to ' + supplyFreqRec.location + ' have been closed - Replen Frequency ID: ' + supplyFreqRec.id + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
                break;
              default:
                log.debug('Failure', 'Unfirmed TOs to ' + supplyFreqRec.location + ' have been closed - Replen Frequency ID: ' + supplyFreqRec.id + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
                break;
            }

            // Create Emergency TOs
            var ETOArray = createETOSearch(supplyFreqRec);
            var ETOID = TO.createETransOrder(supplyFreqRec,ETOArray);
            if(ETOID == true){
              log.debug('Complete', 'TOs Created - Replen Frequency ID: ' + supplyFreqRec.id + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
            }
            else{
              log.debug('Complete without TOs', 'No TOs Created - Replen Frequency ID: ' + supplyFreqRec.id + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
            }
          }
          skipCancelWO = 'T';
          if (lastDOCRecID == 0){
            var cycleCount = 3;
          }
          else{
            var cycleCount = lastDOCRecID;
          }

          // Create Cycle TOs
          for(var cycle = cycleCount; cycle<=Number(supplyFreqRec.planningHorizon); cycle++){

            var TOSearchResult = createTOSearch(supplyFreqRec,cycle);
            var cycleTOArray = TOSearchResult[0];
            var cycleDate = TOSearchResult[1];
            log.debug('TOSearchResult',cycleTOArray + ' - ' + cycleDate);
            var TOID = TO.createCycleTOs(supplyFreqRec,cycleTOArray,cycleDate,cycle);

            lastDOCRecID = cycle + 1;
            if (runtime.getCurrentScript().getRemainingUsage() < 2000) {
              //log.debug('lastDOCRecID',lastDOCRecID);
              //log.debug('lastEDOCRecID',lastEDOCRecID);
              //log.debug('lastSupplyFreqRecID',lastSupplyFreqRecID);
              //log.debug('skipRunDate',skipRunDate);
              log.debug('Rescheduling - Cycle TOs',"Rescheduling Script: customdeploy_tph_supply_plan_main_od");
              var taskId = rescheduleCurrentScript(lastSupplyFreqRecID,lastEDOCRecID,lastDOCRecID,skipRunDate,skipCancelWO);
              //log.debug('Rescheduling','Rescheduling status: ' + task.checkStatus(taskId));
              return;
            }

          }
          skipRunDate = 'F';
          skipCancelWO = 'F';
          lastDOCRecID = 0;
          lastSupplyFreqRecID = supplyFreqRec.id;
          log.debug('Rescheduling',"Rescheduling Script: " + runtime.getCurrentScript().deploymentId);
          var taskId = rescheduleCurrentScript(lastSupplyFreqRecID,lastEDOCRecID,lastDOCRecID,skipRunDate);
          return;
        }// End of TO Creation

        // Start of PO Creation/Deletion
        else if(supplyFreqRec.orderType == '1') {


          if(supplyFreqRec.location != '3'){
            // Remove Pending Approval POs
            if (skipCancelWO == false){
              var removedPOs = PO.deletePOs(supplyFreqRec,supplyFreqRec.location);

              // Create Emergency POs
              var EPOArray = createEPOSearch(supplyFreqRec);
              var EPOID = PO.createEPurchaseOrder(supplyFreqRec,EPOArray);
              if(ETOID == true){
                log.debug('Complete', 'POs Created - Replen Frequency ID: ' + supplyFreqRec.id + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
              }
              else{
                log.debug('Complete without POs', 'No POs Created - Replen Frequency ID: ' + supplyFreqRec.id + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
              }
            }
            skipCancelWO = 'T';
            if (lastDOCRecID == 0){
              var cycleCount = 2;
            }
            else{
              var cycleCount = lastDOCRecID;
            }

            // Create Cycle POs
            for(var cycle = cycleCount; cycle<=Number(supplyFreqRec.planningHorizon); cycle++){
              var POSearchResult = createPOSearch(supplyFreqRec,cycle);
              var cyclePOArray = POSearchResult[0];
              var cycleDate = POSearchResult[1];
              var POID = PO.createCyclePOs(supplyFreqRec,cyclePOArray,cycleDate,cycle);

              lastDOCRecID = cycle + 1;
              if (runtime.getCurrentScript().getRemainingUsage() < 2000) {
                //log.debug('lastDOCRecID',lastDOCRecID);
                //log.debug('lastEDOCRecID',lastEDOCRecID);
                //log.debug('lastSupplyFreqRecID',lastSupplyFreqRecID);
                //log.debug('skipRunDate',skipRunDate);
                log.debug('Rescheduling - Cycle TOs',"Rescheduling Script: customdeploy_tph_supply_plan_main_od");
                var taskId = rescheduleCurrentScript(lastSupplyFreqRecID,lastEDOCRecID,lastDOCRecID,skipRunDate,skipCancelWO);
                //log.debug('Rescheduling','Rescheduling status: ' + task.checkStatus(taskId));
                return;
              }

            }
          }
          else{
            if (lastDOCRecID == 0){
              var cycleCount = 2;
            }
            else{
              var cycleCount = lastDOCRecID;
            }

            for(var cycle = cycleCount; cycle<Number(supplyFreqRec.planningHorizon); cycle++){
              var POSearchResult = createFBAUSPO(supplyFreqRec,cycle);
              if(cycle == 2 && POSearchResult[0].length != 0 && skipCancelWO == false){
                var removedPOs = PO.deletePOs(supplyFreqRec,POSearchResult[0][0].transloadLoc)
                skipCancelWO = 'T';
              }

              var cyclePOArray = POSearchResult[0];
              var cycleDate = POSearchResult[1];
              var POID = PO.createCycleFBAUSPOs(supplyFreqRec,cyclePOArray,cycleDate,cycle);

              lastDOCRecID = cycle + 1;
              if (runtime.getCurrentScript().getRemainingUsage() < 2000) {
                //log.debug('lastDOCRecID',lastDOCRecID);
                //log.debug('lastEDOCRecID',lastEDOCRecID);
                //log.debug('lastSupplyFreqRecID',lastSupplyFreqRecID);
                //log.debug('skipRunDate',skipRunDate);
                log.debug('Rescheduling - Cycle TOs',"Rescheduling Script: customdeploy_tph_supply_plan_main_od");
                var taskId = rescheduleCurrentScript(lastSupplyFreqRecID,lastEDOCRecID,lastDOCRecID,skipRunDate,skipCancelWO);
                //log.debug('Rescheduling','Rescheduling status: ' + task.checkStatus(taskId));
                return;
              }
            }
          }
          skipRunDate = 'F';
          skipCancelWO = 'F';
          lastDOCRecID = 0;
          lastSupplyFreqRecID = supplyFreqRec.id;
          log.debug('Rescheduling',"Rescheduling Script: " + runtime.getCurrentScript().deploymentId);
          var taskId = rescheduleCurrentScript(lastSupplyFreqRecID,lastEDOCRecID,lastDOCRecID,skipRunDate);
          return;
        }// End of PO Creation/Deletion
      }
      else{
        log.debug('Complete','NextRunDate Mismatch - Replen Frequency ID: ' + supplyFreqRec.id);
      }
      lastSupplyFreqRecID = supplyFreqRec.id;
    }
    log.debug('Script Complete', 'Script has been Completed. Remaining Governance: ' + runtime.getCurrentScript().getRemainingUsage());
  }


  function createSupplyFreqSearch(LastSupplyFreqRecID) {
    // Searches for the Active Supply Planning Frequency Records

    var customrecord_tph_supply_planning_freqSearchObj = search.create({
      type: "customrecord_tph_supply_planning_freq",
      filters:
      [
        ["isinactive","is","F"],
        "AND",
        ["internalidnumber","greaterthan",LastSupplyFreqRecID]
      ],
      columns:
      [
        search.createColumn({
          name: "internalid",
          sort: search.Sort.ASC,
          label: "Internal ID"
        }),
        search.createColumn({name: "custrecord_tph_supplan_location", label: "Location"}),
        search.createColumn({name: "custrecord_tph_supplan_order_type", label: "Order Type"}),
        search.createColumn({name: "custrecord_tph_supplan_plan_horizon", label: "Planning Horizon (Cycles)"}),
        search.createColumn({name: "custrecord_tph_supplan_plan_cycle", label: "Planning Cycle (Days)"}),
        search.createColumn({name: "custrecord_tph_supplan_target_doc", label: "Target DOC"}),
        search.createColumn({name: "custrecord_tph_supplan_min_doc", label: "Minimum DOC"}),
        search.createColumn({name: "custrecord_tph_supplan_last_run", label: "Last Run Date"}),
        search.createColumn({name: "custrecord_tph_supplan_next_run", label: "Next Run Date"})
      ]
    });
    var searchResultCount = customrecord_tph_supply_planning_freqSearchObj.runPaged().count;
    //log.debug("customrecord_tph_supply_planning_freqSearchObj result count",searchResultCount);
    var freqArray = new Array();
    customrecord_tph_supply_planning_freqSearchObj.run().each(function(result){
      freqArray.push({
        id:result.getValue({name:"internalid"}),
        location:result.getValue({name:"custrecord_tph_supplan_location"}),
        orderType:result.getValue({name:"custrecord_tph_supplan_order_type"}),
        planningHorizon:result.getValue({name:"custrecord_tph_supplan_plan_horizon"}),
        planningCycle:result.getValue({name:"custrecord_tph_supplan_plan_cycle"}),
        tarDOC:result.getValue({name:"custrecord_tph_supplan_target_doc"}),
        minDOC:result.getValue({name:"custrecord_tph_supplan_min_doc"}),
        lastRun:result.getValue({name:"custrecord_tph_supplan_last_run"}),
        nextRun:result.getValue({name:"custrecord_tph_supplan_next_run"})
      });
      return true;
    });
    return freqArray;
  }


  function dateCheck(ID,PlanningCycle,NextRun) {
    /*
     * Compares the next run date to the current day
     * 
     * If next run date equals today 
     * then set last rundate to today and nextrun date plus freq and run script
     * else NextRunDate Mismatch
     */
    var today = new Date();
    var todayDay = today.getDay();
    var todayYear = today.getFullYear();
    var todayMonth = String(today.getMonth() + 1).padStart(2,'0'); // January is 0
    var todayDate = String(today.getDate()).padStart(2,'0');
    var todayString = (todayYear + '-' + todayMonth + '-' + todayDate);
    if(todayString == NextRun){
      /*if(todayDay == 6 || todayDay == 0) {
        return false;
      }*/
      var nextRun = today.addDays(Number(PlanningCycle));
      var nextRunYear = nextRun.getFullYear();
      var nextRunMonth = String(nextRun.getMonth()+1).padStart(2,'0');
      var nextRunDate = String(nextRun.getDate()).padStart(2,'0');
      var nextRunDateString = (nextRunYear + '-' + nextRunMonth + '-' + nextRunDate);
      var freqRec = record.load({
        type:'customrecord_tph_supply_planning_freq',
        id:ID
      });
      freqRec.setValue({
        fieldId:'custrecord_tph_supplan_last_run',
        value:today
      });
      freqRec.setValue({
        fieldId:'custrecord_tph_supplan_next_run',
        value:nextRun
      });
      freqRec.save();
      return true;
    }
    return false;
  }


  function createEDOCSearch(SupplyFreqObj,LastEDOCRecID) {
    var customrecord_tph_days_of_invSearchObj = search.create({
      type: "customrecord_tph_days_of_inv",
      filters:
      [
        ["custrecord_tph_doi","lessthan",SupplyFreqObj.minDOC], 
        "AND", 
        ["custrecord_tph_doi_asin.custitem_tph_defaulmfglocation","anyof",SupplyFreqObj.location], 
        "AND", 
        ["custrecord_tph_doi_marketplace","anyof","@NONE@"],
        "AND",
        ["custrecord_tph_doi_asin.isinactive","is","F"], 
        "AND", 
        ["custrecord_tph_doi_asin.custitem_tph_po_wo_hold","is","F"], 
        "AND", 
        ["internalidnumber","greaterthan",LastEDOCRecID]
        //,
        //"AND",
        //["custrecord_tph_doi_asin","anyof","171"]
      ],
      columns:
      [
        search.createColumn({name: "internalid",
                             sort: search.Sort.ASC,
                             label: "Internal ID"}),
        search.createColumn({name: "externalid", label: "External ID"}),
        search.createColumn({
          name: "custrecord_tph_doi_asin",
          label: "ASIN"
        }),
        search.createColumn({name: "custrecord_tph_doi", label: "Days of Inventory"}),
        search.createColumn({name: "custrecord_tph_ppsv_doi", label: "PPSV"}),
        search.createColumn({
          name: "reordermultiple",
          join: "CUSTRECORD_TPH_DOI_ASIN",
          label: "Reorder Multiple"
        }),
        search.createColumn({name: "custrecord167", label: "Quantity In Marketplace"}),
        search.createColumn({name: "custrecord_tph_qty_on_po_and_wo", label: "Quantity on POs and WOs"})
      ]
    });
    var searchResultCount = customrecord_tph_days_of_invSearchObj.runPaged().count;
    var DOCArr = new Array()
    log.debug("EDOCArray result count",searchResultCount);
    customrecord_tph_days_of_invSearchObj.run().each(function(result){
      DOCArr.push({
        id:result.getValue({name:'internalid'}),
        externalId:result.getValue({name:'externalid'}),
        asin:result.getValue({name:'custrecord_tph_doi_asin'}),
        doi:result.getValue({name:'custrecord_tph_doi'}),
        ppsv:result.getValue({name:'custrecord_tph_ppsv_doi'}),
        reorderMultiple:result.getValue({name:'reordermultiple',join:'CUSTRECORD_TPH_DOI_ASIN'}),
        qtyInFG:result.getValue({name:'custrecord167'}),
        qtyOnPOWO:result.getValue({name:'custrecord_tph_qty_on_po_and_wo'})
      });
      return true;
    });
    return DOCArr;
  }


  function createDOCSearch(SupplyFreqObj,LastDOCRecID) {
    var customrecord_tph_days_of_invSearchObj = search.create({
      type: "customrecord_tph_days_of_inv",
      filters:
      [
        ["custrecord_tph_doi_asin.custitem_tph_defaulmfglocation","anyof",SupplyFreqObj.location], 
        "AND", 
        ["custrecord_tph_doi_marketplace","anyof","@NONE@"],
        "AND",
        ["custrecord_tph_doi_asin.isinactive","is","F"], 
        "AND", 
        ["custrecord_tph_doi_asin.custitem_tph_po_wo_hold","is","F"], 
        "AND", 
        ["internalidnumber","greaterthan",LastDOCRecID]
        //,
        //"AND",
        //["custrecord_tph_doi_asin","anyof","171"]
      ],
      columns:
      [
        search.createColumn({name: "internalid", sort: search.Sort.ASC, label: "Internal ID"}),
        search.createColumn({name: "externalid", label: "External ID"}),
        search.createColumn({
          name: "custrecord_tph_doi_asin",
          label: "ASIN"
        }),
        search.createColumn({name: "custrecord_tph_doi", label: "Days of Inventory"}),
        search.createColumn({name: "custrecord_tph_ppsv_doi", label: "PPSV"}),
        search.createColumn({
          name: "reordermultiple",
          join: "CUSTRECORD_TPH_DOI_ASIN",
          label: "Reorder Multiple"
        }),
        search.createColumn({name: "custrecord167", label: "Quantity In Marketplace"}),
        search.createColumn({name: "custrecord_tph_qty_on_po_and_wo", label: "Quantity on POs and WOs"})
      ]
    });
    var searchResultCount = customrecord_tph_days_of_invSearchObj.runPaged().count;
    var DOCArr = new Array()
    log.debug("DOCArray result count",searchResultCount);
    customrecord_tph_days_of_invSearchObj.run().each(function(result){
      DOCArr.push({
        id:result.getValue({name:'internalid'}),
        externalId:result.getValue({name:'externalid'}),
        asin:result.getValue({name:'custrecord_tph_doi_asin'}),
        doi:result.getValue({name:'custrecord_tph_doi'}),
        ppsv:result.getValue({name:'custrecord_tph_ppsv_doi'}),
        reorderMultiple:result.getValue({name:'reordermultiple',join:'CUSTRECORD_TPH_DOI_ASIN'}),
        qtyInFG:result.getValue({name:'custrecord167'}),
        qtyOnPOWO:result.getValue({name:'custrecord_tph_qty_on_po_and_wo'})
      });
      return true;
    });
    return DOCArr;
  }


  function createETOSearch(SupplyFreqRec){
    var workorderSearchObj = search.create({
      type: "workorder",
      filters:
      [
        ["type","anyof","WorkOrd"], 
        "AND", 
        ["mainline","is","F"], 
        "AND", 
        ["status","anyof","WorkOrd:B"], 
        "AND", 
        ["item.custitem_tph_item_default_fg_location","anyof",SupplyFreqRec.location], 
        "AND", 
        ["item.custitem_tph_transload_loc","noneof","@NONE@"]
      ],
      columns:
      [
        search.createColumn({
          name: "item",
          summary: "GROUP",
          label: "Item"
        }),
        search.createColumn({
          name: "formulanumeric",
          summary: "SUM",
          formula: "NVL({quantity},'0') - NVL({quantitycommitted},'0')",
          label: "Formula (Numeric)"
        }),
        search.createColumn({
          name: "vendor",
          join: "item",
          summary: "MAX",
          label: "Preferred Vendor"
        }),
        search.createColumn({
          name: "custitem_tph_transload_loc",
          join: "item",
          summary: "MAX",
          sort: search.Sort.ASC,
          label: "Default Transload Location"
        }),
        search.createColumn({
          name: "formulanumeric",
          summary: "MAX",
          formula: "NVL({item.custitem_tph_distribution_multiple},'1')",
          label: "Formula (Numeric)"
        }),
        search.createColumn({
          name: "unitstype",
          join: "item",
          summary: "MAX",
          label: "Unit Type"
        }),
        search.createColumn({
          name: "stockunit",
          join: "item",
          summary: "MAX",
          label: "Stock Unit"
        })
      ]
    });
    var searchResultCount = workorderSearchObj.runPaged().count;
    //log.debug("workorderSearchObj result count",searchResultCount);
    var ETOArray = new Array();
    workorderSearchObj.run().each(function(result){
      // .run().each has a limit of 4,000 results
      //log.debug('qty Needed',result.getValue({name:'formulanumeric',summary:'SUM'}))

      if(result.getValue({name:'formulanumeric',summary:'SUM'}) != '0'){
        ETOArray.push({
          item:result.getValue({name:'item',summary:'GROUP'}),
          quantityNeed:result.getValue({name:'formulanumeric',summary:'SUM'}),
          vendor:result.getValue({name:'vendor',summary:'MAX',join:'item'}),
          transloadLoc:result.getValue({name:'custitem_tph_transload_loc',summary:'MAX',join:'item'}),
          distMultiple:result.getValue({name:'formulanumeric',summary:'MAX'}),
          baseUnit:result.getValue({name:'unitstype',summary:'MAX',join:'item'}),
          stockUnit:result.getValue({name:'stockunit',summary:'MAX',join:'item'})
        });
      }

      return true;
    });
    return ETOArray;
  }


  function createTOSearch(SupplyFreqRec,cycle){
    var today = new Date()
    var cycle3Date = today.addDays(SupplyFreqRec.planningCycle * 2);
    var cycle3DateYear = cycle3Date.getFullYear();
    var cycle3DateMonth = cycle3Date.getMonth() + 1;
    var cycle3DateDay = cycle3Date.getDate();
    if(cycle3DateMonth.toString().length == 1){
      cycle3DateMonth = '0' + cycle3DateMonth;
    }
    if(cycle3DateDay.toString().length == 1){
      cycle3DateDay = '0' + cycle3DateDay;
    }
    var cycle3DateString = cycle3DateYear + '-' + cycle3DateMonth + '-' + cycle3DateDay;

    var cycleNDate = today.addDays((SupplyFreqRec.planningCycle * cycle) - 2);
    var cycleNDateYear = cycleNDate.getFullYear();
    var cycleNDateMonth = cycleNDate.getMonth() + 1;
    var cycleNDateDay = cycleNDate.getDate();
    if(cycleNDateMonth.toString().length == 1){
      cycleNDateMonth = '0' + cycleNDateMonth;
    }
    if(cycleNDateDay.toString().length == 1){
      cycleNDateDay = '0' + cycleNDateDay;
    }
    var cycleNDateString = cycleNDateYear + '-' + cycleNDateMonth + '-' + cycleNDateDay;

    var cycleNEndDate = today.addDays((SupplyFreqRec.planningCycle * (cycle + 1)) - 1);
    var cycleNEndDateYear = cycleNEndDate.getFullYear();
    var cycleNEndDateMonth = cycleNEndDate.getMonth() + 1;
    var cycleNEndDateDay = cycleNEndDate.getDate();
    if(cycleNEndDateMonth.toString().length == 1){
      cycleNEndDateMonth = '0' + cycleNEndDateMonth;
    }
    if(cycleNEndDateDay.toString().length == 1){
      cycleNEndDateDay = '0' + cycleNEndDateDay;
    }
    var cycleNEndDateString = cycleNEndDateYear + '-' + cycleNEndDateMonth + '-' + cycleNEndDateDay;

    var workorderSearchObj = search.create({
      type: "workorder",
      filters:
      [
        ["type","anyof","WorkOrd"], 
        "AND", 
        ["mainline","is","F"], 
        "AND", 
        ["status","anyof","WorkOrd:A"], 
        "AND", 
        ["item.custitem_tph_item_default_fg_location","anyof",SupplyFreqRec.location], 
        "AND", 
        ["item.custitem_tph_transload_loc","noneof","@NONE@"], 
        "AND", 
        ["trandate","within",cycle3DateString,cycleNEndDateString]
        //,
        //"AND",
        //["item","noneof","1056","1057"]
      ],
      columns:
      [
        search.createColumn({
          name: "item",
          summary: "GROUP",
          label: "Item"
        }),
        search.createColumn({
          name: "quantity",
          summary: "SUM",
          label: "Quantity"
        }),
        search.createColumn({
          name: "vendor",
          join: "item",
          summary: "MAX",
          label: "Preferred Vendor"
        }),
        search.createColumn({
          name: "custitem_tph_transload_loc",
          join: "item",
          summary: "MAX",
          sort: search.Sort.ASC,
          label: "Default Transload Location"
        }),
        search.createColumn({
          name: "custitem_tph_distribution_multiple",
          join: "item",
          summary: "MAX",
          label: "Reorder Multiple"
        }),
        search.createColumn({
          name: "formulanumeric",
          summary: "MAX",
          formula: "NVL({item.custitem_tph_distribution_multiple},'1')",
          label: "Formula (Numeric)"
        }),
        search.createColumn({
          name: "unitstype",
          join: "item",
          summary: "MAX",
          label: "Unit Type"
        }),
        search.createColumn({
          name: "stockunit",
          join: "item",
          summary: "MAX",
          label: "Stock Unit"
        })
      ]
    });
    var searchResultCount = workorderSearchObj.runPaged().count;
    //log.debug("workorderSearchObj result count",searchResultCount);
    var TOArray = new Array();
    workorderSearchObj.run().each(function(result){
      // .run().each has a limit of 4,000 results
      //log.debug('qty Needed',result.getValue({name:'formulanumeric',summary:'SUM'}))
      TOArray.push({
        item:result.getValue({name:'item',summary:'GROUP'}),
        quantityNeed:result.getValue({name:'quantity',summary:'SUM'}),
        vendor:result.getValue({name:'vendor',summary:'MAX',join:'item'}),
        transloadLoc:result.getValue({name:'custitem_tph_transload_loc',summary:'MAX',join:'item'}),
        distMultiple:result.getValue({name:'formulanumeric',summary:'MAX'}),
        baseUnit:result.getValue({name:'unitstype',summary:'MAX',join:'item'}),
        stockUnit:result.getValue({name:'stockunit',summary:'MAX',join:'item'})
      });

      return true;
    });

    return [TOArray,cycleNDate];
  }


  function createEPOSearch(SupplyFreqRec){
    var transferorderSearchObj = search.create({
      type: "transaction",
      filters:
      [
        [["type","anyof","TrnfrOrd"],"AND",["status","anyof","TrnfrOrd:B"],"AND",["mainline","is","F"],"AND",["firmed","is","T"],"AND",["location","anyof",SupplyFreqRec.location],"AND",["transferlocation","noneof","1","2","18","3","8"],"AND",["shipping","is","F"],"AND",["taxline","is","F"],"AND",["cogs","is","F"],"AND",["transactionlinetype","noneof","SHIPPING","RECEIVING"],"AND",["item.type","noneof","Discount"],"AND",["item.custitem_tph_transload_loc","anyof",SupplyFreqRec.location]], 
        "OR", 
        [["type","anyof","WorkOrd"],"AND",["status","anyof","WorkOrd:B"],"AND",["mainline","is","F"],"AND",["item.custitem_tph_transload_loc","anyof","@NONE@"],"AND",["item.custitem_tph_item_default_fg_location","anyof",SupplyFreqRec.location]]
      ],
      columns:
      [
        search.createColumn({
          name: "item",
          summary: "GROUP",
          label: "Item"
        }),
        search.createColumn({
          name: "quantity",
          summary: "SUM",
          label: "Quantity"
        }),
        search.createColumn({
          name: "formulanumeric",
          summary: "SUM",
          formula: "{quantity} - CASE WHEN NVL({transferorderquantitycommitted},0) = 0 THEN NVL({quantitycommitted},0) ELSE NVL({transferorderquantitycommitted},0) END",
          label: "Quantity Needed"
        }),
        search.createColumn({
          name: "vendor",
          join: "item",
          summary: "MAX",
          sort: search.Sort.ASC,
          label: "Preferred Vendor"
        }),
        search.createColumn({
          name: "formulanumeric",
          summary: "MAX",
          formula: "NVL({item.reordermultiple},'1')",
          label: "Formula (Numeric)"
        }),
        search.createColumn({
          name: "transferorderquantitycommitted",
          summary: "SUM",
          label: "Transfer Order Quantity Committed"
        }),
        search.createColumn({
          name: "purchaseunit",
          join: "item",
          summary: "MAX",
          label: "Primary Purchase Unit"
        }),
        search.createColumn({
          name: "unitstype",
          join: "item",
          summary: "MAX",
          label: "Primary Units Type"
        })
      ]
    });
    var searchResultCount = transferorderSearchObj.runPaged().count;
    log.debug("transferorderSearchObj result count",searchResultCount);
    var EPOArray = new Array();
    transferorderSearchObj.run().each(function(result){
      var qty = Math.abs(result.getValue({name:'formulanumeric',summary:'SUM'}))
      if(qty > 0){
        EPOArray.push({
          item:result.getValue({name:'item',summary:'GROUP'}),
          qtyNeed:Math.abs(result.getValue({name:'formulanumeric',summary:'SUM'})),
          vendor:result.getValue({name:'vendor',summary:'MAX',join:'item'}),
          reorderMultiple:result.getValue({name:'formulanumeric',summary:'MAX'}),
          baseUnit:result.getValue({name:'unitstype',summary:'MAX',join:'item'}),
          purchaseUnit:result.getValue({name:'purchaseunit',summary:'MAX',join:'item'})
        });
      }
      // .run().each has a limit of 4,000 results
      return true;
    });
    return EPOArray;
  }


  function createPOSearch(SupplyFreqRec,cycle){

    var today = new Date()
    var cycle3Date = today.addDays((SupplyFreqRec.planningCycle * 2) - 2);
    var cycle3DateYear = cycle3Date.getFullYear();
    var cycle3DateMonth = cycle3Date.getMonth() + 1;
    var cycle3DateDay = cycle3Date.getDate();
    if(cycle3DateMonth.toString().length == 1){
      cycle3DateMonth = '0' + cycle3DateMonth;
    }
    if(cycle3DateDay.toString().length == 1){
      cycle3DateDay = '0' + cycle3DateDay;
    }
    var cycle3DateString = cycle3DateYear + '-' + cycle3DateMonth + '-' + cycle3DateDay;

    var cycleNDate = today.addDays((SupplyFreqRec.planningCycle * cycle) - 2);
    var cycleNDateYear = cycleNDate.getFullYear();
    var cycleNDateMonth = cycleNDate.getMonth() + 1;
    var cycleNDateDay = cycleNDate.getDate();
    if(cycleNDateMonth.toString().length == 1){
      cycleNDateMonth = '0' + cycleNDateMonth;
    }
    if(cycleNDateDay.toString().length == 1){
      cycleNDateDay = '0' + cycleNDateDay;
    }
    var cycleNDateString = cycleNDateYear + '-' + cycleNDateMonth + '-' + cycleNDateDay;

    var cycleNEndDate = cycleNDate.addDays(SupplyFreqRec.planningCycle - 1);
    var cycleNEndDateYear = cycleNEndDate.getFullYear();
    var cycleNEndDateMonth = cycleNEndDate.getMonth() + 1;
    var cycleNEndDateDay = cycleNEndDate.getDate();
    if(cycleNEndDateMonth.toString().length == 1){
      cycleNEndDateMonth = '0' + cycleNEndDateMonth;
    }
    if(cycleNEndDateDay.toString().length == 1){
      cycleNEndDateDay = '0' + cycleNEndDateDay;
    }
    var cycleNEndDateString = cycleNEndDateYear + '-' + cycleNEndDateMonth + '-' + cycleNEndDateDay;

    log.debug('cycle3DateString',cycle3DateString);
    log.debug('cycleNDateString',cycleNDateString);
    log.debug('cycleNEndDateString',cycleNEndDateString);

    var purchaseorderSearchObj = search.create({
      type: "transaction",
      filters:
      [
        [["type","anyof","TrnfrOrd"],"AND",["status","anyof","TrnfrOrd:A"],"AND",["mainline","is","F"],"AND",["firmed","is","F"],"AND",["location","anyof",SupplyFreqRec.location],"AND",["transferlocation","noneof","1","2","18","3","8"],"AND",["shipping","is","F"],"AND",["taxline","is","F"],"AND",["cogs","is","F"],"AND",["transactionlinetype","noneof","SHIPPING","RECEIVING"],"AND",["item.type","noneof","Discount"],"AND",["item.custitem_tph_transload_loc","anyof",SupplyFreqRec.location]], 
        "OR", 
        [["type","anyof","WorkOrd"],"AND",["status","anyof","WorkOrd:A"],"AND",["mainline","is","F"],"AND",["item.custitem_tph_transload_loc","anyof","@NONE@"],"AND",["item.custitem_tph_item_default_fg_location","anyof",SupplyFreqRec.location]], 
        "AND", 
        ["trandate","within",cycle3DateString,cycleNEndDateString]
      ],
      columns:
      [
        search.createColumn({
          name: "item",
          summary: "GROUP",
          label: "Item"
        }),
        search.createColumn({
          name: "quantity",
          summary: "SUM",
          label: "Quantity"
        }),
        search.createColumn({
          name: "formulanumeric",
          summary: "SUM",
          formula: "{quantity} - CASE WHEN NVL({transferorderquantitycommitted},0) = 0 THEN NVL({quantitycommitted},0) ELSE NVL({transferorderquantitycommitted},0) END",
          label: "Quantity Needed"
        }),
        search.createColumn({
          name: "vendor",
          join: "item",
          summary: "MAX",
          sort: search.Sort.ASC,
          label: "Preferred Vendor"
        }),
        search.createColumn({
          name: "formulanumeric",
          summary: "MAX",
          formula: "NVL({item.reordermultiple},'1')",
          label: "Formula (Numeric)"
        }),
        search.createColumn({
          name: "transferorderquantitycommitted",
          summary: "SUM",
          label: "Transfer Order Quantity Committed"
        }),
        search.createColumn({
          name: "purchaseunit",
          join: "item",
          summary: "MAX",
          label: "Primary Purchase Unit"
        }),
        search.createColumn({
          name: "unitstype",
          join: "item",
          summary: "MAX",
          label: "Primary Units Type"
        })
      ]
    });
    var searchResultCount = purchaseorderSearchObj.runPaged().count;
    log.debug("purchaseorderSearchObj result count",searchResultCount);
    var POArray = new Array();
    purchaseorderSearchObj.run().each(function(result){
      var qty = Math.abs(result.getValue({name:'formulanumeric',summary:'SUM'}));
      if(qty > 0){
        POArray.push({
          item:result.getValue({name:'item',summary:'GROUP'}),
          qtyNeed:Math.abs(result.getValue({name:'formulanumeric',summary:'SUM'})),
          vendor:result.getValue({name:'vendor',summary:'MAX',join:'item'}),
          reorderMultiple:result.getValue({name:'formulanumeric',summary:'MAX'}),
          baseUnit:result.getValue({name:'unitstype',summary:'MAX',join:'item'}),
          purchaseUnit:result.getValue({name:'purchaseunit',summary:'MAX',join:'item'})
        });
      }
      // .run().each has a limit of 4,000 results
      return true;
    });
    return [POArray,cycleNDate];
  }


  function createFBAUSPO(SupplyFreqRec,Cycle){
    var today = new Date()
    var cycle3Date = today.addDays((SupplyFreqRec.planningCycle * 2) - 2);
    var cycleNDate = today.addDays((SupplyFreqRec.planningCycle * Cycle) - 2);
    log.debug('qtyNeed Formula',Number(SupplyFreqRec.tarDOC) + ((Cycle - 2) * Number(SupplyFreqRec.planningCycle)));
    log.debug('qtyNeed Formula',SupplyFreqRec.tarDOC);
    log.debug('qtyNeed Formula',Cycle);
    log.debug('qtyNeed Formula',SupplyFreqRec.planningCycle);
    var customrecord_tph_days_of_invSearchObj = search.create({
      type: "customrecord_tph_days_of_inv",
      filters:
      [
        ["custrecord_tph_doi","between","0",SupplyFreqRec.tarDOC + ((Cycle - 2) * SupplyFreqRec.planningCycle)], 
        "AND", 
        ["custrecord_tph_doi_asin.custitem_tph_item_default_fg_location","anyof",SupplyFreqRec.location], 
        "AND", 
        ["custrecord_tph_doi_marketplace","anyof","8"], 
        "AND", 
        ["custrecord_tph_doi_asin.isinactive","is","F"], 
        "AND", 
        ["custrecord_tph_doi_asin.custitem_tph_po_wo_hold","is","F"], 
        "AND", 
        ["custrecord_tph_doi_asin.custitem_tph_sales_hold_checkbox","is","F"]
      ],
      columns:
      [
        search.createColumn({name: "internalid", label: "Internal ID"}),
        search.createColumn({name: "externalid", label: "External ID"}),
        search.createColumn({
          name: "custrecord_tph_doi_asin",
          sort: search.Sort.ASC,
          label: "ASIN"
        }),
        search.createColumn({name: "custrecord_tph_doi", label: "Days of Inventory"}),
        search.createColumn({name: "custrecord_tph_doi_t30", label: "T30UpD"}),
        search.createColumn({
          name: "reordermultiple",
          join: "CUSTRECORD_TPH_DOI_ASIN",
          label: "Reorder Multiple"
        }),
        search.createColumn({name: "custrecord167", label: "Quantity In Marketplace"}),
        search.createColumn({
          name: "vendor",
          join: "CUSTRECORD_TPH_DOI_ASIN",
          label: "Preferred Vendor"
        }),
        search.createColumn({
          name: "unitstype",
          join: "CUSTRECORD_TPH_DOI_ASIN",
          label: "Primary Units Type"
        }),
        search.createColumn({
          name: "purchaseunit",
          join: "CUSTRECORD_TPH_DOI_ASIN",
          label: "Primary Purchase Unit"
        }),
        search.createColumn({
          name: "custitem_tph_transload_loc",
          join: "CUSTRECORD_TPH_DOI_ASIN",
          label: "Default Transload Location"
        }),
        search.createColumn({
          name: "formulanumeric",
          formula: "{custrecord_tph_ppsv_doi} * ("+ (Number(SupplyFreqRec.tarDOC) + ((Cycle) * Number(SupplyFreqRec.planningCycle)))+" -{custrecord_tph_doi})",
          label: "Formula (Numeric)"
        })
      ]
    });
    var searchResultCount = customrecord_tph_days_of_invSearchObj.runPaged().count;
    log.debug("customrecord_tph_days_of_invSearchObj result count",searchResultCount);
    var POArray = new Array();
    customrecord_tph_days_of_invSearchObj.run().each(function(result){
      POArray.push({
        item:result.getValue({name:'custrecord_tph_doi_asin'}),
        qtyNeed:result.getValue({name:'formulanumeric'}),
        vendor:result.getValue({name:'vendor',join:'CUSTRECORD_TPH_DOI_ASIN'}),
        reorderMultiple:result.getValue({name:'reordermultiple',join:'CUSTRECORD_TPH_DOI_ASIN'}),
        transloadLoc:result.getValue({name:'custitem_tph_transload_loc',join:'CUSTRECORD_TPH_DOI_ASIN'}),
        baseUnit:result.getValue({name:'unitstype',join:'CUSTRECORD_TPH_DOI_ASIN'}),
        purchaseUnit:result.getValue({name:'purchaseunit',join:'CUSTRECORD_TPH_DOI_ASIN'})
      })
      // .run().each has a limit of 4,000 results
      return true;
    });
    log.debug('POArray',POArray);
    return [POArray,cycleNDate];
  }
  /*
 * 
 * 
 * Helper Functions
 * 
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

  function rescheduleCurrentScript(LastSupplyFreqRecID,LastEDOCRecID,LastDOCRecID,SkipRunDate,SkipCancelWO) {
    var scheduledScriptTask = task.create({
      taskType: task.TaskType.SCHEDULED_SCRIPT
    });
    scheduledScriptTask.scriptId = runtime.getCurrentScript().id;
    scheduledScriptTask.deploymentId = 'customdeploy_tph_supply_plan_main_od'
    scheduledScriptTask.params = {
      'custscript_tph_last_sup_freq_rec' : LastSupplyFreqRecID,
      'custscript_tph_last_edoc_rec' : LastEDOCRecID,
      'custscript_tph_last_doc_rec' : LastDOCRecID,
      'custscript_tph_skip_run_date' : SkipRunDate,
      'custscript_tph_skip_cancel_wo' : SkipCancelWO
    };
    return scheduledScriptTask.submit();
  }


  exports.execute = execute;
  return exports;
});