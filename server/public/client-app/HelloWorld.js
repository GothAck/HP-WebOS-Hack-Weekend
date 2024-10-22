/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.BarcodeThing",
	kind: enyo.VFlexBox,
  components: [
    {name: "getResults", kind: "WebService",
      onSuccess: "gotResults",
      onFailure: "gotResultsFailure",
    },
    
    {
      name : "getCurPosition",
      kind : "PalmService",
      service : "palm://com.palm.location/",
      method : "getCurrentPosition",
      onSuccess : "posFinished",
      onFailure : "posFail",
      onResponse : "gotResponse",
      subscribe : false,
    },

    {kind: "PageHeader", layoutKind: "HFlexLayout", components: [
      {kind:"Image", src:"logo.png"},
      //{name: "appTitle", content: "BarcodeThing"},
    ]},
    {kind: "RowGroup", caption: "Search for a barcode number", components: [
      {kind: "Input", components: [
        {kind: "Button", caption: "Search", onclick: "btnClick"},
      ]},
    ]},
    {kind: "Scroller", flex: 1, components: [
      {name: "list", kind: "VirtualRepeater", onSetupRow: "getListPlugin",
        components: [
          {kind: "Item", layoutKind: "VFlexLayout", components: [
            {name: "pluginTitle", kind: "Divider"},
            {name: "list_items", kind: "VirtualRepeater", onSetupRow: "getListPluginItem",
              components: [
                {kind: "Item", layoutKind: "VFlexLayout", components: [
                  {name: "itemTitle"},
                  {name: "description", allowHtml: true}
                ]},
              ],
            },
          ]},
        ],
      },
    ]},
  ],
  btnClick: function () {
    this.$.getCurPosition.call({});
  },
  doLinkClick: function (inSender, inUrl) {
    enyo.log("Got URL Click" + inUrl);
    //this.controller.serviceRequest(inUrl, method: 'launch');
  },
  gotResults: function (inSender, inResponse) {
    this.results = inResponse;
    this.$.button.setCaption("Success");
    this.$.list.render();
  },
  gotResultsFailure: function (inSender, inResponse) {
    enyo.log("Got failure from API");
    this.$.button.setCaption("Failure");
  },
  getListPlugin: function (inSender, inIndex) {
    r = this.results[inIndex];
    if (r) {
      this.$.pluginTitle.setCaption(r.plugin.charAt(0).toUpperCase() + r.plugin.slice(1));
      this.$.list_items.results = r.results;
      this.$.list_items.resultsPlugin = r.plugin;
      this.$.list_items.render();
      return true;
    }
  },
  getListPluginItem: function (inSender, inIndex) {
    console.log (inSender, inIndex);
    r = inSender.results[inIndex];
    console.log (r);
    if (r) {
      this.$.itemTitle.setContent(r.title);
      this.$.description.setContent(customRender[inSender.resultsPlugin](r));
      console.log('Rendered');
      return true;
    }
  },
  create: function () {
    this.inherited(arguments);
    this.results = [];
  },

  posFinished : function(inSender, inResponse) {
    //enalert ("getCurrentPosition success, results=" + enyo.json.stringify(inResponse));
    enyo.log("getCurrentPosition success, results=" + enyo.json.stringify(inResponse));
    var url = "http://tnkd.net:3000/lookup/"+this.$.input.getValue()+'/json?lat='+inResponse.latitude+'&lon='+inResponse.longitude;
    this.$.getResults.setUrl(url);
    this.$.getResults.call();
  },
  posFail : function(inSender, inResponse) {
    enyo.log("getCurrentPosition success, results=" + enyo.json.stringify(inResponse));
    var url = "http://tnkd.net:3000/lookup/"+this.$.input.getValue()+'/json';
    this.$.getResults.setUrl(url);
    this.$.getResults.call();
  },
  getPos : function(inSender, inResponse)
  {
    this.$.getCurPosition.call({});
  },

});

customRender = {
  'youtube': function(data) {
      var ret = '<img style="float:left; height: 80px; padding-right: 4px" src="' + data.thumburl + '" />';
      ret += '<a href="' + data.playerurl + '">' + data.title + '</a><div style="clear:both"></div>';
      return ret;
    },
  'ebay': function(data) {
      var ret = '<img style="float:left; height: 80px; padding-right: 4px" src="' + data.galleryURL[0] + '" />';
      ret += '<a href="' + data.viewItemURL + '">' + data.location + '<br /> &pound;' + data.sellingStatus[0].currentPrice[0].__value__ + ' + &pound;' + data.shippingInfo[0].shippingServiceCost[0].__value__ + ' P&P </a>';
      return ret;
    },
  'guardian': function(data) {
      return '<a href="' + data.url + '">' + data.text + '</a><div style="clear:both"></div>';
    },
  }
