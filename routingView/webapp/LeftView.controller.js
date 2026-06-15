sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("uiux.test2.uiuxtest2.controller.LeftView", {
        onInit() 
        {
            var oModel2 = new JSONModel("/left/left.json");

            this.getView().setModel(oModel2, "left")
        },

        goMain: function()
        {
            this.getRouter().navTo("MainView"); // navigate to main route
        },

        goRight: function()
        {
            this.getRouter().navTo("RightView"); // routing name
        },

        // get routing info of current UI5 app (routes from manifest.json)
        getRouter: function()
        {
            return sap.ui.core.UIComponent.getRouterFor(this);
        }
        
    });
});
