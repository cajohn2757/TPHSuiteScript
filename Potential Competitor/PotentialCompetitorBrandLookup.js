/*
*
* Purpose: Find Potential Competitors per Market
* Author: Corey Johnson
* Date: 2021/12/07
*
*
*/

function main () {

  var brandObj = brandLookupSearch();
  var recordUpdate = 0;

  for(var i in brandObj) {
    var resultSet = brandObj[i];
    var columns = resultSet.getAllColumns();

    var potentialCompId = resultSet.getValue(columns[9]);
    var amzBrand = resultSet.getValue(columns[7]);
    var asin = resultSet.getValue(columns[0]);
    //nlapiLogExecution('debug', 'amz brand: ', amzBrand);
    var accuracyCounter = 3;
    try {
      do {
        var trackedBrandObj = trackedbrandLookupSearch(amzBrand,accuracyCounter);
        var trackedBrandArray = trackedBrandObj[0];
        accuracyCounter = trackedBrandObj[1];
        nlapiLogExecution('debug', 'While loop interations: ', accuracyCounter-3);

        if(nlapiGetContext().getRemainingUsage() < 300){
          nlapiLogExecution('debug', 'Remaining Gov', 'Remainging Gov: ' + nlapiGetContext().getRemainingUsage());
          nlapiGetContext().getRemainingUsage = function () { return 1000; }
        }

      }while(trackedBrandArray.length > 1);
    } catch(error) {
      nlapiLogExecution('debug', 'Brand Not Found', "No brand found with name. ASIN: " + asin);
      
      if(nlapiGetContext().getRemainingUsage() < 300){
          nlapiLogExecution('debug', 'Remaining Gov', 'Remainging Gov: ' + nlapiGetContext().getRemainingUsage());
          //nlapiGetContext().getRemainingUsage = function () { return 1000; }
          nlapiYieldScript();
        }
      
      continue;
    }

    var brandMatch = trackedBrandArray[0];
    var brandMatchColumns = brandMatch.getAllColumns();

    var nsBrandId = brandMatch.getValue(brandMatchColumns[6]);
    var sellerName = brandMatch.getValue(brandMatchColumns[0]);
    var sellerId = brandMatch.getValue(brandMatchColumns[7]);

    var potentCompRecord = nlapiLoadRecord("customrecord_tph_potential_comp_product", potentialCompId);
    potentCompRecord.setFieldValue("custrecord_tph_potential_comp_ns_brand", nsBrandId);
    potentCompRecord.setFieldValue("custrecord_tph_potential_comp_sellr_name", sellerName);
    potentCompRecord.setFieldValue("custrecord_tph_potential_comp_seller_id", sellerId);
    nlapiSubmitRecord(potentCompRecord);
    nlapiLogExecution('debug', 'Submit Record', "Updated Potential Comptetitor: " + asin);
    recordUpdate = recordUpdate + 1;

    if(nlapiGetContext().getRemainingUsage() < 300){
      nlapiLogExecution('debug', 'Remaining Gov', 'Remainging Gov: ' + nlapiGetContext().getRemainingUsage());
      nlapiGetContext().getRemainingUsage = function () { return 1000; }
    }
  }
  //if(recordUpdate > 0) { // Two instances. The first is if the Seller ID is present and then the item gets created. The second is if the Seller ID is not present, but the Brand is still present.
  nlapiScheduleScript("customscript_tph_potent_comp_item_create", "customdeploy_tph_comp_item_create_sch"); // This line makes the Item Creation Script Run Automatically
  //nlapiScheduleScript("customscript_tph_potent_comp_item_nobrnd", "customdeploy_tph_pot_comp_item_nobrnd_od");
  //}
  nlapiLogExecution('debug', 'EOF', "End Of File");
}


function brandLookupSearch() {
  var customrecord_tph_potential_comp_productSearch = nlapiSearchRecord("customrecord_tph_potential_comp_product",null,
                                                                        [
    ["custrecord_tph_potential_comp_line_exten","is","F"], 
    "AND", 
    ["custrecord_tph_potential_comp_brand","isnotempty",""], 
    "AND", 
    [["custrecord_tph_potential_comp_ns_brand","anyof","@NONE@"],"OR",["custrecord_tph_potential_comp_seller_id","isempty",""]], 
    "AND", 
    ["custrecord_tph_potential_comp_iscreated","is","F"]
  ], 
                                                                        [
    new nlobjSearchColumn("custrecord_tph_potential_comp_asin").setSort(false), //0
    new nlobjSearchColumn("custrecord_tph_potential_comp_desc"), //1
    new nlobjSearchColumn("custrecord_tph_potential_comp_market"), //2
    new nlobjSearchColumn("custrecord_tph_potential_comp_detail_pag"), //3
    new nlobjSearchColumn("custrecord_tph_potential_comp_image"), //4
    new nlobjSearchColumn("custrecord_tph_potential_comp_avat_asin"), //5
    new nlobjSearchColumn("custrecord_tph_potential_comp_line_exten"), //6
    new nlobjSearchColumn("custrecord_tph_potential_comp_brand"), //7
    new nlobjSearchColumn("custrecord_tph_potential_comp_ns_brand"), //8
    new nlobjSearchColumn("internalid") //9
  ]
                                                                       );

  return customrecord_tph_potential_comp_productSearch;
}

function trackedbrandLookupSearch(AMZBrand,AccuracyCount) {

  var brandSubstring = AMZBrand.substring(0,AccuracyCount);

  var customrecord_f3_brandnameSearch = nlapiSearchRecord("customrecord_f3_brandname",null,
                                                          [
    ["name","startswith",brandSubstring]
  ], 
                                                          [
    new nlobjSearchColumn("name").setSort(false), //0
    new nlobjSearchColumn("custrecord_tph_brand_amazon_name"), //1
    new nlobjSearchColumn("custrecordbrandowner"), //2
    new nlobjSearchColumn("custrecord_tph_primary_trademark"), //3
    new nlobjSearchColumn("custrecord_tph_brand_store_id"), //4
    new nlobjSearchColumn("custrecord_tph_brand_store_url"), //5
    new nlobjSearchColumn("internalid"), //6
    new nlobjSearchColumn("name","CUSTRECORDBRANDOWNER",null), //7
    new nlobjSearchColumn("custrecordsellername","CUSTRECORDBRANDOWNER",null) //8
  ]
                                                         );
  AccuracyCount = AccuracyCount+1;
  return [customrecord_f3_brandnameSearch, AccuracyCount];
}


