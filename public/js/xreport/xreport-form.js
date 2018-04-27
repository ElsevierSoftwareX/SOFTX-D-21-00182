//XReport form components
var XReportForm = (function(jQ) {
  //Base XFormElem
  function XFormElem(type) {
    var that = this;
    that.type = type;
    that.id = that.genUniqueId();
  }

  XFormElem.prototype.genUniqueId = function() {
    XFormElem.numInstances = (XFormElem.numInstances || 0) + 1;
    return "x-elem-" + XFormElem.numInstances;
  }

  XFormElem.prototype.bind = function(view) {
    view.attr("data-x-id", this.id);
  }

  XFormElem.prototype.buildEditor = function() {

  }

  //label
  function XLabel(label) {
    XFormElem.call(this, "label");
    this.val = label;
  }

  XLabel.prototype = Object.create(XFormElem.prototype);

  XLabel.prototype.render = function(forId) {
    var _for = (forId) ? ("for='" + forId + "'") : "";
    var view = jQ("<label " + _for + ">" + this.val + "</label>");
    this.bind(view);
    return view;
  }

  XLabel.prototype.buildEditor = function() {
    var model = this;
    var editor = jQ("<div class='form-group'></div>");
    editor.append("<label>Mező neve</label>");
    var inp = jQ("<input type='text' class='form-control'>");
    inp.val(model.val);

    inp.on("change", function() {
      var val = jQ(this).val();
      model.val = val;
      var view = jQ("*[data-x-id='" + model.id + "']");

      if (model.type === "header") {
        view.find(":header").text(val);
      } else {
        view.text(val);
      }
    });

    editor.append(inp);
    return editor;
  }

  //Label -> Header
  function XHeader(text) {
    XLabel.call(this, text);
    this.type = "header";
  }

  XHeader.prototype = Object.create(XLabel.prototype);

  XHeader.prototype.render = function() {
    var view = jQ("<div><h5>" + this.val + "</h5><hr></div>");
    this.bind(view);
    return view;
  }

  //Label -> Info
  function XInfo(text, type) {
    XLabel.call(this, text);
    this.type = type;
  }

  XInfo.prototype = Object.create(XLabel.prototype);

  XInfo.prototype.render = function() {
    var view = jQ("<div class='alert alert-" + this.type + "' role='alert'>" + this.val + "</div>");
    this.bind(view);
    return view;
  }

  XInfo.prototype.buildEditor = function() {
    var baseEditor = XLabel.prototype.buildEditor.call(this);
    var view = jQ("<select class='form-control'></select>");
    var model = this;

    view.append(jQ('<option>', {
      value: "info",
      text : "Magyarázó szöveg"
    }));
    view.append(jQ('<option>', {
      value: "danger",
      text : "Figyelmeztető szöveg"
    }));

    view.on("change", function() {
      var val = $(this).val();
      model.type = val;
      var currentView = jQ("*[data-x-id='" + model.id + "']");
      currentView.replaceWith(model.render());
    });

    baseEditor.append(view);
    return baseEditor;
  }

  //Numberbox
  function XInNum() {
    XFormElem.call(this, "innum");
    this.min = 0;
    this.max = Infinity;
    this.unit = "";
  }

  XInNum.prototype = Object.create(XFormElem.prototype);

  XInNum.prototype.render = function() {
    var model = this;
    var view = jQ("<input type='number' class='form-control' min='" + model.min + "' max='" + model.max + "' >");
    this.bind(view);

    if (model.unit) {
      view.wrap("<div class='input-group mb-3'></div>");
      view.parent().append("<div class='input-group-append'>\
                              <span class='input-group-text'>" + model.unit + "</span>\
                            </div>");
      view = view.parent();
    }

    return view;
  }

  XInNum.prototype.buildEditor = function() {
    var model = this;
    var editor = jQ("<div></div>");
    var view = jQ("*[data-x-id='" + model.id + "']");
    var minWrapper = jQ("<div class='form-group'><label>Minimum érték</label></div>");
    var minControl = jQ("<input type='number' class='form-control'>");
    var maxWrapper = jQ("<div class='form-group'><label>Maximum érték</label></div>");
    var maxControl = jQ("<input type='number' class='form-control'>");
    var unitWrapper = jQ("<div class='form-group' class='form-control'><label>Mértékegység</label></div>");
    var unitControl = jQ("<input type='text' class='form-control'>");

    minControl.val(model.min);
    maxControl.val(model.max);

    minControl.on("change", function() {
      var val = jQ(this).val();
      model.min = val;
      view.attr("min", val);
    });

    maxControl.on("change", function() {
      var val = jQ(this).val();
      model.max = val;
      view.attr("max", val);
    });

    unitControl.on("change", function() {
      var val = jQ(this).val();
      model.unit = val;

      if (!val) {
        view.parent().find(".input-group-append").remove();
        return;
      }

      if (!view.parent().hasClass("input-group")) {
        view.wrap("<div class='input-group mb-3'></div>");
        view.parent().append("<div class='input-group-append'>\
                                <span class='input-group-text'>" + model.unit + "</span>\
                              </div>");
      } else {
        view.parent().find(".input-group-text").first().html(model.unit);
      }
    });

    minWrapper.append(minControl);
    maxWrapper.append(maxControl);
    unitWrapper.append(unitControl);
    editor.append(minWrapper);
    editor.append(maxWrapper);
    editor.append(unitWrapper);
    return editor;
  }

  //Textbox
  function XInText() {
    XFormElem.call(this, "intext");
  }

  XInText.prototype = Object.create(XFormElem.prototype);

  XInText.prototype.render = function() {
    return jQ("<input type='text' class='form-control'>");
  }

  //Checkbox
  function XInBool(style) {
    XFormElem.call(this, "inbool");
    this.style = style || "checkbox";
  }

  XInBool.prototype = Object.create(XFormElem.prototype);

  XInBool.prototype.render = function() {
    return jQ("<div class='form-check'>\
                <input id='" + this.id + "' class='form-check-input' type='" + this.style + "'>\
              </div>");
  }

  //textArea
  function XTextArea(rows) {
    XFormElem.call(this, "tarea");
    this.rows = 3;
  }

  XTextArea.prototype = Object.create(XFormElem.prototype);

  XTextArea.prototype.render = function() {
    return jQ("<textarea class='form-control' rows='" + this.rows + "'></textarea>");
  }

  //Select
  function XSel(style) {
    XFormElem.call(this, "sel");
    this.style = style || "default";
    this.options = ["Opció 1", "Opció 2"];
  }

  XSel.prototype = Object.create(XFormElem.prototype);

  XSel.prototype.render = function() {
    var view = "";
    var model = this;

    if (this.style === "radio") {
      view = jQ("<div></div>");
    } else {
      view = jQ("<select class='form-control'></select>");

      model.options.forEach(function(option) {
        view.append(jQ('<option>', {
          value: option,
          text : option
        }));
      });
    }

    this.bind(view);
    return view;
  }

  XSel.prototype.buildEditor = function() {
    var model = this;
    var editor = jQ("<div class='form-group'></div>");
    editor.append("<label>Opciók</label>");
    var textArea = jQ("<textarea class='form-control' rows='5' id='comment'></textarea>");
    var updateOptionsBtn = jQ("<br><button type='button' class='btn btn-secondary'>Mentés</button>");
    var view = jQ("*[data-x-id='" + model.id + "']");

    updateOptionsBtn.click(function() {
      var text = textArea.val();
      var splitted = text.split(';');
      model.options = [];
      view.html("");

      splitted.forEach(function(option) {
        if (!option || option === "") {
          return;
        }

        model.options.push(option);

        if (model.style === "radio") {
            var inbool = new XInBool("radio");
            var inboolView = inbool.render();
            inboolView.find("input").first().attr("name", model.id);
            var radio = inboolView.append(new XLabel(option).render());
            view.append(radio);
        } else {
          view.append(jQ('<option>', {
            value: option,
            text : option
          }));
        }
      });
    });

    var optionsStringified = "";

    model.options.forEach(function(option) {
      optionsStringified += option + ";";
    });

    textArea.val(optionsStringified);
    editor.append(textArea);
    editor.append(updateOptionsBtn);
    return editor;
  }

  //Multiple select
  function XMulSel(style) {
    XFormElem.call(this, "mulsel");
    this.style = style || "default";
    this.options = ["Opció 1", "Opció 2"];
  }

  XMulSel.prototype = Object.create(XFormElem.prototype);

  XMulSel.prototype.render = function() {
    var view = "";
    var model = this;

    if (this.style === "checkbox") {
      view = jQ("<div></div>");

      model.options.forEach(function(option) {
        var inbool = new XInBool();
        var inboolView = inbool.render();
        var check = inboolView.append(new XLabel(option).render(inbool.id));
        view.append(check);
      });
    } else {
      view = jQ("<select class='form-control' multiple></select>");
    }

    this.bind(view);
    return view;
  }

  XMulSel.prototype.buildEditor = function() {
    var model = this;
    var editor = jQ("<div class='form-group'></div>");
    editor.append("<label>Opciók</label>");
    var textArea = jQ("<textarea class='form-control' rows='5' id='comment'></textarea>");
    var updateOptionsBtn = jQ("<br><button type='button' class='btn btn-secondary'>Mentés</button>");
    var view = jQ("*[data-x-id='" + model.id + "']");

    updateOptionsBtn.click(function() {
      var text = textArea.val();
      var splitted = text.split(';');
      view.empty();
      model.options = [];

      splitted.forEach(function(option) {
        if (!option || option === "") {
          return;
        }

        model.options.push(option);

        if (model.style === "checkbox") {
            var inbool = new XInBool();
            var inboolView = inbool.render();
            var check = inboolView.append(new XLabel(option).render());
            view.append(check);
        } else {
          view.append(jQ('<option>', {
            value: option,
            text : option
          }));
        }
      });
    });

    var optionsStringified = "";

    model.options.forEach(function(option) {
      optionsStringified += option + ";";
    });

    textArea.val(optionsStringified);
    editor.append(textArea);
    editor.append(updateOptionsBtn);
    return editor;
  }

  function XDate() {
    XFormElem.call(this, "date");
  }

  XDate.prototype = Object.create(XFormElem.prototype);

  XDate.prototype.render = function() {
    var xDate = jQ('<div class="input-group">\
                      <div class="input-group-prepend">\
                        <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>\
                      </div>\
                      <input type="text" class="form-control" data-provide="datepicker" type="text" />\
                    </div>');
    return xDate;
  }

  //Rating table
  function XRating() {
    XFormElem.call(this, "rating");
    this.parameters = ["Paraméter 1", "Paraméter 2"];
    this.ratings = ["Érték 1", "Érték 2", "Érték 3"];
    this.title = "Cím";
  }

  XRating.prototype = Object.create(XFormElem.prototype);

  XRating.prototype.render = function() {
    var view = jQ("<table class='table table-bordered'></table>");
    var model = this;
    this.bind(view);

    //Build header
    var header = jQ("<thead></thead>");
    var ratingsRow = jQ("<tr></tr>");
    ratingsRow.append(jQ("<th class='text-secondary' scope='col'>" + model.title + "</th>"));

    model.ratings.forEach(function(rating) {
      ratingsRow.append(jQ("<th scope='col' class='text-center'>" + rating + "</th>"));
    });

    header.append(ratingsRow);
    view.append(header);

    //Build body
    var body = jQ("<tbody></tbody>");
    var newRow = "";
    var i = 0;

    model.parameters.forEach(function(parameter) {
      newRow = jQ("<tr></tr>");
      newRow.append(jQ("<th scope='row'>" + parameter + "</th>"));
      i++;

      model.ratings.forEach(function() {
        newRow.append(jQ("<td class='text-center'>\
                            <input type='radio' name='" + (model.id + "-" + i) + "' value='option1'>\
                          </td>"));
      });
      body.append(newRow);
    });

    view.append(body);
    return view;
  }

  XRating.prototype.buildEditor = function() {
    var model = this;
    var editor = jQ("<div class='form-group'></div>");
    var textAreaParameters = jQ("<textarea class='form-control' rows='5' id='comment'></textarea>");
    var textAreaRatings = jQ("<textarea class='form-control' rows='5' id='comment'></textarea>");
    var updateOptionsBtn = jQ("<br><button type='button' class='btn btn-secondary'>Mentés</button>");

    updateOptionsBtn.click(function() {
      var parameters = textAreaParameters.val().split(';');
      var ratings = textAreaRatings.val().split(';');
      var view = jQ("*[data-x-id='" + model.id + "']");
      var newView = "";
      view.html("");
      model.parameters = [];
      model.ratings = [];

      //Parameters
      parameters.forEach(function(parameter) {
        if (!parameter || parameter === "") {
          return;
        }

        model.parameters.push(parameter);
      });

      //Ratings
      ratings.forEach(function(rating) {
        if (!rating || rating === "") {
          return;
        }

        model.ratings.push(rating);
      });

      newView = model.render();
      newView.addClass(view.hasClass("d-none") ? "d-none" : "");
      view.replaceWith(newView);
    });

    var titleEditor = jQ("<div class='form-group'><label>Táblázat címe</label></div>");
    var inp = jQ("<input type='text' class='form-control'>");
    inp.val(model.val);

    inp.on("change", function() {
      var val = jQ(this).val();
      var view = jQ("*[data-x-id='" + model.id + "']");
      var newView = "";
      model.title = val;
      newView = model.render();
      newView.addClass(view.hasClass("d-none") ? "d-none" : "");
      view.replaceWith(newView);
    });

    //Fill in model data to editor
    var parametersString = "";
    var ratingsString = "";

    model.parameters.forEach(function(parameter) {
      parametersString += parameter + ";";
    });

    model.ratings.forEach(function(rating) {
       ratingsString += rating + ";";
    });

    inp.val(model.title);

    textAreaParameters.val(parametersString);
    textAreaRatings.val(ratingsString);
    titleEditor.append(inp);
    editor.append(titleEditor);
    editor.append("<label>Értékek</label>");
    editor.append(textAreaRatings);
    editor.append("<label>Paraméterek</label>");
    editor.append(textAreaParameters);
    editor.append(updateOptionsBtn);

    return editor;
  }

  //Form group
  //orientation can be "horizontal" or "vertical"
  function XFormGroup(orientation, label) {
    XFormElem.call(this, "group");
    this.child = "";
    this.label = new XLabel(label);
  }

  XFormGroup.prototype = Object.create(XFormElem.prototype);

  XFormGroup.prototype.addChild = function(child) {
    this.child = child;
  }

  XFormGroup.prototype.buildEditor = function() {
    var model = this;
    var editor = jQ("<div></div>");
    editor.append(this.label.buildEditor());
    editor.append(this.child.buildEditor());
    return editor;
  }

  XFormGroup.prototype.render = function() {
    var viewWrapper = jQ("<div></div>");
    var view = jQ("<div class='form-group'></div>");
    var diagnostic = jQ("<div><span class='text-info x-diagnostic'>group: " + this.id + "; label: " + this.label.id + "; input: " + this.child.id + "</span></div>");
    //viewWrapper.append(diagnostic);
    this.bind(view);
    //view.append(diagnostic);

    if (this.child.type === "inbool") {
      var checkLabel = this.child.render();
      view.append(checkLabel.append(this.label.render(this.child.id)));
    } else {
      view.append(this.label.render());
      view.append(this.child.render());
    }

    viewWrapper.append(view);
    return viewWrapper;
  }

  //Form row (for custom elems)
  function XFormRow() {
    XFormElem.call(this, "row");
    this.children = [];
  }

  XFormRow.prototype = Object.create(XFormElem.prototype);

  XFormRow.prototype.addChild = function(child) {
    this.children.push(child);
  }

  XFormRow.prototype.render = function() {
    var view = jQ("<div class='form-row'></div>");
    var model = this;
    this.bind(view);

    this.children.forEach(function(child) {
      var col = jQ("<div class='col'></div>");
      col.append(child.render());
      view.append(col);
    });

    return view;
  }

  XFormRow.prototype.buildEditor = function() {
    var model = this;
    var editor = jQ("<div></div>");

    model.children.forEach(function(child) {
      editor.append(child.buildEditor());
    });

    return editor;
  }

  return {
    Label: XLabel,
    Text: XInText,
    Header: XHeader,
    Info: XInfo,
    Num: XInNum,
    Bool: XInBool,
    Sel: XSel,
    MulSel: XMulSel,
    Group: XFormGroup,
    Datepicker: XDate,
    Row: XFormRow,
    TextArea: XTextArea,
    Rating: XRating
  }
})($);
