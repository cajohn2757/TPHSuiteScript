/*
*
* Purpose: Create Replenishments automatically
* Author: Corey Johnson
* Date: 2021/10/22
*
*
*/

function main() {

  var freqReplenSS = createFreqReplenSearch();

  for (var i in freqReplenSS) {
    var resultSet = freqReplenSS[i];
    var columns = resultSet.getAllColumns();


    // Loads Replen Frequency Record
    var freqReplenRecord = nlapiLoadRecord('customrecord_tph_mrktplc_replen_freq',resultSet.getValue(columns[0]));
    var replenFrequency = freqReplenRecord.getFieldValue('custrecord_tph_replen_freq');
    var marketplaceId = freqReplenRecord.getFieldValue('custrecord_tph_replen_freq_mrktplce');
    var sizeTierId = freqReplenRecord.getFieldValue('custrecord_tph_replen_freq_size_tier');
    var fgLocationId = freqReplenRecord.getFieldValue('custrecord_tph_replen_freq_fglocation');
    var doi = freqReplenRecord.getFieldValue('custrecord_tph_replen_freq_doi');
    var nextRun = freqReplenRecord.getFieldValue('custrecord_tph_replen_freq_next_run');
    var lastRun = freqReplenRecord.getFieldValue('custrecord_tph_replen_freq_last_run');

    //Update Run dates for Marketplace Replenisment Frequency Record
    var runDateArr = dateCheck(replenFrequency,lastRun);

    if(nextRun == runDateArr[0]) {
      // Submits Replen Record with New Run Times
      freqReplenRecord.setFieldValue('custrecord_tph_replen_freq_last_run',runDateArr[0]);
      freqReplenRecord.setFieldValue('custrecord_tph_replen_freq_next_run', runDateArr[1]);
      nlapiSubmitRecord(freqReplenRecord);

      //Loads Market Record to retrieve Primary Fulfillment Location
      var marketplaceRecord = nlapiLoadRecord('department',marketplaceId);
      var primaryFulfillmentLocationId = marketplaceRecord.getFieldValue('custrecord_tph_primary_parcel')

      var customrecord_tph_days_of_invSearch = createSearch(marketplaceId,doi,sizeTierId,fgLocationId);

      // Creates the initial Transfer Order
      var transferOrderId = createTransferOrder(customrecord_tph_days_of_invSearch, fgLocationId,primaryFulfillmentLocationId);
      //nlapiLogExecution('debug', 'debug', transferOrderId);

      if (transferOrderId == false) {
        nlapiLogExecution('debug', 'Complete', 'No Record Created - ' + "Replen Frequency ID: " + resultSet.getValue(columns[0]));
      	continue;
      }
      //Sets the Transfer Order Status to Pending Fulfillment
      nlapiSubmitField('transferOrder', transferOrderId, 'orderstatus','B',false);

      // Checks Transfer Order for backlog products
      var checkTransfer = checkTransferOrder(transferOrderId);
      if(checkTransfer == true) {
     	nlapiLogExecution('debug', 'Complete', 'Success - ' + "Replen Frequency ID: " + resultSet.getValue(columns[0]) + " Transfer Order ID: " + transferOrderId);
      }
      else {
        nlapiLogExecution('debug', 'Complete', 'No Record Created - ' + "Replen Frequency ID: " + resultSet.getValue(columns[0]));
      }
    }
    else if (nextRun == '' || nextRun == null) {
      freqReplenRecord.setFieldValue('custrecord_tph_replen_freq_next_run', runDateArr[1]);
      nlapiSubmitRecord(freqReplenRecord);
    }
	else {
      nlapiLogExecution('debug', 'Complete', 'NextRunDate Mismatch - ' + "Replen Frequency ID: " + resultSet.getValue(columns[0]));
    }
  }
  nlapiLogExecution('debug', 'Script Complete', 'Script Completed');
}

function dateCheck(replenFrequency,lastRun) {
  var today = new Date();
  var todayYear = today.getFullYear();
  var todayMonth = String(today.getMonth() + 1).padStart(2,'0'); //January is 0!
  var todayDay = String(today.getDate()).padStart(2,'0');
  var runDate = (todayYear + '-' + todayMonth + '-' + todayDay);
  //nlapiLogExecution('debug','RunTime',today);

  //var lastRun = new Date(lastRun.substring(0,4),lastRun.substring(5,7) - 1,lastRun.substring(8,10));
  var nextRunDate = new Date(today.setDate(today.getDate() + Number(replenFrequency)));
  //nlapiLogExecution('debug', 'next RunDate', nextRunDate.getDay());
  if(nextRunDate.getDay() == 6){
    nextRunDate = new Date(nextRunDate.setDate(nextRunDate.getDate() + 2));
  }
  else if (nextRunDate.getDay == 0){
    nextRunDate = new Date(nextRunDate.setDate(nextRunDate.getDate() + 1));
  }
  var nextRunYear = nextRunDate.getFullYear();
  var nextRunMonth = String(nextRunDate.getMonth() + 1).padStart(2,'0'); //January is 0!
  var nextRunDay = String(nextRunDate.getDate()).padStart(2,'0');
  var nextRunDateString = (nextRunYear + '-' + nextRunMonth + '-' + nextRunDay);
  //nlapiLogExecution('debug', 'next RunDate', nextRunDateString);

  var runDateArr = [runDate, nextRunDateString];

  return runDateArr;
}

function createTransferOrder(savedSearch,fromLocation,ToLocation) {

  var tranOrder = nlapiCreateRecord('transferorder');
  //var tranOrder = nlapiLoadRecord('transferorder',3350908);//TO00866

  tranOrder.setFieldValue('location', fromLocation); //From Location field
  tranOrder.setFieldValue('transferlocation', ToLocation); //To Location field
  tranOrder.setFieldValue('firmed', 'F');

  for (var i in savedSearch) {
    var resultSet = savedSearch[i];
    var columns = resultSet.getAllColumns();

    tranOrder.selectNewLineItem('item');
    tranOrder.setCurrentLineItemValue('item','item',resultSet.getValue(columns[1]));
    tranOrder.setCurrentLineItemValue('item','quantity',resultSet.getValue(columns[2]));
    tranOrder.commitLineItem('item');
    //nlapiLogExecution('debug', 'searchResults', resultSet.getValue(columns[i]));
  }
  if (tranOrder.getLineItemCount('item') == 0) {
    var transferOrderId = false;
  }
  else {
    var transferOrderId = nlapiSubmitRecord(tranOrder);
    //nlapiLogExecution('debug', 'debug', transferOrderId);
  }

  return transferOrderId;
}

function createFreqReplenSearch () {
  var searchColumns = new Array();
  searchColumns[0] = new nlobjSearchColumn("internalid");

  var searchFilters = new Array();
  searchFilters[0] = new nlobjSearchFilter("isinactive",null,"is","F");

  var customrecord_tph_mrktplc_replen_freqSearch = nlapiSearchRecord("customrecord_tph_mrktplc_replen_freq",null,searchFilters,searchColumns);
  return customrecord_tph_mrktplc_replen_freqSearch;
}

function createSearch(marketplaceId,doi,sizeTierId,fgLocationId) {
  var searchColumns = new Array();
  searchColumns[0] = new nlobjSearchColumn("custrecord_tph_doi_marketplace");
  searchColumns[1] = new nlobjSearchColumn("custrecord_tph_doi_asin");
  //searchColumns[2] = new nlobjSearchColumn("formulanumeric").setFormula("ROUND(CASE WHEN {custrecord_tph_doi_on_transferorders} IS NULL THEN ({custrecord_tph_ppsv_doi}*"+doi+"-{custrecord167})*{custrecord_tph_doi_t30_multiplier} ELSE(({custrecord_tph_ppsv_doi}*"+doi+"-{custrecord167}))*{custrecord_tph_doi_t30_multiplier}-{custrecord_tph_doi_on_transferorders}END,0)");
  searchColumns[2] = new nlobjSearchColumn("formulanumeric").setFormula("ROUND(CASE WHEN {custrecord_tph_doi_on_transferorders} IS NULL THEN ({custrecord_tph_ppsv_doi}*"+doi+"-{custrecord167}) ELSE(({custrecord_tph_ppsv_doi}*"+doi+"-{custrecord167}))-{custrecord_tph_doi_on_transferorders}END,0)");
  searchColumns[3]= new nlobjSearchColumn("custrecord_tph_doi_ppsv");
  searchColumns[4] = new nlobjSearchColumn("custitem_tph_item_fbaus_size_tier","CUSTRECORD_TPH_DOI_ASIN",null);
  searchColumns[5] = new nlobjSearchColumn("custitem_tph_item_default_fg_location","CUSTRECORD_TPH_DOI_ASIN",null);

  var searchFilters = new Array();
  searchFilters[0] = new nlobjSearchFilter("custrecord_tph_doi_ppsv",null,"between","0",doi);
  searchFilters[1] = new nlobjSearchFilter("custrecord_tph_doi_marketplace",null,"anyof",marketplaceId);
  searchFilters[2] = new nlobjSearchFilter("isinactive","CUSTRECORD_TPH_DOI_ASIN","is","F");
  //searchFilters[3] = new nlobjSearchFilter("formulanumeric",null,"greaterthan","0").setFormula("ROUND(CASE WHEN {custrecord_tph_doi_on_transferorders} IS NULL THEN ({custrecord_tph_ppsv_doi}*"+doi+"-{custrecord167})*{custrecord_tph_doi_t30_multiplier} ELSE(({custrecord_tph_ppsv_doi}*"+doi+"-{custrecord167}))*{custrecord_tph_doi_t30_multiplier}-{custrecord_tph_doi_on_transferorders}END,0)");
  searchFilters[3] = new nlobjSearchFilter("formulanumeric",null,"greaterthan","0").setFormula("ROUND(CASE WHEN {custrecord_tph_doi_on_transferorders} IS NULL THEN ({custrecord_tph_ppsv_doi}*"+doi+"-{custrecord167}) ELSE(({custrecord_tph_ppsv_doi}*"+doi+"-{custrecord167}))-{custrecord_tph_doi_on_transferorders}END,0)");
  searchFilters[4] = new nlobjSearchFilter("custitem_tph_sales_hold_checkbox","CUSTRECORD_TPH_DOI_ASIN","is","F");
  searchFilters[5] = new nlobjSearchFilter("custitem_tph_item_fbaus_size_tier","CUSTRECORD_TPH_DOI_ASIN","anyof",sizeTierId);
  searchFilters[6] = new nlobjSearchFilter("custitem_tph_item_default_fg_location","CUSTRECORD_TPH_DOI_ASIN","anyof",fgLocationId);
  searchFilters[7] = new nlobjSearchFilter("custitem_tph_fbaus_excess","CUSTRECORD_TPH_DOI_ASIN","is","F");

  var customrecord_tph_days_of_invSearch = nlapiSearchRecord("customrecord_tph_days_of_inv",null,searchFilters,searchColumns);
  return customrecord_tph_days_of_invSearch;
}

function checkTransferOrder(Id) {
  var tranOrder = nlapiLoadRecord('transferorder', Id);
  var lineCount = tranOrder.getLineItemCount('item');
  //nlapiLogExecution('debug', 'line count', lineCount);

  for(var i = 1; i <= lineCount; i++) {
    var asin = tranOrder.getLineItemValue('item','item',i);
    var totalQty = tranOrder.getLineItemValue('item','quantity',i);
    var backOrderQty = tranOrder.getLineItemValue('item','quantitybackordered',i);
    var committedQty = tranOrder.getLineItemValue('item','quantitycommitted',i);
    var unitsPerCase = tranOrder.getLineItemValue('item','custcol_tph_toline_unitspercase',i);
    var reorderMultiple = tranOrder.getLineItemValue('item','custcol_tph_reorder_multiple',i);
    var distributionMultiple = tranOrder.getLineItemValue('item','custcol_tph_distribution_multiple',i);
    if(distributionMultiple == '' || distributionMultiple == undefined){
      distributionMultiple = 1;
    }

    // Create Replen Failure Record From Backorder
    //nlapiLogExecution('debug', 'totalqty', asin + ' Total: ' + totalQty + ' BackOrder: ' + backOrderQty);
    //Remove Lines from TO
    if(totalQty == backOrderQty) {
      //nlapiLogExecution('debug', 'removing Line', asin + ' Total: ' + totalQty + ' BackOrder: ' + backOrderQty);
      tranOrder.removeLineItem('item',i);
      //nlapiLogExecution('debug', 'after Remove', i);
      lineCount--;
      i--;
    }
    else{
      var committedQtyinCases = (Math.ceil((totalQty-backOrderQty)/distributionMultiple))*distributionMultiple; //Calculate qty to ship that are in full cases
      if (committedQtyinCases == 0) {
        //nlapiLogExecution('debug', 'committedQtyinCases', asin + ' Commited Cases: ' + committedQtyinCases);
        committedQtyinCases = distributionMultiple; //Send one case when total qty does not meet a case quantity
        totalQty = distributionMultiple;
      }
      //nlapiLogExecution('debug', 'commited qty', asin + ' ' + committedQtyinCases);
      tranOrder.selectLineItem('item',i);
      tranOrder.setCurrentLineItemValue('item','quantity',Math.round(committedQtyinCases));
      tranOrder.commitLineItem('item');
      //nlapiLogExecution('debug', 'submit line', asin + ' ' + committedQtyinCases);
      //backOrderQty = (totalQty - committedQtyinCases); //Calculate qty of units that are in backlog and not in cases
    }
	if (backOrderQty != 0) {
      backOrderQty = Math.round((Math.ceil(backOrderQty/distributionMultiple))*distributionMultiple);
      //nlapiLogExecution('debug', 'removing Line', asin + ' Total: ' + totalQty + ' BackOrder: ' + backOrderQty);
      var replenFailure = nlapiCreateRecord('customrecord_tph_replen_failures');
      replenFailure.setFieldValue('custrecord_tph_replen_fail_toid', Id);
      replenFailure.setFieldValue('custrecord_tph_replen_fail_asin', asin);
      replenFailure.setFieldValue('custrecord_tph_replen_fail_qty', backOrderQty);
      nlapiSubmitRecord(replenFailure);
      //nlapiLogExecution('debug', 'replen Failure', "record Submitted");
    }
  }
  tranOrder.setFieldValue('firmed','T');

  if (tranOrder.getLineItemCount('item') == 0) {
    nlapiDeleteRecord('transferorder',Id);
    return false;
  }
  else {
    nlapiSubmitRecord(tranOrder);
    return true;
  }
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

