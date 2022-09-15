define(["N/record","N/log","N/search","N/ui/dialog","N/runtime","N/task"], function(record,log,search,dialog,runtime,task) {
  /**
	 * Provides click handler for buttons
	 *
	 *
	 * 
	 *
	 * @function lookup
	 * @description lookup
	 *
	 *
	 */

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
  var createEWorkOrder = function(SupplyFreqRec,DOCRec) {
    try{

      // Create Emergency Work Order

      var WOID;

      //log.debug('title',"hello world")
      var lastEDOCId = DOCRec.id;
      var currDOC = Number(DOCRec.doi);
      var ppsv = Number(DOCRec.ppsv);
      var reorderMultiple = Number(DOCRec.reorderMultiple);
      var asin = DOCRec.asin;
      var qtyInFG = Number(DOCRec.qtyInFG);
      var qtyOnPOWO = Number(DOCRec.qtyOnPOWO);


      var workorderSearchObj = search.create({
        type: "workorder",
        filters:
        [
          ["type","anyof","WorkOrd"], 
          "AND", 
          ["status","anyof","WorkOrd:B"], 
          "AND", 
          ["item","anyof",asin]
        ],
        columns:
        [
          search.createColumn({
            name: "quantity",
            summary: "SUM",
            label: "Quantity"
          })
        ]
      });
      var workOrderQtyObj = workorderSearchObj.run().getRange({
        start: 0,
        end:1
      })[0];
      //log.debug('releasedWOQTY',workOrderQtyObj.getValue(workOrderQtyObj.columns[0]));

      var releasedWOQty = Number(workOrderQtyObj.getValue(workOrderQtyObj.columns[0]));
      var qtyToMake = 0;

      var lastSupFreqRecId = SupplyFreqRec.id;
      var tarDOC = Number(SupplyFreqRec.tarDOC);
      var planningCycle = Number(SupplyFreqRec.planningCycle);
      var minDOC = Number(SupplyFreqRec.minDOC);
      var location = SupplyFreqRec.location;

      //var qtyWeHave = currDOC * ppsv;
      if(currDOC < minDOC){
        var DOCTOMake = minDOC - currDOC;
        qtyToMake = Math.ceil((((tarDOC + planningCycle) * ppsv) - releasedWOQty - qtyInFG) / reorderMultiple) * reorderMultiple;
        if(qtyToMake > 0){
          log.debug('Creating Emergency WO','Creating Emergency WO for ASIN: ' + asin);
          var endDate = new Date();
          var WORec = record.create({
            type:'workorder',
            isDynamic:true,
            defaultValues: {
              assemblyitem:asin
            }
          });
          WORec.setValue({
            fieldId:'location',
            value:location
          });
          WORec.setValue({
            fieldId:'quantity',
            value:qtyToMake
          });
          WORec.setValue({
            fieldId:'orderstatus',
            value:'B'
          });
          WORec.setValue({
            fieldId:'custbody_tph_expedite_level',
            value:'2'
          });
          WORec.setValue({
            fieldId:'enddate',
            value:endDate.addDays(planningCycle - 1)
          });
          WOID = WORec.save();
          log.debug('Emergency WO Created', 'Success - Replen Frequency ID: ' + lastSupFreqRecId + ' Work Order ID: ' + WOID + ' ASIN: ' + asin + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
        }
      }
      else{
        WOID = false;
        log.debug('No Emergency WO Created', 'Success - Replen Frequency ID: ' + lastSupFreqRecId + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
      }

      return WOID;
    }catch(error){
      log.debug('error',error);
      return false;
    }
  };


  var createCycleWOs = function(SupplyFreqRec,DOCRec) {
    try{

      var WOIDs = new Array();

      var currDOC = Number(DOCRec.doi);
      var ppsv = Number(DOCRec.ppsv);
      var reorderMultiple = Number(DOCRec.reorderMultiple);
      var asin = DOCRec.asin;
      var qtyInFG = Number(DOCRec.qtyInFG);
      var qtyOnPOWO = Number(DOCRec.qtyOnPOWO);

      var tarDOC = Number(SupplyFreqRec.tarDOC);
      var planningCycle = Number(SupplyFreqRec.planningCycle);
      var planningHorizon = Number(SupplyFreqRec.planningHorizon);
      var minDOC = Number(SupplyFreqRec.minDOC);
      var location = SupplyFreqRec.location;

      /*var plannedWOSearch = search.create({
        type: "workorder",
        filters:
        [
          ["type","anyof","WorkOrd"], 
          "AND", 
          ["status","anyof","WorkOrd:A"], 
          "AND", 
          ["item","anyof",asin]
        ],
        columns:
        [
          search.createColumn({
            name: "internalid",
            label: "Internal Id"
          })
        ]
      });
      log.debug('Cancelling Planned WOs','WOs for ASIN: ' + asin + ' are being Cancelled.');
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
        return true;
      });
      log.debug('Cancelling Planned WOs Complete','WOs for ASIN: ' + asin + ' have been Cancelled.');*/

      log.debug('Creating CycleN WOs','CycleN WOs for ASIN: ' + asin + ' are being Created.');
      for(var i = 3; i <= planningHorizon; i++){

        var workorderSearchObj = search.create({
          type: "workorder",
          filters:
          [
            ["type","anyof","WorkOrd"], 
            "AND", 
            ["status","anyof","WorkOrd:B"], 
            "AND", 
            ["item","anyof",asin]
          ],
          columns:
          [
            search.createColumn({
              name: "quantity",
              summary: "SUM",
              label: "Quantity"
            })
          ]
        });
        var workOrderQtyObj = workorderSearchObj.run().getRange({
          start: 0,
          end:1
        })[0];
        var releasedWOQty = Number(workOrderQtyObj.getValue(workOrderQtyObj.columns[0]));

        var workorderSearchObj = search.create({
          type: "workorder",
          filters:
          [
            ["type","anyof","WorkOrd"], 
            "AND", 
            ["status","anyof","WorkOrd:A"], 
            "AND", 
            ["item","anyof",asin]
          ],
          columns:
          [
            search.createColumn({
              name: "quantity",
              summary: "SUM",
              label: "Quantity"
            })
          ]
        });
        var searchResultCount = workorderSearchObj.runPaged().count;
        //log.debug("workorderSearchObj result count",searchResultCount);
        var plannedWOObj = workorderSearchObj.run().getRange({
          start: 0,
          end:1
        })[0];
        var plannedWOQty = Number(plannedWOObj.getValue(plannedWOObj.columns[0]));

        var baselineQty = ppsv * planningCycle;
        var consumtion = (i-1) * baselineQty;
        //log.debug('releasedWOQty',releasedWOQty);

        var CycleN = ((tarDOC * ppsv) + consumtion - releasedWOQty - plannedWOQty - qtyInFG);
        //var Cycle3 = Math.ceil(((planningCycle * ppsv) - CycleN) / reorderMultiple) * reorderMultiple;
        //log.debug('tarDOC',tarDOC);
        //log.debug('ppsv',ppsv);
        //log.debug('baselineQty',baselineQty);
        //log.debug('consumtion',consumtion);
        //log.debug('qtyInFG',qtyInFG);
        //log.debug('reorderMultiple',reorderMultiple);
        //log.debug('releasedWOQty',releasedWOQty);
        //log.debug('qtyInFG + consumtion - releasedWOQty',qtyInFG + consumtion - releasedWOQty);
        //log.debug('CycleN',CycleN);
        //log.debug('Cycle3',Cycle3);
        var cycleDate = new Date().addDays((i-1) * planningCycle);

        if(CycleN > 0 && CycleN <= baselineQty){

          // Search for existing WO for asin/date/qty similiarites
          //var cycleMonth = cycleDate.getMonth() + 1;
          //var cycleDateString = cycleDate.getFullYear() + '-' + cycleMonth + '-' + cycleDate.getDate();

          var workorderSearchObj = search.create({
            type: "workorder",
            filters:
            [
              ["type","anyof","WorkOrd"], 
              "AND", 
              ["status","anyof","WorkOrd:A"], 
              "AND", 
              ["item","anyof",asin]
            ],
            columns:
            [
              search.createColumn({
                name: "quantity",
                summary: "SUM",
                label: "Quantity"
              })
            ]
          });
          var searchResultCount = workorderSearchObj.runPaged().count;
          //log.debug("workorderSearchObj result count",searchResultCount);
          var plannedWOObj = workorderSearchObj.run().getRange({
            start: 0,
            end:1
          })[0];
          var plannedWOQty = Number(plannedWOObj.getValue(plannedWOObj.columns[0]));

          var WORec = record.create({
            type:'workorder',
            isDynamic:true,
            defaultValues: {
              assemblyitem:asin
            }
          });
          WORec.setValue({
            fieldId:'trandate',
            value: cycleDate
          });
          WORec.setValue({
            fieldId:'startdate',
            value: cycleDate
          });
          WORec.setValue({
            fieldId:'enddate',
            value:cycleDate.addDays(planningCycle)
          });
          WORec.setValue({
            fieldId:'location',
            value:location
          });
          WORec.setValue({
            fieldId:'quantity',
            value:Math.ceil(CycleN / reorderMultiple) * reorderMultiple
          });
          if(i == 3){
            WORec.setValue({
              fieldId:'orderstatus',
              value:'B'
            });
            WORec.setValue({
              fieldId:'custbody_tph_expedite_level',
              value:'1'
            });
          }
          else{
            WORec.setValue({
              fieldId:'orderstatus',
              value:'A'
            });
            WORec.setValue({
              fieldId:'firmed',
              value:false
            });
            
          }
          WOIDs.push(WORec.save());

        }
        else if(CycleN > 0 && CycleN > baselineQty){
          var WORec = record.create({
            type:'workorder',
            isDynamic:true,
            defaultValues: {
              assemblyitem:asin
            }
          });
          WORec.setValue({
            fieldId:'trandate',
            value: cycleDate.addDays(2)
          });
          WORec.setValue({
            fieldId:'startdate',
            value: cycleDate.addDays(2)
          });
          WORec.setValue({
            fieldId:'enddate',
            value:cycleDate.addDays(planningCycle + 2)
          });
          WORec.setValue({
            fieldId:'location',
            value:location
          });
          WORec.setValue({
            fieldId:'quantity',
            value:Math.ceil(CycleN / reorderMultiple) * reorderMultiple
          });
          if(i == 3){
            WORec.setValue({
              fieldId:'orderstatus',
              value:'B'
            });
            WORec.setValue({
              fieldId:'custbody_tph_expedite_level',
              value:'1'
            });
          }
          else{
            WORec.setValue({
              fieldId:'orderstatus',
              value:'A'
            });
            WORec.setValue({
              fieldId:'firmed',
              value:false
            });
            
          }
          WOIDs.push(WORec.save());

        }
      }
      log.debug('Creating CycleN WOs Complete','CycleN WOs for ASIN: ' + asin + ' have been Created.');

      return WOIDs;
      //log.debug('title',runtime.getCurrentScript().getRemainingUsage() + " - - - - - ");
    }catch(error){
      log.debug('error',error);
      return false;
    }
  };



  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }


  function rescheduleCurrentScript(LastSupplyFreqRecID,LastEDOCRecID,LastDOCRecID) {
    var scheduledScriptTask = task.create({
      taskType: task.TaskType.SCHEDULED_SCRIPT
    });
    scheduledScriptTask.scriptId = runtime.getCurrentScript().id;
    scheduledScriptTask.deploymentId = runtime.getCurrentScript().deploymentId;
    scheduledScriptTask.params = {
      'custscript_tph_last_sup_freq_rec' : LastSupplyFreqRecID,
      'custscript_tph_last_edoc_rec' : LastEDOCRecID,
      'custscript_tph_last_doc_rec' : LastDOCRecID
    };
    return scheduledScriptTask.submit();
  }


  return {
    createEWorkOrder: createEWorkOrder,
    createCycleWOs: createCycleWOs
  };
});