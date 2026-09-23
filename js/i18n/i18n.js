var Dom = {
  placeholder: (function () {
    var probe = document.createElement("input");
    return "placeholder" in probe;
  })(),

  byId: function (id) {
    return document.getElementById(id);
  },

  byClass: function (cls, root) {
    root = root || document;
    if (root.getElementsByClassName) {
      return root.getElementsByClassName(cls);
    }
    if (root.querySelectorAll) {
      return root.querySelectorAll("." + cls);
    }
    return [];
  },

  byAttr: function (name, root) {
    root = root || document;
    if (root.querySelectorAll) {
      return root.querySelectorAll("[" + name + "]");
    }
    var all = root.getElementsByTagName("*");
    var out = [];
    var i;
    for (i = 0; i < all.length; i++) {
      if (all[i].getAttribute(name)) {
        out.push(all[i]);
      }
    }
    return out;
  },

  hasClass: function (el, cls) {
    if (!el || !el.className) {
      return false;
    }
    return (" " + el.className + " ").indexOf(" " + cls + " ") !== -1;
  },

  addClass: function (el, cls) {
    if (!el || this.hasClass(el, cls)) {
      return;
    }
    el.className += (el.className ? " " : "") + cls;
  },

  removeClass: function (el, cls) {
    if (!el || !el.className) {
      return;
    }
    var parts = el.className.split(/\s+/);
    var out = [];
    var i;
    for (i = 0; i < parts.length; i++) {
      if (parts[i] && parts[i] !== cls) {
        out.push(parts[i]);
      }
    }
    el.className = out.join(" ");
  },

  toggleClass: function (el, cls) {
    if (this.hasClass(el, cls)) {
      this.removeClass(el, cls);
    } else {
      this.addClass(el, cls);
    }
  },

  each: function (list, fn) {
    var i;
    for (i = 0; i < list.length; i++) {
      fn(list[i], i);
    }
  },

  text: function (el, value) {
    if (!el) {
      return "";
    }
    if (typeof value === "undefined") {
      if (typeof el.textContent !== "undefined") {
        return el.textContent;
      }
      return el.innerText || "";
    }
    if (typeof el.textContent !== "undefined") {
      el.textContent = value;
    } else {
      el.innerText = value;
    }
  },

  on: function (el, type, fn) {
    if (!el) {
      return;
    }
    if (el.addEventListener) {
      el.addEventListener(type, fn, false);
    } else if (el.attachEvent) {
      el.attachEvent("on" + type, function () {
        return fn.call(el);
      });
    }
  },

  appendHtml: function (el, html) {
    var wrap;
    var first;
    if (!el) {
      return;
    }
    wrap = document.createElement("div");
    wrap.innerHTML = html;
    while (wrap.firstChild) {
      first = wrap.firstChild;
      wrap.removeChild(first);
      el.appendChild(first);
    }
  },

  hide: function (el) {
    if (!el) {
      return;
    }
    this.addClass(el, "hide");
    el.style.display = "none";
  }
};

var I18nObj = {
  labelObj: {
    en_US: "English",
    es_ES: "Español",
    fr_FR: "Français",
    th_TH: "ไทย",
    tr_TR: "Türkçe",
    vi_VN: "Tiếng Việt",
    zh_CN: "简体中文"
  },

  currentLang: "en_US",
  activedObj: null,

  init: function (data) {
    var langs = data && data.custom_html && data.custom_html.lang;
    this.activedObj = LandObj.en_US;
    if (!langs || !langs.length) {
      return;
    }
    this.currentLang = langs[0];
    this.activedObj = LandObj[this.currentLang] || LandObj.en_US;
    this.renderLangMenu(langs);
    this.initEvent();
  },

  renderLangMenu: function (langs) {
    var menuItems = "";
    var i;
    var lang;
    var label;
    var parent = Dom.byId("body_content");
    for (i = 0; i < langs.length; i++) {
      lang = langs[i];
      label = this.labelObj[lang] || lang;
      menuItems +=
        '<a href="javascript:void(0)" onclick="I18nObj.changeLang(\'' +
        lang +
        "')\">" +
        label +
        "</a>";
    }
    Dom.appendHtml(
      parent,
      '<div class="dropdown language-select" id="language_select">' +
        '<span class="dropdown-label">' +
        (this.labelObj[this.currentLang] || "English") +
        "</span>" +
        '<span class="dropdown-arrow">&#9660;</span>' +
        '<span class="dropdown-menu">' +
        menuItems +
        "</span>" +
        "</div>"
    );
  },

  initEvent: function () {
    var select = Dom.byId("language_select");
    Dom.on(select, "click", function () {
      Dom.toggleClass(select, "actived");
    });
  },

  $t: function (key) {
    var pack = this.activedObj || LandObj.en_US;
    if (pack && pack[key]) {
      return pack[key];
    }
    return key;
  },

  changeLang: function (lang) {
    var labels;
    Dom.text(Dom.byId("login_msg"), "");
    this.currentLang = lang;
    this.activedObj = LandObj[lang] || LandObj.en_US;
    labels = Dom.byClass("dropdown-label");
    if (labels.length) {
      Dom.text(labels[0], this.labelObj[lang] || lang);
    }
    this.renderHtmlLang();
  },

  renderHtmlLang: function () {
    var self = this;
    Dom.each(Dom.byAttr("data-i18n"), function (el) {
      Dom.text(el, self.$t(el.getAttribute("data-i18n")));
    });
    Dom.each(Dom.byAttr("data-i18n-placeholder"), function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      var translation = self.$t(key);
      var oldHint = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", translation);
      if (!Dom.placeholder && (!el.value || el.value === oldHint)) {
        el.value = translation;
      }
    });
  }
};
