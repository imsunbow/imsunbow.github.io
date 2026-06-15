/*global QUnit*/

sap.ui.define([
	"zgwe1fi0002/zgwe1fi0002/controller/DunningView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("DunningView Controller");

	QUnit.test("I should test the DunningView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
