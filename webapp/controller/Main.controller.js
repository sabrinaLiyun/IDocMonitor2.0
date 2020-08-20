sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Token",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../model/formatter"
], function (Controller, JSONModel, Fragment, ColumnListItem, Label, Token, Filter, FilterOperator, Formatter) {
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
					template: "Bukrs"
				}, {
					label: "Company Name",
					template: "Butxt"
				}]
			};
			this._oModelColumns = new JSONModel(columns);

			var oModelYear = new JSONModel(oYears);
			// var oModelYear = new JSONModel(sap.ui.require.toUrl("com/bosch/idocmonitor/localService/years.json"));
			this.getView().setModel(oModelYear, "years");

			// var oModel = new JSONModel();
			// this.getView().setModel(oModel);

			this._oTable = this.getView().byId("idocTable");

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

			var aFilter = [];
			var flag_search;
			var oTable = this._oTable;

			var oLSSender = this.getView().byId("inputLSSender");
			if (oLSSender.getValue() === "") {
				flag_search = "reject";
				oLSSender.setValueState(sap.ui.core.ValueState.Error);
			} else {
				aFilter.push(new Filter("Sndprn", FilterOperator.EQ, oLSSender.getValue()));
			}

			var oLSReceiver = this.getView().byId("inputLSReceiver");
			if (oLSReceiver.getValue() === "") {
				flag_search = "reject";
				oLSReceiver.setValueState(sap.ui.core.ValueState.Error);
			} else {
				aFilter.push(new Filter("Rcvprn", FilterOperator.EQ, oLSReceiver.getValue()));
			}

			var oMsgType = this.getView().byId("inputMsgType");
			if (oMsgType.getValue() === "") {
				flag_search = "reject";
				oMsgType.setValueState(sap.ui.core.ValueState.Error);
			} else {
				aFilter.push(new Filter("Mestyp", FilterOperator.EQ, oMsgType.getValue()));
			}

			var oBukrs = this.getView().byId("compCode");
			if (oBukrs.getTokens().length === 0) {
				flag_search = "reject";
				oBukrs.setValueState(sap.ui.core.ValueState.Error);
			} else {
				for (var i = 0; i < oBukrs.getTokens().length; i++) {
					aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oBukrs.getTokens()[i].getKey()));
				}
			}

			var oADNSender = this.getView().byId("inputADNSender");
			if (oADNSender.getValue() !== "") {
				aFilter.push(new Filter("SndDocnum", FilterOperator.EQ, oADNSender.getValue()));
			}

			var oADNReceiver = this.getView().byId("inputADNReceiver");
			if (oADNReceiver.getValue() !== "") {
				aFilter.push(new Filter("RcvDocnum", FilterOperator.EQ, oADNReceiver.getValue()));
			}

			var oDateRange = this.getView().byId("dateRange");
			if (oDateRange.getDateValue() !== null) {
				var dateFrom = oDateRange.getFrom();
				var dateTo = oDateRange.getTo();
				var sFrom = Formatter.dateFormat(dateFrom);
				var sTo = Formatter.dateFormat(dateTo);
				aFilter.push(new Filter("Credat", FilterOperator.BT, dateFrom, dateTo));
				// aFilter.push(new Filter("Credat",FilterOperator.LE,sTo));
				// var oTitle = this.getView().byId("tableTitle");
				// var sTitle = sFrom.concat(" - ", sTo);
				// oTitle.setText(sTitle);
			} else {
				flag_search = "reject";
				oDateRange.setValueState(sap.ui.core.ValueState.Error);
			}

			var oYear = this.getView().byId("year");
			if (oYear.getSelectedItem() === null) {
				flag_search = "reject";
				oYear.setValueState(sap.ui.core.ValueState.Error);
			} else {
				aFilter.push(new Filter("Gjahr", FilterOperator.EQ, oYear.getSelectedItem().getText()));
			}
			
			// set table title
			

			if (flag_search !== "reject") {
				var oTitle = this.getView().byId("tableTitle");
				var sTitle = "Date Range: " + sFrom + "-" + sTo + "(" + oYear.getSelectedItem().getText() + ")";
				oTitle.setText(sTitle);
				oTable.getBinding("items").filter(aFilter);
				oTable.getModel().refresh(true);
			}
			// var oModel = this.getView().getModel();
			// oModel.read("/IDOCMV2SET",{
			// 	success: function(oData,response){
			// 		oTable.setModel(new JSONModel(oData));
			// 		oTable.getModel().refresh(true);
			// 	}
			// });
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
				oTable.setModel(this.getOwnerComponent().getModel());
				oTable.setModel(this._oModelColumns, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/CompanyCodeSet");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/CompanyCodeSet", function () {
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
			this.getView().byId("compCode").fireTokenUpdate();
		},

		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
		},

		compCodeChange: function (oEvent) {
			if (oEvent.getSource().getTokens().length > 0) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
		}
	});
});