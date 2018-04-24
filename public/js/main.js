//Structured reporting scheme builder for XReport
$(function() {
  "use strict";

  //#region INIT
  var currentUser = null;
  var currentReportId = null;
  moment.locale("hu");
  getCategories();
  loadSchemesPage();
  //#endregion

  //#region COMPONENTS
  function schemeButton() {
    return $('<div class="col-12 col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4">\
                <h4 class="text-muted">Új sablon hozzáadása</h4>\
                <div class="card card-shadowed report-list-item report-list-item-new" data-id="new">\
                  <div class="card-body text-center">\
                    <img src="image/add.png" style="height: 64px; width: 64px"></i>\
                  </div>\
                </div>\
              <div>');
  }

  function schemeListElem(scheme) {
    return $('<div class="col-12 col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4">\
                <div class="card card-shadowed report-list-item h-100" data-id="' + scheme.id + '">\
                  <div class="card-body">\
                    <h4 class="card-title">' + scheme.name + '</h4>\
                    <h6 class="card-subtitle mb-2 text-muted">' + scheme.category + '</h6>\
                    <p class="card-text"><small class="text-muted">Készítette <strong>' + scheme.creator + "</strong>, " + moment(scheme.createdAt).fromNow()  + '</small></p>\
                  </div>\
                </div>\
              <div>');
  }
  //#endregion

  //#region UI
  function showNewSchemeModal() {
    $("#modal-new-scheme").modal('show');
  }

  function hideNewSchemeModal() {
    $("#modal-new-scheme").modal('hide');
  }

  function showMessage(msg) {
    $("#div-msg-box .modal-title").text(msg.title);
    $("#div-msg-box .modal-body").text(msg.text);
    $("#div-msg-box").modal('show');
  }

  function loggedInState() {
    $("#a-login").addClass("d-none");
    $("#a-logout").removeClass("d-none");
    $("#user-info").text(currentUser.displayName);
  }

  function loggedOutState() {
    $("#a-login").removeClass("d-none");
    $("#a-logout").addClass("d-none");
  }

  function navTabsClick() {
    $(this).tab('show');
  }

  function startLoading() {
    $("#anim-loader").removeClass("d-none");
    $("#li-schemes").addClass("d-none");
  }

  function stopLoading() {
    $("#anim-loader").addClass("d-none");
    $("#li-schemes").removeClass("d-none");
  }

  function loadSchemesPage() {
    $("#div-schemes").removeClass("d-none");
    $("#div-builder").addClass("d-none");
    getReports();
  }

  function loadEditorPage() {
    var title = $("#modal-scheme-name").val();
    var category = $("#modal-scheme-category").val();
    $("#div-builder").removeClass("d-none");
    $("#div-schemes").addClass("d-none");
    $("#input-scheme-title").val(title);

    XReportBuilder.initBuilder();
    XReportBuilder.useReportSection();
    XReportBuilder.setReportTitle(title);
    XReportBuilder.setReportCategory(category);
  }
  //#endregion

  //#region NETWORKING
  api.onAuthStateChanged(function(user) {
    currentUser = user;
    loggedInState();
  }, function() {
    loggedOutState();
  });

  function getCategories() {
    api.getCategories().then(function(categories) {
      categories.forEach(function(category) {
        $("#modal-scheme-category").append($('<option>', {
          value: category.id,
          text : category.data().name
        }));
        $("#navbarCategoryDropdown .dropdown-menu").append('<a class="dropdown-item" href="#" data-id="' + category.id + '">' + category.data().name + '</a>');
      });
    });
  }

  function getReports() {
    $("#li-schemes").html("");
    startLoading();

    api.getReports().then(function(reports) {
      $("#li-schemes").append(schemeButton());

      reports.forEach(function(report) {
        api.getCategory(report.data().category).then(function(category) {
          $("#li-schemes").append(schemeListElem({ id: report.id,
                                                   name: report.data().name,
                                                   creator: report.data().creator,
                                                   createdAt: report.data().createdAt,
                                                   category: category.data().name }));
        });
      });

      stopLoading();
    }).catch(function(error) {
      stopLoading();
      console.log(error);
    });
  }

  function googleLogin() {
    api.logIn().then(function(result) {
      //currentUser = result.user;
      console.log("Google login succeeded.");
    }).catch(function(error) {
      /*var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;*/
      console.log(error);
    });
  }

  function logOut() {
    api.logOut();
  }

  function saveScheme() {
    if (!currentUser) {
      googleLogin();
      return;
    }

    var title = XReportBuilder.getReportTitle();
    var category = XReportBuilder.getReportCategory();

    if (!title) {
      showMessage({ title: "Hiba", text: "Adja meg a sablon nevét! " });
      return;
    }

    waitingDialog.show("Sablon mentése...");

    var payload = {
      file: XReportBuilder.getReportInJSONFile(),
      name: title,
      creator: currentUser.displayName,
      category: category
    };

    //Edit report
    if (currentReportId) {
      api.editReport(payload, currentReportId)
      .then(function() {
        console.log("Report editing successful.");
        waitingDialog.hide();
      })
      .catch(function(error) {
        console.log(error);
        waitingDialog.hide();
      });
    //Save report
    } else {
      api.saveReport(payload)
      .then(function() {
        console.log("Report saving successful.");
        waitingDialog.hide();
      })
      .catch(function(error) {
        waitingDialog.hide();
        console.log(error);
      });
    }
  }

  function loadReport() {
    if ($(this).attr("data-id") === "new") {
      showNewSchemeModal();
      return;
    }

    waitingDialog.show("Sablon betöltése...");
    XReportBuilder.initBuilder();
    currentReportId = $(this).attr("data-id");

    api.getReport(currentReportId).then(function(report) {
      if (report.exists) {
        console.log("Document data:", report.data());
        $.getJSON(report.data().contentUrl, function(json) {
          XReportBuilder.setReportTitle(report.data().name);
          XReportBuilder.buildReportFromJSON(report.data().name, json);
          //$("#btn-clinics-section")[0].click();
          $("#div-builder").removeClass("d-none");
          $("#div-schemes").addClass("d-none");
          XReportBuilder.toggleEditState();
          waitingDialog.hide();
        });
      } else {
        waitingDialog.hide();
        console.log("No such document!");
      }
    }).catch(function(error) {
        waitingDialog.hide();
        showMessage({ title: "Hiba", text: "A sablon betöltése sikertelen. " });
        console.log(error);
    });
  }
  //#endregion

  //#region EVENT HANDLERS
  $(".nav-tabs a").click(navTabsClick);
  $("body").on("click", "#tool-menu .dropdown-item", function(e) {
    e.preventDefault();
    var id = $(this).attr("id");

    switch (id) {
      case "btn-add-textbox":
        XReportBuilder.addTextGroup();
        break;
      case "btn-add-numberbox":
        XReportBuilder.addNumberGroup();
        break;
      case "btn-add-checkbox":
        XReportBuilder.addBoolGroup();
        break;
      case "btn-add-select":
        XReportBuilder.addSelGroup();
        break;
      case "btn-add-select-multiple":
        XReportBuilder.addMulSelGroup();
        break;
      case "btn-add-textarea":
        XReportBuilder.addTextAreaGroup();
        break;
      case "btn-add-date":
        XReportBuilder.addDateGroup();
        break;
      case "btn-add-header":
        XReportBuilder.addHeader();
        break;
      case "btn-add-info":
        XReportBuilder.addInfo();
        break;
      case "btn-add-rating":
        XReportBuilder.addRating();
        break;
    }
  });

  $("#a-login").click(googleLogin);
  $("#a-logout").click(logOut);
  $("#btn-save-scheme").click(saveScheme);
  $("body").on('click', ".report-list-item", loadReport);
  $("#btn-toggle-edit").click(function(e) {
    e.preventDefault();
    XReportBuilder.toggleEditState();
  });

  $("#btn-run-script").click(function() {
    var scriptText = $("#script-area").val();
  });

  $("#input-scheme-title").on("change", function(e) {
    e.preventDefault();
    XReportBuilder.setReportTitle($(this).val());
  });

  $('.navbar li').click(function(){
    $('.navbar li').removeClass('active');
    $(this).addClass('active');
  });

  //Navbar
  $("#btn-new-scheme").click(function() {
    loadEditorPage();
    hideNewSchemeModal();
  });
  $("#a-schemes").click(function() {
    loadSchemesPage();
  });
  //#endregion
});
