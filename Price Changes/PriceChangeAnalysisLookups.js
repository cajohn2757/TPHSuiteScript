define(["N/record","N/log","N/search","N/ui/dialog"], function(record,log,search,dialog) {
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
  var lookupDailyLog = function(ExternalID) {
    try{
      var customrecord_tph_detail_page_trafficSearchObj = search.create({
        type: "customrecord_tph_detail_page_traffic",
        filters:
        [
          ["externalidstring","is",ExternalID]
        ],
        columns:
        [
          search.createColumn({name: "internalid", label: "Internal ID"})
        ]
      });
      var searchResultCount = customrecord_tph_detail_page_trafficSearchObj.runPaged().count;
      if(searchResultCount == 0){
        return -1;
      }
      //log.debug("customrecord_tph_detail_page_trafficSearchObj result count",searchResultCount);
      var internalid = new Array();
      customrecord_tph_detail_page_trafficSearchObj.run().each(function(result){
        internalid.push(result.getValue({name: 'internalid'}));
        //log.debug("internalid",internalid);
        return true;
      });
      return internalid[0];
    }catch(error){
      log.error({
        title: 'error',
        details: error
      });
    }
  };

  var setBaselineDay = function(PriceChangeRecordId) {
    try{
      var priceChangeRecord = record.load({
        type: 'customrecord_tph_base_price_change',
        id: PriceChangeRecordId
      });
      var baseline = priceChangeRecord.getValue('custrecord_tph_pc_baseline_days');
      var asinString = priceChangeRecord.getValue('custrecord_tph_pc_asin_text');
      if(baseline == '') {
        var PCStartDate = priceChangeRecord.getValue('custrecord_tph_pc_start_date');
        var baselineDate = PCStartDate.addDays(-1);
        var baselineMonth = baselineDate.getMonth() + 1;
        var baselineDay = baselineDate.getDate();
        if(baselineMonth.toString().length == 1){
          baselineMonth = '0'+baselineMonth;
        }
        if(baselineDay.toString().length == 1){
          baselineDay = '0'+baselineDay;
        }
        var baselineDateString = baselineDate.getFullYear() +'-'+ baselineMonth +'-'+ baselineDay;
        var baselineDayExternalId = asinString + '|Amazon : amazon.com|' + baselineDateString;
        //log.debug('baselineDayExternalId',baselineDayExternalId);
        var baselineDayInternalId = lookupDailyLog(baselineDayExternalId);
        priceChangeRecord.setValue({
          fieldId:'custrecord_tph_pc_baseline_days',
          value:baselineDayInternalId
        });
        priceChangeRecord.save();
        return true;
      }
    }catch(error){
      return false;
    }
    return false;
  }

  var setMaxDay = function(PriceChangeRecordId) {
    try{
      var priceChangeRecord = record.load({
        type: 'customrecord_tph_base_price_change',
        id: PriceChangeRecordId
      });
      var priceType = priceChangeRecord.getValue('custrecord_tph_pc_type');
      if(priceType == '2'){
        var asin = priceChangeRecord.getValue('custrecord_tph_pc_asin');
        var startDate = priceChangeRecord.getValue('custrecord_tph_pc_start_date');
        var startDateMonth = startDate.getMonth() +1;
        var startDateString = startDate.getFullYear() + '-' + startDateMonth + '-' + startDate.getDate();
        var endDate = priceChangeRecord.getValue('custrecord_tph_pc_end_date');
        var endDateMonth = endDate.getMonth() +1;
        var endDateString = endDate.getFullYear() + '-' + endDateMonth + '-' + endDate.getDate();
        var maxT7Search = search.create({
          type: "customrecord_tph_detail_page_traffic",
          filters:
          [
            ["custrecord_tph_traffic_date","onorafter",startDateString], 
            "AND", 
            ["custrecord_tph_traffic_marketplace","anyof","8"], 
            "AND", 
            ["custrecord_tph_traffic_asin","anyof",asin], 
            "AND", 
            ["custrecord_tph_traffic_date","onorbefore",endDateString]
          ],
          columns:
          [
            search.createColumn({name: "internalid", label: "Internal ID"}),
            search.createColumn({name: "externalid", label: "External ID"}),
            search.createColumn({name: "custrecord_tph_traffic_t7_upd", label: "T7 UpD"})
          ]
        });
        var searchResultCount = maxT7Search.runPaged().count;
        //log.debug("maxT7Search result count",searchResultCount);
        var maxT7 = 0;
        var maxT7Id = '';
        maxT7Search.run().each(function(result){
          if(Number(result.getValue({name: 'custrecord_tph_traffic_t7_upd'})) >= maxT7) {
            maxT7Id = result.getValue({name: 'internalid'});
            maxT7 = Number(result.getValue({name: 'custrecord_tph_traffic_t7_upd'}));
          }
          return true;
        });
        //log.debug('maxT7',maxT7 + " - id: " + maxT7Id);
        priceChangeRecord.setValue({
          fieldId:'custrecord_tph_pc_max_day',
          value:maxT7Id
        });
        priceChangeRecord.save();

        return true;
      }

    }catch(error){
      return error;
    }
  }

  var setMinDay = function(PriceChangeRecordId) {
    try{
      var priceChangeRecord = record.load({
        type: 'customrecord_tph_base_price_change',
        id: PriceChangeRecordId
      });
      var priceType = priceChangeRecord.getValue('custrecord_tph_pc_type');
      if(priceType == '2'){
        var asin = priceChangeRecord.getValue('custrecord_tph_pc_asin');
        var startDate = priceChangeRecord.getValue('custrecord_tph_pc_start_analyze');
        var startDateMonth = startDate.getMonth() +1;
        var startDateString = startDate.getFullYear() + '-' + startDateMonth + '-' + startDate.getDate();
        var endDate = priceChangeRecord.getValue('custrecord_tph_pc_end_analyze');
        var endDateMonth = endDate.getMonth() +1;
        var endDateString = endDate.getFullYear() + '-' + endDateMonth + '-' + endDate.getDate();
        var minT7Search = search.create({
          type: "customrecord_tph_detail_page_traffic",
          filters:
          [
            ["custrecord_tph_traffic_date","onorafter",startDateString], 
            "AND", 
            ["custrecord_tph_traffic_marketplace","anyof","8"], 
            "AND", 
            ["custrecord_tph_traffic_asin","anyof",asin], 
            "AND", 
            ["custrecord_tph_traffic_date","onorbefore",endDateString]
          ],
          columns:
          [
            search.createColumn({name: "internalid", label: "Internal ID"}),
            search.createColumn({name: "externalid", label: "External ID"}),
            search.createColumn({name: "custrecord_tph_traffic_t7_upd", label: "T7 UpD"})
          ]
        });
        var searchResultCount = minT7Search.runPaged().count;
        //log.debug("minT7Search result count",searchResultCount);
        var minT7 = 3000;
        var minT7Id = '';
        minT7Search.run().each(function(result){
          if(Number(result.getValue({name: 'custrecord_tph_traffic_t7_upd'})) <= minT7) {
            minT7Id = result.getValue({name: 'internalid'});
            minT7 = Number(result.getValue({name: 'custrecord_tph_traffic_t7_upd'}));
          }
          return true;
        });
        //log.debug('maxT7',minT7 + " - id: " + minT7Id);
        priceChangeRecord.setValue({
          fieldId:'custrecord_tph_pc_min_day',
          value:minT7Id
        });
        priceChangeRecord.save({ignoreMandatoryFields: true});

        return true;

      }
    }catch(error){
      return error;
    }
  }

  var setFinalDay = function() {
    try{
      log.debug('Set Final Day','Running Final Day Function');
      var finalDaySearch = search.create({
        type: "customrecord_tph_base_price_change",
        filters:
        [
          ["formuladate: {custrecord_tph_pc_end_analyze} + 6","on","today"]
        ],
        columns:
        [
          search.createColumn({
            name: "scriptid",
            sort: search.Sort.ASC,
            label: "Script ID"
          }),
          search.createColumn({name: "internalid", label: "internalid"}),
          search.createColumn({name: "custrecord_tph_pc_asin", label: "ASIN"}),
          search.createColumn({name: "custrecord_tph_pc_start_date", label: "First Day"}),
          search.createColumn({name: "custrecord_tph_pc_end_date", label: "Last Day"}),
          search.createColumn({name: "custrecord_tph_pc_type", label: "Type"}),
          search.createColumn({name: "custrecord_tph_pc_start_analyze", label: "First Analysis Day"}),
          search.createColumn({name: "custrecord_tph_pc_end_analyze", label: "Last Analysis Day"}),
          search.createColumn({
            name: "formuladate",
            formula: "{custrecord_tph_pc_end_analyze} + 6",
            label: "Final Day"
          })
        ]
      });
      var searchResultCount = finalDaySearch.runPaged().count;
      log.debug("finalDaySearch result count",searchResultCount);
      var recordArray = new Array();
      finalDaySearch.run().each(function(result){
        var priceChangeRecordId = result.getValue({name: 'internalid'});
        var priceChangeRecordEndDate = result.getValue({name: 'formuladate'});
        recordArray.push({id:priceChangeRecordId,endDate:priceChangeRecordEndDate});
        // .run().each has a limit of 4,000 results
        return true;
      });
      for(var i in recordArray) {
        var priceChangeRecord = record.load({
          type: 'customrecord_tph_base_price_change',
          id: recordArray[i].id
        });
        var marketplace = 'Amazon : amazon.com';
        var asinString = priceChangeRecord.getValue('custrecord_tph_pc_asin_text');
        var endAnalyzeDate = recordArray[i].endDate;
        var dailyLogExternalId = asinString + '|' + marketplace + '|' + endAnalyzeDate;
        var dailyLogInternalId = '';
        var customrecord_tph_detail_page_trafficSearchObj = search.create({
          type: "customrecord_tph_detail_page_traffic",
          filters:
          [
            ["externalidstring","is",dailyLogExternalId]
          ],
          columns:
          [
            search.createColumn({name: "internalid", label: "Internal ID"})
          ]
        });
        var searchResultCount = customrecord_tph_detail_page_trafficSearchObj.runPaged().count;
        if(searchResultCount == 0){
          log.debug('finalDayStatus', 'Final Day failed for Price Change Record: ' + recordArray[i].id);
        }
        else{
          customrecord_tph_detail_page_trafficSearchObj.run().each(function(result){
            dailyLogInternalId = result.getValue({name: 'internalid'});
            //log.debug("internalid",internalid);
            return true;
          });
          //log.debug('Final Day Record Id', dailyLogInternalId + '    space      ' + recordArray[i].id);
          priceChangeRecord.setValue({
            fieldId:recordArray[i].id,
            value:dailyLogInternalId
          });
          priceChangeRecord.save();
        }
        log.debug('finalDayStatus', 'Final Day set for Price Change Record: ' + recordArray[i].id);
      }
      return true;
      //var endDate = priceChangeRecord.getValue('custrecord_tph_pc_end_analyze');
      //var finalDate = endDate.addDays(6);

    }catch(error){
      return error;
    }
  }

  return {
    lookupDailyLog: lookupDailyLog,
    setBaselineDay: setBaselineDay,
    setMaxDay: setMaxDay,
    setMinDay: setMinDay,
    setFinalDay: setFinalDay
  };
});