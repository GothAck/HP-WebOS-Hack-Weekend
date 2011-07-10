/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.BarcodeThing",
	kind: enyo.VFlexBox,
  components: [
    {name: "getResults", kind: "WebService",
      onSuccess: "gotResults",
      onFailure: "gotResultsFailure",
    },
    {kind: "PageHeader", content: "BarcodeThing"},
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
                  {name: "description", kind: "HtmlContent", onLinkClick: "doLinkClick"}
                ]},
              ],
            },
          ]},
        ],
      },
    ]},
  ],
  btnClick: function () {
    var url = "http://localhost:3000/lookup/"+this.$.input.getValue()+'/json';
    this.$.getResults.setUrl(url);
    this.$.getResults.call();
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
  }
});
/*
enyo.kind({
  name: "enyo.Canon.ListItem",
  kind: enyo.VFlexLayout,
  components: [ { content: "Content" } ],
  content: "Content",
});

enyo.kind({
  name: "enyo.Canon.WebService",
  kind: enyo.WebService,
  url: "http://localhost/lookup",
  onSuccess: "gotSearch",
  onFailure: "gotSearchFailure",
  gotSearch: function (inSender, inResponse, inRequest) {
    this.searchResults = inResponse;
  },
  gotSearchFailure: function (inSender, inResponse, inRequest) {
    enyo.log("fail response");
  },
});

enyo.kind({
  name: "enyo.Canon.ThingList",
  kind: enyo.SlidingView,
  layoutKind: enyo.VFlexLayout,
  components: [],
});
*/
customRender = {
  'youtube': function(data) {
      return '<a href="' + data.playerurl + '">' + data.title + '</a>';
    },
  'ebay': function(data) {
      return '<a href="' + data.viewItemURL + '">' + data.location + '<br /> &pound;' + data.sellingStatus[0].currentPrice[0].__value__ + ' + &pound;' + data.shippingInfo[0].shippingServiceCost[0].__value__ + ' P&P </a>';
    },
  'guardian': function(data) {
      return '<a href="' + data.url + '">' + data.text + '</a>';
    },
  }
