/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
* 
*
* Purpose: Find Potential Competitors per Market
* Author: Corey Johnson
* Date: 2021/12/07
*
*
*/

"use strict";

define(['N/record','N/search'], function (record,search) {
  
  var beforeLoad = function beforeLoad(context) {
    /*log.debug({
      title: 'beforeLoad: context',
      details: context
    });*/
    
    if ((context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT)) {
      var title = context.newRecord.getValue({
        fieldId: "title"
      });
      var messageId = context.newRecord.getValue({
        fieldId: "id"
      });
      var messageResult = FirstMessageSearch(messageId)
      var messageResultSet = messageResult.run();
      var messageResults = messageResultSet.getRange(0,1);
      for(var i in messageResults){
        var resultMessage = messageResults[i];
        for(var j in resultMessage.columns){
          var message = resultMessage.getValue(resultMessage.columns[j]);

        }
      }

      var titleArray = title.split(' ');
      var firstWord = titleArray[0];
      if(firstWord == 'Inquiry'){
        var amzOrderId = title.substr(-20,19);
        context.newRecord.setValue({
          fieldId: "category",
          value: 3
        });
      }
      /*else if(firstWord == 'Refund') {
        var amzOrderId = title.substr(-19,19);
        context.newRecord.setValue({
          fieldId: "category",
          value: 4
        });

        // Find the refund Reason
        var findRefundReason = "We will adjust your seller account accordingly.";
        var parsingReasonEndPos = message.indexOf(findRefundReason)-59; // End of the Refund Reason
        var firstHalfMessage = message.substring(0,parsingReasonEndPos);
        var parsingReasonStartPos = message.lastIndexOf("style=\"font-size:0.765em\"")+26;
        var refundReason = message.substring(parsingReasonStartPos,parsingReasonEndPos);

        // Find Amount being refunded
        var findRefundAmount = "Initiated a refund in the amount of USD ";
        var parsingRefundAmountStart = message.indexOf(findRefundAmount);
        var refundAmount = message.substring(parsingRefundAmountStart+40, parsingRefundAmountStart+46);

        // Find Item being Refunded
        var findRefundItem = "Refund Reason"
        var parsingRefundItem = message.indexOf(findRefundItem)+117;
        var refundItemASIN = message.substring(parsingRefundItem, parsingRefundItem+10);
        /*log.debug({
          title: 'refundItem',
          details: refundItemASIN
        });

        var refundItemResult = ItemSearch(refundItemASIN);
        var itemResultSet = refundItemResult.run();
        var itemResults = itemResultSet.getRange(0,1);
        for(var i in itemResults){
          var resultItem = itemResults[i];
          for(var j in resultItem.columns){
            var refundItem = resultItem.getValue(resultItem.columns[j]);
          }
        }
        context.newRecord.setValue({
          fieldId: "item",
          value: refundItem
        });
        if(refundAmount < 100) {
          context.newRecord.setValue({
            fieldId: "status",
            value: "5"
          });
        }
        if(refundReason != 0) {
          context.newRecord.setValue({
            fieldId: "quicknote",
            value: "Refund Reason: " + refundReason + " - Amount Refunded: $" + refundAmount
          });
        }
      }*/
      else {
        var amzOrderId = "114";
      }
      var searchResult = SalesOrderSearch(amzOrderId);
      var resultSet = searchResult.run();
      var results = resultSet.getRange(0,1);
      for(var i in results){
        var result = results[i];
        for(var j in result.columns){
          var orderIntId = result.getValue(result.columns[j]);
        }
      }
      
      context.newRecord.setValue({
        fieldId: "custevent_tph_case_linked_trans",
        value: orderIntId
      });
    }
    
    
  };

  var beforeSubmit = function beforeSubmit(context) {
    log.debug({
      title: 'beforeSubmit: context',
      details: context
    });
    if ((context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT)) {
      var title = context.newRecord.getValue({
        fieldId: "title"
      });
      var messageId = context.newRecord.getValue({
        fieldId: "id"
      });
      var messageResult = FirstMessageSearch(messageId)
      var messageResultSet = messageResult.run();
      var messageResults = messageResultSet.getRange(0,1);
      for(var i in messageResults){
        var resultMessage = messageResults[i];
        for(var j in resultMessage.columns){
          var message = resultMessage.getValue(resultMessage.columns[j]);

        }
      }

      var titleArray = title.split(' ');
      var firstWord = titleArray[0];
      if(firstWord == 'Inquiry'){
        var amzOrderId = title.substr(-20,19);
        context.newRecord.setValue({
          fieldId: "category",
          value: 3
        });
      }
      else if(firstWord == 'Refund') {
        var amzOrderId = title.substr(-19,19);
        context.newRecord.setValue({
          fieldId: "category",
          value: 4
        });

        // Find the refund Reason
        var findRefundReason = "We will adjust your seller account accordingly.";
        var parsingReasonEndPos = message.indexOf(findRefundReason)-59; // End of the Refund Reason
        var firstHalfMessage = message.substring(0,parsingReasonEndPos);
        var parsingReasonStartPos = message.lastIndexOf("style=\"font-size:0.765em\"")+26;
        var refundReason = message.substring(parsingReasonStartPos,parsingReasonEndPos);

        // Find Amount being refunded
        var findRefundAmount = "Initiated a refund in the amount of USD ";
        var parsingRefundAmountStart = message.indexOf(findRefundAmount);
        var refundAmount = message.substring(parsingRefundAmountStart+40, parsingRefundAmountStart+46);

        // Find Item being Refunded
        var findRefundItem = "Refund Reason"
        var parsingRefundItem = message.indexOf(findRefundItem)+117;
        var refundItemASIN = message.substring(parsingRefundItem, parsingRefundItem+10);
        /*log.debug({
          title: 'refundItem',
          details: refundItemASIN
        });

        var refundItemResult = ItemSearch(refundItemASIN);
        var itemResultSet = refundItemResult.run();
        var itemResults = itemResultSet.getRange(0,1);
        for(var i in itemResults){
          var resultItem = itemResults[i];
          for(var j in resultItem.columns){
            var refundItem = resultItem.getValue(resultItem.columns[j]);
          }
        }
        context.newRecord.setValue({
          fieldId: "item",
          value: refundItem
        });*/
        if(refundAmount < 100) {
          context.newRecord.setValue({
            fieldId: "status",
            value: "5"
          });
        }
        if(refundReason != 0) {
          context.newRecord.setValue({
            fieldId: "quicknote",
            value: "Refund Reason: " + refundReason + " - Amount Refunded: $" + refundAmount
          });
        }
      }
      else {
        var amzOrderId = "114";
      }
      var searchResult = SalesOrderSearch(amzOrderId);
      var resultSet = searchResult.run();
      var results = resultSet.getRange(0,1);
      for(var i in results){
        var result = results[i];
        for(var j in result.columns){
          var orderIntId = result.getValue(result.columns[j]);
        }
      }
      
      context.newRecord.setValue({
        fieldId: "custevent_tph_case_linked_trans",
        value: orderIntId
      });
    };

  };

  var afterSubmit = function afterSubmit(context) {
    /*log.debug({
      title: 'afterSubmit: context',
      details: context
    });
    if (!(context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT)) return; // var itemRecordx = context.newRecord;
*/
  };

  return {
    beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit
  };
  
  
  
  
  
  function SalesOrderSearch(AmzOrderId){
    try {
    var salesorderSearchObj = search.create({
   type: "salesorder",
   filters:
   [
      ["type","anyof","SalesOrd"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["tranid","is",AmzOrderId]
   ],
   columns:
   [
      search.createColumn({name: "internalid", label: "Internal ID"})
   ]
});
      
    } catch (error) {
      return null;
    }
//var searchResultCount = salesorderSearchObj.runPaged().count;
//log.debug("salesorderSearchObj result count",searchResultCount);

   return salesorderSearchObj;
  }
  
  
  function FirstMessageSearch(MessageId) {
    var supportcaseSearchObj = search.create({
      type: "supportcase",
      filters:
      [
        ["formulanumeric: CASE WHEN {messagedate} = {createddate} THEN 1 ELSE 0 END","equalto","1"], 
        "AND", 
        ["internalidnumber","equalto",MessageId]
      ],
      columns:
      [
        search.createColumn({name: "message", label: "Message Text"})
      ]
    });

    return supportcaseSearchObj;
  }
  
  
  function ItemSearch(RefundItemASIN) {
    var itemSearchObj = search.create({
      type: "assemblyitem",
      filters:
      [
        ["externalidstring","is",RefundItemASIN]
      ],
      columns:
      [
        search.createColumn({name: "internalid", label: "Internal ID"})
      ]
    });

    return itemSearchObj;
  }
  
});


