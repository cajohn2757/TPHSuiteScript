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
  var createETransOrder = function(SupplyFreqRec,ETOArray) {
    try{
      var RecId = 0;
      //log.debug('ETOArray',ETOArray);
      for(var i in ETOArray){
        var TOID;

        var item = ETOArray[i].item;
        var qtyNeed = ETOArray[i].quantityNeed;
        var vendor = ETOArray[i].vendor;
        var transloadLoc = ETOArray[i].transloadLoc;
        var baseUnit = ETOArray[i].baseUnit;
        var stockUnit = ETOArray[i].stockUnit;
        //log.debug('transloadLoc',transloadLoc);
        var distMultiple = ETOArray[i].distMultiple;
        var sublistId = 'item';

        var toLocation = SupplyFreqRec.location;
        //log.debug('location',location);
        var planningCycle = SupplyFreqRec.planningCycle;

        if(baseUnit != stockUnit){
          var baseUnitConversion = getBaseUnit(stockUnit);
          qtyNeed = qtyNeed / baseUnitConversion;
        }

        // Check to From Location
        if(RecId == 0){
          var transloadLocId = locationSearch(transloadLoc);
          var ETORec = record.create({
            type:'transferorder',
            isDynamic:true
          });
          ETORec.setValue({
            fieldId:'trandate',
            value: new Date()
          });
          ETORec.setValue({
            fieldId:'location',
            value: transloadLocId
          });
          ETORec.setValue({
            fieldId:'transferlocation',
            value: toLocation
          });
          ETORec.setValue({
            fieldId:'firmed',
            value: true
          });
          ETORec.setValue({
            fieldId:'custbody_tph_expedite_level',
            value: '2'
          });
        }
        else if(transloadLoc != ETOArray[i-1].transloadLoc){
          //log.debug('TO RecId for ' + transloadLoc,RecId);
          var transloadLocId = locationSearch(transloadLoc);
          var ETORec = record.create({
            type:'transferorder',
            isDynamic:true
          });
          ETORec.setValue({
            fieldId:'trandate',
            value: new Date()
          });
          ETORec.setValue({
            fieldId:'location',
            value: transloadLocId
          });
          ETORec.setValue({
            fieldId:'transferlocation',
            value: toLocation
          });
          ETORec.setValue({
            fieldId:'firmed',
            value: true
          });
          ETORec.setValue({
            fieldId:'custbody_tph_expedite_level',
            value: '2'
          });
        }
        else{
          var ETORec = record.load({
            type:'transferorder',
            id:RecId,
            isDynamic:true
          });
        }


        ETORec.selectNewLine({
          sublistId:sublistId
        });
        ETORec.setCurrentSublistValue({
          sublistId:sublistId,
          fieldId:'item',
          value:item
        });
        ETORec.setCurrentSublistValue({
          sublistId:sublistId,
          fieldId:'quantity',
          value:Math.ceil(qtyNeed / distMultiple) * distMultiple
        });
        ETORec.commitLine({
          sublistId:sublistId
        });
        RecId = ETORec.save();
        //log.debug('RecId',RecId);
      }
      log.debug('TO RecId',RecId);
      return true;

    }catch(error){
      log.debug('error',error);
      return false;
    }
  };


  var createCycleTOs = function(SupplyFreqRec,TOArray,CycleDate,Cycle) {
    try{
      var RecId = 0;

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

      var cycleNDate = CycleDate.addDays(-1 * SupplyFreqRec.planningCycle);
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

      var cycleNEndDate = CycleDate.addDays(-1 * (SupplyFreqRec.planningCycle - 1));
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

      /*var cycle3EndDate = today.addDays((SupplyFreqRec.planningCycle * (cycle + 1)) - 1);
      var cycle3EndDateYear = cycle3EndDate.getFullYear();
      var cycle3EndDateMonth = cycle3EndDate.getMonth() + 1;
      var cycle3EndDateDay = cycle3EndDate.getDate();
      if(cycle3EndDateMonth.toString().length == 1){
        cycle3EndDateMonth = '0' + cycle3EndDateMonth;
      }
      if(cycle3EndDateDay.toString().length == 1){
        cycle3EndDateDay = '0' + cycle3EndDateDay;
      }
      var cycle3EndDateString = cycle3EndDateYear + '-' + cycle3EndDateMonth + '-' + cycle3EndDateDay;*/
      var prevLocId = '';
      for(var i in TOArray){


        var TOID;
        var item = TOArray[i].item;
        var qtyNeed = TOArray[i].quantityNeed;
        var vendor = TOArray[i].vendor;
        var transloadLoc = TOArray[i].transloadLoc;
        var distMultiple = TOArray[i].distMultiple;
        var baseUnit = TOArray[i].baseUnit;
        var stockUnit = TOArray[i].stockUnit;
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
        var itemUnfirmedQty = createItemTOSearch(toLocation,item,cycle3DateString,cycleNEndDateString);
        //log.debug('itemUnfirmedQty',itemUnfirmedQty);

        if(baseUnit != stockUnit){
          var baseUnitConversion = getBaseUnit(stockUnit);
          qtyNeed = qtyNeed / baseUnitConversion;
          //qtyAvail = qtyAvail / baseUnitConversion;
          itemUnfirmedQty = itemUnfirmedQty / baseUnitConversion;
        }

        var qtyTONeed = Math.round(qtyNeed - qtyAvail - itemUnfirmedQty);

        //log.debug('item',item);
        //log.debug('qtyNeed',qtyNeed);
        //log.debug('transloadLoc',transloadLoc);
        //log.debug('distMultiple',distMultiple);
        //log.debug('toLocation',toLocation);
        //log.debug('planningCycle',planningCycle);
        //log.debug('itemObj',itemObj);
        //log.debug('itemUnfirmedQty',itemUnfirmedQty);
        //log.debug('qtyTONeed',qtyTONeed);
        //log.debug('qtyAvail',qtyAvail);

        if(qtyTONeed > 0){
          var transloadLocId = locationSearch(transloadLoc);
          //if(baseUnit != 'Each' && stockUnit != 'Eaches'){
          //var baseUnitConversion = getBaseUnit(stockUnit);
          //qtyTONeed = qtyTONeed / baseUnitConversion;
          //}

          //log.debug('item',item);
          //log.debug('transloadLocId',transloadLocId);

          if(RecId == 0){
            //var transloadLocId = locationSearch(transloadLoc);
            //log.debug('item',item);
            //log.debug('qtyNeed',qtyNeed);
            //log.debug('transloadLocId',transloadLocId);
            //log.debug('distMultiple',distMultiple);
            //log.debug('toLocation',toLocation);
            //log.debug('planningCycle',planningCycle);
            //log.debug('itemObj',itemObj);
            //log.debug('itemUnfirmedQty',itemUnfirmedQty);
            var TORec = record.create({
              type:'transferorder',
              isDynamic:true
            });
            TORec.setValue({
              fieldId:'trandate',
              value: cycleNDate
            });
            TORec.setValue({
              fieldId:'location',
              value: transloadLocId
            });
            TORec.setValue({
              fieldId:'transferlocation',
              value: toLocation
            });
            if(Cycle == 3){
              TORec.setValue({
                fieldId:'orderstatus',
                value: 'B'
              });
              TORec.setValue({
                fieldId:'firmed',
                value: true
              });
            }
            else {
              TORec.setValue({
                fieldId:'orderstatus',
                value: 'A'
              });
              TORec.setValue({
                fieldId:'firmed',
                value: false
              });
            }
            TORec.setValue({
              fieldId:'custbody_tph_expedite_level',
              value: '1'
            });
            /*TORec.setValue({
              fieldId:'memo',
              value: 'Cycle # ' + Number(Cycle + 1)
            });*/
          }
          else if(transloadLocId != prevLocId){
            //var transloadLocId = locationSearch(transloadLoc);
            //log.debug('item',item);
            //log.debug('transloadLocId',transloadLocId);
            var TORec = record.create({
              type:'transferorder',
              isDynamic:true
            });
            TORec.setValue({
              fieldId:'trandate',
              value: cycleNDate
            });
            TORec.setValue({
              fieldId:'location',
              value: transloadLocId
            });
            TORec.setValue({
              fieldId:'transferlocation',
              value: toLocation
            });
            if(Cycle == 3){
              TORec.setValue({
                fieldId:'orderstatus',
                value: 'B'
              });
              TORec.setValue({
                fieldId:'firmed',
                value: true
              });
            }
            else {
              TORec.setValue({
                fieldId:'orderstatus',
                value: 'A'
              });
              TORec.setValue({
                fieldId:'firmed',
                value: false
              });
            }
            TORec.setValue({
              fieldId:'custbody_tph_expedite_level',
              value: '1'
            });
            /*TORec.setValue({
              fieldId:'memo',
              value: 'Cycle # ' + Number(Cycle + 1)
            });*/
          }
          else{
            //log.debug('item',item);
            //log.debug('transloadLocId',transloadLocId);
            var TORec = record.load({
              type:'transferorder',
              id:RecId,
              isDynamic:true
            });
          }


          TORec.selectNewLine({
            sublistId:sublistId
          });
          TORec.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'item',
            value:item
          });
          TORec.setCurrentSublistValue({
            sublistId:sublistId,
            fieldId:'quantity',
            value:Math.ceil(qtyTONeed / distMultiple) * distMultiple
          });
          TORec.commitLine({
            sublistId:sublistId
          });
          RecId = TORec.save();

        }
        prevLocId = transloadLocId;

      }// End loop of TOArray
      log.debug('RecId',RecId);
      return true;
    }catch(error){
      log.debug('error',error);
      return false;
    }
  };

  var deleteTOs = function(SupplyFreqRec) {
    try{
      var toLocation = SupplyFreqRec.location;
      var transferorderSearchObj = search.create({
        type: "transferorder",
        filters:
        [
          ["type","anyof","TrnfrOrd"], 
          "AND", 
          ["transferlocation","anyof",toLocation], 
          "AND", 
          ["firmed","is","F"],
          "AND", 
          ["mainline","is","T"],
          "AND", 
          ["status","noneof","TrnfrOrd:H"]
        ],
        columns:
        [
          search.createColumn({name: "internalid",label: "Internal ID"})
        ]
      });
      var searchResultCount = transferorderSearchObj.runPaged().count;
      log.debug("transferorderSearchObj result count",searchResultCount);
      var CancelTOs = new Array();
      transferorderSearchObj.run().each(function(result){
        CancelTOs.push({internalid:result.getValue({name:'internalid'})});
        return true;
      });

      for(var i in CancelTOs){
        var TORec = record.load({
          type:'transferorder',
          id:CancelTOs[i].internalid,
          isDynamic:true
        });
        var lineCount = TORec.getLineCount({
          sublistId:'item'
        });
        for(var j = 0; j < lineCount; j++){
          TORec.selectLine({
            sublistId:'item',
            line:j
          });
          TORec.setCurrentSublistValue({
            sublistId:'item',
            fieldId:'isclosed',
            line:j,
            value:true,
            ignoreFieldChange:true
          });
          TORec.commitLine({
            sublistId:'item',
            line:j
          });
        }
        var closedTOID = TORec.save();
        log.debug('closedTOID',closedTOID);
      }
      return true;
    }catch(error){
      log.debug('error',error);
      return false;
    }
  };


  function locationSearch(locationName){
    log.debug('locationName',locationName);
    var locationSearchObj = search.create({
      type: "location",
      filters:
      [
        ["name","is",locationName]
      ],
      columns:
      [
        search.createColumn({name: "internalid", label: "Internal ID"})
      ]
    });
    var searchResultCount = locationSearchObj.runPaged().count;
    //log.debug("locationSearchObj result count",searchResultCount);
    var locationObj = locationSearchObj.run().getRange({
      start:0,
      end:1
    })[0];
    var locationId = locationObj.getValue(locationObj.columns[0]);
    return locationId;
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
    var itemObj = itemSearchObj.run().getRange({
      start:0,
      end:1
    })[0];
    var itemData = {
      qtyAvailable:itemObj.getValue(itemObj.columns[4]),
      qtyCommitted:itemObj.getValue(itemObj.columns[5]),
    };
    return itemData;

  }


  function createItemTOSearch(Location,Item,Cycle3DateString,CycleNEndDateString) {
    //log.debug('dates for itemTOSearch', Cycle3DateString + ' - ' + CycleNEndDateString);
    var workorderSearchObj2 = search.create({
      type: "transferorder",
      filters:
      [
        ["type","anyof","TrnfrOrd"], 
        "AND", 
        ["mainline","is","F"], 
        "AND", 
        ["status","noneof","TrnfrOrd:H"], 
        "AND", 
        ["item.custitem_tph_item_default_fg_location","anyof",Location], 
        "AND", 
        ["item.custitem_tph_transload_loc","noneof","@NONE@"], 
        "AND", 
        ["trandate","within",Cycle3DateString,CycleNEndDateString], 
        "AND", 
        ["transferlocation","anyof",Location], 
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
    var searchResultCount = workorderSearchObj2.runPaged().count;
    //log.debug("workorderSearchObj result count",searchResultCount);
    //var prevTOArray = new Array();
    if(searchResultCount != 0){
      var prevTOSearchItem = workorderSearchObj2.run().getRange({
        start:0,
        end:1
      })[0];
      var itemTOQty = prevTOSearchItem.getValue(prevTOSearchItem.columns[1]);
      return Math.abs(itemTOQty);
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
    createETransOrder: createETransOrder,
    createCycleTOs: createCycleTOs,
    deleteTOs: deleteTOs
  };
});