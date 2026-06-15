sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Text"
], function (Controller, JSONModel, Filter, FilterOperator, Dialog, Button, Table, Column, ColumnListItem, Text) {
    "use strict";

    return Controller.extend("zgwe1fi0002.zgwe1fi0002.controller.OverviewView", {

        onInit: function () {
            this.getView().setModel(new JSONModel({
                kpi: {
                    openCount:      0,
                    overdueCount:   0,
                    totalOpen:      0,
                    totalOpenScale: "만",
                    over90Count:    0,
                    avgOverdue:     0
                },
                overdueRanges: [
                    { label: "1~30일",   count: 0 },
                    { label: "31~60일",  count: 0 },
                    { label: "61~90일",  count: 0 },
                    { label: "90일 초과", count: 0 }
                ],
                clearStatus: [
                    { label: "미반제",   count: 0 },
                    { label: "일부반제", count: 0 },
                    { label: "반제완료", count: 0 }
                ]
            }), "overview");

            this._loadDunningStats([]);
        },

        onOverviewSearch: function () {
            var sPartner = this.byId("ovInputPartner").getValue().trim();
            var sBukrs   = this.byId("ovInputBukrs").getValue().trim();
            var aFilters = [];
            if (sPartner) aFilters.push(new Filter("PartnerNo", FilterOperator.EQ, sPartner));
            if (sBukrs)   aFilters.push(new Filter("Bukrs",     FilterOperator.EQ, sBukrs));
            this._loadDunningStats(aFilters);
        },

        onOverviewReset: function () {
            this.byId("ovInputPartner").setValue("");
            this.byId("ovInputBukrs").setValue("");
            this._loadDunningStats([]);
        },

        onOverviewPartnerValueHelp: function () {
            var that = this;
            this.getOwnerComponent().getModel().read("/DunningSet", {
                urlParameters: { "$select": "PartnerNo,CompName" },
                success: function (oData) {
                    var mSeen = new Map();
                    (oData.results || []).forEach(function (o) {
                        if (o.PartnerNo && !mSeen.has(o.PartnerNo)) mSeen.set(o.PartnerNo, o.CompName || "");
                    });
                    var aList = Array.from(mSeen.entries())
                        .map(function (e) { return { PartnerNo: e[0], CompName: e[1] }; })
                        .sort(function (a, b) { return a.PartnerNo.localeCompare(b.PartnerNo); });

                    if (!that._oOverviewPartnerDialog) {
                        that._oOverviewPartnerDialog = new sap.m.SelectDialog({
                            title: "거래처(BP) 검색",
                            noDataText: "검색 결과가 없습니다.",
                            search: function (oEvent) {
                                var sVal = oEvent.getParameter("value");
                                var oF = sVal ? new Filter([
                                    new Filter("PartnerNo", FilterOperator.Contains, sVal),
                                    new Filter("CompName",  FilterOperator.Contains, sVal)
                                ], false) : [];
                                oEvent.getParameter("itemsBinding").filter(oF);
                            },
                            confirm: function (oEvent) {
                                var oItem = oEvent.getParameter("selectedItem");
                                if (oItem) that.byId("ovInputPartner").setValue(oItem.getTitle());
                            }
                        });
                        that._oOverviewPartnerDialog.bindAggregation("items", {
                            path: "/",
                            template: new sap.m.StandardListItem({ title: "{PartnerNo}", description: "{CompName}", type: "Active" })
                        });
                        that.getView().addDependent(that._oOverviewPartnerDialog);
                    }
                    that._oOverviewPartnerDialog.setModel(new JSONModel(aList));
                    that._oOverviewPartnerDialog.open();
                }
            });
        },

        _loadDunningStats: function (aFilters) {
            var that = this;
            var oModel = this.getOwnerComponent().getModel();

            var fnRead = function () {
                oModel.read("/DunningSet", {
                    success: function (oData) {
                        var aItems = oData.results || [];
                        // 클라이언트 필터링
                        if (aFilters && aFilters.length) {
                            aItems = aItems.filter(function (item) {
                                return aFilters.every(function (oFilter) {
                                    var sPath = oFilter.sPath;
                                    var sVal  = (oFilter.oValue1 || "").toString().toLowerCase();
                                    var iVal  = (item[sPath] || "").toString().toLowerCase();
                                    return iVal === sVal;
                                });
                            });
                        }
                        that._calcStats(aItems);
                    },
                    error: function (oErr) {
                        console.error("DunningSet read failed", oErr);
                    }
                });
            };

            if (oModel.isMetadataLoadingFailed()) {
                console.error("Metadata load failed");
                return;
            }

            oModel.metadataLoaded().then(fnRead);
        },

        _calcStats: function (aItems) {
            var iTotalOpen = 0, iOver90 = 0, iTotalDays = 0, iOverdueCnt = 0, iTotalCnt = 0;
            var oRanges = { "1~30일": 0, "31~60일": 0, "61~90일": 0, "90일 초과": 0 };
            var oStatus = { N: 0, P: 0, C: 0 };

            aItems.forEach(function (item) {
                var iDays   = parseInt(item.OverdueDays) || 0;
                var fAmt    = parseFloat(item.Skfor)     || 0;
                var sStatus = item.ClearStatus || "N";

                oStatus[sStatus] = (oStatus[sStatus] || 0) + 1;

                // 미납액: 미반제(N)인 항목 전체 합산
                if (sStatus === "N") iTotalOpen += fAmt;

                // 연체일: 음수는 0으로 처리, 전체 건수 기준 평균
                var iEffDays = iDays > 0 ? iDays : 0;
                iTotalCnt++;
                iTotalDays += iEffDays;

                if (iDays <= 0) return;

                // OverdueDays > 0인 항목만 연체 건수·차트에 집계
                iOverdueCnt++;
                if (iDays > 90) iOver90++;

                if (iDays <= 30)      oRanges["1~30일"]++;
                else if (iDays <= 60) oRanges["31~60일"]++;
                else if (iDays <= 90) oRanges["61~90일"]++;
                else                  oRanges["90일 초과"]++;
            });

            var fScale = iTotalOpen >= 1e8 ? 1e8 : 1e4;
            var sScale = iTotalOpen >= 1e8 ? "억" : "만";

            this.getView().getModel("overview").setData({
                kpi: {
                    openCount:      oStatus.N || 0,
                    overdueCount:   iOverdueCnt,
                    totalOpen:      Math.round(iTotalOpen / fScale * 10) / 10,
                    totalOpenScale: sScale,
                    over90Count:    iOver90,
                    avgOverdue:     iTotalCnt ? Math.round(iTotalDays / iTotalCnt) : 0
                },
                overdueRanges: Object.keys(oRanges).map(function (k) {
                    return { label: k, count: oRanges[k] };
                }),
                clearStatus: [
                    { label: "미반제",   count: oStatus.N || 0 },
                    { label: "일부반제", count: oStatus.P || 0 },
                    { label: "반제완료", count: oStatus.C || 0 }
                ]
            });
        },

        onOpenMigyeolDialog: function () {
            var that = this;
            var sPartner = this.byId("ovInputPartner").getValue().trim();
            var sBukrs   = this.byId("ovInputBukrs").getValue().trim();

            this.getOwnerComponent().getModel().read("/DunningSet", {
                success: function (oData) {
                    var aItems = (oData.results || []).filter(function (item) {
                        if (item.ClearStatus !== "N") return false;
                        if (parseFloat(item.Skfor || 0) <= 0) return false;
                        if (sPartner && item.PartnerNo !== sPartner) return false;
                        if (sBukrs   && item.Bukrs    !== sBukrs)   return false;
                        return true;
                    });
                    that._showMigyeolDialog(aItems);
                },
                error: function (oErr) {
                    console.error("미반제 조회 실패", oErr);
                }
            });
        },

        _showMigyeolDialog: function (aItems) {
            if (!this._oMigyeolDialog) {
                this._oMigyeolDialog = new Dialog({
                    title: "미반제 내역",
                    contentWidth: "800px",
                    content: [
                        new Table({
                            columns: [
                                new Column({ header: new Text({ text: "전표번호" }) }),
                                new Column({ header: new Text({ text: "거래처명" }) }),
                                new Column({ header: new Text({ text: "만기일" }) }),
                                new Column({ header: new Text({ text: "미납금액" }), hAlign: "End" })
                            ],
                            items: {
                                path: "/",
                                template: new ColumnListItem({
                                    cells: [
                                        new Text({ text: "{Belnr}" }),
                                        new Text({ text: "{CompName}" }),
                                        new Text({ text: "{DueDate}" }),
                                        new Text({ text: { parts: ["Skfor", "Waers"], formatter: function(s, w) { return s ? Number(s).toLocaleString() + " " + (w || "") : "-"; } } })
                                    ]
                                })
                            }
                        })
                    ],
                    endButton: new Button({
                        text: "닫기",
                        press: function () { this._oMigyeolDialog.close(); }.bind(this)
                    })
                });
                this.getView().addDependent(this._oMigyeolDialog);
            }

            this._oMigyeolDialog.setModel(new JSONModel(aItems));
            this._oMigyeolDialog.open();
        },

        onNavToDunning: function () {
            var iCount = this.getView().getModel("overview").getProperty("/kpi/overdueCount");
            if (!iCount) {
                sap.m.MessageBox.information("조회된 미결 독촉 내역이 없습니다.");
                return;
            }
            this.getOwnerComponent().getRouter().navTo("RouteDunningView");
        }

    });
});
