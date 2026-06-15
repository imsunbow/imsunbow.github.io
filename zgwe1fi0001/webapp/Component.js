sap.ui.define([
    "sap/ui/core/UIComponent",
    "zgwe1fi0001/zgwe1fi0001/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("zgwe1fi0001.zgwe1fi0001.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});