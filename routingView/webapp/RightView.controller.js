sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("uiux.test2.uiuxtest2.controller.RightController", {
        onInit() 
        {
            var oData =        
                            {
                                gt_data: 
                                            [
                                                {Val: "33.1", Label: "5월"},
                                                {Val: "12",   Label: "6월"},
                                                {Val: "51.4", Label: "7월"},
                                                {Val: "52",   Label: "8월"},
                                                {Val: "69.9", Label: "9월"},
                                                {Val: "0.9",  Label: "10월"},
                                                {Val: "20",   Label: "11월"},
                                                {Val: "14",   Label: "12월"}
                                            ]
                            },

                 oModel = new JSONModel(oData); 
                 
            this.getView().setModel(oModel, "data");
        },


        goMain: function()
        {
            this.getRouter().navTo("MainView"); // navigate to main route

        },

        goLeft: function()
        {
            this.getRouter().navTo("LeftView"); // routing name
        },

        // get routing info of current UI5 app (routes from manifest.json)
        getRouter: function()
        {
            return sap.ui.core.UIComponent.getRouterFor(this);
        }
        
    });
});
