function main() {
  var products = prodSpecSearch();
  var domain = "https://6915778.app.netsuite.com"
  for (var i in products) {
    var productsResultSet = products[i];
    var columns = productsResultSet.getAllColumns();

    var internalId = productsResultSet.getValue(columns[0]);
    var asin = productsResultSet.getValue(columns[1]);
    var prodSpecID = productsResultSet.getValue(columns[2]);
    var prodSpec = nlapiLoadFile(prodSpecID);
    var prodSpecFolder = prodSpec.getFolder();
    var prodSpecURLSlug = prodSpec.getURL();
    var prodSpecURL = domain + prodSpecURLSlug;
    nlapiLogExecution('debug', 'Output', asin + " Product Spec URL: " + prodSpecURL);
    nlapiSubmitField('assemblyitem',internalId,'custitem_tph_product_spec_link', prodSpecURL);
  }
}

function prodSpecSearch() {
  var itemSearch = nlapiSearchRecord("item",null,
[
   ["externalid","noneof","@NONE@"], 
   "AND", 
   ["custitem_tph_purchase_spec","noneof","@NONE@"]
], 
[
   new nlobjSearchColumn("internalid"), 
   new nlobjSearchColumn("externalid"), 
   new nlobjSearchColumn("custitem_tph_purchase_spec")
]
);
  return itemSearch;
}