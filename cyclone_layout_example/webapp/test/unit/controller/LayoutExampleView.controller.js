/*global QUnit*/

sap.ui.define([
	"cyclone/layout/example/cyclonelayoutexample/controller/LayoutExampleView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("LayoutExampleView Controller");

	QUnit.test("I should test the LayoutExampleView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
