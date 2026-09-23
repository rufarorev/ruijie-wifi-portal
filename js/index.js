function loadConfig(data) {
  try {
    IndexObj.init(data);
  } catch (e) {
    Dom.hide(Dom.byId("body_loading"));
  }
}

var IndexObj = {
  currentOption: "",
  loginOptions: [],

  LOGIN_OPTION: {
    VOUCHER: "voucher",
    FIXACCOUNT: "fixaccount",
    PASS: "pass"
  },

  init: function (data) {
    this.loadJson(data);
    this.initEvent();
    Dom.hide(Dom.byId("body_loading"));
  },

  loadJson: function (data) {
    I18nObj.init(data);
    this.renderHtml(data);
  },

  initEvent: function () {
    var self = this;
    Dom.on(Dom.byId("login_btn"), "click", function () {
      self.onLogin();
    });
  },

  renderHtml: function (data) {
    var loginOptions = ["fixaccount"];
    var priorityOrder;
    var i;
    var currentOption = "";
    this.loginOptions = loginOptions;

    if (!loginOptions || !loginOptions.length) {
      return false;
    }

    priorityOrder = [
      this.LOGIN_OPTION.VOUCHER,
      this.LOGIN_OPTION.FIXACCOUNT,
      this.LOGIN_OPTION.PASS
    ];

    for (i = 0; i < priorityOrder.length; i++) {
      if (this._hasOption(loginOptions, priorityOrder[i])) {
        currentOption = priorityOrder[i];
        this.currentOption = currentOption;
        break;
      }
    }

    if (!currentOption) {
      return false;
    }

    I18nObj.renderHtmlLang();
    this.renderLoginHtml(loginOptions);
    this.renderCurrentLogin(currentOption);
  },

  renderHtmlLang: function () {},

  renderLoginHtml: function (loginOptions) {
    var allOptions;
    var i;
    var option;
    if (loginOptions.length > 1) {
      Dom.removeClass(Dom.byId("login_split_line"), "hide");
    }

    allOptions = [
      this.LOGIN_OPTION.VOUCHER,
      this.LOGIN_OPTION.FIXACCOUNT,
      this.LOGIN_OPTION.PASS
    ];

    for (i = 0; i < allOptions.length; i++) {
      option = allOptions[i];
      if (!this._hasOption(loginOptions, option)) {
        this._removeByClass("login-item-" + option);
      }
    }
  },

  renderCurrentLogin: function (currentOption) {
    var form = Dom.byClass("login-form-wrapper")[0];
    var other = Dom.byClass("other-btn-wrapper")[0];
    var title = Dom.byClass("login-form-title")[0];
    var loginOptions = this.loginOptions;
    var titleKey = "voucher_login";
    var i;

    if (currentOption === this.LOGIN_OPTION.PASS) {
      titleKey = "one_click_login";
    } else if (currentOption === this.LOGIN_OPTION.FIXACCOUNT) {
      titleKey = "account_login";
    }

    if (title) {
      Dom.text(title, I18nObj.$t(titleKey));
      title.setAttribute("data-i18n", titleKey);
    }

    if (form) {
      this._setHidden(Dom.byClass("login-item", form), true);
      this._setHidden(Dom.byClass("login-item-" + currentOption, form), false);
    }

    if (other) {
      this._setHidden(Dom.byClass("login-item", other), true);
      for (i = 0; i < loginOptions.length; i++) {
        if (loginOptions[i] !== currentOption) {
          this._setHidden(Dom.byClass("login-item-" + loginOptions[i], other), false);
        }
      }
    }
  },

  changeLoginOption: function (currentOption) {
    this.currentOption = currentOption;
    this.renderCurrentLogin(currentOption);
  },

  onLogin: function () {
    var paramObj = {};
    var validRes;
    var self = this;

    if (this.currentOption === this.LOGIN_OPTION.FIXACCOUNT) {
      paramObj.account = this._fieldValue(Dom.byId("account_input"));
      paramObj.password = this._fieldValue(Dom.byId("account_password"));
    } else if (this.currentOption === this.LOGIN_OPTION.VOUCHER) {
      paramObj.account = this._fieldValue(Dom.byId("voucher_code"));
    }

    validRes = this.validateLoginForm();
    if (!validRes) {
      return false;
    }

    paramObj.lang = I18nObj.currentLang;
    paramObj.authType = this.currentOption;
    paramObj.sessionId = this._getParamVal("sessionId");

    this._postJson("/api/auth/general", paramObj, function (response) {
      var msg = Dom.byId("login_msg");
      if (response && response.success && response.result && response.result.logonUrl) {
        window.location.href = response.result.logonUrl;
      } else if (response && response.message) {
        Dom.text(msg, response.message);
      }
    });
  },

  validateLoginForm: function () {
    Dom.text(Dom.byId("login_msg"), "");
    if (!this.currentOption) {
      return true;
    }

    if (this.currentOption === this.LOGIN_OPTION.PASS) {
      return true;
    }
    if (this.currentOption === this.LOGIN_OPTION.FIXACCOUNT) {
      return this.validateAccountForm();
    }
    return this.validateVoucherForm();
  },

  validateVoucherForm: function () {
    if (!this._fieldValue(Dom.byId("voucher_code"))) {
      Dom.text(Dom.byId("login_msg"), I18nObj.$t("please_enter_access_code"));
      return false;
    }
    return true;
  },

  validateAccountForm: function () {
    if (!this._fieldValue(Dom.byId("account_input"))) {
      Dom.text(Dom.byId("login_msg"), I18nObj.$t("please_enter_account"));
      return false;
    }
    if (!this._fieldValue(Dom.byId("account_password"))) {
      Dom.text(Dom.byId("login_msg"), I18nObj.$t("please_enter_pwd"));
      return false;
    }
    return true;
  },

  _fieldValue: function (el) {
    var value = "";
    var hint;
    if (!el) {
      return "";
    }
    value = (el.value || "").replace(/^\s+|\s+$/g, "");
    if (!Dom.placeholder) {
      hint = el.getAttribute("placeholder") || "";
      if (value === hint) {
        return "";
      }
    }
    return value;
  },

  _hasOption: function (list, value) {
    var i;
    if (!list) {
      return false;
    }
    for (i = 0; i < list.length; i++) {
      if (list[i] === value) {
        return true;
      }
    }
    return false;
  },

  _setHidden: function (list, hidden) {
    var i;
    for (i = 0; i < list.length; i++) {
      if (hidden) {
        Dom.addClass(list[i], "hide");
      } else {
        Dom.removeClass(list[i], "hide");
      }
    }
  },

  _removeByClass: function (cls) {
    var nodes = Dom.byClass(cls);
    var copy = [];
    var i;
    for (i = 0; i < nodes.length; i++) {
      copy.push(nodes[i]);
    }
    for (i = 0; i < copy.length; i++) {
      if (copy[i].parentNode) {
        copy[i].parentNode.removeChild(copy[i]);
      }
    }
  },

  _getParamVal: function (paras) {
    var topUrl;
    var queryString;
    var paraString;
    var paraObj;
    var i;
    var pair;
    var key;
    try {
      topUrl = decodeURI(window.top.location.href);
      queryString = topUrl.split("?")[1];
      if (!queryString) {
        return null;
      }
      if (queryString.indexOf("#") !== -1) {
        queryString = queryString.split("#")[0];
      }
      paraString = queryString.split("&");
      paraObj = {};
      for (i = 0; i < paraString.length; i++) {
        pair = paraString[i].split("=");
        if (pair.length >= 2) {
          key = pair[0].toLowerCase();
          paraObj[key] = pair.slice(1).join("=");
        }
      }
      key = paras.toLowerCase();
      return typeof paraObj[key] === "undefined" ? null : paraObj[key];
    } catch (e) {
      return null;
    }
  },

  _postJson: function (url, data, onOk) {
    var xhr = null;
    var body = this._toJson(data);
    if (window.XMLHttpRequest) {
      try {
        xhr = new XMLHttpRequest();
      } catch (e1) {}
    }
    if (!xhr) {
      try {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e2) {}
    }
    if (!xhr) {
      try {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e3) {}
    }
    if (!xhr) {
      return;
    }
    xhr.open("POST", url, true);
    try {
      xhr.setRequestHeader("Content-Type", "application/json");
    } catch (e4) {}
    xhr.onreadystatechange = function () {
      var parsed = null;
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        parsed = IndexObj._parseJson(xhr.responseText);
        onOk(parsed);
      }
    };
    xhr.send(body);
  },

  _toJson: function (obj) {
    var parts;
    var key;
    var value;
    if (window.JSON && JSON.stringify) {
      return JSON.stringify(obj);
    }
    parts = [];
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        value = obj[key];
        if (value === null || typeof value === "undefined") {
          parts.push('"' + key + '":null');
        } else {
          parts.push(
            '"' +
              key +
              '":"' +
              String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"') +
              '"'
          );
        }
      }
    }
    return "{" + parts.join(",") + "}";
  },

  _parseJson: function (text) {
    if (!text) {
      return null;
    }
    if (window.JSON && JSON.parse) {
      try {
        return JSON.parse(text);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};
