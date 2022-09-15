/*
*
* Purpose: Create Potential Competitor Item Record in Item Master
* Author: Corey Johnson
* Date: 2021/12/25
*
*
*/

function main() {
  // Create a Saved Search to find Potnetial Competitors to Create - https://6915778.app.netsuite.com/app/common/search/search.nl?cu=T&e=T&id=2000
  var potentCompToCreate = potentCompToCreateSearch();
  for (var i in potentCompToCreate) {
    try {
      var potentCompToCreateResultSet = potentCompToCreate[i];
      var columns = potentCompToCreateResultSet.getAllColumns();
      //nlapiLogExecution('debug', 'Start', 'Start of Record' + columns);

      var asin = potentCompToCreateResultSet.getValue(columns[0]);
      var desc = potentCompToCreateResultSet.getValue(columns[1]);
      var market = potentCompToCreateResultSet.getValue(columns[2]);
      var dp = potentCompToCreateResultSet.getValue(columns[3]);
      var image = potentCompToCreateResultSet.getValue(columns[4]);
      var avatarAsin = potentCompToCreateResultSet.getValue(columns[5]);
      var sellerName = potentCompToCreateResultSet.getValue(columns[7]);
      var sellerID = potentCompToCreateResultSet.getValue(columns[8]);
      var brand = potentCompToCreateResultSet.getValue(columns[9]);
      var countryCode = potentCompToCreateResultSet.getValue(columns[10]);
      var price = potentCompToCreateResultSet.getValue(columns[11]);
      var potentCompInternalID = potentCompToCreateResultSet.getValue(columns[12]);
      //nlapiLogExecution('debug', 'Output', potentCompToCreate);
      var marketplaceSellerID = createMarketplaceSellerRecord(sellerID,sellerName,countryCode);

      var brandRecordID = createBrandRecord(brand,marketplaceSellerID);

      if(brandRecordID != null) {
        var itemRecordID = createItemRecord(asin,desc,market,avatarAsin,brandRecordID,price);

        nlapiSubmitField('customrecord_tph_potential_comp_product',potentCompInternalID,'custrecord_tph_potential_comp_iscreated','T');
      }
      else {
        nlapiLogExecution('debug', 'No Item Created', "No Item Created for ASIN: " + asin + ". No Brand Found.");
      }
    } catch(error){nlapiLogExecution('debug', 'Error in Item Creation', asin + ' - ' + error);}

  }
  nlapiLogExecution('debug', 'Finished', "Script Complete");
}

function potentCompToCreateSearch() {
  var findItems = nlapiSearchRecord("customrecord_tph_potential_comp_product",null,
[
   ["custrecord_tph_potential_comp_avat_asin","noneof","@NONE@"], 
   "AND", 
   ["custrecord_tph_potential_comp_line_exten","is","F"], 
   "AND", 
   ["custrecord_tph_potential_comp_iscreated","is","F"], 
   "AND", 
   ["custrecord_tph_potential_comp_seller_id","isnotempty",""],
   "AND", 
   ["custrecord_tph_potential_comp_market","isnotempty",""]
    
], 
[
   new nlobjSearchColumn("custrecord_tph_potential_comp_asin").setSort(false), //columns[0]
   new nlobjSearchColumn("custrecord_tph_potential_comp_desc"), //columns[1]
   new nlobjSearchColumn("custrecord_tph_potential_comp_market"), //columns[2]
   new nlobjSearchColumn("custrecord_tph_potential_comp_detail_pag"), //columns[3]
   new nlobjSearchColumn("custrecord_tph_potential_comp_image"), //columns[4]
   new nlobjSearchColumn("custrecord_tph_potential_comp_avat_asin"), //columns[5]
   new nlobjSearchColumn("custrecord_tph_potential_comp_line_exten"), //columns[6]
   new nlobjSearchColumn("custrecord_tph_potential_comp_sellr_name"), //columns[7]
   new nlobjSearchColumn("custrecord_tph_potential_comp_seller_id"), //columns[8]
   new nlobjSearchColumn("custrecord_tph_potential_comp_brand"), //columns[9]
   new nlobjSearchColumn("custrecord_tph_potential_comp_country"), //columns[10]
   new nlobjSearchColumn("custrecord_tph_potential_comp_price"), //columns[11]
   new nlobjSearchColumn("internalid") //columns[12]
]
);
  return findItems;
}


function createMarketplaceSellerRecord(SellerID,SellerName,CountryCode) {
  
  var marketplaceSellerIDSearchResult = marketplaceSellerIDSearch(SellerID);
  
  if(marketplaceSellerIDSearchResult != undefined){
    var marketplaceSeller = marketplaceSellerIDSearchResult[0];
    var columns = marketplaceSeller.getAllColumns();
    var name = marketplaceSeller.getValue(columns[0]);
    var recordID = marketplaceSeller.getValue(columns[1]);
    nlapiLogExecution('debug', 'End', 'Marketplace Seller Exists: ' + SellerID);
  }
  else{
    
    switch(CountryCode) {
      case 'US':
        CountryCode = '230';
        break;
      case 'CN':
        CountryCode = '47';
        break;
      case 'HK':
        CountryCode = '47';
        break;
    }

    var marketplaceSellerRecord = nlapiCreateRecord('customrecordmarketplacesellers');

    marketplaceSellerRecord.setFieldValue('name',SellerID);
    marketplaceSellerRecord.setFieldValue('custrecordsellername',SellerName);
    marketplaceSellerRecord.setFieldValue('custrecordcountry',CountryCode);
    //nlapiLogExecution('debug', 'countryCode', CountryCode);

    var recordID = nlapiSubmitRecord(marketplaceSellerRecord);
    
    //nlapiLogExecution('debug', 'marketplaceSellerID', recordID);

    nlapiLogExecution('debug', 'End', 'End of Marketplace Seller Record');
  }
  return recordID;
}

function marketplaceSellerIDSearch(SellerID) {
  //nlapiLogExecution('debug', 'legnth if found', SellerID);
  var potentialCompetitors = nlapiSearchRecord("customrecordmarketplacesellers",null,
[
   ["name","is",SellerID]
], 
[
   new nlobjSearchColumn("name").setSort(false),
   new nlobjSearchColumn("internalid")
]
);
  return potentialCompetitors;
}


function createBrandRecord(Brand,SellerInternalID) {

  var brandIDSearchResult = brandIDSearch(Brand, SellerInternalID);

  if(brandIDSearchResult != undefined) {
    var brandIDSearchResultSet = brandIDSearchResult[0];
    var columns = brandIDSearchResultSet.getAllColumns();
    var name = brandIDSearchResultSet.getValue(columns[0]);
    var recordID = brandIDSearchResultSet.getValue(columns[1]);
    nlapiLogExecution('debug', 'End', 'Brand Already Exists: ' + recordID);
  }
  else{
    nlapiLogExecution('debug', 'End', brandIDSearchResult);

    var brandRecord = nlapiCreateRecord('customrecord_f3_brandname');
  
    brandRecord.setFieldValue('name',Brand);
    brandRecord.setFieldValue('custrecordbrandowner',SellerInternalID);
  
    var recordID = nlapiSubmitRecord(brandRecord);
    nlapiLogExecution('debug', 'End', 'Brand Record Created: ' + recordID);
  }
  
  return recordID;
}


function brandIDSearch(Brand,SellerID) {

  var potentialCompetitors = nlapiSearchRecord("customrecord_f3_brandname",null,
[
   ["name","is",Brand],
   "AND",
   ["custrecordbrandowner","is",SellerID]
], 
[
   new nlobjSearchColumn("name").setSort(false),
    new nlobjSearchColumn("internalid")
]
);
  return potentialCompetitors;
}


function createItemRecord(ASIN,Desc,Market,AvatarAsin,BrandID,Price) {
  
  var itemRecordResult = itemCheckSearch(ASIN);
  
  if(itemRecordResult != undefined) {
    var itemSearchResultSet = itemRecordResult[0];
    var columns = itemSearchResultSet.getAllColumns();
    var asin = itemSearchResultSet.getValue(columns[0]);
    var recordID = itemSearchResultSet.getValue(columns[1]);
    nlapiLogExecution('debug', 'End', 'Item Already Exists: ' + recordID + ' ASIN: ' + asin);
  }
  else {
    var itemRecord = nlapiCreateRecord('assemblyitem');

    itemRecord.setFieldValue('itemid',ASIN);
    itemRecord.setFieldValue('taxschedule',2);
    itemRecord.setFieldValue('custitem_tph_avatar_asin',AvatarAsin);
    itemRecord.setFieldValue('custitem_f3_productbrand',BrandID);
    itemRecord.setFieldValue('class',Market);
    itemRecord.setFieldValue('custitem2','T');
    itemRecord.setFieldValue('description',Desc);
    itemRecord.setFieldValue('unitstype',1);
    itemRecord.setFieldValue('externalid',ASIN);
    itemRecord.setFieldValue('custitem_tph_not_hatchery_product','T');
    itemRecord.setLineItemMatrixValue('price','price',1,1,Price);

    var recordID = nlapiSubmitRecord(itemRecord);
    nlapiLogExecution('debug', 'End', 'Item Created: ' + recordID + ' ASIN: ' + ASIN);
  }
  return recordID;
}


function itemCheckSearch(ASIN) {
  var potentialCompetitors = nlapiSearchRecord("item",null,
[
   ["itemid","is",ASIN]
], 
[
   new nlobjSearchColumn("itemid").setSort(false),
   new nlobjSearchColumn("internalid")
]
);
  return potentialCompetitors;
}







