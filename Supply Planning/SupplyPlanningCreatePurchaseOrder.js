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
  var createEPurchaseOrder = function(SupplyFreqRec,EPOArray) {
    try{
      var RecId = 0;
      var prevVendorId = '';
      //log.debug('ETOArray',ETOArray);
      for(var i in EPOArray){
        var TOID;

        var item = EPOArray[i].item;
        var qtyNeed = EPOArray[i].qtyNeed;
        var vendor = EPOArray[i].vendor;
        //log.debug('transloadLoc',transloadLoc);
        var reorderMultiple = EPOArray[i].reorderMultiple;
        var baseUnit = EPOArray[i].baseUnit;
        var purchaseUnit = EPOArray[i].purchaseUnit;
        var sublistId = 'item';

        var toLocation = SupplyFreqRec.location;
        //log.debug('location',location);
        var planningCycle = SupplyFreqRec.planningCycle;
        log.debug('item',item);
        log.debug('qtyNeed',qtyNeed);
        log.debug('vendor',vendor);
        log.debug('reorderMultiple',reorderMultiple);
        //log.debug('toLocation',toLocation);
        //log.debug('planningCycle',planningCycle);

        if(qtyNeed > 0) {
          var vendorArray = getVendorId(vendor);
          var vendorId = vendorArray[0];
          var vendorLeadTime = vendorArray[1];

          if(baseUnit != purchaseUnit){
            var baseUnitConversion = getBaseUnit(purchaseUnit);
            qtyNeed = qtyNeed / baseUnitConversion;
            log.debug('baseUnitConversion',baseUnitConversion);
            log.debug('qtyNeed',qtyNeed);
          }

          if(RecId == 0){
            var EPORec = record.create({
              type:'purchaseorder',
              isDynamic:true
            });
            EPORec.setValue({
              fieldId:'entity',
              value: vendorId
            });
            EPORec.setValue({
              fieldId:'fob',
              value: 'Destination'
            });
            EPORec.setValue({
              fieldId:'trandate',
              value: new Date()
            });
            EPORec.setValue({
              fieldId:'duedate',
              value: new Date()
            });
            EPORec.setValue({
              fieldId:'employee',
              value:989093
            })
            EPORec.setValue({
              fieldId:'location',
              value: toLocation
            });
            EPORec.setValue({
              fieldId:'firmed',
              value: true
            });
            EPORec.setValue({
              fieldId:'custbody_tph_expedite_level',
              value: '2'
            });
            EPORec.setValue({
              fieldId:'orderstatus',
              value:'A'
            });
          }
          else if(vendorId != prevVendorId){
            var EPORec = record.create({
              type:'purchaseorder',
              isDynamic:true
            });
            EPORec.setValue({
              fieldId:'entity',
              value: vendorId
            });
            EPORec.setValue({
              fieldId:'fob',
              value: 'Destination'
            });
            EPORec.setValue({
              fieldId:'trandate',
              value: new Date()
            });
            EPORec.setValue({
              fieldId:'duedate',
              value: new Date()
            });
            EPORec.setValue({
              fieldId:'employee',
              value:989093
            })
            EPORec.setValue({
              fieldId:'location',
              value: toLocation
            });
            EPORec.setValue({
              fieldId:'firmed',
              value: true
            });
            EPORec.setValue({
              fieldId:'custbody_tph_expedite_level',
              value: '2'
            });
            EPORec.setValue({
              fieldId:'orderstatus',
              value:'P'
            });
          }
          else{
            EPORec = record.load({
              type:'purchaseorder',
              id:RecId,
              isDynamic:true
            });
          }

          EPORec.selectNewLine({
            sublistId:sublistId
          });
          EPORec.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'item',
            value:item
          });
          EPORec.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'quantity',
            value:Math.ceil(qtyNeed / reorderMultiple) * reorderMultiple
          });
          EPORec.commitLine({
            sublistId:sublistId
          });
          RecId = EPORec.save();
          log.debug('RecId',RecId);

          prevVendorId = vendorId;
        }
      }
      return true;
    }catch(error){
      log.debug('Create Emergency PO Error',error);
      return false;
    }
  };


  var createCyclePOs = function(SupplyFreqRec,POArray,CycleDate,Cycle) {
    try{
      var RecId = 0;
      var prevVendorId = '';

      var today = new Date();
      var cycle3Date = today;
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

      var cycleNDate = CycleDate;
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

      var cycleNEndDate = CycleDate.addDays(SupplyFreqRec.planningCycle - 1);
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

      for(var i in POArray){


        var TOID;
        var item = POArray[i].item;
        var qtyNeed = POArray[i].qtyNeed;
        var vendor = POArray[i].vendor;
        var reorderMultiple = POArray[i].reorderMultiple;
        var baseUnit = POArray[i].baseUnit;
        var purchaseUnit = POArray[i].purchaseUnit;
        //log.debug('baseUnit',baseUnit);
        //log.debug('stockUnit',stockUnit);
        var sublistId = 'item';

        var toLocation = SupplyFreqRec.location;
        var planningCycle = SupplyFreqRec.planningCycle;
        var planningHorizon = SupplyFreqRec.planningHorizon;

        // Item Available Inventory
        var itemObj = createItemSearch(toLocation,item);
        var qtyAvail = itemObj.qtyAvailable

        // Item qty on newly created TOs
        var itemUnfirmedQty = createItemPOSearch(toLocation,item,cycle3DateString,cycleNEndDateString);
        //log.debug('itemUnfirmedQty',itemUnfirmedQty);

        if(baseUnit != purchaseUnit){
          var baseUnitConversion = getBaseUnit(purchaseUnit);
          qtyNeed = qtyNeed / baseUnitConversion;
          itemUnfirmedQty = itemUnfirmedQty / baseUnitConversion;
        }

        var qtyPONeed = Math.round(qtyNeed - qtyAvail - itemUnfirmedQty);

        log.debug('item',item);
        log.debug('qtyNeed',qtyNeed);
        //log.debug('transloadLoc',transloadLoc);
        //log.debug('distMultiple',distMultiple);
        //log.debug('toLocation',toLocation);
        //log.debug('planningCycle',planningCycle);
        //log.debug('itemObj',itemObj);
        log.debug('itemUnfirmedQty',itemUnfirmedQty);
        log.debug('qtyPONeed',qtyPONeed);
        log.debug('qtyAvail',qtyAvail);

        if(qtyPONeed > 0){
          var vendorArray = getVendorId(vendor);
          var vendorId = vendorArray[0];
          var vendorLeadTime = vendorArray[1];

          //log.debug('item',item);
          //log.debug('transloadLocId',transloadLocId);

          if(RecId == 0){
            var PORec = record.create({
              type:'purchaseorder',
              isDynamic:true
            });
            PORec.setValue({
              fieldId:'entity',
              value: vendorId
            });
            PORec.setValue({
              fieldId:'fob',
              value: 'Destination'
            });
            PORec.setValue({
              fieldId:'trandate',
              value: cycleNEndDate.addDays(-vendorLeadTime)
            });
            PORec.setValue({
              fieldId:'duedate',
              value: cycleNEndDate
            });
            PORec.setValue({
              fieldId:'employee',
              value:989093
            })
            PORec.setValue({
              fieldId:'location',
              value: toLocation
            });
            if(Cycle == 2){
              PORec.setValue({
                fieldId:'firmed',
                value: true
              });
              PORec.setValue({
                fieldId:'orderstatus',
                value:'A'
              });
            }
            else if(cycleNEndDate.addDays(-vendorLeadTime) < today){
              PORec.setValue({
                fieldId:'firmed',
                value: true
              });
              PORec.setValue({
                fieldId:'orderstatus',
                value:'A'
              });
            }
            else{
              PORec.setValue({
                fieldId:'firmed',
                value: false
              });
              PORec.setValue({
                fieldId:'orderstatus',
                value:'B'
              });
            }
            PORec.setValue({
              fieldId:'custbody_tph_expedite_level',
              value: '1'
            });
          }
          else if(prevVendorId != vendorId){
            //var transloadLocId = locationSearch(transloadLoc);
            //log.debug('item',item);
            //log.debug('transloadLocId',transloadLocId);
            var PORec = record.create({
              type:'purchaseorder',
              isDynamic:true
            });
            PORec.setValue({
              fieldId:'entity',
              value: vendorId
            });
            PORec.setValue({
              fieldId:'fob',
              value: 'Destination'
            });
            PORec.setValue({
              fieldId:'trandate',
              value: cycleNEndDate.addDays(-vendorLeadTime)
            });
            PORec.setValue({
              fieldId:'duedate',
              value: cycleNEndDate
            });
            PORec.setValue({
              fieldId:'employee',
              value:989093
            })
            PORec.setValue({
              fieldId:'location',
              value: toLocation
            });
            if(Cycle == 2){
              PORec.setValue({
                fieldId:'firmed',
                value: true
              });
              PORec.setValue({
                fieldId:'orderstatus',
                value:'A'
              });
            }
            else if(cycleNEndDate.addDays(-vendorLeadTime) < today){
              PORec.setValue({
                fieldId:'firmed',
                value: true
              });
              PORec.setValue({
                fieldId:'orderstatus',
                value:'A'
              });
            }
            else{
              PORec.setValue({
                fieldId:'firmed',
                value: false
              });
              PORec.setValue({
                fieldId:'orderstatus',
                value:'B'
              });
            }
            PORec.setValue({
              fieldId:'custbody_tph_expedite_level',
              value: '1'
            });
          }
          else{
            //log.debug('item',item);
            //log.debug('transloadLocId',transloadLocId);
            var PORec = record.load({
              type:'purchaseorder',
              id:RecId,
              isDynamic:true
            });
          }


          PORec.selectNewLine({
            sublistId:sublistId
          });
          PORec.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'item',
            value:item
          });
          PORec.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'quantity',
            value:Math.ceil(qtyPONeed / reorderMultiple) * reorderMultiple
          });
          PORec.commitLine({
            sublistId:sublistId
          });
          RecId = PORec.save();

        }
        prevVendorId = vendorId;

      }// End loop of TOArray
      log.debug('RecId',RecId);
      return true;
    }catch(error){
      log.debug('Create Cycle PO Error',error);
      return false;
    }
  };



  var createCycleFBAUSPOs = function(SupplyFreqRec,POArray,CycleDate,Cycle){
    try{
      var RecId = 0;
      var prevVendorId = '';

      var today = new Date();
      var cycle3Date = today;
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

      var cycleNDate = CycleDate;
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

      var cycleNEndDate = CycleDate.addDays(SupplyFreqRec.planningCycle - 1);
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

      for(var i in POArray){


        var TOID;
        var item = POArray[i].item;
        var qtyNeed = POArray[i].qtyNeed;
        var vendor = POArray[i].vendor;
        var reorderMultiple = POArray[i].reorderMultiple;
        var baseUnit = POArray[i].baseUnit;
        var purchaseUnit = POArray[i].purchaseUnit;
        var toLocation = POArray[i].transloadLoc;
        //log.debug('baseUnit',baseUnit);
        //log.debug('stockUnit',stockUnit);
        var sublistId = 'item';

        var planningCycle = SupplyFreqRec.planningCycle;
        var planningHorizon = SupplyFreqRec.planningHorizon;

        // Item Available Inventory
        var itemObj = createItemSearch(toLocation,item);
        var qtyAvail = Number(itemObj.qtyAvailable);

        // Vendor Info
        var vendorArray = getVendorId(vendor);
        var vendorId = vendorArray[0];
        var vendorLeadTime = vendorArray[1];

        var cycleStartDate = today.addDays(-vendorLeadTime - 1);
        var cycleStartDateYear = cycleStartDate.getFullYear();
        var cycleStartDateMonth = cycleStartDate.getMonth() + 1;
        var cycleStartDateDay = cycleStartDate.getDate();
        if(cycleStartDateMonth.toString().length == 1){
          cycleStartDateMonth = '0' + cycleStartDateMonth;
        }
        if(cycleStartDateDay.toString().length == 1){
          cycleStartDateDay = '0' + cycleStartDateDay;
        }
        var cycleStartDateString = cycleStartDateYear + '-' + cycleStartDateMonth + '-' + cycleStartDateDay;
        log.debug('cycleStartDateString',cycleStartDateString);
        log.debug('cycleNEndDate',cycleNEndDate);

        // Item qty on newly created TOs
        log.debug('before unfirmed','');
        var itemUnfirmedQty = createItemPOSearch(toLocation,item,cycleStartDateString,cycleNEndDateString);
        log.debug('after unfirmed','');
        //log.debug('itemUnfirmedQty',itemUnfirmedQty);

        if(baseUnit != purchaseUnit){
          var baseUnitConversion = getBaseUnit(purchaseUnit);
          qtyNeed = qtyNeed / baseUnitConversion;
          itemUnfirmedQty = itemUnfirmedQty / baseUnitConversion;
        }

        var qtyPONeed = Math.round(qtyNeed - qtyAvail - itemUnfirmedQty);

        log.debug('item',item);
        log.debug('qtyNeed',qtyNeed);
        log.debug('transloadLoc',toLocation);
        //log.debug('distMultiple',distMultiple);
        //log.debug('toLocation',toLocation);
        //log.debug('planningCycle',planningCycle);
        //log.debug('itemObj',itemObj);
        log.debug('itemUnfirmedQty',itemUnfirmedQty);
        log.debug('qtyPONeed',qtyPONeed);
        log.debug('qtyAvail',qtyAvail);
        log.debug('qty on PO',Math.ceil(qtyPONeed / reorderMultiple) * reorderMultiple);

        if(qtyPONeed > 0){

          //log.debug('item',item);
          //log.debug('transloadLocId',transloadLocId);

          if(RecId == 0){
            var PORec = record.create({
              type:'purchaseorder',
              isDynamic:true
            });
            PORec.setValue({
              fieldId:'entity',
              value: vendorId
            });
            PORec.setValue({
              fieldId:'fob',
              value: 'Destination'
            });
            PORec.setValue({
              fieldId:'trandate',
              value: cycleNEndDate.addDays(-vendorLeadTime)
            });
            PORec.setValue({
              fieldId:'duedate',
              value: cycleNEndDate
            });
            PORec.setValue({
              fieldId:'employee',
              value:989093
            })
            PORec.setValue({
              fieldId:'location',
              value: toLocation
            });
            if(Cycle == 2 || cycleNEndDate.addDays(-vendorLeadTime) < cycle3Date){
              PORec.setValue({
                fieldId:'firmed',
                value: true
              });
              PORec.setValue({
                fieldId:'orderstatus',
                value:'B'
              });
            }
            else{
              PORec.setValue({
                fieldId:'firmed',
                value: false
              });
              PORec.setValue({
                fieldId:'orderstatus',
                value:'A'
              });
            }
            PORec.setValue({
              fieldId:'custbody_tph_expedite_level',
              value: '1'
            });
          }
          else if(prevVendorId != vendorId){
            //var transloadLocId = locationSearch(transloadLoc);
            //log.debug('item',item);
            //log.debug('transloadLocId',transloadLocId);
            var PORec = record.create({
              type:'purchaseorder',
              isDynamic:true
            });
            PORec.setValue({
              fieldId:'entity',
              value: vendorId
            });
            PORec.setValue({
              fieldId:'fob',
              value: 'Destination'
            });
            PORec.setValue({
              fieldId:'trandate',
              value: cycleNEndDate.addDays(-vendorLeadTime)
            });
            PORec.setValue({
              fieldId:'duedate',
              value: cycleNEndDate
            });
            PORec.setValue({
              fieldId:'employee',
              value:989093
            })
            PORec.setValue({
              fieldId:'location',
              value: toLocation
            });
            if(Cycle == 2 || cycleNEndDate.addDays(-vendorLeadTime) < cycle3Date){
              PORec.setValue({
                fieldId:'firmed',
                value: true
              });
              PORec.setValue({
                fieldId:'orderstatus',
                value:'B'
              });
            }
            else{
              PORec.setValue({
                fieldId:'firmed',
                value: false
              });
              PORec.setValue({
                fieldId:'orderstatus',
                value:'A'
              });
            }
            PORec.setValue({
              fieldId:'custbody_tph_expedite_level',
              value: '1'
            });
          }
          else{
            //log.debug('item',item);
            //log.debug('transloadLocId',transloadLocId);
            var PORec = record.load({
              type:'purchaseorder',
              id:RecId,
              isDynamic:true
            });
          }


          PORec.selectNewLine({
            sublistId:sublistId
          });
          PORec.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'item',
            value:item
          });
          PORec.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'quantity',
            value:Math.ceil(qtyPONeed / reorderMultiple) * reorderMultiple
          });
          PORec.commitLine({
            sublistId:sublistId
          });
          RecId = PORec.save();

        }
        prevVendorId = vendorId;

      }// End loop of TOArray
      log.debug('RecId',RecId);
      return true;
    }catch(error){
      log.debug('Create Cycle FBAUS PO Error',error);
      return false;
    }
  };



  var deletePOs = function(SupplyFreqRec,ToLocation) {
    try{
      var toLocation = ToLocation;
      var purchaseorderSearchObj = search.create({
        type: "purchaseorder",
        filters:
        [
          ["type","anyof","PurchOrd"], 
          "AND", 
          ["mainline","is","T"], 
          "AND", 
          ["status","anyof","PurchOrd:P","PurchOrd:A"], 
          "AND", 
          ["location","anyof",toLocation],
          "AND",
          ["custbody_tph_expedite_level","noneof","@NONE@"],
          "AND",
          ["firmed","is","F"]
        ],
        columns:
        [
          search.createColumn({name: "internalid", label: "Internal Id"})
        ]
      });
      var searchResultCount = purchaseorderSearchObj.runPaged().count;
      log.debug("purchaseorderSearchObj result count",searchResultCount);
      purchaseorderSearchObj.run().each(function(result){
        var id = result.getValue({name:'internalid'});
        log.debug('id',id);
        var PORec = record.load({
          type:'purchaseorder',
          id:id,
          isDynamic:true
        });
        var lineCount = PORec.getLineCount({
          sublistId:'item'
        });
        for(var i = 0; i < lineCount; i++){
          PORec.selectLine({
            sublistId:'item',
            line:i
          });
          PORec.setCurrentSublistValue({
            sublistId:'item',
            fieldId:'isclosed',
            line:i,
            value:true,
            ingnoreFieldChange:true
          });
          PORec.commitLine({
            sublistId:'item',
            line:i
          });
        }
        var closedPOID = PORec.save();
        log.debug('closedPOID',closedPOID);
        return true;
      });

      log.debug('Complete', 'Pending Approval POs have been closed - Replen Frequency ID: ' + SupplyFreqRec.id + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
      return true;
    }catch(error){
      log.debug('Failure', 'Pending Approval POs have not been closed - Replen Frequency ID: ' + SupplyFreqRec.id + ' Governance: ' + runtime.getCurrentScript().getRemainingUsage());
      log.debug('Close PO Error',error);
      return true;
    }
  };


  function getVendorId(vendor){
    var filter;
    if(vendor.indexOf('VEN') != -1){
      filter = ["formulatext: CONCAT({entityid},CONCAT(' ',{companyname}))","is",vendor]
    }
    else{
      filter = ["internalid","is",vendor]
    }
    var vendorSearchObj = search.create({
      type: "vendor",
      filters:
      [
        filter
      ],
      columns:
      [
        search.createColumn({name: "internalid", label: "Internal ID"}),
        search.createColumn({
          name: "formulanumeric",
          formula: "{custentity_tph_ven_dft_prod_time} + {custentitydefaulttransittime}",
          label: "Formula (Numeric)"
        })
      ]
    });
    var searchResultCount = vendorSearchObj.runPaged().count;
    //log.debug("vendorSearchObj result count",searchResultCount);
    var vendorObj = vendorSearchObj.run().getRange({
      start:0,
      end:1
    })[0];
    var vendorId = vendorObj.getValue(vendorObj.columns[0]);
    var vendorLeadTime = vendorObj.getValue(vendorObj.columns[1]);
    return [vendorId,vendorLeadTime];
  }


  function createItemSearch(ToLocation,ItemId){
    var itemSearchObj = search.create({
      type: "item",
      filters:
      [
        ["internalidnumber","equalto",ItemId], 
        "AND", 
        ["inventorylocation","anyof",ToLocation]
      ],
      columns:
      [
        search.createColumn({name: "externalid", label: "External ID"}),
        search.createColumn({
          name: "itemid",
          sort: search.Sort.ASC,
          label: "Name"
        }),
        search.createColumn({name: "internalid", label: "Internal ID"}),
        search.createColumn({
          name: "formulanumeric",
          formula: "CASE WHEN {inventorylocation} = '' THEN {locationquantityavailable} END",
          label: "Formula (Numeric)"
        }),
        search.createColumn({name: "locationquantityavailable", label: "Location Available"}),
        search.createColumn({name: "locationquantitycommitted", label: "Location Committed"}),
        search.createColumn({name: "locationquantityonhand", label: "Location On Hand"})
      ]
    });
    var searchResultCount = itemSearchObj.runPaged().count;
    //log.debug("itemSearchObj result count",searchResultCount);
    var itemData = '';
    if(searchResultCount != 0){
      var itemObj = itemSearchObj.run().getRange({
        start:0,
        end:1
      })[0];
      var itemData = {
        qtyAvailable:itemObj.getValue(itemObj.columns[4]),
        qtyCommitted:itemObj.getValue(itemObj.columns[5]),
      };
    }
    else{
      var itemData = {
        qtyAvailable:0,
        qtyCommitted:0,
      };
    }
    return itemData;
  }


  function createItemPOSearch(Location,Item,Cycle3DateString,CycleNEndDateString) {
    //log.debug('dates for itemTOSearch', Cycle3DateString + ' - ' + CycleNEndDateString);
    var purchaseorderSearchObj2 = search.create({
      type: "purchaseorder",
      filters:
      [
        ["type","anyof","PurchOrd"], 
        "AND", 
        ["mainline","is","F"], 
        "AND", 
        ["status","noneof","PurchOrd:H","PurchOrd:G"], 
        "AND", 
        [["item.custitem_tph_item_default_fg_location","anyof",Location], 
         "OR", 
         ["item.custitem_tph_transload_loc","anyof",Location]], 
        "AND", 
        ["duedate","within",Cycle3DateString,CycleNEndDateString], 
        "AND", 
        ["location","anyof",Location], 
        "AND", 
        ["shipping","is","F"], 
        "AND", 
        ["taxline","is","F"], 
        "AND", 
        ["cogs","is","F"],
        "AND",
        ["item","anyof",Item]
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
          name: "custitem_tph_transload_loc",
          summary: "GROUP",
          join: "item",
          sort: search.Sort.ASC,
          label: "Transload Location"
        })
      ]
    });
    var searchResultCount = purchaseorderSearchObj2.runPaged().count;
    //log.debug("workorderSearchObj result count",searchResultCount);
    //var prevTOArray = new Array();
    if(searchResultCount != 0){
      var prevPOSearchItem = purchaseorderSearchObj2.run().getRange({
        start:0,
        end:1
      })[0];
      var itemPOQty = prevPOSearchItem.getValue(prevPOSearchItem.columns[1]);
      return Math.abs(itemPOQty);
    }
    return '0';
  }


  function getBaseUnit(StockUnit) {
    var unitstypeSearchObj = search.create({
      type: "unitstype",
      filters:
      [
        ["unitname","is",StockUnit]
      ],
      columns:
      [
        search.createColumn({name: "conversionrate", label: "Rate"})
      ]
    });
    var searchResultCount = unitstypeSearchObj.runPaged().count;
    //log.debug("unitstypeSearchObj result count",searchResultCount);
    var baseUnitObj = unitstypeSearchObj.run().getRange({
      start:0,
      end:1
    })[0];
    var stockUnitRate = baseUnitObj.getValue(baseUnitObj.columns[0]);
    return stockUnitRate;

  }

  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }



  return {
    createEPurchaseOrder: createEPurchaseOrder,
    createCyclePOs: createCyclePOs,
    createCycleFBAUSPOs: createCycleFBAUSPOs,
    deletePOs: deletePOs
  };
});