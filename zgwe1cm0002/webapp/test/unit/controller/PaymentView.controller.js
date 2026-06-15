/*global QUnit*/

sap.ui.define([
	"zgwe1cm0002/controller/PaymentView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("PaymentView Controller");

	QUnit.test("I should test the PaymentView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
