sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    /* ── mock 거래처 데이터 ── */
    const MOCK_SALES = [
        { rank:1,  customerNo:"C-1001", customerName:"삼성전자(주)",     division:"B2B", revenue:4820000000, currency:"KRW", growthRate:12.4,  achieveRate:96,  status:"달성",    salesRep:"김민준", lastOrderDate:"2026-06-05", orderCount:34 },
        { rank:2,  customerNo:"C-1002", customerName:"LG화학(주)",        division:"B2B", revenue:3650000000, currency:"KRW", growthRate:8.1,   achieveRate:88,  status:"진행중",  salesRep:"이서연", lastOrderDate:"2026-06-03", orderCount:27 },
        { rank:3,  customerNo:"C-1003", customerName:"현대자동차(주)",    division:"B2B", revenue:3120000000, currency:"KRW", growthRate:-2.3,  achieveRate:74,  status:"미달",    salesRep:"박지호", lastOrderDate:"2026-05-28", orderCount:19 },
        { rank:4,  customerNo:"C-1004", customerName:"SK하이닉스(주)",    division:"수출", revenue:2980000000, currency:"KRW", growthRate:21.7,  achieveRate:102, status:"초과달성", salesRep:"최유나", lastOrderDate:"2026-06-07", orderCount:41 },
        { rank:5,  customerNo:"C-1005", customerName:"카카오커머스(주)",  division:"B2C", revenue:1870000000, currency:"KRW", growthRate:5.2,   achieveRate:81,  status:"진행중",  salesRep:"정승우", lastOrderDate:"2026-06-01", orderCount:88 },
        { rank:6,  customerNo:"C-1006", customerName:"네이버(주)",        division:"B2C", revenue:1650000000, currency:"KRW", growthRate:-8.6,  achieveRate:65,  status:"미달",    salesRep:"한소희", lastOrderDate:"2026-05-20", orderCount:62 },
        { rank:7,  customerNo:"C-1007", customerName:"롯데케미칼(주)",    division:"B2B", revenue:1540000000, currency:"KRW", growthRate:3.1,   achieveRate:79,  status:"진행중",  salesRep:"김민준", lastOrderDate:"2026-06-04", orderCount:15 },
        { rank:8,  customerNo:"C-1008", customerName:"포스코홀딩스(주)", division:"수출", revenue:1320000000, currency:"KRW", growthRate:15.9,  achieveRate:94,  status:"달성",    salesRep:"이서연", lastOrderDate:"2026-06-06", orderCount:22 },
        { rank:9,  customerNo:"C-1009", customerName:"GS칼텍스(주)",      division:"B2B", revenue:980000000,  currency:"KRW", growthRate:-1.1,  achieveRate:71,  status:"미달",    salesRep:"박지호", lastOrderDate:"2026-05-30", orderCount:11 },
        { rank:10, customerNo:"C-1010", customerName:"아모레퍼시픽(주)", division:"B2C", revenue:760000000,  currency:"KRW", growthRate:9.4,   achieveRate:87,  status:"진행중",  salesRep:"최유나", lastOrderDate:"2026-06-02", orderCount:53 }
    ];

    /* ── 사업부별 목표 (정해진 값) ── */
    const DIV_TARGET = { "B2B": 17.3, "B2C": 5.5, "수출": 4.4 };

    return Controller.extend("cyclone.layout.example.cyclonelayoutexample.controller.LayoutExampleView", {

        onInit: function () {
            this._oModel = new JSONModel({
                salesList:      [],
                divisionData:   [],
                kpiHtml:        "",
                filterTagHtml:  "",
                chartSelection: ""
            });
            this.getView().setModel(this._oModel, "view");

            this._allData      = MOCK_SALES;
            this._currentData  = MOCK_SALES; // 필터바 적용 후 데이터
            this._chartFilter  = "";         // 차트 선택 사업부

            this._applyAll(MOCK_SALES);

            /* VizFrame selectData 이벤트 연결 (렌더 후) */
            this.getView().attachAfterRendering(function () {
                var oChart = this.byId("divisionChart");
                if (oChart && !this._chartAttached) {
                    oChart.attachSelectData(this.onChartSelect, this);
                    oChart.attachDeselectData(this.onChartDeselect, this);
                    this._chartAttached = true;
                }
            }.bind(this));
        },

        /* ── 필터바 조회 ── */
        onFilterChange: function () {
            this._applyFilterBar();
        },

        onLiveSearch: function (oEvent) {
            var sQuery = (oEvent.getParameter("query") || oEvent.getParameter("newValue") || "").toLowerCase();
            var aBase  = this._applyFilterBar(true); // 필터바만 반영, 차트 무시
            var aResult = sQuery
                ? aBase.filter(function (d) { return d.customerName.toLowerCase().includes(sQuery) || d.customerNo.toLowerCase().includes(sQuery); })
                : aBase;
            this._chartFilter = "";
            this._currentData = aResult;
            this._refreshTable(aResult);
            this._oModel.setProperty("/chartSelection", "");
            this._refreshFilterTag();
        },

        onReset: function () {
            this.byId("selDivision").setSelectedKey("");
            this.byId("selRep").setSelectedKey("");
            this.byId("sfSearch").setValue("");
            this._chartFilter = "";
            this._currentData = this._allData;
            this._oModel.setProperty("/chartSelection", "");
            this._applyAll(this._allData);
        },

        onExport: function () {
            MessageToast.show("엑셀 내보내기 기능입니다.");
        },

        /* ── 차트 선택 → 테이블 필터 ── */
        onChartSelect: function (oEvent) {
            var aData = oEvent.getParameter("data");
            if (!aData || !aData.length) return;
            /* VizFrame 선택 데이터에서 dimension 값 추출 */
            var oDimData = aData[0].data;
            var sDivision = oDimData["사업부"] || "";
            if (!sDivision) return;

            this._chartFilter = sDivision;
            this._oModel.setProperty("/chartSelection", sDivision);
            var aFiltered = this._currentData.filter(function (d) { return d.division === sDivision; });
            this._refreshTable(aFiltered);
            this._refreshFilterTag();
        },

        onChartDeselect: function () {
            this._chartFilter = "";
            this._oModel.setProperty("/chartSelection", "");
            this._refreshTable(this._currentData);
            this._refreshFilterTag();
        },

        onClearChartSelection: function () {
            this._chartFilter = "";
            this._oModel.setProperty("/chartSelection", "");
            /* VizFrame 선택 해제 */
            var oChart = this.byId("divisionChart");
            if (oChart && oChart.vizSelection) { try { oChart.vizSelection([], { clearSelection: true }); } catch (e) {} }
            this._refreshTable(this._currentData);
            this._refreshFilterTag();
        },

        onRowPress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("view");
            if (!oCtx) return;
            var d = oCtx.getObject();
            MessageToast.show(d.customerName + " | 매출 " + this.fmtAmount(d.revenue, d.currency) + " | 달성률 " + d.achieveRate + "%");
        },

        /* ── 내부 메서드 ── */
        _applyFilterBar: function (bReturnOnly) {
            var sDivision = this.byId("selDivision").getSelectedKey();
            var sRep      = this.byId("selRep").getSelectedKey();
            var aFiltered = this._allData.filter(function (d) {
                if (sDivision && d.division   !== sDivision) return false;
                if (sRep      && d.salesRep   !== sRep)      return false;
                return true;
            });
            if (bReturnOnly) return aFiltered;

            this._currentData = aFiltered;
            this._chartFilter = "";
            this._oModel.setProperty("/chartSelection", "");
            this._applyAll(aFiltered);
            return aFiltered;
        },

        _applyAll: function (aData) {
            this._refreshKpi(aData);
            this._refreshDivisionChart(aData);
            this._refreshTable(aData);
            this._refreshFilterTag();
        },

        _refreshKpi: function (aData) {
            var iTotalRev = 0;
            aData.forEach(function (d) { iTotalRev += d.revenue; });
            var fAvgAchieve = aData.length
                ? Math.round(aData.reduce(function (s, d) { return s + d.achieveRate; }, 0) / aData.length)
                : 0;
            var fRevBil = Math.round(iTotalRev / 1e8 * 10) / 10; // 억 단위

            var sHtml =
                '<div class="clKpiStrip">' +
                    '<div class="clKpiItem">' +
                        '<span class="clKpiLabel">총 매출액</span>' +
                        '<span class="clKpiNum">' + fRevBil + '<span class="clKpiUnit">억원</span></span>' +
                    '</div>' +
                    '<div class="clKpiDivider"></div>' +
                    '<div class="clKpiItem">' +
                        '<span class="clKpiLabel">평균 달성률</span>' +
                        '<span class="clKpiNum">' + fAvgAchieve + '<span class="clKpiUnit">%</span></span>' +
                    '</div>' +
                '</div>';
            this._oModel.setProperty("/kpiHtml", sHtml);
        },

        _refreshDivisionChart: function (aData) {
            /* 사업부별 집계 */
            var mRev = {};
            aData.forEach(function (d) {
                mRev[d.division] = (mRev[d.division] || 0) + d.revenue;
            });
            var aDivData = Object.keys(mRev).map(function (sDiv) {
                return {
                    division: sDiv,
                    revenue:  Math.round(mRev[sDiv] / 1e8 * 10) / 10,
                    target:   DIV_TARGET[sDiv] || 0
                };
            });
            /* 사업부 순서 고정 */
            var aOrder = ["B2B", "B2C", "수출"];
            aDivData.sort(function (a, b) { return aOrder.indexOf(a.division) - aOrder.indexOf(b.division); });
            this._oModel.setProperty("/divisionData", aDivData);
        },

        _refreshTable: function (aData) {
            this._oModel.setProperty("/salesList", aData);
        },

        _refreshFilterTag: function () {
            var sChartSel = this._oModel.getProperty("/chartSelection");
            if (!sChartSel) {
                this._oModel.setProperty("/filterTagHtml", "");
                return;
            }
            var sHtml = '<span style="display:inline-flex;align-items:center;background:#e8edf9;border:1px solid #3b66d4;border-radius:4px;padding:2px 8px;font-size:12px;color:#1e3a8a;font-weight:600;">' +
                        '사업부: ' + sChartSel + '</span>';
            this._oModel.setProperty("/filterTagHtml", sHtml);
        },

        /* ── 포매터 ── */
        fmtAmount: function (fVal, sCur) {
            if (!fVal && fVal !== 0) return "-";
            return new Intl.NumberFormat("ko-KR").format(Math.round(fVal)) + " " + (sCur || "KRW");
        },

        fmtGrowth: function (fRate) {
            if (fRate === null || fRate === undefined) return "-";
            return (fRate >= 0 ? "▲ " : "▼ ") + Math.abs(fRate).toFixed(1) + "%";
        },

        fmtGrowthState: function (fRate) {
            if (!fRate && fRate !== 0) return "None";
            return fRate >= 0 ? "Success" : "Error";
        },

        fmtAchieveState: function (fRate) {
            if (fRate >= 100) return "Success";
            if (fRate >= 80)  return "Warning";
            return "Error";
        },

        fmtStatusBadge: function (sStatus) {
            var mClass = { "달성":"clBadge-green", "초과달성":"clBadge-blue", "진행중":"clBadge-orange", "미달":"clBadge-red" };
            return '<span class="clBadge ' + (mClass[sStatus] || "") + '">' + (sStatus || "") + '</span>';
        }
    });
});
