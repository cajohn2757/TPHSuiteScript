define(["N/record","N/log","N/search","N/ui/dialog","SuiteScripts/Price-Change-Analysis/PriceChangeAnalysisLookups"], function(record,log,search,dialog,lookup) {
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
    var PriceChangesSearchObj = grabPriceChangeSearch();
    var SalePeriod = PriceChangesSearchObj[0];
    var AnalysisPeriod = PriceChangesSearchObj[1];

    for(var i in SalePeriod){
      try{
        var d = new Date();
        var dateYear = d.getFullYear();
        var dateMonth = d.getMonth() + 1;
        var dateDay = d.addDays(-1).getDate();
        var yesterday = new Date(dateYear,dateMonth-1,dateDay);
        if(dateMonth.toString().length == 1){
          dateMonth = '0'+dateMonth;
        }
        if(dateDay.toString().length == 1){
          dateDay = '0'+dateDay;
        }
        var dateString = d.getFullYear() + '-' + dateMonth + '-' + dateDay;
        //log.debug('yesterday',yesterday);

        var saleStart = SalePeriod[i][2];
        var saleStartYear = saleStart.substring(0,4);
        var saleStartMonth = saleStart.substring(5,7);
        var saleStartDay = saleStart.substring(8);
        var saleDate = new Date(saleStartYear,saleStartMonth-1,saleStartDay);
        //log.debug('saleStartYear',saleStartYear);
        //log.debug('saleStartMonth',saleStartMonth);
        //log.debug('saleStartDay',saleStartDay);
        //log.debug('saleDate',saleDate);

        var daySequence = Math.floor((d.getTime() - saleDate.getTime()) / (24*60*60*1000));
        //log.debug('daySequence',daySequence);
        var asin = SalePeriod[i][1];
        var asinString = SalePeriod[i][3];
        var priceChangeRecordId = SalePeriod[i][0];
        var priceChangeType = SalePeriod[i][4];
        var marketplace = '8';

        var dailyLogExternalId = asinString + '|Amazon : amazon.com|' + dateString;
        var dailyLogInternalId = lookup.lookupDailyLog(dailyLogExternalId);
        //log.debug(dateString)
        if(dailyLogInternalId == -1) {
          var DailySummaryRecord = record.create({
            type: 'customrecord_tph_detail_page_traffic',
            isDynamic: true
          });
          DailySummaryRecord.setValue({
            fieldId: 'externalid',
            value: dailyLogExternalId
          });
          DailySummaryRecord.setValue({
            fieldId: 'custrecord_tph_traffic_asin',
            value: asin
          });
          DailySummaryRecord.setValue({
            fieldId: 'custrecord_tph_traffic_date',
            value: yesterday
          });
          DailySummaryRecord.setValue({
            fieldId: 'custrecord_tph_traffic_marketplace',
            value: marketplace
          });
          var newDailySummaryRecord = DailySummaryRecord.save();



          var AnalysisRecord = record.create({
            type: 'customrecord_tph_price_change_analysis',
            isDynamic: true
          });
          AnalysisRecord.setValue({
            fieldId: 'externalid',
            value: dailyLogExternalId + '|' + priceChangeType
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_asin',
            value: asin
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_sale_period',
            value: true
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_pc_record',
            value: priceChangeRecordId
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_date',
            value: yesterday
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_marketplace',
            value: marketplace
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_day_sequence',
            value: daySequence
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_daily_sum_record',
            value: newDailySummaryRecord
          });
          var newRecId = AnalysisRecord.save();
          log.debug('Record Created',' New Record ID: '+ newRecId + '. ASIN ID: ' + asin + '. Created By Price Change ID: ' + priceChangeRecordId);
        }
        if(dailyLogInternalId != -1){
          var AnalysisRecord = record.create({
            type: 'customrecord_tph_price_change_analysis',
            isDynamic: true
          });
          AnalysisRecord.setValue({
            fieldId: 'externalid',
            value: dailyLogExternalId + '|' + priceChangeType
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_asin',
            value: asin
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_sale_period',
            value: true
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_pc_record',
            value: priceChangeRecordId
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_date',
            value: yesterday
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_marketplace',
            value: marketplace
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_day_sequence',
            value: daySequence
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_daily_sum_record',
            value: dailyLogInternalId
          });
          var newRecId = AnalysisRecord.save();
          log.debug('Record Created',' New Record ID: '+ newRecId + '. ASIN ID: ' + asin + '. Created By Price Change ID: ' + priceChangeRecordId);

        }
        else {
          log.debug('No Record Created',asin + ' Record was not created. Price Change Record ID: ' + priceChangeRecordId);
        }
        //log.debug('dailyLogExternalId',dailyLogExternalId);
        //log.debug('dailyLogInternalId',dailyLogInternalId);
      }catch(error){
        log.debug('error',error);
      }

      var baselineDayStatus = lookup.setBaselineDay(priceChangeRecordId);
      if(baselineDayStatus == true) {
        log.debug('baselineDayStatus', 'Baseline Day set for Price Change Record: ' + priceChangeRecordId);
      }
      else{
        log.debug('baselineDayStatus', 'Baseline Day failed for Price Change Record: ' + priceChangeRecordId);
      }
      if(priceChangeType != '1'){
        var maxDayStatus = lookup.setMaxDay(priceChangeRecordId);
        if(maxDayStatus == true) {
          log.debug('maxDayStatus', 'Max Day set for Price Change Record: ' + priceChangeRecordId);
        }
        else{
          log.debug('maxDayStatus', 'Max Day failed for Price Change Record: ' + priceChangeRecordId + '     Error: '+ maxDayStatus);
        }
      }
      //return;
    }
    for(var i in AnalysisPeriod){
      try{
        var d = new Date();
        var dateYear = d.getFullYear();
        var dateMonth = d.getMonth() + 1;
        var dateDay = d.addDays(-1).getDate();
        var yesterday = new Date(dateYear,dateMonth-1,dateDay);
        if(dateMonth.toString().length == 1){
          dateMonth = '0'+dateMonth;
        }
        if(dateDay.toString().length == 1){
          dateDay = '0'+dateDay;
        }
        var dateString = d.getFullYear() + '-' + dateMonth + '-' + dateDay;
        log.debug('dateString',dateString);
        //log.debug('yesterday',yesterday);

        var saleStart = AnalysisPeriod[i][2];
        var saleStartYear = saleStart.substring(0,4);
        var saleStartMonth = saleStart.substring(5,7);
        var saleStartDay = saleStart.substring(8);
        var saleDate = new Date(saleStartYear,saleStartMonth-1,saleStartDay)
        //log.debug('saleStartYear',saleStartYear);
        //log.debug('saleStartMonth',saleStartMonth);
        //log.debug('saleStartDay',saleStartDay);
        //log.debug('saleDate',saleDate);

        var daySequence = Math.floor((d.getTime() - saleDate.getTime()) / (24*60*60*1000));
        //log.debug('daySequence',daySequence);
        var asin = AnalysisPeriod[i][1];
        var asinString = AnalysisPeriod[i][3];
        var priceChangeRecordId = AnalysisPeriod[i][0];
        var priceChangeType = AnalysisPeriod[i][4];
        var marketplace = '8';

        var dailyLogExternalId = asinString + '|Amazon : amazon.com|' + dateString;
        //log.debug('dailyLogExternalId',dailyLogExternalId)
        var dailyLogInternalId = lookup.lookupDailyLog(dailyLogExternalId);
        //log.debug(dateString)
        if(dailyLogInternalId == -1) {
          var DailySummaryRecord = record.create({
            type: 'customrecord_tph_detail_page_traffic',
            isDynamic: true
          });
          DailySummaryRecord.setValue({
            fieldId: 'externalid',
            value: dailyLogExternalId
          });
          DailySummaryRecord.setValue({
            fieldId: 'custrecord_tph_traffic_asin',
            value: asin
          });
          DailySummaryRecord.setValue({
            fieldId: 'custrecord_tph_traffic_date',
            value: yesterday
          });
          DailySummaryRecord.setValue({
            fieldId: 'custrecord_tph_traffic_marketplace',
            value: marketplace
          });
          var newDailySummaryRecord = DailySummaryRecord.save();



          var AnalysisRecord = record.create({
            type: 'customrecord_tph_price_change_analysis',
            isDynamic: true
          });
          AnalysisRecord.setValue({
            fieldId: 'externalid',
            value: dailyLogExternalId + '|' + priceChangeType
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_asin',
            value: asin
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_sale_period',
            value: true
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_pc_record',
            value: priceChangeRecordId
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_date',
            value: yesterday
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_marketplace',
            value: marketplace
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_day_sequence',
            value: daySequence
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_daily_sum_record',
            value: newDailySummaryRecord
          });
          var newRecId = AnalysisRecord.save();
          log.debug('Record Created',' New Record ID: '+ newRecId + '. ASIN ID: ' + asin + '. Created By Price Change ID: ' + priceChangeRecordId);
        }
        if(dailyLogInternalId != -1){
          var AnalysisRecord = record.create({
            type: 'customrecord_tph_price_change_analysis',
            isDynamic: true
          });
          AnalysisRecord.setValue({
            fieldId: 'externalid',
            value: dailyLogExternalId + '|' + priceChangeType
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_asin',
            value: asin
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_sale_period',
            value: false
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_pc_record',
            value: priceChangeRecordId
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_date',
            value: yesterday
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_marketplace',
            value: marketplace
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_day_sequence',
            value: daySequence
          });
          AnalysisRecord.setValue({
            fieldId: 'custrecord_tph_pca_daily_sum_record',
            value: dailyLogInternalId
          });
          var newRecId = AnalysisRecord.save();
          log.debug('Record Created',' New Record ID: '+ newRecId + '. ASIN ID: ' + asin + '. Created By Price Change ID: ' + priceChangeRecordId);

        }
        else {
          log.debug('No Record Created',asin + ' Record was not created. Price Change Record ID: ' + priceChangeRecordId);
        }
        //log.debug('dailyLogExternalId',dailyLogExternalId);
        //log.debug('dailyLogInternalId',dailyLogInternalId);
      }catch(error){
        log.debug('error',error + '                 Price Change Record ID: ' + priceChangeRecordId);
      }

      var priceChangeRecord = lookup.setBaselineDay(priceChangeRecordId);
      if(baselineDayStatus == true) {
        log.debug('baselineDayStatus', 'Baseline Day set for Price Change Record: ' + priceChangeRecordId);
      }
      else{
        log.debug('baselineDayStatus', 'Baseline Day failed for Price Change Record: ' + priceChangeRecordId);
      }

      if(priceChangeType != '1'){
        var minDayStatus = lookup.setMinDay(priceChangeRecordId);
        if(minDayStatus == true) {
          log.debug('minDayStatus', 'Min Day set for Price Change Record: ' + priceChangeRecordId);
        }
        else{
          log.debug('minDayStatus', 'Min Day failed for Price Change Record: ' + priceChangeRecordId + '     Error: '+ minDayStatus);
        }
      }
    }

    var finalDayStatus = lookup.setFinalDay();
    //log.debug('results Array',PriceChangesSearchObj);
    
    log.debug('Script Complete','Script has benn completed.');
  }

  function grabPriceChangeSearch() {
    var customrecord_tph_price_changeSearchObj = search.create({
      type: "customrecord_tph_base_price_change",
      filters:
      [
        ["custrecord_tph_pc_start_date","onorbefore","yesterday"], 
        "AND", 
        ["custrecord_tph_pc_end_date","onorafter","yesterday"],
        "AND",
        ["custrecord_tph_pc_approved","is","T"]
      ],
      columns:
      [
        search.createColumn({name: "internalid", label: "Internal ID"}),
        search.createColumn({
          name: "custrecord_tph_pc_asin",
          sort: search.Sort.ASC,
          label: "ASIN"
        }),
        search.createColumn({
          name: "custrecord_tph_pc_start_date",
          sort: search.Sort.ASC,
          label: "First Day"
        }),
        search.createColumn({name: "custrecord_tph_pc_asin_text", label: "ASIN (Text)"}),
        search.createColumn({name: "custrecord_tph_pc_end_date", label: "Last Day"}),
        search.createColumn({name: "custrecord_tph_pc_sale_duration", label: "Duration"}),
        search.createColumn({name: "custrecord_tph_pc_old_base_price", label: "Current Base Price"}),
        search.createColumn({name: "custrecord_tph_pc_price_change", label: "Price Change ($)"}),
        search.createColumn({name: "custrecord_tph_pc_discount_perc", label: "Price Change (%)"}),
        search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Evaluation Days"}),
        search.createColumn({name: "custrecord_tph_pc_exp_upd_after", label: "Expected UpD Change (%)"}),
        search.createColumn({name: "custrecord_tph_pc_base_price_cm", label: "Current CM (%)"}),
        search.createColumn({name: "custrecord_tph_pc_sale_price_cm", label: "CM During Sale (%)"}),
        search.createColumn({name: "custrecord_tph_pc_weekly_sale_dollars", label: "Change in Weekly Sales ($)"}),
        search.createColumn({name: "custrecord_tph_pc_weekly_cp_dollars", label: "Change in Weekly CP ($)"}),
        search.createColumn({name: "custrecord_tph_pc_weekly_units", label: "Change in Weekly Units"}),
        search.createColumn({name: "custrecord_tph_pc_approved", label: "Approved"}),
        search.createColumn({name: "custrecord_tph_pc_manual_entry", label: "Manually Scheduled"}),
        search.createColumn({name: "custrecord_tph_pc_terminated_by", label: "Terminated By"}),
        search.createColumn({name: "custrecord_tph_pc_fba_quantity_available", label: "FBA Quantity Available"}),
        search.createColumn({name: "custrecord_tph_pc_fba_qty_fc_transfer", label: "FBA Quantity FC Transfer"}),
        search.createColumn({name: "custrecord_tph_pc_fba_qty_to_pend_recpt", label: "FBA Quantity TO Pending Receipt"}),
        search.createColumn({name: "custrecord_tph_pc_fba_qty_to_pend_fulfil", label: "FBA Quantity TO Pending Fulfillment"}),
        search.createColumn({name: "custrecord_tph_pc_doc_during_sale", label: "DoC During Sale"}),
        search.createColumn({name: "custrecord_tph_pc_doc_after_sale", label: "DoC After Sale"}),
        search.createColumn({name: "custrecord_tph_pc_payback_days", label: "Payback (Days)"}),
        search.createColumn({name: "custrecord_tph_pc_type", label: "Price Change Type"})
      ]
    });

    var customrecord_tph_price_change_analysisSearchObj = search.create({
      type: "customrecord_tph_base_price_change",
      filters:
      [
        ["custrecord_tph_pc_start_analyze","onorbefore","yesterday"], 
        "AND", 
        ["custrecord_tph_pc_end_analyze","onorafter","yesterday"],
        "AND",
        ["custrecord_tph_pc_approved","is","T"]
      ],
      columns:
      [
        search.createColumn({name: "internalid", label: "Internal ID"}),
        search.createColumn({
          name: "custrecord_tph_pc_asin",
          sort: search.Sort.ASC,
          label: "ASIN"
        }),
        search.createColumn({
          name: "custrecord_tph_pc_start_date",
          sort: search.Sort.ASC,
          label: "First Day"
        }),
        search.createColumn({name: "custrecord_tph_pc_asin_text", label: "ASIN (Text)"}),
        search.createColumn({name: "custrecord_tph_pc_end_date", label: "Last Day"}),
        search.createColumn({name: "custrecord_tph_pc_sale_duration", label: "Duration"}),
        search.createColumn({name: "custrecord_tph_pc_old_base_price", label: "Current Base Price"}),
        search.createColumn({name: "custrecord_tph_pc_price_change", label: "Price Change ($)"}),
        search.createColumn({name: "custrecord_tph_pc_discount_perc", label: "Price Change (%)"}),
        search.createColumn({name: "custrecord_tph_pc_eval_dur", label: "Evaluation Days"}),
        search.createColumn({name: "custrecord_tph_pc_exp_upd_after", label: "Expected UpD Change (%)"}),
        search.createColumn({name: "custrecord_tph_pc_base_price_cm", label: "Current CM (%)"}),
        search.createColumn({name: "custrecord_tph_pc_sale_price_cm", label: "CM During Sale (%)"}),
        search.createColumn({name: "custrecord_tph_pc_weekly_sale_dollars", label: "Change in Weekly Sales ($)"}),
        search.createColumn({name: "custrecord_tph_pc_weekly_cp_dollars", label: "Change in Weekly CP ($)"}),
        search.createColumn({name: "custrecord_tph_pc_weekly_units", label: "Change in Weekly Units"}),
        search.createColumn({name: "custrecord_tph_pc_approved", label: "Approved"}),
        search.createColumn({name: "custrecord_tph_pc_manual_entry", label: "Manually Scheduled"}),
        search.createColumn({name: "custrecord_tph_pc_terminated_by", label: "Terminated By"}),
        search.createColumn({name: "custrecord_tph_pc_fba_quantity_available", label: "FBA Quantity Available"}),
        search.createColumn({name: "custrecord_tph_pc_fba_qty_fc_transfer", label: "FBA Quantity FC Transfer"}),
        search.createColumn({name: "custrecord_tph_pc_fba_qty_to_pend_recpt", label: "FBA Quantity TO Pending Receipt"}),
        search.createColumn({name: "custrecord_tph_pc_fba_qty_to_pend_fulfil", label: "FBA Quantity TO Pending Fulfillment"}),
        search.createColumn({name: "custrecord_tph_pc_doc_during_sale", label: "DoC During Sale"}),
        search.createColumn({name: "custrecord_tph_pc_doc_after_sale", label: "DoC After Sale"}),
        search.createColumn({name: "custrecord_tph_pc_payback_days", label: "Payback (Days)"}),
        search.createColumn({name: "custrecord_tph_pc_start_analyze", label: "Payback (Days)"}),
        search.createColumn({name: "custrecord_tph_pc_end_analyze", label: "Payback (Days)"}),
        search.createColumn({name: "custrecord_tph_pc_type", label: "Price Change Type"})
      ]
    });
    var searchResultCount = customrecord_tph_price_changeSearchObj.runPaged().count;
    var resultsSaleArray = new Array();
    //log.debug("priceChangeSearchObj result count",searchResultCount);
    customrecord_tph_price_changeSearchObj.run().each(function(result){
      //log.debug({title:'Results array', message:result});
      var internalid = result.getValue({name:'internalid'});
      var asin = result.getValue({name:'custrecord_tph_pc_asin'});
      var startDate = result.getValue({name:'custrecord_tph_pc_start_date'});
      var asinText = result.getValue({name:'custrecord_tph_pc_asin_text'});
      var type = result.getValue({name:'custrecord_tph_pc_type'});
      resultsSaleArray.push([internalid,asin,startDate,asinText,type]);
      return true;
    });
    var searchResultCount = customrecord_tph_price_change_analysisSearchObj.runPaged().count;
    var resultsAnalysisArray = new Array();
    //log.debug("priceChangeSearchObj result count",searchResultCount);
    customrecord_tph_price_change_analysisSearchObj.run().each(function(result){
      //log.debug({title:'Results array', message:result});
      var internalid = result.getValue({name:'internalid'});
      var asin = result.getValue({name:'custrecord_tph_pc_asin'});
      var startDate = result.getValue({name:'custrecord_tph_pc_start_analyze'});
      var asinText = result.getValue({name:'custrecord_tph_pc_asin_text'});
      var type = result.getValue({name:'custrecord_tph_pc_type'});
      resultsAnalysisArray.push([internalid,asin,startDate,asinText,type]);
      return true;
    });

    return [resultsSaleArray,resultsAnalysisArray];
  }




  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }

  exports.execute = execute;
  return exports;
});