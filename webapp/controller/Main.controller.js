sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/Token'
], function (Controller, JSONModel, Fragment, ColumnListItem, Label, Token) {
	"use strict";
	return Controller.extend("com.bosch.idocmonitor.controller.Main", {
		onInit: function () {
			// var arrayYears = [{year:"2020"},{year:"2019"}];
			// var oYear = JSON.stringify(arrayYears);
			this._oMultiInput = this.getView().byId("compCode");
			var oYears = {
				arrayYears: []
			};
			// var sYear = JSON.stringify(oYear);

			var date = new Date();
			var currentYear = date.getFullYear();
			var previousYear;
			for (var i = 0; i < 10; i++) {
				var oYear = {};
				previousYear = currentYear - i;
				oYear.year = previousYear;
				// oYears.arrayYears.push(oYear);
				oYears.arrayYears[i] = oYear;
			}

			var columns = {
				cols: [{
					label: "Company Code",
					template: "Code"
				}, {
					label: "Company Name",
					template: "Name"
				}]
			};
			this._oModelColumns = new JSONModel(columns);
			this._oModelCompanies = new JSONModel(sap.ui.require.toUrl("com/bosch/idocmonitor/localService/company.json"))

			var oModelYear = new JSONModel(oYears);
			// var oModelYear = new JSONModel(sap.ui.require.toUrl("com/bosch/idocmonitor/localService/years.json"));
			this.getView().setModel(oModelYear, "years");

			// var oModel = new JSONModel();
			// this.getView().setModel(oModel);

		},

		updateFinished: function (oEvent) {
			var sTitle,
				oTable = oEvent.getSource(),
				oViewModel = this.getModel(),
				iTotalItems = oEvent.getParameter("total");

			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {

			}
		},

		onSearch: function () {

			var oDateRange = this.getView().byId("dateRange");
			if (oDateRange.getDateValue() !== null) {
				var sFrom = oDateRange.getFrom().toDateString().slice(4, 15);
				var sTo = oDateRange.getTo().toDateString().slice(4, 15);
				var oTitle = this.getView().byId("tableTitle");
				var sTitle = sFrom.concat(" - ", sTo);
				oTitle.setText(sTitle);
			}

			var oLSSender = this.getView().byId("inputLSSender");
			if (oLSSender.getValue() === "") {
				oLSSender.setValueState(sap.ui.core.ValueState.Error);
			}

			if (typeof this.getView().getModel() === "undefined") {
				var oModel = new JSONModel(sap.ui.require.toUrl("com/bosch/idocmonitor/localService/idocs.json"));
				this.getView().setModel(oModel);
			}
		},

		onRequiredField: function (oEvent) {
			oEvent.getSource();
		},

		inputChange: function (oEvent) {
			var oInput = oEvent.getSource();
			if (oInput.getValue() !== "") {
				oInput.setValueState(sap.ui.core.ValueState.None);
			}
		},

		onValueHelpRequest: function () {
			var aCols = this._oModelColumns.getData().cols;

			this._oValueHelpDialog = sap.ui.xmlfragment("com.bosch.idocmonitor.view.ValueHelpDialog", this);
			this.getView().addDependent(this._oValueHelpDialog);

			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				oTable.setModel(this._oModelCompanies);
				oTable.setModel(this._oModelColumns, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/companies");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/companies", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({
									text: "{" + column.template + "}"
								});
							})
						});
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

			this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
			this._oValueHelpDialog.open();
		},
		
		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInput.setTokens(aTokens);
			this._oValueHelpDialog.close();
		},

		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
		}
	});
});