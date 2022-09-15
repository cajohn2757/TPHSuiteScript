/*
*
* Purpose: Find Potential Competitors per Market and Creates Potential Competitor Record
* Author: Corey Johnson
* Date: 2021/12/07
*
*
*/

function main() {
  var ignored = 0;
  var tracking = 0;
  var created = 0;
  var updated = 0;

  var findPotentialCompetitors = potentialCompetitorSearch();

  nlapiLogExecution('debug', '# of PotentialCompetitors', 'Length of array: ' + findPotentialCompetitors.length);

  var marketDefiningTerms = NumberOfSearchTerms();

  var definingTerms = new Array();
  for(var i in marketDefiningTerms) {
    var termResults = marketDefiningTerms[i];
    var termColumns = termResults.getAllColumns();
    definingTerms.push({
      market: termResults.getValue(termColumns[0]),
      terms: termResults.getValue(termColumns[1])
    });
  }
  nlapiLogExecution('debug', 'terms Array of OBJs', JSON.stringify(definingTerms));

  var NumOccurancesPerSearchTerm = 9;

  for(var i in findPotentialCompetitors) {
    //nlapiLogExecution('debug', 'Usage Limit', 'Usage Limit Remaining: ' + nlapiGetContext().getRemainingUsage());
    var resultSet = findPotentialCompetitors[i];
    var columns = resultSet.getAllColumns();

    var asin = resultSet.getValue(columns[1]);
    var searchTermId = resultSet.getValue(columns[7]);
    var marketId = nlapiLookupField('customrecord_tph_search_terms', searchTermId, 'custrecord_tph_market');
    var externalId = asin + "|" + marketId;
    var desc = resultSet.getValue(columns[6]);

    var obj = ObjectSearch(marketId, definingTerms);
    var countOfTerms = obj.terms;
    //nlapiLogExecution('debug', 'search term', obj.terms);

    /*
    //nlapiLogExecution('debug', 'search term', resultSet.getValue(columns[0]));
    nlapiLogExecution('debug', 'asin', resultSet.getValue(columns[1]));
    nlapiLogExecution('debug', 'search term', resultSet.getValue(columns[2]));
    nlapiLogExecution('debug', 'search term', resultSet.getValue(columns[3]));
    nlapiLogExecution('debug', 'search term', resultSet.getValue(columns[4]));
    nlapiLogExecution('debug', 'search term', resultSet.getValue(columns[5]));
    nlapiLogExecution('debug', 'search term', resultSet.getValue(columns[6]));
    nlapiLogExecution('debug', 'search term', resultSet.getValue(columns[7]));
    */
    nlapiLogExecution('debug', 'search term', resultSet.getValue(columns[8]));
    nlapiLogExecution('debug', 'terms Array of OBJs', resultSet.getValue(columns[3]) + ' < ' + countOfTerms*NumOccurancesPerSearchTerm);
    

    // Number of Occurances under threshold will create record
    if(resultSet.getValue(columns[3]) < (countOfTerms*NumOccurancesPerSearchTerm)) {
      //nlapiLogExecution('debug', 'Under Threshold', 'Threshold: ' + countOfTerms*NumOccurancesPerSearchTerm + ' Num of Occur: ' + resultSet.getValue(columns[3]));
      ignored = ignored+1;
      continue;
    }
    else {
    try {
      var asinInternalId = lookupExistingAsin(asin);
      nlapiLogExecution('debug', 'Item Record already exists', asin+" exists in Netsuite Item Master");
      tracking = tracking+1;
      continue;
    }
    catch(error) {
      nlapiLogExecution('debug', 'Item Record does not exist', asin+" does not exist in Netsuite Item Master");
      try {
        var potentialCompetitorRecord = nlapiCreateRecord('customrecord_tph_potential_comp_product');
        potentialCompetitorRecord.setFieldValue('custrecord_tph_potential_comp_asin',asin);
        potentialCompetitorRecord.setFieldValue('custrecord_tph_potential_comp_market', marketId);
        potentialCompetitorRecord.setFieldValue('custrecord_tph_potential_comp_image', resultSet.getValue(columns[5]));
        potentialCompetitorRecord.setFieldValue('custrecord_tph_potential_comp_detail_pag', "https://www.amazon.com/dp/" + asin);
        potentialCompetitorRecord.setFieldValue('custrecord_tph_potential_comp_desc', desc);
        potentialCompetitorRecord.setFieldValue('externalid', externalId);
        //nlapiLogExecution('debug', 'search term', resultSet.getValue(columns[0]));
        //nlapiLogExecution('debug', 'asin', resultSet.getValue(columns[1]));
        //nlapiLogExecution('debug', 'market', resultSet.getValue(columns[2]));
        //nlapiLogExecution('debug', 'number of occurances', resultSet.getValue(columns[3]));
        //nlapiLogExecution('debug', 'average', Math.round(resultSet.getValue(columns[4])));
        //nlapiLogExecution('debug', 'main image url', Math.round(resultSet.getValue(columns[5])));
        //nlapiLogExecution('debug', 'description', resultSet.getValue(columns[6]));
        //nlapiLogExecution('debug', 'internalid', resultSet.getValue(columns[7]));
        var potentialCompetitorRecordId = nlapiSubmitRecord(potentialCompetitorRecord);
        created = created+1;
        nlapiLogExecution('debug', 'potentialCompetitorRecordID', potentialCompetitorRecordId);
      }
      catch(error){
        nlapiLogExecution('debug', 'Catch Error', 'Potential Competitor Record already Exists');
        var updateRecord = updateCompetitorSearch(externalId);
        nlapiLogExecution('debug', 'updateRecordID', updateRecord);
        var exsistingCompetitor = nlapiLoadRecord('customrecord_tph_potential_comp_product', updateRecord);
        exsistingCompetitor.setFieldValue('custrecord_tph_potential_comp_image', resultSet.getValue(columns[5]));
        exsistingCompetitor.setFieldValue('custrecord_tph_potential_comp_desc', desc);
        nlapiSubmitRecord(exsistingCompetitor);
        updated = updated+1;
      }

    }
    }

  }

  //nlapiScheduleScript("customscript_tph_brand_lookup_potnt_comp","customdeploy_tph_brand_lookup_compet_sch");
  
  nlapiLogExecution('debug', 'End Of File', 'Script Successful. Records Created: ' + created + ' Records Updated: ' + updated + ' Records Tracking: ' + tracking + ' Records Ignored: ' + ignored);
}


function potentialCompetitorSearch() {
  var searchColumns = new Array();
  searchColumns[0] = new nlobjSearchColumn("altname","CUSTRECORD_TPH_SEARCH_TERM_ASIN_TERM","MAX");
  searchColumns[1] = new nlobjSearchColumn("custrecord_tph_search_term_asin",null,"GROUP");
  searchColumns[2] = new nlobjSearchColumn("custrecord_tph_market","CUSTRECORD_TPH_SEARCH_TERM_ASIN_TERM","GROUP");
  searchColumns[3] = new nlobjSearchColumn("custrecord_tph_search_term_asin_position",null,"COUNT");
  searchColumns[4] = new nlobjSearchColumn("custrecord_tph_search_term_asin_position",null,"AVG");
  searchColumns[5] = new nlobjSearchColumn("custrecord_tph_search_term_asin_image",null,"MAX");
  searchColumns[6] = new nlobjSearchColumn("custrecord_tph_search_term_asin_title",null,"MAX");
  searchColumns[7] = new nlobjSearchColumn("internalid","CUSTRECORD_TPH_SEARCH_TERM_ASIN_TERM","MAX");
  searchColumns[8] = new nlobjSearchColumn("internalid",null,"MAX").setSort(true);

  var searchFilters = new Array();
  searchFilters[0] = new nlobjSearchFilter("custrecord_tph_search_term_asin_position",null,"lessthanorequalto","60");
  searchFilters[1] = new nlobjSearchFilter("custrecord_tph_market","CUSTRECORD_TPH_SEARCH_TERM_ASIN_TERM","noneof","@NONE@","704");
  searchFilters[2] = new nlobjSearchFilter("created",null,"after","daysago21","daysago21");
  searchFilters[3] = new nlobjSearchFilter("custrecord_tph_search_term_asin_position",null,"greaterthanorequalto","9").setSummaryType('count');
  

  var potentialCompetitors = nlapiSearchRecord("customrecord_tph_search_term_asin_rank",null,searchFilters,searchColumns);


  var completeSet = potentialCompetitors;
  var counter = 1;
  var asinCount = 0;
  while(potentialCompetitors.length == 1000) {  //while(counter != 4)

    for(var i=0; i < potentialCompetitors.length; i++) {
      //nlapiLogExecution('debug', 'Usage Limit', 'Usage Limit Remaining: ' + nlapiGetContext().getRemainingUsage());
      var resultSet = potentialCompetitors[i];
      var columns = resultSet.getAllColumns();

      var asin = resultSet.getValue(columns[1]);
      asinCount = asinCount+1;

      searchFilters[((counter-1)*1000)+(5+i)] = new nlobjSearchFilter("custrecord_tph_search_term_asin",null,"isnot",asin);
  }

    var lastIdResult = potentialCompetitors[999];
    var lastIdColumns = lastIdResult.getAllColumns();
    var lastId = potentialCompetitors[999].getValue(lastIdColumns[8]); //note the last record retreived
    nlapiLogExecution('debug', '# of Asins: ', asinCount);
    nlapiLogExecution('debug', 'Id of previous search: ', lastId + ' ' + counter);
    searchFilters[4] = new nlobjSearchFilter("internalidnumber",null,"lessthan",lastId);

    potentialCompetitors = nlapiSearchRecord("customrecord_tph_search_term_asin_rank",null,searchFilters,searchColumns);

    completeSet = completeSet.concat(potentialCompetitors);
    counter = counter+1;
  }

  return completeSet;
}


function updateCompetitorSearch(externalid) {
  var searchColumns = new Array();
  searchColumns[0] = new nlobjSearchColumn("internalid");

  var searchFilters = new Array();
  searchFilters[0] = new nlobjSearchFilter("externalidstring",null,"is",externalid);

  var updatePotentialCompetitors = nlapiSearchRecord("customrecord_tph_potential_comp_product",null,searchFilters,searchColumns);
  for(var i in updatePotentialCompetitors) {
    var resultSet1 = updatePotentialCompetitors[0];
    var columns = resultSet1.getAllColumns();
  }

  return resultSet1.getValue(columns[0]);
}


function lookupExistingAsin(asin) {
  var searchColumns = new Array();
  searchColumns[0] = new nlobjSearchColumn("internalid");

  var searchFilters = new Array();
  searchFilters[0] = new nlobjSearchFilter("externalidstring",null,"is",asin);

  var updatePotentialCompetitors = nlapiSearchRecord("assemblyitem",null,searchFilters,searchColumns);
  for(var i in updatePotentialCompetitors) {
    var resultSet2 = updatePotentialCompetitors[0];
    var columns = resultSet2.getAllColumns();
  }

  return resultSet2.getValue(columns[0]);
}


function NumberOfSearchTerms() {
  var searchColumns = new Array();
  searchColumns[0] = new nlobjSearchColumn("custrecord_tph_market",null,"GROUP")
  searchColumns[1] = new nlobjSearchColumn("altname",null,"COUNT").setSort(false)

  var searchFilters = new Array();
  searchFilters[0] = new nlobjSearchFilter("custrecord_tph_market",null,"noneof","@NONE@");

  var updatePotentialCompetitors = nlapiSearchRecord("customrecord_tph_search_terms",null,searchFilters,searchColumns);

  return updatePotentialCompetitors;
}


function ObjectSearch(marketId, arr) {
  for(var i=0; i < arr.length; i++) {
    if (arr[i].market === marketId) {
      return arr[i];
    }
  }
}
