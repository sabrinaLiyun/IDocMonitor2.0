sap.ui.define(["./formatter"], function () {

	return {
		dateFormat: function (oDate) {
			var mm = oDate.getMonth() + 1;
			var dd = oDate.getDate();

			return [(dd > 9 ? "" : "0") + dd,
				(mm > 9 ? "" : "0") + mm,
				oDate.getFullYear()
			].join(".");
		}

	};
});