sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel", 
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "sap/m/TextArea",
  "sap/m/Button"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, Dialog, TextArea, Button) {
  "use strict";

  return Controller.extend("zgwe1fi0001.zgwe1fi0001.controller.MainView", {

    onInit: function () {
      
      // JSON 모델 등록 - 차트 데이터 전용 모델로 활용
      var oChartModel = new JSONModel({
        WaitCount: 0,
        DoneCount: 0,
        RejectCount: 0
      });
      this.getView().setModel(oChartModel, "chart");

      var oList = this.byId("idList");

      // 초기 데이터 로드가 완료되면 첫 필터링 수행 및 백엔드 카운트 집계 요청
      oList.attachEventOnce("updateFinished", function () {
        this._applyFilter("D"); // 초기 로드시 결재 대기 상태만 필터링 적용
        
        // OData 모델이 로드 완료된 후 백엔드 원본 데이터 집계 실행
        var oModel = this.getView().getModel();
        if (oModel) {
          this._calculateChartCounts(oModel);
        }
      }.bind(this));
    },

     // 백엔드 OData에서 상태별 전표 개수를 계산하는 내부 메소드
    _calculateChartCounts: function (oModel) {
      var oChartModel = this.getView().getModel("chart");

      // 리스트의 필터 상태에 구애받지 않고 원본 데이터를 조회하기 위해 백엔드 다이렉트 read 수행
      oModel.read("/ApprovalHeaderSet", {
        success: function (oData) {
          var iWait = 0, iDone = 0, iReject = 0;

          // 데이터 배열을 순회하며 Status 분기 연산
          oData.results.forEach(function (item) {
            if (item.Status === "D") { iWait++; }      // 결재 대기
            else if (item.Status === "P") { iDone++; }  // 결재 완료
            else if (item.Status === "J") { iReject++; } // 반려
          });

          // 계산 결과를 JSON 모델 프로퍼티에 반영하여 XML 차트 자동 갱신유도
          oChartModel.setProperty("/WaitCount", iWait);
          oChartModel.setProperty("/DoneCount", iDone);
          oChartModel.setProperty("/RejectCount", iReject);
        }.bind(this),
        error: function () {
          console.error("대시보드 차트용 데이터 집계 중 백엔드 통신 오류 발생");
        }
      });
    },

    // 탭 필터 
    onFilterSelect: function (oEvent) {
      var sKey = oEvent.getParameter("key");

      switch (sKey) {
        case "wait":   this._applyFilter("D"); break;
        case "done":   this._applyFilter("P"); break;
        case "reject": this._applyFilter("J"); break;
        default:       this._applyFilter(null); break;
      }
    },

    _applyFilter: function (sStatus) {
      var oList = this.byId("idList");
      var aFilters = [];

      if (sStatus) {
        aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
      }

      oList.getBinding("items").filter(aFilters);
    },

     // 차트 세그먼트(조각)를 클릭했을 때 대시보드가 실시간 연동되어 리스트를 필터링하는 이벤트
    onChartSelectionChanged: function (oEvent) {
      var oSelectedSegment = oEvent.getParameter("segment");
      if (!oSelectedSegment) { return; }

      var sLabel = oSelectedSegment.getLabel();
      var oIconTabBar = this.byId("idIconTabBar");
      var sKey = "all";

      if (sLabel === "결재 대기") { sKey = "wait"; }
      else if (sLabel === "결재 완료") { sKey = "done"; }
      else if (sLabel === "반려") { sKey = "reject"; }

      // 탭의 활성 위치를 강제 변경하고 리스트 필터 즉시 호출
      oIconTabBar.setSelectedKey(sKey);
      this.onFilterSelect(new sap.ui.base.Event("select", oIconTabBar, { key: sKey }));
    },

    // 리스트 클릭 
    onItemPress: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext();
      var oSplitApp = this.byId("idSplitApp");
      var oDetailPage = this.byId("idDetailPage");

      // 가이드 페이지 => 상세 페이지 전환
      oSplitApp.toDetail(oDetailPage.getId());

      // 상세 페이지에 데이터 바인딩
      oDetailPage.bindElement({
        path: oContext.getPath(),
        parameters: {
          expand: "ItemSet"
        }
      });
    },

    //  결재 
    onApprove: function () {
      var oContext = this.byId("idDetailPage").getBindingContext();

      if (!oContext) {
        MessageToast.show("전표를 선택하세요.");
        return;
      }

      var oData = oContext.getObject();

      if (oData.Status !== "D") {
        MessageToast.show("결재 대기 상태만 결재 가능합니다.");
        return;
      }

      var oModel = this.getView().getModel();
      var sPath = oContext.getPath();
      var that = this;

      MessageBox.confirm(
        oData.Belnr + "번 전표를 결재하시겠습니까?",
        {
          title: "임시전표 결재",
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.OK) {
              oModel.update(sPath, { Status: "P" }, {
                success: function () {
                  MessageToast.show("결재 완료되었습니다.");
                  oModel.refresh(true);
                  
                  // 5. 결재 완료 성공 후 차트 숫자 동적 리프레시 수행
                  that._calculateChartCounts(oModel);

                  // 결재 후 가이드 페이지로 돌아가기
                  var oSplitApp = that.byId("idSplitApp");
                  var oEmptyPage = that.byId("idEmptyPage");
                  oSplitApp.toDetail(oEmptyPage.getId());
                },
                error: function () {
                  MessageToast.show("결재 처리 중 오류가 발생했습니다.");
                }
              });
            }
          }
        }
      );
    },

    // 반려 
    onReject: function () {
      var oContext = this.byId("idDetailPage").getBindingContext();

      if (!oContext) {
        MessageToast.show("전표를 선택하세요.");
        return;
      }

      var oData = oContext.getObject();

      if (oData.Status !== "D") {
        MessageToast.show("결재 대기 상태만 반려 가능합니다.");
        return;
      }

      var oModel = this.getView().getModel();
      var sPath = oContext.getPath();
      var that = this;

      var oDialog = new Dialog({
        title: "반려 사유 입력",
        type: "Message",
        content: [
          new TextArea("idRejectReason", {
            width: "100%",
            rows: 4,
            placeholder: "반려 사유를 입력하세요"
          })
        ],
        beginButton: new Button({
          text: "반려 확정",
          type: "Reject",
          press: function () {
            var sReason = sap.ui.getCore().byId("idRejectReason").getValue();

            if (!sReason) {
              MessageToast.show("반려 사유를 입력하세요.");
              return;
            }

            oModel.update(sPath, { Status: "J", ReasonTxt: sReason }, {
              success: function () {
                MessageToast.show("반려 처리 완료되었습니다.");
                oModel.refresh(true);

                // 반려 성공 후 차트 숫자 동적 리프레시 수행
                that._calculateChartCounts(oModel);

                // 반려 후 가이드 페이지로 돌아가기
                var oSplitApp = that.byId("idSplitApp");
                var oEmptyPage = that.byId("idEmptyPage");
                oSplitApp.toDetail(oEmptyPage.getId());
              },
              error: function () {
                MessageToast.show("반려 처리 중 오류가 발생했습니다.");
              }
            });

            oDialog.close();
          }
        }),
        endButton: new Button({
          text: "취소",
          press: function () {
            oDialog.close();
          }
        }),
        afterClose: function () {
          oDialog.destroy();
        }
      });

      oDialog.open();
    },

    // ===================== 일괄 결재 =====================
        onApproveAll: function () {
      var oList = this.byId("idList");
      var oBinding = oList.getBinding("items");
      var oModel = this.getView().getModel();
      var that = this;

      if (!oBinding) {
        MessageToast.show("결재할 전표 목록이 없습니다.");
        return;
      }

      var aContexts = oBinding.getContexts(0, oBinding.getLength());
      var aPending = [];

      aContexts.forEach(function (oCtx) {
        if (oCtx) {
          var oData = oCtx.getObject();
          if (oData && oData.Status === "D") {
            aPending.push(oCtx.getPath());
          }
        }
      });

      if (aPending.length === 0) {
        MessageToast.show("현재 목록에 결재 대기 중인 전표가 없습니다.");
        return;
      }

      var iTotal = aPending.length;
      var iSuccess = 0;
      var iError = 0;

      MessageBox.confirm(
        iTotal + "건의 전표를 일괄 결재하시겠습니까?",
        {
          title: "일괄 결재",
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.OK) {

              sap.ui.core.BusyIndicator.show(0);

              // 건별 순차 호출
              var fnNext = function (iIndex) {
                if (iIndex >= iTotal) {
                  sap.ui.core.BusyIndicator.hide();
                  oModel.refresh(true);
                  that._calculateChartCounts(oModel);

                  if (iError === 0) {
                    MessageToast.show(iSuccess + "건 일괄 결재 완료.");
                  } else {
                    MessageBox.warning("성공 " + iSuccess + "건 / 실패 " + iError + "건");
                  }

                  var oSplitApp = that.byId("idSplitApp");
                  var oEmptyPage = that.byId("idEmptyPage");
                  if (oSplitApp && oEmptyPage) {
                    oSplitApp.toDetail(oEmptyPage.getId());
                  }
                  return;
                }

                oModel.update(aPending[iIndex], { Status: "P" }, {
                  success: function () {
                    iSuccess++;
                    fnNext(iIndex + 1);
                  },
                  error: function () {
                    iError++;
                    fnNext(iIndex + 1);
                  }
                });
              };

              fnNext(0);
            }
          }
        }
      );
    }

  });
});