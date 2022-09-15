define(['N/record','N/search','N/ui/dialog', 'N/log'], function (record, search, dialog, log) {
  /**
    *@NApiVersion 2.0
    *@NScriptType ClientScript
    *@Author Corey Johnson
    *@Date: 2021-12-07
    */

  function pageInit(context) {
    var currentRecord = context.currentRecord;
  }

  function fieldChanged(context) {
    var currentRecord = context.currentRecord;
    var currentfieldid = context.fieldId;

    var asin = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_asin'
    });

    var startDate = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_start_date'
    });

    var endDate = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_end_date'
    });

    var saleDuration = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_sale_duration'
    });

    var basePrice = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_base_price'
    });

    var salePrice = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_sale_price'
    });

    var referralFee = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_referral_fee'
    });

    var fbaFee = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_fba_fee'
    });

    var avgCost = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_avg_cost'
    });

    var expectedSaleIncrease = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_exp_sale_incr'
    });

    var contributionProfitBasePrice = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_bp_cp'
    });

    var contributionMarginBasePrice = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_bp_cm'
    });

    var t30UPD = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_t30_upd'
    });

    var dollarDiscount = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_discount_price'
    });

    var discountCP = context.currentRecord.getValue({
      fieldId:'custrecord_tph_sale_price_discount_cp'
    });

    if(currentfieldid === "custrecord_tph_sale_price_start_date" || currentfieldid === "custrecord_tph_sale_price_end_date"){
      var saleDur = changeDuration(context, startDate, endDate);
    }

    if(currentfieldid === "custrecord_tph_sale_price_sale_price" || currentfieldid === "custrecord_tph_sale_price_base_price"){
      var saleDiscount = changeDiscount(context, asin, salePrice, basePrice, avgCost, referralFee, fbaFee, t30UPD, saleDuration, expectedSaleIncrease, contributionProfitBasePrice);
    }

    if(currentfieldid === "custrecord_tph_sale_price_asin"){
      //log.debug({title: "asin: ", details: asin});
      var asinId = getAsinID(context,asin,salePrice,basePrice,avgCost,fbaFee,referralFee);
    }

    if(currentfieldid === "custrecord_tph_sale_price_exp_sale_incr"){
      //log.debug({title: "expectedSaleIncrease: ", details: expectedSaleIncrease});
      var expectedSale = expectedUpD(context,expectedSaleIncrease,t30UPD,dollarDiscount,discountCP,saleDuration);
    }
  }


  function expectedUpD(context,ExpectedSaleIncrease,T30UPD,DollarDiscount,DiscountCP,SaleDuration) {
    if(ExpectedSaleIncrease == '' || ExpectedSaleIncrease == null || T30UPD == '' || T30UPD == null || SaleDuration == '' || SaleDuration == null) {
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_exp_upd',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_total_dis_doll',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_total_dis_cp',
        value: ''
      });

    }
    else {
      //log.debug({title: "expectedSaleIncrease: ", details: ExpectedSaleIncrease});
      var expectedSaleUPD = Math.round((1+(ExpectedSaleIncrease/100))*T30UPD)
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_exp_upd',
        value: expectedSaleUPD
      });

      var totalDiscountDollar = Math.round((DollarDiscount * T30UPD * SaleDuration * (1 + ExpectedSaleIncrease))*100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_total_dis_doll',
        value: totalDiscountDollar
      });

      var totalDiscountCPDollar = Math.round((DiscountCP * T30UPD * SaleDuration * (1 + ExpectedSaleIncrease))*100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_total_dis_cp',
        value: totalDiscountDollar
      });
    }
    return true;
  }


  function getAsinID(context,ASIN,SalePrice,BasePrice,AVGCost,FBAFee,ReferralFee) {
    if(ASIN == '' || ASIN == null) {
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_fba_fee',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_referral_fee',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_t30_upd',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_bp_ref_fee',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_bp_cp',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_bp_cm',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_asin_text',
        value: ''
      });
    }
    else {
      var salesorderSearchObj = search.create({
        type: "salesorder",
        filters:
        [
          ["type","anyof","SalesOrd"],
          "AND", 
          ["item","anyof",ASIN],
          "AND", 
          ["custbody_tph_order_date_time","within","daysago30"]
        ],
        columns:
        [
          search.createColumn({
            name: "quantity",
            summary: "SUM",
            label: "Units Sold on Date"
          })
        ],
        isPublic: "true"
      });
      var unitSoldObj = salesorderSearchObj.run().getRange({
        start: 0,
        end: 1
      })[0];
      //log.debug("resultOBJ result ",resultObj);

      var t30UPD = Math.round((unitSoldObj.getValue(unitSoldObj.columns[0]))/30);
      //log.debug("t30UPD result ",t30UPD);
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_t30_upd',
        value: t30UPD
      });


      var itemSearchObj = search.create({
        type: "item",
        filters:
        [
          ["internalidnumber","equalto",ASIN], 
          "AND", 
          ["custrecord_f3_item.custrecord_f3_marketplace","anyof","8"]
        ],
        columns:
        [
          search.createColumn({name: "externalid", label: "External ID"}),
          search.createColumn({
            name: "itemid",
            sort: search.Sort.ASC,
            label: "Name"
          }),
          search.createColumn({name: "salesdescription", label: "Description"}),
          search.createColumn({
            name: "custrecord_f3_referralfee",
            join: "CUSTRECORD_F3_ITEM",
            label: "% Referral Fee"
          }),
          search.createColumn({
            name: "custrecord_f3_fulfillmentfee",
            join: "CUSTRECORD_F3_ITEM",
            label: "Fulfillment Fee"
          }),
          search.createColumn({name: "baseprice", label: "Base Price"}),
          search.createColumn({name: "averagecost", label: "Average Cost"})
        ]
      });
      var resultObj = itemSearchObj.run().getRange({
        start: 0,
        end: 1
      })[0];

      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_asin_text',
        value: resultObj.getValue(resultObj.columns[1])
      });

      if(BasePrice == '' || BasePrice == null) {
        var basePrice = resultObj.getValue(resultObj.columns[5]);
        //log.debug("baseprice result ",basePrice);
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_sale_price_base_price',
          value: basePrice
        });
      }
      else {
        var basePrice = BasePrice;
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_sale_price_base_price',
          value: basePrice
        });
      }

      if(FBAFee == '' || FBAFee == null) {
        var fbaFee = resultObj.getValue(resultObj.columns[4]);
        //log.debug("fbaFee result ",fbaFee);
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_sale_price_fba_fee',
          value: fbaFee
        });
      }
      else {
        var fbaFee = FBAFee;
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_sale_price_fba_fee',
          value: fbaFee
        });
      }

      if(AVGCost == '' || AVGCost == null) {
        var avgCost = resultObj.getValue(resultObj.columns[6]);
        //log.debug("fbaFee result ",fbaFee);
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_sale_price_avg_cost',
          value: avgCost
        });
      }
      else {
        var avgCost = AVGCost;
        context.currentRecord.setValue({
          fieldId:'custrecord_tph_sale_price_avg_cost',
          value: avgCost
        });
      }

      var referralFeeBasePrice = Math.round((basePrice*(((resultObj.getValue(resultObj.columns[3])).substring(0,4))/100)) * 100) / 100;
      log.debug("feeObj result ",referralFeeBasePrice);
      log.debug("feeObj result ",basePrice);
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_bp_ref_fee',
        value: referralFeeBasePrice
      });

      var contributionProfitBasePrice = Math.round((basePrice-avgCost-fbaFee-referralFeeBasePrice) * 100) / 100;
      var contributionMarginBasePrice = Math.round((contributionProfitBasePrice/basePrice*100) * 100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_bp_cp',
        value: contributionProfitBasePrice
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_bp_cm',
        value: contributionMarginBasePrice
      });
    }
    return true;
  }


  function changeDuration(context,StartDate,EndDate) {
    if(StartDate == '' || StartDate == null || EndDate == '' || EndDate == null) {
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_sale_duration',
        value: ''
      });
    }
    else {
      var saleDuration = (EndDate-StartDate)/(24*60*60*1000);
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_sale_duration',
        value: saleDuration
      });
    }
    return true;
  }

  function changeDiscount(context,ASIN,SalePrice,BasePrice,AVGCost,ReferralFee,FBAFee,T30UPD,SaleDuration,ExpectedSaleIncrease,ContributionProfitBasePrice) {
    if(SalePrice == ''|| SalePrice == null || BasePrice == '' || BasePrice == null || AVGCost == '' || AVGCost == null) {
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_discount_price',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_discount_prece',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_cp',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_cm',
        value: ''
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_referral_fee',
        value: ''
      });
    }
    else {
      var dollarDiscount = Math.round((BasePrice-SalePrice) * 100) / 100;
      var percentDiscount = Math.round((((BasePrice-SalePrice)/BasePrice)*100) * 100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_discount_price',
        value: dollarDiscount
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_discount_prece',
        value: percentDiscount
      });
      var feeSearchObj = search.create({
        type: "item",
        filters:
        [
          ["internalidnumber","equalto",ASIN], 
          "AND", 
          ["custrecord_f3_item.custrecord_f3_marketplace","anyof","8"]
        ],
        columns:
        [
          search.createColumn({
            name: "custrecord_f3_referralfee",
            join: "CUSTRECORD_F3_ITEM",
            label: "% Referral Fee"
          })
        ]
      });
      var feeObj = feeSearchObj.run().getRange({
        start: 0,
        end: 1
      })[0];
      //log.debug("resultOBJ result ",resultObj);

      var referralFee = SalePrice*(((feeObj.getValue(feeObj.columns[0])).substring(0,4))/100);
      //log.debug("feeObj result ",referralFee);
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_referral_fee',
        value: referralFee
      });

      var contributionProfit = Math.round((SalePrice-AVGCost-FBAFee-ReferralFee) * 100) / 100;
      var contributionMargin = Math.round((contributionProfit/SalePrice*100) * 100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_cp',
        value: contributionProfit
      });
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_cm',
        value: contributionMargin
      });

      var discountCP = ContributionProfitBasePrice-contributionProfit;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_discount_cp',
        value: discountCP
      });

      var totalDiscountDollar = Math.round((dollarDiscount * T30UPD * SaleDuration * (1 + ExpectedSaleIncrease))*100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_total_dis_doll',
        value: totalDiscountDollar
      });

      var totalDiscountCPDollar = Math.round((discountCP * T30UPD * SaleDuration * (1 + ExpectedSaleIncrease))*100) / 100;
      context.currentRecord.setValue({
        fieldId:'custrecord_tph_sale_price_total_dis_cp',
        value: totalDiscountDollar
      });
    }
    return true;
  }


  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged
  }

});