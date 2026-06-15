sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, Filter, FilterOperator, FilterType, MessageBox, MessageToast, Fragment) => {
    "use strict";

    return Controller.extend("zgwe1cm0002.controller.PaymentView", {

        //  Lifecycle
        onInit() {
            // FLP 셸 컨테이너 width 제한 해제
            const aSelectors = [
                ".sapUShellApplicationContainerLimitedWidth",
                ".sapUShellApplicationContainer",
                ".sapUShellContentDiv",
                ".sapUShellCanvas"
            ];
            aSelectors.forEach((sSel) => {
                document.querySelectorAll(sSel).forEach((el) => {
                    el.style.maxWidth = "none";
                    el.style.width = "100%";
                });
            });
            const oViewModel = new JSONModel({
                dialogTitle: "",
                isNewEmployee: false,
                editEmployee: {},
                editPath: ""
            });
            this.getView().setModel(oViewModel, "viewModel");

            // KPI 모델
            this.getView().setModel(new JSONModel({
                totalEmp: 0,
                totalPay: "0",
                totalCC: 0,
                pendingCC: 0
            }), "kpi");

            // 사원 테이블용 로컬 모델 (클라이언트 필터링)
            const oLocalModel = new JSONModel({ employees: [], ccItems: [] });
            this.getView().setModel(oLocalModel, "local");

            // 차트별 전용 모델
            ["1100", "1200", "1300", "1400"].forEach((sKey) => {
                this.getView().setModel(new JSONModel({ items: [] }), "chart" + sKey);
            });

            // OData 모델 준비 후 사원 데이터 로드
            const oModel = this.getOwnerComponent().getModel();
            oModel.metadataLoaded().then(() => {
                oModel.read("/PayrollEmpSet", {
                    success: (oData) => {
                        this._allEmployees = oData.results;
                        this.getView().getModel("local").setProperty("/employees", oData.results);
                        this._buildChartData();
                        this._updateKPI();
                    },
                    error: (oError) => {
                        MessageBox.error("사원 데이터 로드 실패: " + this._parseErrorMsg(oError));
                    }
                });
                oModel.read("/PayrollCCSet", {
                    success: (oData) => {
                        const aFixed = oData.results.map((o) => {
                            const nTotal = (parseFloat(o.TotalRankPay) || 0) * 100;
                            return Object.assign({}, o, {
                                TotalRankPay: String(nTotal),
                                TotalRankPayNum: nTotal
                            });
                        });
                        this._allCC = aFixed;
                        const oLocalModel = this.getView().getModel("local");
                        oLocalModel.setProperty("/ccItems", aFixed);
                        this._buildChartData();
                        this._updateKPI();
                    },
                    error: () => { this._allCC = []; }
                });
            });
        },

        onAfterRendering() {
            if (this._chartInited) { return; }
            this._chartInited = true;
            ["1100", "1200", "1300", "1400"].forEach((sKey) => {
                const oChart = this.byId("chart" + sKey);
                if (!oChart) { return; }
                oChart.setVizProperties({
                    plotArea: { dataLabel: { visible: true, type: "percentage" } },
                    legend: {
                        visible: true,
                        label: {
                            truncation: { enabled: false },
                            maxWidth: 180
                        }
                    }
                });
            });
        },

        _buildChartData(aCC) {
            const aEmps = this._allEmployees || [];
            if (!aCC) { aCC = this._allCC || []; }

            // CC Kostl 앞 4자리로 그룹 키 추출
            const aKeys = [...new Set(aCC.map((o) => o.Kostl.substring(0, 4)))].sort();
            const oGroups = {};
            aKeys.forEach((k) => { oGroups[k] = []; });

            // CC 전체 Kostl → KostlName 맵
            const oKostlNameMap = {};
            aCC.forEach((o) => { oKostlNameMap[o.Kostl] = o.KostlName; });

            // 사원을 앞4자리 그룹 / CC명 서브그룹으로 집계
            const oAgg = {};
            aEmps.forEach((o) => {
                const sKostl  = o.Kostl || "";
                const sPrefix = sKostl.substring(0, 4);
                const sLabel  = oKostlNameMap[sKostl] || sKostl.substring(4) || "기타";
                if (!oGroups[sPrefix]) { return; }
                if (!oAgg[sPrefix]) { oAgg[sPrefix] = {}; }
                oAgg[sPrefix][sLabel] = (oAgg[sPrefix][sLabel] || 0) + (parseFloat(o.RankPay) || 0);
            });

            // 집계 결과를 배열로 변환
            aKeys.forEach((sKey) => {
                const oSub = oAgg[sKey] || {};
                oGroups[sKey] = Object.keys(oSub).sort().map((sSuffix) => ({
                    SubGroup: sSuffix,
                    RankPayNum: oSub[sSuffix]
                }));
            });

            // 각 차트 전용 모델에 데이터 세팅
            const oNameMap = {};
            aCC.forEach((o) => { oNameMap[o.Kostl.substring(0, 4)] = o.KostlName; });

            ["1100", "1200", "1300", "1400"].forEach((sKey) => {
                const aItems = oGroups[sKey] || [];
                const oModel = this.getView().getModel("chart" + sKey);
                if (oModel) { oModel.setProperty("/items", aItems); }
                const oChart = this.byId("chart" + sKey);
                if (oChart) {
                    oChart.setVisible(aItems.length > 0);
                    oChart.setVizProperties({ title: { text: `${oNameMap[sKey] || sKey} (${sKey})` } });
                }
            });
        },

        _updateKPI() {
            const aEmps = this._allEmployees || [];
            const aCC   = this._allCC || [];
            const nTotalPay = aEmps.reduce((s, o) => s + (parseFloat(o.RankPay) || 0) * 1000, 0);
            this.getView().getModel("kpi").setData({
                totalEmp:   aEmps.length,
                totalPay:   (nTotalPay / 100000000000).toFixed(1),
                totalCC:    aCC.length,
                pendingCC:  aCC.filter((o) => o.PayStatus !== "X").length
            });
        },

        // ──────────────────────────────────────────────
        // 검색 / 필터
        // ──────────────────────────────────────────────
        onSearchEmp() {
            const sEmpId   = this.byId("inpSearchEmpId").getValue().trim().toUpperCase();
            const sEmpName = this.byId("inpSearchEmpName").getValue().trim();
            const sDeptNo  = this.byId("inpSearchDeptNo").getValue().trim().toUpperCase();
            const sKostl   = this.byId("inpSearchEmpKostl").getValue().trim().toUpperCase();
            const aAll     = this._allEmployees || [];

            const aFiltered = aAll.filter((o) => {
                const bId     = !sEmpId   || (o.EmpId   || "").toUpperCase().startsWith(sEmpId);
                const bName   = !sEmpName || (o.EmpName || "").includes(sEmpName);
                const bDept   = !sDeptNo  || (o.DeptNo  || "").toUpperCase().startsWith(sDeptNo);
                const bKostl  = !sKostl   || (o.Kostl   || "").toUpperCase().startsWith(sKostl);
                return bId && bName && bDept && bKostl;
            });

            this.getView().getModel("local").setProperty("/employees", aFiltered);
        },

        onClearFilter() {
            this.byId("inpSearchEmpId").setValue("");
            this.byId("inpSearchEmpName").setValue("");
            this.byId("inpSearchDeptNo").setValue("");
            this.byId("inpSearchEmpKostl").setValue("");
            this.getView().getModel("local").setProperty("/employees", this._allEmployees || []);
        },

        onSearchCC() {
            const sKostl = this.byId("inpSearchKostl").getValue().trim().toUpperCase();
            this._applyChartFilter(sKostl, "");
        },

        onClearCCFilter() {
            this.byId("inpSearchKostl").setValue("");
            this._applyChartFilter("", "");
        },

        _recalcCC() {
            const aEmps = this._allEmployees || [];
            const aCC   = this._allCC || [];

            // 사원 배열로 Kostl별 합계/인원 재계산
            const oMap = {};
            aEmps.forEach((o) => {
                const sKey = o.Kostl;
                if (!oMap[sKey]) { oMap[sKey] = { total: 0, count: 0 }; }
                oMap[sKey].total += parseFloat(o.RankPay) || 0;
                oMap[sKey].count += 1;
            });

            const aUpdated = aCC.map((o) => {
                const oAgg = oMap[o.Kostl] || { total: 0, count: 0 };
                return Object.assign({}, o, {
                    TotalRankPay: String(oAgg.total.toFixed(3)),
                    TotalRankPayNum: oAgg.total,
                    Headcount: oAgg.count
                });
            });

            this._allCC = aUpdated;
            this.getView().getModel("local").setProperty("/ccItems", aUpdated);
            this._updateKPI();
        },

        _applyChartFilter(sKostl, sKostlName) {
            const aAll = this._allCC || [];
            const aFiltered = aAll.filter((o) => {
                const bKostl     = !sKostl     || o.Kostl.toUpperCase().startsWith(sKostl.toUpperCase());
                const bKostlName = !sKostlName || o.KostlName.includes(sKostlName);
                return bKostl && bKostlName;
            });
            this.getView().getModel("local").setProperty("/ccItems", aFiltered);
            this._buildChartData(aFiltered);
        },

        // ──────────────────────────────────────────────
        // 사원 CRUD
        // ──────────────────────────────────────────────
        onAddEmployee() {
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/dialogTitle", "사원 추가");
            oViewModel.setProperty("/isNewEmployee", true);
            oViewModel.setProperty("/editPath", "");
            oViewModel.setProperty("/editEmployee", {
                EmpName: "",
                DeptNo: "",
                DeptName: "",
                Kostl: "",
                Kokrs: "",
                KostlName: "",
                Prctr: "",
                Rank: "",
                EntYear: "",
                RankPay: "0",
                Waers: "KRW"
            });
            this._openEmpDialog();
        },

        onEditEmployee() {
            const oItem = this.byId("empTable").getSelectedItem();
            if (!oItem) {
                MessageBox.warning("수정할 사원을 선택해 주세요.");
                return;
            }
            const oData = oItem.getBindingContext("local").getObject();
            const sEmpId = oData.EmpId;
            const sPath  = `/PayrollEmpSet('${sEmpId}')`;
            const oViewModel = this.getView().getModel("viewModel");

            oViewModel.setProperty("/dialogTitle", "사원 수정");
            oViewModel.setProperty("/isNewEmployee", false);
            oViewModel.setProperty("/editPath", sPath);
            oViewModel.setProperty("/editEmployee", Object.assign({}, oData));
            this._openEmpDialog();
        },

        onDeleteEmployee() {
            const oItem = this.byId("empTable").getSelectedItem();
            if (!oItem) {
                MessageBox.warning("삭제할 사원을 선택해 주세요.");
                return;
            }
            const oObj   = oItem.getBindingContext("local").getObject();
            const sEmpId = oObj.EmpId;
            const sPath  = `/PayrollEmpSet('${sEmpId}')`;

            MessageBox.confirm(`사원번호 [${sEmpId}] 를 삭제하시겠습니까?`, {
                title: "삭제 확인",
                onClose: (sAction) => {
                    if (sAction !== MessageBox.Action.OK) { return; }
                    this.getView().getModel().remove(sPath, {
                        success: () => {
                            this._allEmployees = (this._allEmployees || []).filter((o) => o.EmpId !== sEmpId);
                            this.getView().getModel("local").setProperty("/employees", this._allEmployees);
                            this._recalcCC();
                            this._buildChartData();
                            MessageToast.show("삭제되었습니다.");
                        },
                        error: (oError) => {
                            const sMsg = this._parseErrorMsg(oError);
                            MessageBox.error("삭제 실패: " + sMsg);
                        }
                    });
                }
            });
        },

        onSave() {
            const oModel = this.getView().getModel();
            if (!oModel.hasPendingChanges()) {
                MessageToast.show("저장할 변경사항이 없습니다.");
                return;
            }
            oModel.submitChanges({
                success: () => MessageToast.show("저장되었습니다."),
                error: (oError) => {
                    const sMsg = this._parseErrorMsg(oError);
                    MessageBox.error("저장 실패: " + sMsg);
                }
            });
        },

        onCancel() {
            const oModel = this.getView().getModel();
            if (oModel.hasPendingChanges()) {
                oModel.resetChanges();
                MessageToast.show("변경사항이 취소되었습니다.");
            } else {
                MessageToast.show("취소할 변경사항이 없습니다.");
            }
        },

        // ──────────────────────────────────────────────
        // Dialog 처리
        // ──────────────────────────────────────────────
        async _openEmpDialog() {
            if (!this._oEmpDialog) {
                this._oEmpDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "zgwe1cm0002.view.EmpDialog",
                    controller: this
                });
                this.getView().addDependent(this._oEmpDialog);
            }
            this._oEmpDialog.open();
        },

        onConfirmEmpDialog() {
            const oViewModel = this.getView().getModel("viewModel");
            const oEmp = oViewModel.getProperty("/editEmployee");
            const bIsNew = oViewModel.getProperty("/isNewEmployee");
            const sPath = oViewModel.getProperty("/editPath");

            const aMissing = [];
            if (!oEmp.EmpName) { aMissing.push("사원명"); }
            if (!oEmp.DeptNo)  { aMissing.push("부서번호"); }
            if (!oEmp.Kostl)   { aMissing.push("코스트센터"); }
            if (aMissing.length) {
                MessageBox.warning(`필수 입력항목을 확인해 주세요: ${aMissing.join(", ")}`);
                return;
            }

            const oModel = this.getView().getModel();

            if (bIsNew) {
                oModel.create("/PayrollEmpSet", oEmp, {
                    success: (oNew) => {
                        this._allEmployees = [...(this._allEmployees || []), oNew];
                        this.getView().getModel("local").setProperty("/employees", this._allEmployees);
                        this._recalcCC();
                        this._buildChartData();
                        MessageToast.show("사원이 추가되었습니다.");
                        this._oEmpDialog.close();
                    },
                    error: (oError) => {
                        const sMsg = this._parseErrorMsg(oError);
                        MessageBox.error("추가 실패: " + sMsg);
                    }
                });
            } else {
                const oKeys = Object.keys(oEmp).filter((k) => k !== "EmpId");
                oKeys.forEach((sKey) => { oModel.setProperty(sPath + "/" + sKey, oEmp[sKey]); });
                oModel.submitChanges({
                    success: () => {
                        this._allEmployees = (this._allEmployees || []).map((o) =>
                            o.EmpId === oEmp.EmpId ? Object.assign({}, o, oEmp) : o
                        );
                        this.getView().getModel("local").setProperty("/employees", this._allEmployees);
                        this._recalcCC();
                        this._buildChartData();
                        MessageToast.show("수정되었습니다.");
                        this._oEmpDialog.close();
                    },
                    error: (oError) => {
                        const sMsg = this._parseErrorMsg(oError);
                        MessageBox.error("수정 실패: " + sMsg);
                    }
                });
            }
        },

        onCancelEmpDialog() {
            this._oEmpDialog.close();
        },

        // ──────────────────────────────────────────────
        // 전표 생성
        // ──────────────────────────────────────────────
        onCreateDocument() {
            const aItems = this.byId("ccTable").getSelectedItems();
            if (aItems.length === 0) {
                MessageBox.warning("전표를 생성할 코스트센터를 선택해 주세요.");
                return;
            }

            const aKostlList = aItems.map((oItem) =>
                oItem.getBindingContext("local").getProperty("Kostl")
            );

            MessageBox.confirm(
                `선택한 ${aItems.length}개 코스트센터에 대해 전표를 생성하시겠습니까?\n(${aKostlList.join(", ")})`,
                {
                    title: "전표 생성 확인",
                    onClose: (sAction) => {
                        if (sAction !== MessageBox.Action.OK) { return; }
                        this._callCreatePayroll(aKostlList);
                    }
                }
            );
        },

        _callCreatePayroll(aKostlList) {
            const oModel = this.getView().getModel();
            let iDone = 0;
            let iError = 0;
            const iTotal = aKostlList.length;

            const fnCheck = () => {
                if (iDone + iError < iTotal) { return; }
                if (iError === 0) {
                    MessageToast.show("전표 생성이 완료되었습니다.");
                } else {
                    MessageBox.warning(`전표 생성 완료: ${iDone}건 성공, ${iError}건 실패`);
                }
                oModel.refresh(true);
            };

            aKostlList.forEach((sKostl) => {
                oModel.create("/PayrollCCSet", { Kostl: sKostl }, {
                    success: () => { iDone++; fnCheck(); },
                    error: (oError) => {
                        iError++;
                        const sMsg = this._parseErrorMsg(oError);
                        MessageBox.error(`전표 생성 실패 (${sKostl}): ${sMsg}`);
                        fnCheck();
                    }
                });
            });
        },

        // ──────────────────────────────────────────────
        // 서치헬프 (Value Help)
        // ──────────────────────────────────────────────
        onDeptNoValueHelp() {
            this._openValueHelp({
                title: "부서번호 선택",
                key: "DeptNo",
                desc: "DeptName",
                colKey: "부서번호",
                colDesc: "부서명",
                targetInputId: "inpSearchDeptNo"
            });
        },

        onKostlCCValueHelp() {
            const aAll = this._allCC || [];
            const aUnique = aAll.map((o) => ({ key: o.Kostl, desc: o.KostlName }))
                                .sort((a, b) => a.key.localeCompare(b.key));

            const oModel = new JSONModel({ items: aUnique });
            const oTemplate = new sap.m.StandardListItem({ title: "{vh>key}", description: "{vh>desc}" });

            const oDialog = new sap.m.SelectDialog({
                title: "코스트센터 선택",
                noDataText: "데이터가 없습니다.",
                items: { path: "vh>/items", template: oTemplate },
                confirm: (oEvt) => {
                    const oSelected = oEvt.getParameter("selectedItem");
                    if (oSelected) { this.byId("inpSearchKostl").setValue(oSelected.getTitle()); }
                    oDialog.destroy();
                },
                cancel: () => { oDialog.destroy(); },
                liveChange: (oEvt) => {
                    const sVal = oEvt.getParameter("value").toUpperCase();
                    oDialog.getItems().forEach((oItem) => {
                        oItem.setVisible(
                            oItem.getTitle().toUpperCase().includes(sVal) ||
                            oItem.getDescription().toUpperCase().includes(sVal)
                        );
                    });
                }
            });
            this.getView().addDependent(oDialog);
            oDialog.setModel(oModel, "vh");
            oDialog.open();
        },

        onKostlValueHelp() {
            this._openValueHelp({
                title: "코스트센터 선택",
                key: "Kostl",
                desc: "KostlName",
                colKey: "코스트센터",
                colDesc: "코스트센터명",
                targetInputId: "inpSearchEmpKostl"
            });
        },

        _openValueHelp({ title, key, desc, targetInputId }) {
            const aAll = this._allEmployees || [];
            const aUnique = [];
            const aSeen = new Set();
            aAll.forEach((o) => {
                const sKey = o[key];
                if (!aSeen.has(sKey)) {
                    aSeen.add(sKey);
                    aUnique.push({ key: sKey, desc: o[desc] });
                }
            });
            aUnique.sort((a, b) => a.key.localeCompare(b.key));

            const oModel = new JSONModel({ items: aUnique });
            const oTemplate = new sap.m.StandardListItem({ title: "{vh>key}", description: "{vh>desc}" });

            const oDialog = new sap.m.SelectDialog({
                title: title,
                noDataText: "데이터가 없습니다.",
                items: {
                    path: "vh>/items",
                    template: oTemplate
                },
                confirm: (oEvt) => {
                    const oSelected = oEvt.getParameter("selectedItem");
                    if (oSelected) {
                        this.byId(targetInputId).setValue(oSelected.getTitle());
                    }
                    oDialog.destroy();
                },
                cancel: () => { oDialog.destroy(); },
                liveChange: (oEvt) => {
                    const sVal = oEvt.getParameter("value").toUpperCase();
                    oDialog.getItems().forEach((oItem) => {
                        const bMatch = oItem.getTitle().toUpperCase().includes(sVal) ||
                                       oItem.getDescription().toUpperCase().includes(sVal);
                        oItem.setVisible(bMatch);
                    });
                }
            });

            this.getView().addDependent(oDialog);
            oDialog.setModel(oModel, "vh");
            oDialog.open();
        },

        // ──────────────────────────────────────────────
        // 포매터
        // ──────────────────────────────────────────────
        formatDecimal(sVal) {
            return parseFloat(sVal) || 0;
        },

        formatAmount(vVal) {
            const n = parseFloat(vVal) || 0;
            return n.toLocaleString("ko-KR");
        },

        // ──────────────────────────────────────────────
        // 유틸
        // ──────────────────────────────────────────────
        _parseErrorMsg(oError) {
            try {
                return JSON.parse(oError.responseText).error.message.value;
            } catch {
                return oError.message || "알 수 없는 오류";
            }
        }
    });
});
