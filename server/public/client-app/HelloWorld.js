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
      {name: "list", kind: "VirtualRepeater", onSetupRow: "getListItem",
        components: [
          {kind: "Item", layoutKind: "VFlexLayout", components: [
            {name: "title", kind: "Divider"},
            {name: "description"}
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
    console.log (inResponse);
    this.results = inResponse;
    this.$.button.setCaption("Success");
    this.$.list.render();
  },
  gotResultsFailure: function (inSender, inResponse) {
    enyo.log("Got failure from API");
    this.$.button.setCaption("Failure");
  },
  getListItem: function (inSender, inIndex) {
    r = this.results[inIndex];
    if (r) {
      this.$.title.setCaption(r.plugin.charAt(0).toUpperCase() + r.plugin.slice(1));
      this.$.description.setContent("This");
      return true;
    }
  },
  create: function () {
    this.inherited(arguments);
    this.results = [];
  }
});

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
