sap.ui.define(["./formatter"], function () {

	return {
		dateFormat: function (oDate) {
			var mm = oDate.getMonth() + 1;
			var dd = oDate.getDate();

			return [oDate.getFullYear(),
				(mm > 9 ? '' : '0') + mm,
				(dd > 9 ? '' : "0") + dd
			].join('');
		}

	};
});