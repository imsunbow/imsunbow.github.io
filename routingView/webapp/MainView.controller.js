sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("uiux.test2.uiuxtest2.controller.MainView", {
        onInit() 
        {

        },

        goLeft: function()
        {
            this.getRouter().navTo("LeftView"); // routing name
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
