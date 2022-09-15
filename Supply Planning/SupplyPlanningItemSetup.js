define(["N/record","N/log","N/search"], function(record,log,search) {
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
  var run = true;

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
    var oldRecObj = context.oldRecord;
    var newRecObj = context.newRecord;
    log.debug('',newRecObj)
    log.debug('',newRecObj.getValue({fieldId:'_submit_field_mode'}))
    if(newRecObj.getValue({fieldId:'_submit_field_mode'}) == 'RECORDPROCESSOR'){
      run = false;
      log.debug('run status',run);
      return;
    }

    var internalId = context.newRecord.id;
    try{

      var FGLocationId = newRecObj.getValue({fieldId: "custitem_tph_item_default_fg_location"});
      var FGLocation = search.lookupFields({type: search.Type.LOCATION,id: FGLocationId, columns: ['name']});

      var fixedLotSize = ReorderMultipleSearch(internalId); //Reorder Multiple
      var distributionMultiple = DistributionMultipleSearch(internalId);
      if(fixedLotSize == 0){
        log.debug('Item Update Failed','Add a Reorder Multiple to the Packageing of this Item. ' + internalId)
        return;
      }
      var nonHatcheryProduct = newRecObj.getValue({
        fieldId: "custitem_tph_not_hatchery_product"
      });

      if(nonHatcheryProduct == false) {
        newRecObj.setValue({
          fieldId: "supplyreplenishmentmethod",
          value: "MRP"
        });


        var MFGLocationId = newRecObj.getValue({fieldId: "custitem_tph_defaulmfglocation"});
        var TRANSLocationId = newRecObj.getValue({fieldId: "custitem_tph_transload_loc"});

        if(MFGLocationId != (undefined || '')) {
          var MFGLocation = search.lookupFields({type: search.Type.LOCATION,id: MFGLocationId, columns: ['name']});
          var planningItemCat = FGLocation.name + "-" + MFGLocation.name;
          var planningItemCatId = PlanningItemCatSearch(planningItemCat);
        }
        else if(TRANSLocationId != (undefined || '')) {
          var TRANSLocation = search.lookupFields({type: search.Type.LOCATION,id: TRANSLocationId, columns: ['name']});
          var planningItemCat = FGLocation.name + "-" + TRANSLocation.name;
          var planningItemCatId = PlanningItemCatSearch(planningItemCat);
        }
        else {
          var planningItemCat = FGLocation.name;
          //log.debug({title: "TRANSLoc", details: planningItemCatId});
          var planningItemCatId = PlanningItemCatSearch(planningItemCat);
        }
        //log.debug({title: "TRANSLoc", details: planningItemCatId});
        newRecObj.setValue({
          fieldId: "planningitemcategory",
          value: planningItemCatId
        });
        newRecObj.setValue({
          fieldId: "autoleadtime",
          value: false
        });
        newRecObj.setValue({
          fieldId: "reordermultiple",
          value: fixedLotSize
        });
        newRecObj.setValue({
          fieldId: "custitem_tph_distribution_multiple",
          value: distributionMultiple
        });

      }
    }catch(error){
      log.debug({title: "Error", details: error});
    }
  }


  function afterSubmit(context) {

    var oldRecObj = context.oldRecord;
    var newRecObj = context.newRecord;

    if(newRecObj.getValue({fieldId:'_submit_field_mode'}) == 'RECORDPROCESSOR'){
      run = false;
      log.debug('run status',run);
      return;
    }

    var internalId = newRecObj.id;
    var nonHatcheryProduct = newRecObj.getValue({
      fieldId: "custitem_tph_not_hatchery_product"
    });

    try{

      var FGLocationId = newRecObj.getValue({fieldId: "custitem_tph_item_default_fg_location"});
      var MFGLocationId = newRecObj.getValue({fieldId: "custitem_tph_defaulmfglocation"});
      var TRANSLocationId = newRecObj.getValue({fieldId: "custitem_tph_transload_loc"});

      var allLocations = LocationSearch();
      var fixedLotSize = ReorderMultipleSearch(internalId); //Reorder Multiple
      if(fixedLotSize == 0){
        //log.debug('Item Update Failed','Add a Reorder Multiple to the Packageing of this Item. ' + itemName)
        return;
      }
      var supplyLotSizingMethod = 'FIXED_LOT_SIZE';

      var vendorLines = newRecObj.getLineCount({sublistId: 'itemvendor'});
      var purchaseLeadTime = 0;
      log.debug('vendorLines',vendorLines);

      if(vendorLines != 0){
        for (var k=0;k<vendorLines;k++){
          var preferredVendor = newRecObj.getSublistValue({
            sublistId: 'itemvendor',
            fieldId: 'preferredvendor',
            line: k
          });
          if(preferredVendor == true) {
            var vendor = newRecObj.getSublistValue({
              sublistId: 'itemvendor',
              fieldId: 'vendor',
              line: k
            });
            break;
          }
        }

        var vendorLeadTimes = search.lookupFields({
          type: search.Type.VENDOR,
          id: vendor,
          columns: ['custentitydefaulttransittime','custentity_tph_ven_dft_prod_time']
        });
        purchaseLeadTime = Number(vendorLeadTimes.custentitydefaulttransittime) + Number(vendorLeadTimes.custentity_tph_ven_dft_prod_time);

        log.debug('preferredVendor',preferredVendor);
        log.debug('vendor',vendor);
      }

      for(var i in allLocations) {
        var locationId = allLocations[i][0];
        var locationName = allLocations[i][1];
        var fixedBuildLeadTime = allLocations[i][2];
        if(fixedBuildLeadTime == (null || undefined || '')) {
          fixedBuildLeadTime = 30;
        }

        //log.debug("locationid",locationId)
        if(locationId == MFGLocationId) {
          var supplyType = "BUILD";
          var itemLocationConfigId = ItemLocationConfigSearch(internalId,MFGLocationId);
          //log.debug("location stuff",locationName + " :  This is MFG")
        }
        else {
          var supplyType = "PURCHASE";
          var itemLocationConfigId = ItemLocationConfigSearch(internalId,locationId);
          //log.debug("location stuff",locationName + " :  This is FG")
        }

        var itemLocationRecObj = record.load({
          type: record.Type.ITEM_LOCATION_CONFIGURATION,
          id: itemLocationConfigId,
          isDynamic: true
        });
        //log.debug("Item Location Config Record ID",itemLocationRecObj)

        itemLocationRecObj.setValue({
          fieldId: "buildtime",
          value: ''
        });
        itemLocationRecObj.setValue({
          fieldId: "buildtimelotsize",
          value: ''
        });
        itemLocationRecObj.setValue({
          fieldId: "supplylotsizingmethod",
          value: supplyLotSizingMethod
        });
        itemLocationRecObj.setValue({
          fieldId: "fixedlotsize",
          value: fixedLotSize
        });
        itemLocationRecObj.setValue({
          fieldId: "supplytype",
          value: supplyType
        });
        itemLocationRecObj.setValue({
          fieldId: "leadtime",
          value: purchaseLeadTime
        });
        itemLocationRecObj.setValue({
          fieldId: "fixedbuildtime",
          value: fixedBuildLeadTime
        });
        itemLocationRecObj.save();
      }

    }catch(error){
      log.debug({title: "Error", details: error});
    }


  }

  function PlanningItemCatSearch(PlanningItemCat) {

    log.debug({title: "itemCatId", details: PlanningItemCat});
    var planningItemSearchObj = search.create({
      type: "planningitemcategory",
      filters:
      [
        ["name","is",PlanningItemCat],
      ],
      columns:
      [
        search.createColumn({
          name: "internalid",
          label: "Internal Id"
        })
      ]
    });
    var planningItemCatObj = planningItemSearchObj.run().getRange({
      start: 0,
      end: 1
    })[0];

    var itemCatId = planningItemCatObj.getValue(planningItemCatObj.columns[0]);
    //log.debug({title: "itemCatId", details: itemCatId});
    return itemCatId;
  }


  function ItemLocationConfigSearch(ItemId, LocationId) {

    //log.debug({title: "itemid and locationid", details: ItemId + " " + LocationId});
    var itemLocConfigSearchObj = search.create({
      type: "itemlocationconfiguration",
      filters:
      [
        ["item","anyof",ItemId],
        "AND",
        ["location","anyof",LocationId]
      ],
      columns:
      [
        search.createColumn({
          name: "internalid",
          label: "Internal Id"
        })
      ]
    });
    var itemLocConfigObj = itemLocConfigSearchObj.run().getRange({
      start: 0,
      end: 1
    })[0];
    //log.debug({title: "itemLocConfigId", details: itemLocConfigObj});
    var itemLocConfigId = itemLocConfigObj.getValue(itemLocConfigObj.columns[0]);
    //log.debug({title: "itemLocConfigId", details: itemLocConfigId});
    return itemLocConfigId;
  }


  function ReorderMultipleSearch(ItemId) {

    //log.debug({title: "itemid and locationid", details: ItemId});
    var reorderMultipleSearchObj = search.create({
      type: "customrecord_f3_uom_configuration",
      filters:
      [
        ["custrecord_f3_reorder_multiple","is","T"], 
        "AND", 
        ["custrecord_f3_configuration_item","anyof",ItemId]
      ],
      columns:
      [
        search.createColumn({name: "custrecord_f3_unit_quantity", label: "Unit Quantity"})
      ]
    });
    var reorderMultipleObj = reorderMultipleSearchObj.run().getRange({
      start: 0,
      end: 1
    })[0];

    if(reorderMultipleObj != undefined){
      var reorderMultiple = reorderMultipleObj.getValue(reorderMultipleObj.columns[0]);
    }
    else{
      var reorderMultiple = 0;
    }
    //log.debug({title: "reorderMultiple", details: reorderMultiple});
    return reorderMultiple;
  }
  
  
  function DistributionMultipleSearch(ItemId) {

    //log.debug({title: "itemid and locationid", details: ItemId});
    var distributionMultipleSearchObj = search.create({
      type: "customrecord_f3_uom_configuration",
      filters:
      [
        ["custrecord_f3_distribution_multiple","is","T"], 
        "AND", 
        ["custrecord_f3_configuration_item","anyof",ItemId]
      ],
      columns:
      [
        search.createColumn({name: "custrecord_f3_unit_quantity", label: "Unit Quantity"})
      ]
    });
    var distributionMultipleObj = distributionMultipleSearchObj.run().getRange({
      start: 0,
      end: 1
    })[0];

    if(distributionMultipleObj != undefined){
      var distributionMultiple = distributionMultipleObj.getValue(distributionMultipleObj.columns[0]);
    }
    else{
      var distributionMultiple = 0;
    }
    //log.debug({title: "distributionMultiple", details: distributionMultiple});
    return distributionMultiple;
  }


  function LocationSearch() {

    //log.debug({title: "location Search begin", details: "Hello world"});
    var locationSearchObj = search.create({
      type: "location",
      filters:
      [
        ["includeinsupplyplanning","is","T"],
        "AND", 
        ["internalid","noneof","33","34"]
      ],
      columns:
      [
        search.createColumn({name: "internalid", label: "Internal ID"}),
        search.createColumn({
          name: "name",
          sort: search.Sort.ASC,
          label: "Name"
        }),
        search.createColumn({name: "custrecord_tph_loc_dft_prod_time", label: "Production Lead Time"})
      ]
    });
    var locationArr = new Array;
    var count = 0;
    var locationObj = locationSearchObj.run().each(function(result){
      //log.debug("location array",result)
      var resultId = result['id'];
      var resultName = result.getValue({name: "name"});
      var resultProdTime = result.getValue({name: "custrecord_tph_loc_dft_prod_time"});
      log.debug('name',resultProdTime)
      locationArr.push([resultId,resultName,resultProdTime]);
      count = count+1;

      //log.debug("location array", resultId + " " + resultName);
      return true;
    });

    //log.debug({title: "location array", details: locationArr});

    return locationArr;
  }



  exports.beforeSubmit = beforeSubmit;
  exports.afterSubmit = afterSubmit;
  return exports;
});