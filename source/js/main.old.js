!(function () {
  var e,
    t,
    l,
    c,
    n,
    o,
    d,
    h,
    f,
    p,
    v,
    g,
    y,
    m,
    S,
    x,
    w,
    I,
    b,
    E,
    D,
    F,
    _,
    P,
    k,
    z,
    i,
    N = function (e) {
      var t = new N.Index();
      return (
        t.pipeline.add(N.trimmer, N.stopWordFilter, N.stemmer),
        e && e.call(t, t),
        t
      );
    };
  (N.version = '0.9.5'),
    ((lunr = N).utils = {}),
    (N.utils.warn =
      ((i = this),
      function (e) {
        i.console && console.warn && console.warn(e);
      })),
    (N.utils.toString = function (e) {
      return null == e ? '' : e.toString();
    }),
    (N.EventEmitter = function () {
      this.events = {};
    }),
    (N.EventEmitter.prototype.addListener = function () {
      var e = Array.prototype.slice.call(arguments),
        t = e.pop(),
        n = e;
      if ('function' != typeof t)
        throw new TypeError('last argument must be a function');
      n.forEach(function (e) {
        this.hasHandler(e) || (this.events[e] = []), this.events[e].push(t);
      }, this);
    }),
    (N.EventEmitter.prototype.removeListener = function (e, t) {
      if (this.hasHandler(e)) {
        var n = this.events[e].indexOf(t);
        -1 !== n &&
          (this.events[e].splice(n, 1),
          0 == this.events[e].length && delete this.events[e]);
      }
    }),
    (N.EventEmitter.prototype.emit = function (e) {
      if (this.hasHandler(e)) {
        var t = Array.prototype.slice.call(arguments, 1);
        this.events[e].forEach(function (e) {
          e.apply(void 0, t);
        }, this);
      }
    }),
    (N.EventEmitter.prototype.hasHandler = function (e) {
      return e in this.events;
    }),
    (N.tokenizer = function (e) {
      if (!arguments.length || null == e) return [];
      if (Array.isArray(e)) {
        var t = e.filter(function (e) {
          return null != e;
        });
        t = t.map(function (e) {
          return N.utils.toString(e).toLowerCase();
        });
        var n = [];
        return (
          t.forEach(function (e) {
            var t = e.split(N.tokenizer.seperator);
            n = n.concat(t);
          }, this),
          n
        );
      }
      return e.toString().trim().toLowerCase().split(N.tokenizer.seperator);
    }),
    (N.tokenizer.defaultSeperator = /[\s\-]+/),
    (N.tokenizer.seperator = N.tokenizer.defaultSeperator),
    (N.tokenizer.setSeperator = function (e) {
      null != e && 'object' == typeof e && (N.tokenizer.seperator = e);
    }),
    (N.tokenizer.resetSeperator = function () {
      N.tokenizer.seperator = N.tokenizer.defaultSeperator;
    }),
    (N.tokenizer.getSeperator = function () {
      return N.tokenizer.seperator;
    }),
    (N.Pipeline = function () {
      this._queue = [];
    }),
    (N.Pipeline.registeredFunctions = {}),
    (N.Pipeline.registerFunction = function (e, t) {
      t in N.Pipeline.registeredFunctions &&
        N.utils.warn('Overwriting existing registered function: ' + t),
        (e.label = t),
        (N.Pipeline.registeredFunctions[t] = e);
    }),
    (N.Pipeline.getRegisteredFunction = function (e) {
      return e in N.Pipeline.registeredFunctions != 1
        ? null
        : N.Pipeline.registeredFunctions[e];
    }),
    (N.Pipeline.warnIfFunctionNotRegistered = function (e) {
      (e.label && e.label in this.registeredFunctions) ||
        N.utils.warn(
          'Function is not registered with pipeline. This may cause problems when serialising the index.\n',
          e
        );
    }),
    (N.Pipeline.load = function (e) {
      var n = new N.Pipeline();
      return (
        e.forEach(function (e) {
          var t = N.Pipeline.getRegisteredFunction(e);
          if (!t) throw new Error('Cannot load un-registered function: ' + e);
          n.add(t);
        }),
        n
      );
    }),
    (N.Pipeline.prototype.add = function () {
      Array.prototype.slice.call(arguments).forEach(function (e) {
        N.Pipeline.warnIfFunctionNotRegistered(e), this._queue.push(e);
      }, this);
    }),
    (N.Pipeline.prototype.after = function (e, t) {
      N.Pipeline.warnIfFunctionNotRegistered(t);
      var n = this._queue.indexOf(e);
      if (-1 === n) throw new Error('Cannot find existingFn');
      this._queue.splice(n + 1, 0, t);
    }),
    (N.Pipeline.prototype.before = function (e, t) {
      N.Pipeline.warnIfFunctionNotRegistered(t);
      var n = this._queue.indexOf(e);
      if (-1 === n) throw new Error('Cannot find existingFn');
      this._queue.splice(n, 0, t);
    }),
    (N.Pipeline.prototype.remove = function (e) {
      var t = this._queue.indexOf(e);
      -1 !== t && this._queue.splice(t, 1);
    }),
    (N.Pipeline.prototype.run = function (e) {
      for (
        var t = [], n = e.length, o = this._queue.length, i = 0;
        i < n;
        i++
      ) {
        for (
          var r = e[i], s = 0;
          s < o && null != (r = this._queue[s](r, i, e));
          s++
        );
        null != r && t.push(r);
      }
      return t;
    }),
    (N.Pipeline.prototype.reset = function () {
      this._queue = [];
    }),
    (N.Pipeline.prototype.get = function () {
      return this._queue;
    }),
    (N.Pipeline.prototype.toJSON = function () {
      return this._queue.map(function (e) {
        return N.Pipeline.warnIfFunctionNotRegistered(e), e.label;
      });
    }),
    (N.Index = function () {
      (this._fields = []),
        (this._ref = 'id'),
        (this.pipeline = new N.Pipeline()),
        (this.documentStore = new N.DocumentStore()),
        (this.index = {}),
        (this.eventEmitter = new N.EventEmitter()),
        (this._idfCache = {}),
        this.on(
          'add',
          'remove',
          'update',
          function () {
            this._idfCache = {};
          }.bind(this)
        );
    }),
    (N.Index.prototype.on = function () {
      var e = Array.prototype.slice.call(arguments);
      return this.eventEmitter.addListener.apply(this.eventEmitter, e);
    }),
    (N.Index.prototype.off = function (e, t) {
      return this.eventEmitter.removeListener(e, t);
    }),
    (N.Index.load = function (e) {
      e.version !== N.version &&
        N.utils.warn(
          'version mismatch: current ' + N.version + ' importing ' + e.version
        );
      var t = new this();
      for (var n in ((t._fields = e.fields),
      (t._ref = e.ref),
      (t.documentStore = N.DocumentStore.load(e.documentStore)),
      (t.pipeline = N.Pipeline.load(e.pipeline)),
      (t.index = {}),
      e.index))
        t.index[n] = N.InvertedIndex.load(e.index[n]);
      return t;
    }),
    (N.Index.prototype.addField = function (e) {
      return (
        this._fields.push(e), (this.index[e] = new N.InvertedIndex()), this
      );
    }),
    (N.Index.prototype.setRef = function (e) {
      return (this._ref = e), this;
    }),
    (N.Index.prototype.saveDocument = function (e) {
      return (this.documentStore = new N.DocumentStore(e)), this;
    }),
    (N.Index.prototype.addDoc = function (r, e) {
      if (r) {
        e = void 0 === e || e;
        var s = r[this._ref];
        this.documentStore.addDoc(s, r),
          this._fields.forEach(function (e) {
            var t = this.pipeline.run(N.tokenizer(r[e]));
            this.documentStore.addFieldLength(s, e, t.length);
            var n = {};
            for (var o in (t.forEach(function (e) {
              e in n ? (n[e] += 1) : (n[e] = 1);
            }, this),
            n)) {
              var i = n[o];
              (i = Math.sqrt(i)), this.index[e].addToken(o, { ref: s, tf: i });
            }
          }, this),
          e && this.eventEmitter.emit('add', r, this);
      }
    }),
    (N.Index.prototype.removeDocByRef = function (e) {
      if (
        e &&
        !1 !== this.documentStore.isDocStored() &&
        this.documentStore.hasDoc(e)
      ) {
        var t = this.documentStore.getDoc(e);
        this.removeDoc(t, !1);
      }
    }),
    (N.Index.prototype.removeDoc = function (e, t) {
      if (e) {
        t = void 0 === t || t;
        var n = e[this._ref];
        this.documentStore.hasDoc(n) &&
          (this.documentStore.removeDoc(n),
          this._fields.forEach(function (t) {
            this.pipeline.run(N.tokenizer(e[t])).forEach(function (e) {
              this.index[t].removeToken(e, n);
            }, this);
          }, this),
          t && this.eventEmitter.emit('remove', e, this));
      }
    }),
    (N.Index.prototype.updateDoc = function (e, t) {
      t = void 0 === t || t;
      this.removeDocByRef(e[this._ref], !1),
        this.addDoc(e, !1),
        t && this.eventEmitter.emit('update', e, this);
    }),
    (N.Index.prototype.idf = function (e, t) {
      var n = '@' + t + '/' + e;
      if (Object.prototype.hasOwnProperty.call(this._idfCache, n))
        return this._idfCache[n];
      var o = this.index[t].getDocFreq(e),
        i = 1 + Math.log(this.documentStore.length / (o + 1));
      return (this._idfCache[n] = i);
    }),
    (N.Index.prototype.getFields = function () {
      return this._fields.slice();
    }),
    (N.Index.prototype.search = function (e, t) {
      if (!e) return [];
      e = 'string' == typeof e ? { any: e } : JSON.parse(JSON.stringify(e));
      var n = null;
      null != t && (n = JSON.stringify(t));
      for (
        var o = new N.Configuration(n, this.getFields()).get(),
          i = {},
          r = Object.keys(e),
          s = 0;
        s < r.length;
        s++
      ) {
        var u = r[s];
        i[u] = this.pipeline.run(N.tokenizer(e[u]));
      }
      var a = {};
      for (var l in o) {
        var c = i[l] || i.any;
        if (c) {
          var d = this.fieldSearch(c, l, o),
            h = o[l].boost;
          for (var f in d) d[f] = d[f] * h;
          for (var f in d) f in a ? (a[f] += d[f]) : (a[f] = d[f]);
        }
      }
      var p,
        v = [];
      for (var f in a)
        (p = { ref: f, score: a[f] }),
          this.documentStore.hasDoc(f) &&
            (p.doc = this.documentStore.getDoc(f)),
          v.push(p);
      return (
        v.sort(function (e, t) {
          return t.score - e.score;
        }),
        v
      );
    }),
    (N.Index.prototype.fieldSearch = function (e, h, t) {
      var f = t[h].bool,
        n = t[h].expand,
        o = t[h].boost,
        p = null,
        v = {};
      return 0 !== o
        ? (e.forEach(function (c) {
            var e = [c];
            1 == n && (e = this.index[h].expandToken(c));
            var d = {};
            e.forEach(function (e) {
              var t = this.index[h].getDocs(e),
                n = this.idf(e, h);
              if (p && 'AND' == f) {
                var o = {};
                for (var i in p) i in t && (o[i] = t[i]);
                t = o;
              }
              for (var i in (e == c && this.fieldSearchStats(v, e, t), t)) {
                var r = this.index[h].getTermFrequency(e, i),
                  s = this.documentStore.getFieldLength(i, h),
                  u = 1;
                0 != s && (u = 1 / Math.sqrt(s));
                var a = 1;
                e != c && (a = 0.15 * (1 - (e.length - c.length) / e.length));
                var l = r * n * u * a;
                i in d ? (d[i] += l) : (d[i] = l);
              }
            }, this),
              (p = this.mergeScores(p, d, f));
          }, this),
          (p = this.coordNorm(p, v, e.length)))
        : void 0;
    }),
    (N.Index.prototype.mergeScores = function (e, t, n) {
      if (!e) return t;
      if ('AND' == n) {
        var o = {};
        for (var i in t) i in e && (o[i] = e[i] + t[i]);
        return o;
      }
      for (var i in t) i in e ? (e[i] += t[i]) : (e[i] = t[i]);
      return e;
    }),
    (N.Index.prototype.fieldSearchStats = function (e, t, n) {
      for (var o in n) o in e ? e[o].push(t) : (e[o] = [t]);
    }),
    (N.Index.prototype.coordNorm = function (e, t, n) {
      for (var o in e)
        if (o in t) {
          var i = t[o].length;
          e[o] = (e[o] * i) / n;
        }
      return e;
    }),
    (N.Index.prototype.toJSON = function () {
      var t = {};
      return (
        this._fields.forEach(function (e) {
          t[e] = this.index[e].toJSON();
        }, this),
        {
          version: N.version,
          fields: this._fields,
          ref: this._ref,
          documentStore: this.documentStore.toJSON(),
          index: t,
          pipeline: this.pipeline.toJSON(),
        }
      );
    }),
    (N.Index.prototype.use = function (e) {
      var t = Array.prototype.slice.call(arguments, 1);
      t.unshift(this), e.apply(this, t);
    }),
    (N.DocumentStore = function (e) {
      (this._save = null == e || e),
        (this.docs = {}),
        (this.docInfo = {}),
        (this.length = 0);
    }),
    (N.DocumentStore.load = function (e) {
      var t = new this();
      return (
        (t.length = e.length),
        (t.docs = e.docs),
        (t.docInfo = e.docInfo),
        (t._save = e.save),
        t
      );
    }),
    (N.DocumentStore.prototype.isDocStored = function () {
      return this._save;
    }),
    (N.DocumentStore.prototype.addDoc = function (e, t) {
      this.hasDoc(e) || this.length++,
        (this.docs[e] =
          !0 === this._save
            ? (function (e) {
                if (null === e || 'object' != typeof e) return e;
                var t = e.constructor();
                for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
                return t;
              })(t)
            : null);
    }),
    (N.DocumentStore.prototype.getDoc = function (e) {
      return !1 === this.hasDoc(e) ? null : this.docs[e];
    }),
    (N.DocumentStore.prototype.hasDoc = function (e) {
      return e in this.docs;
    }),
    (N.DocumentStore.prototype.removeDoc = function (e) {
      this.hasDoc(e) &&
        (delete this.docs[e], delete this.docInfo[e], this.length--);
    }),
    (N.DocumentStore.prototype.addFieldLength = function (e, t, n) {
      null != e &&
        0 != this.hasDoc(e) &&
        (this.docInfo[e] || (this.docInfo[e] = {}), (this.docInfo[e][t] = n));
    }),
    (N.DocumentStore.prototype.updateFieldLength = function (e, t, n) {
      null != e && 0 != this.hasDoc(e) && this.addFieldLength(e, t, n);
    }),
    (N.DocumentStore.prototype.getFieldLength = function (e, t) {
      return null != e && e in this.docs && t in this.docInfo[e]
        ? this.docInfo[e][t]
        : 0;
    }),
    (N.DocumentStore.prototype.toJSON = function () {
      return {
        docs: this.docs,
        docInfo: this.docInfo,
        length: this.length,
        save: this._save,
      };
    }),
    (N.stemmer =
      ((l = {
        ational: 'ate',
        tional: 'tion',
        enci: 'ence',
        anci: 'ance',
        izer: 'ize',
        bli: 'ble',
        alli: 'al',
        entli: 'ent',
        eli: 'e',
        ousli: 'ous',
        ization: 'ize',
        ation: 'ate',
        ator: 'ate',
        alism: 'al',
        iveness: 'ive',
        fulness: 'ful',
        ousness: 'ous',
        aliti: 'al',
        iviti: 'ive',
        biliti: 'ble',
        logi: 'log',
      }),
      (c = {
        icate: 'ic',
        ative: '',
        alize: 'al',
        iciti: 'ic',
        ical: 'ic',
        ful: '',
        ness: '',
      }),
      (n = '[aeiouy]'),
      (o = '[^aeiou][^aeiouy]*'),
      (d = new RegExp(
        '^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*'
      )),
      (h = new RegExp(
        '^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*'
      )),
      (f = new RegExp(
        '^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*([aeiouy][aeiou]*)?$'
      )),
      (p = new RegExp('^([^aeiou][^aeiouy]*)?[aeiouy]')),
      (v = /^(.+?)(ss|i)es$/),
      (g = /^(.+?)([^s])s$/),
      (y = /^(.+?)eed$/),
      (m = /^(.+?)(ed|ing)$/),
      (S = /.$/),
      (x = /(at|bl|iz)$/),
      (w = new RegExp('([^aeiouylsz])\\1$')),
      (I = new RegExp('^' + o + n + '[^aeiouwxy]$')),
      (b = /^(.+?[^aeiou])y$/),
      (E =
        /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/),
      (D = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/),
      (F =
        /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/),
      (_ = /^(.+?)(s|t)(ion)$/),
      (P = /^(.+?)e$/),
      (k = /ll$/),
      (z = new RegExp('^' + o + n + '[^aeiouwxy]$')),
      function (e) {
        var t, n, o, i, r, s, u;
        if (e.length < 3) return e;
        if (
          ('y' == (o = e.substr(0, 1)) && (e = o.toUpperCase() + e.substr(1)),
          (r = g),
          (i = v).test(e)
            ? (e = e.replace(i, '$1$2'))
            : r.test(e) && (e = e.replace(r, '$1$2')),
          (r = m),
          (i = y).test(e))
        ) {
          var a = i.exec(e);
          (i = d).test(a[1]) && ((i = S), (e = e.replace(i, '')));
        } else
          r.test(e) &&
            ((t = (a = r.exec(e))[1]),
            (r = p).test(t) &&
              ((s = w),
              (u = I),
              (r = x).test((e = t))
                ? (e += 'e')
                : s.test(e)
                ? ((i = S), (e = e.replace(i, '')))
                : u.test(e) && (e += 'e')));
        return (
          (i = b).test(e) && (e = (t = (a = i.exec(e))[1]) + 'i'),
          (i = E).test(e) &&
            ((t = (a = i.exec(e))[1]),
            (n = a[2]),
            (i = d).test(t) && (e = t + l[n])),
          (i = D).test(e) &&
            ((t = (a = i.exec(e))[1]),
            (n = a[2]),
            (i = d).test(t) && (e = t + c[n])),
          (r = _),
          (i = F).test(e)
            ? ((t = (a = i.exec(e))[1]), (i = h).test(t) && (e = t))
            : r.test(e) &&
              ((t = (a = r.exec(e))[1] + a[2]), (r = h).test(t) && (e = t)),
          (i = P).test(e) &&
            ((t = (a = i.exec(e))[1]),
            (r = f),
            (s = z),
            ((i = h).test(t) || (r.test(t) && !s.test(t))) && (e = t)),
          (r = h),
          (i = k).test(e) && r.test(e) && ((i = S), (e = e.replace(i, ''))),
          'y' == o && (e = o.toLowerCase() + e.substr(1)),
          e
        );
      })),
    N.Pipeline.registerFunction(N.stemmer, 'stemmer'),
    (N.stopWordFilter = function (e) {
      return e && !0 !== N.stopWordFilter.stopWords[e] ? e : void 0;
    }),
    (N.clearStopWords = function () {
      N.stopWordFilter.stopWords = {};
    }),
    (N.addStopWords = function (e) {
      null != e &&
        !1 !== Array.isArray(e) &&
        e.forEach(function (e) {
          N.stopWordFilter.stopWords[e] = !0;
        }, this);
    }),
    (N.resetStopWords = function () {
      N.stopWordFilter.stopWords = N.defaultStopWords;
    }),
    (N.defaultStopWords = {
      '': !0,
      a: !0,
      able: !0,
      about: !0,
      across: !0,
      after: !0,
      all: !0,
      almost: !0,
      also: !0,
      am: !0,
      among: !0,
      an: !0,
      and: !0,
      any: !0,
      are: !0,
      as: !0,
      at: !0,
      be: !0,
      because: !0,
      been: !0,
      but: !0,
      by: !0,
      can: !0,
      cannot: !0,
      could: !0,
      dear: !0,
      did: !0,
      do: !0,
      does: !0,
      either: !0,
      else: !0,
      ever: !0,
      every: !0,
      for: !0,
      from: !0,
      get: !0,
      got: !0,
      had: !0,
      has: !0,
      have: !0,
      he: !0,
      her: !0,
      hers: !0,
      him: !0,
      his: !0,
      how: !0,
      however: !0,
      i: !0,
      if: !0,
      in: !0,
      into: !0,
      is: !0,
      it: !0,
      its: !0,
      just: !0,
      least: !0,
      let: !0,
      like: !0,
      likely: !0,
      may: !0,
      me: !0,
      might: !0,
      most: !0,
      must: !0,
      my: !0,
      neither: !0,
      no: !0,
      nor: !0,
      not: !0,
      of: !0,
      off: !0,
      often: !0,
      on: !0,
      only: !0,
      or: !0,
      other: !0,
      our: !0,
      own: !0,
      rather: !0,
      said: !0,
      say: !0,
      says: !0,
      she: !0,
      should: !0,
      since: !0,
      so: !0,
      some: !0,
      than: !0,
      that: !0,
      the: !0,
      their: !0,
      them: !0,
      then: !0,
      there: !0,
      these: !0,
      they: !0,
      this: !0,
      tis: !0,
      to: !0,
      too: !0,
      twas: !0,
      us: !0,
      wants: !0,
      was: !0,
      we: !0,
      were: !0,
      what: !0,
      when: !0,
      where: !0,
      which: !0,
      while: !0,
      who: !0,
      whom: !0,
      why: !0,
      will: !0,
      with: !0,
      would: !0,
      yet: !0,
      you: !0,
      your: !0,
    }),
    (N.stopWordFilter.stopWords = N.defaultStopWords),
    N.Pipeline.registerFunction(N.stopWordFilter, 'stopWordFilter'),
    (N.trimmer = function (e) {
      if (null == e) throw new Error('token should not be undefined');
      return e.replace(/^\W+/, '').replace(/\W+$/, '');
    }),
    N.Pipeline.registerFunction(N.trimmer, 'trimmer'),
    (N.InvertedIndex = function () {
      this.root = { docs: {}, df: 0 };
    }),
    (N.InvertedIndex.load = function (e) {
      var t = new this();
      return (t.root = e.root), t;
    }),
    (N.InvertedIndex.prototype.addToken = function (e, t, n) {
      n = n || this.root;
      for (var o = 0; o <= e.length - 1; ) {
        var i = e[o];
        i in n || (n[i] = { docs: {}, df: 0 }), (o += 1), (n = n[i]);
      }
      var r = t.ref;
      n.docs[r]
        ? (n.docs[r] = { tf: t.tf })
        : ((n.docs[r] = { tf: t.tf }), (n.df += 1));
    }),
    (N.InvertedIndex.prototype.hasToken = function (e) {
      if (!e) return !1;
      for (var t = this.root, n = 0; n < e.length; n++) {
        if (!t[e[n]]) return !1;
        t = t[e[n]];
      }
      return !0;
    }),
    (N.InvertedIndex.prototype.getNode = function (e) {
      if (!e) return null;
      for (var t = this.root, n = 0; n < e.length; n++) {
        if (!t[e[n]]) return null;
        t = t[e[n]];
      }
      return t;
    }),
    (N.InvertedIndex.prototype.getDocs = function (e) {
      var t = this.getNode(e);
      return null == t ? {} : t.docs;
    }),
    (N.InvertedIndex.prototype.getTermFrequency = function (e, t) {
      var n = this.getNode(e);
      return null != n && t in n.docs ? n.docs[t].tf : 0;
    }),
    (N.InvertedIndex.prototype.getDocFreq = function (e) {
      var t = this.getNode(e);
      return null == t ? 0 : t.df;
    }),
    (N.InvertedIndex.prototype.removeToken = function (e, t) {
      if (e) {
        var n = this.getNode(e);
        null != n && t in n.docs && (delete n.docs[t], --n.df);
      }
    }),
    (N.InvertedIndex.prototype.expandToken = function (e, t, n) {
      if (null == e || '' == e) return [];
      t = t || [];
      if (null == n && null == (n = this.getNode(e))) return t;
      for (var o in (0 < n.df && t.push(e), n))
        'docs' !== o && 'df' !== o && this.expandToken(e + o, t, n[o]);
      return t;
    }),
    (N.InvertedIndex.prototype.toJSON = function () {
      return { root: this.root };
    }),
    (N.Configuration = function (e, t) {
      var n;
      e = e || '';
      if (null == t || null == t) throw new Error('fields should not be null');
      this.config = {};
      try {
        (n = JSON.parse(e)), this.buildUserConfig(n, t);
      } catch (e) {
        N.utils.warn(
          'user configuration parse failed, will use default configuration'
        ),
          this.buildDefaultConfig(t);
      }
    }),
    (N.Configuration.prototype.buildDefaultConfig = function (e) {
      this.reset(),
        e.forEach(function (e) {
          this.config[e] = { boost: 1, bool: 'OR', expand: !1 };
        }, this);
    }),
    (N.Configuration.prototype.buildUserConfig = function (e, t) {
      var n = 'OR',
        o = !1;
      if (
        (this.reset(),
        'bool' in e && (n = e.bool || n),
        'expand' in e && (o = e.expand || o),
        'fields' in e)
      )
        for (var i in e.fields)
          if (-1 < t.indexOf(i)) {
            var r = e.fields[i],
              s = o;
            null != r.expand && (s = r.expand),
              (this.config[i] = {
                boost: r.boost || 0 === r.boost ? r.boost : 1,
                bool: r.bool || n,
                expand: s,
              });
          } else
            N.utils.warn(
              'field name in user configuration not found in index instance fields'
            );
      else this.addAllFields2UserConfig(n, o, t);
    }),
    (N.Configuration.prototype.addAllFields2UserConfig = function (t, n, e) {
      e.forEach(function (e) {
        this.config[e] = { boost: 1, bool: t, expand: n };
      }, this);
    }),
    (N.Configuration.prototype.get = function () {
      return this.config;
    }),
    (N.Configuration.prototype.reset = function () {
      this.config = {};
    }),
    (lunr.SortedSet = function () {
      (this.length = 0), (this.elements = []);
    }),
    (lunr.SortedSet.load = function (e) {
      var t = new this();
      return (t.elements = e), (t.length = e.length), t;
    }),
    (lunr.SortedSet.prototype.add = function () {
      var e, t;
      for (e = 0; e < arguments.length; e++)
        (t = arguments[e]),
          ~this.indexOf(t) || this.elements.splice(this.locationFor(t), 0, t);
      this.length = this.elements.length;
    }),
    (lunr.SortedSet.prototype.toArray = function () {
      return this.elements.slice();
    }),
    (lunr.SortedSet.prototype.map = function (e, t) {
      return this.elements.map(e, t);
    }),
    (lunr.SortedSet.prototype.forEach = function (e, t) {
      return this.elements.forEach(e, t);
    }),
    (lunr.SortedSet.prototype.indexOf = function (e) {
      for (
        var t = 0,
          n = this.elements.length,
          o = n - t,
          i = t + Math.floor(o / 2),
          r = this.elements[i];
        1 < o;

      ) {
        if (r === e) return i;
        r < e && (t = i),
          e < r && (n = i),
          (o = n - t),
          (i = t + Math.floor(o / 2)),
          (r = this.elements[i]);
      }
      return r === e ? i : -1;
    }),
    (lunr.SortedSet.prototype.locationFor = function (e) {
      for (
        var t = 0,
          n = this.elements.length,
          o = n - t,
          i = t + Math.floor(o / 2),
          r = this.elements[i];
        1 < o;

      )
        r < e && (t = i),
          e < r && (n = i),
          (o = n - t),
          (i = t + Math.floor(o / 2)),
          (r = this.elements[i]);
      return e < r ? i : r < e ? i + 1 : void 0;
    }),
    (lunr.SortedSet.prototype.intersect = function (e) {
      for (
        var t = new lunr.SortedSet(),
          n = 0,
          o = 0,
          i = this.length,
          r = e.length,
          s = this.elements,
          u = e.elements;
        !(i - 1 < n || r - 1 < o);

      )
        s[n] !== u[o]
          ? s[n] < u[o]
            ? n++
            : s[n] > u[o] && o++
          : (t.add(s[n]), n++, o++);
      return t;
    }),
    (lunr.SortedSet.prototype.clone = function () {
      var e = new lunr.SortedSet();
      return (e.elements = this.toArray()), (e.length = e.elements.length), e;
    }),
    (lunr.SortedSet.prototype.union = function (e) {
      var t, n, o;
      (n = this.length >= e.length ? ((t = this), e) : ((t = e), this)),
        (o = t.clone());
      for (var i = 0, r = n.toArray(); i < r.length; i++) o.add(r[i]);
      return o;
    }),
    (lunr.SortedSet.prototype.toJSON = function () {
      return this.toArray();
    }),
    (e = this),
    (t = function () {
      return N;
    }),
    'function' == typeof define && define.amd
      ? define(t)
      : 'object' == typeof exports
      ? (module.exports = t())
      : (e.elasticlunr = t());
})();
!(function (e, i) {
  'function' == typeof define && define.amd
    ? define('jquery-bridget/jquery-bridget', ['jquery'], function (t) {
        return i(e, t);
      })
    : 'object' == typeof module && module.exports
    ? (module.exports = i(e, require('jquery')))
    : (e.jQueryBridget = i(e, e.jQuery));
})(window, function (t, e) {
  'use strict';
  function i(h, o, c) {
    (c = c || e || t.jQuery) &&
      (o.prototype.option ||
        (o.prototype.option = function (t) {
          c.isPlainObject(t) && (this.options = c.extend(!0, this.options, t));
        }),
      (c.fn[h] = function (t) {
        if ('string' != typeof t)
          return (
            (n = t),
            this.each(function (t, e) {
              var i = c.data(e, h);
              i
                ? (i.option(n), i._init())
                : ((i = new o(e, n)), c.data(e, h, i));
            }),
            this
          );
        var e,
          r,
          s,
          l,
          a,
          n,
          i = u.call(arguments, 1);
        return (
          (s = i),
          (a = '$().' + h + '("' + (r = t) + '")'),
          (e = this).each(function (t, e) {
            var i = c.data(e, h);
            if (i) {
              var n = i[r];
              if (n && '_' != r.charAt(0)) {
                var o = n.apply(i, s);
                l = void 0 === l ? o : l;
              } else d(a + ' is not a valid method');
            } else d(h + ' not initialized. Cannot call methods, i.e. ' + a);
          }),
          void 0 !== l ? l : e
        );
      }),
      n(c));
  }
  function n(t) {
    !t || (t && t.bridget) || (t.bridget = i);
  }
  var u = Array.prototype.slice,
    o = t.console,
    d =
      void 0 === o
        ? function () {}
        : function (t) {
            o.error(t);
          };
  return n(e || t.jQuery), i;
}),
  (function (t, e) {
    'function' == typeof define && define.amd
      ? define('ev-emitter/ev-emitter', e)
      : 'object' == typeof module && module.exports
      ? (module.exports = e())
      : (t.EvEmitter = e());
  })('undefined' != typeof window ? window : this, function () {
    function t() {}
    var e = t.prototype;
    return (
      (e.on = function (t, e) {
        if (t && e) {
          var i = (this._events = this._events || {}),
            n = (i[t] = i[t] || []);
          return -1 == n.indexOf(e) && n.push(e), this;
        }
      }),
      (e.once = function (t, e) {
        if (t && e) {
          this.on(t, e);
          var i = (this._onceEvents = this._onceEvents || {});
          return ((i[t] = i[t] || {})[e] = !0), this;
        }
      }),
      (e.off = function (t, e) {
        var i = this._events && this._events[t];
        if (i && i.length) {
          var n = i.indexOf(e);
          return -1 != n && i.splice(n, 1), this;
        }
      }),
      (e.emitEvent = function (t, e) {
        var i = this._events && this._events[t];
        if (i && i.length) {
          (i = i.slice(0)), (e = e || []);
          for (
            var n = this._onceEvents && this._onceEvents[t], o = 0;
            o < i.length;
            o++
          ) {
            var r = i[o];
            n && n[r] && (this.off(t, r), delete n[r]), r.apply(this, e);
          }
          return this;
        }
      }),
      (e.allOff = function () {
        delete this._events, delete this._onceEvents;
      }),
      t
    );
  }),
  (function (t, e) {
    'use strict';
    'function' == typeof define && define.amd
      ? define('desandro-matches-selector/matches-selector', e)
      : 'object' == typeof module && module.exports
      ? (module.exports = e())
      : (t.matchesSelector = e());
  })(window, function () {
    'use strict';
    var i = (function () {
      var t = window.Element.prototype;
      if (t.matches) return 'matches';
      if (t.matchesSelector) return 'matchesSelector';
      for (var e = ['webkit', 'moz', 'ms', 'o'], i = 0; i < e.length; i++) {
        var n = e[i] + 'MatchesSelector';
        if (t[n]) return n;
      }
    })();
    return function (t, e) {
      return t[i](e);
    };
  }),
  (function (e, i) {
    'function' == typeof define && define.amd
      ? define(
          'fizzy-ui-utils/utils',
          ['desandro-matches-selector/matches-selector'],
          function (t) {
            return i(e, t);
          }
        )
      : 'object' == typeof module && module.exports
      ? (module.exports = i(e, require('desandro-matches-selector')))
      : (e.fizzyUIUtils = i(e, e.matchesSelector));
  })(window, function (h, r) {
    var c = {
        extend: function (t, e) {
          for (var i in e) t[i] = e[i];
          return t;
        },
        modulo: function (t, e) {
          return ((t % e) + e) % e;
        },
      },
      e = Array.prototype.slice;
    (c.makeArray = function (t) {
      return Array.isArray(t)
        ? t
        : null == t
        ? []
        : 'object' == typeof t && 'number' == typeof t.length
        ? e.call(t)
        : [t];
    }),
      (c.removeFrom = function (t, e) {
        var i = t.indexOf(e);
        -1 != i && t.splice(i, 1);
      }),
      (c.getParent = function (t, e) {
        for (; t.parentNode && t != document.body; )
          if (((t = t.parentNode), r(t, e))) return t;
      }),
      (c.getQueryElement = function (t) {
        return 'string' == typeof t ? document.querySelector(t) : t;
      }),
      (c.handleEvent = function (t) {
        var e = 'on' + t.type;
        this[e] && this[e](t);
      }),
      (c.filterFindElements = function (t, n) {
        t = c.makeArray(t);
        var o = [];
        return (
          t.forEach(function (t) {
            if (t instanceof HTMLElement) {
              if (!n) return void o.push(t);
              r(t, n) && o.push(t);
              for (var e = t.querySelectorAll(n), i = 0; i < e.length; i++)
                o.push(e[i]);
            }
          }),
          o
        );
      }),
      (c.debounceMethod = function (t, e, n) {
        n = n || 100;
        var o = t.prototype[e],
          r = e + 'Timeout';
        t.prototype[e] = function () {
          var t = this[r];
          clearTimeout(t);
          var e = arguments,
            i = this;
          this[r] = setTimeout(function () {
            o.apply(i, e), delete i[r];
          }, n);
        };
      }),
      (c.docReady = function (t) {
        var e = document.readyState;
        'complete' == e || 'interactive' == e
          ? setTimeout(t)
          : document.addEventListener('DOMContentLoaded', t);
      }),
      (c.toDashed = function (t) {
        return t
          .replace(/(.)([A-Z])/g, function (t, e, i) {
            return e + '-' + i;
          })
          .toLowerCase();
      });
    var u = h.console;
    return (
      (c.htmlInit = function (l, a) {
        c.docReady(function () {
          var t = c.toDashed(a),
            o = 'data-' + t,
            e = document.querySelectorAll('[' + o + ']'),
            i = document.querySelectorAll('.js-' + t),
            n = c.makeArray(e).concat(c.makeArray(i)),
            r = o + '-options',
            s = h.jQuery;
          n.forEach(function (e) {
            var t,
              i = e.getAttribute(o) || e.getAttribute(r);
            try {
              t = i && JSON.parse(i);
            } catch (t) {
              return void (
                u &&
                u.error('Error parsing ' + o + ' on ' + e.className + ': ' + t)
              );
            }
            var n = new l(e, t);
            s && s.data(e, a, n);
          });
        });
      }),
      c
    );
  }),
  (function (i, n) {
    'function' == typeof define && define.amd
      ? define(
          'infinite-scroll/js/core',
          ['ev-emitter/ev-emitter', 'fizzy-ui-utils/utils'],
          function (t, e) {
            return n(i, t, e);
          }
        )
      : 'object' == typeof module && module.exports
      ? (module.exports = n(
          i,
          require('ev-emitter'),
          require('fizzy-ui-utils')
        ))
      : (i.InfiniteScroll = n(i, i.EvEmitter, i.fizzyUIUtils));
  })(window, function (e, t, o) {
    function r(t, e) {
      var i = o.getQueryElement(t);
      if (i) {
        if ((t = i).infiniteScrollGUID) {
          var n = l[t.infiniteScrollGUID];
          return n.option(e), n;
        }
        (this.element = t),
          (this.options = o.extend({}, r.defaults)),
          this.option(e),
          s && (this.$element = s(this.element)),
          this.create();
      } else console.error('Bad element for InfiniteScroll: ' + (i || t));
    }
    var s = e.jQuery,
      l = {};
    (r.defaults = {}), (r.create = {}), (r.destroy = {});
    var i = r.prototype;
    o.extend(i, t.prototype);
    var n = 0;
    (i.create = function () {
      var t = (this.guid = ++n);
      if (
        ((this.element.infiniteScrollGUID = t),
        ((l[t] = this).pageIndex = 1),
        (this.loadCount = 0),
        this.updateGetPath(),
        this.getPath && this.getPath())
      )
        for (var e in (this.updateGetAbsolutePath(),
        this.log('initialized', [this.element.className]),
        this.callOnInit(),
        r.create))
          r.create[e].call(this);
      else console.error('Disabling InfiniteScroll');
    }),
      (i.option = function (t) {
        o.extend(this.options, t);
      }),
      (i.callOnInit = function () {
        var t = this.options.onInit;
        t && t.call(this, this);
      }),
      (i.dispatchEvent = function (t, e, i) {
        this.log(t, i);
        var n = e ? [e].concat(i) : i;
        if ((this.emitEvent(t, n), s && this.$element)) {
          var o = (t += '.infiniteScroll');
          if (e) {
            var r = s.Event(e);
            (r.type = t), (o = r);
          }
          this.$element.trigger(o, i);
        }
      });
    var a = {
      initialized: function (t) {
        return 'on ' + t;
      },
      request: function (t) {
        return 'URL: ' + t;
      },
      load: function (t, e) {
        return (t.title || '') + '. URL: ' + e;
      },
      error: function (t, e) {
        return t + '. URL: ' + e;
      },
      append: function (t, e, i) {
        return i.length + ' items. URL: ' + e;
      },
      last: function (t, e) {
        return 'URL: ' + e;
      },
      history: function (t, e) {
        return 'URL: ' + e;
      },
      pageIndex: function (t, e) {
        return 'current page determined to be: ' + t + ' from ' + e;
      },
    };
    (i.log = function (t, e) {
      if (this.options.debug) {
        var i = '[InfiniteScroll] ' + t,
          n = a[t];
        n && (i += '. ' + n.apply(this, e)), console.log(i);
      }
    }),
      (i.updateMeasurements = function () {
        this.windowHeight = e.innerHeight;
        var t = this.element.getBoundingClientRect();
        this.top = t.top + e.pageYOffset;
      }),
      (i.updateScroller = function () {
        var t = this.options.elementScroll;
        if (t) {
          if (
            ((this.scroller = !0 === t ? this.element : o.getQueryElement(t)),
            !this.scroller)
          )
            throw 'Unable to find elementScroll: ' + t;
        } else this.scroller = e;
      }),
      (i.updateGetPath = function () {
        var t = this.options.path;
        if (t) {
          var e = typeof t;
          if ('function' != e)
            return 'string' == e && t.match('{{#}}')
              ? void this.updateGetPathTemplate(t)
              : void this.updateGetPathSelector(t);
          this.getPath = t;
        } else
          console.error('InfiniteScroll path option required. Set as: ' + t);
      }),
      (i.updateGetPathTemplate = function (e) {
        this.getPath = function () {
          var t = this.pageIndex + 1;
          return e.replace('{{#}}', t);
        }.bind(this);
        var t = e.replace(/(\\\?|\?)/, '\\?').replace('{{#}}', '(\\d\\d?\\d?)'),
          i = new RegExp(t),
          n = location.href.match(i);
        n &&
          ((this.pageIndex = parseInt(n[1], 10)),
          this.log('pageIndex', [this.pageIndex, 'template string']));
      });
    var h = [
      /^(.*?\/?page\/?)(\d\d?\d?)(.*?$)/,
      /^(.*?\/?\?page=)(\d\d?\d?)(.*?$)/,
      /(.*?)(\d\d?\d?)(?!.*\d)(.*?$)/,
    ];
    return (
      (i.updateGetPathSelector = function (t) {
        var e = document.querySelector(t);
        if (e) {
          for (
            var i, n, o = e.getAttribute('href'), r = 0;
            o && r < h.length;
            r++
          ) {
            n = h[r];
            var s = o.match(n);
            if (s) {
              i = s.slice(1);
              break;
            }
          }
          return i
            ? ((this.isPathSelector = !0),
              (this.getPath = function () {
                var t = this.pageIndex + 1;
                return i[0] + t + i[2];
              }.bind(this)),
              (this.pageIndex = parseInt(i[1], 10) - 1),
              void this.log('pageIndex', [this.pageIndex, 'next link']))
            : void console.error(
                'InfiniteScroll unable to parse next link href: ' + o
              );
        }
        console.error(
          'Bad InfiniteScroll path option. Next link not found: ' + t
        );
      }),
      (i.updateGetAbsolutePath = function () {
        var t = this.getPath();
        if (t.match(/^http/) || t.match(/^\//))
          this.getAbsolutePath = this.getPath;
        else {
          var e = location.pathname;
          if (t.match(/^\?/))
            this.getAbsolutePath = function () {
              return e + this.getPath();
            };
          else {
            var i = e.substring(0, e.lastIndexOf('/'));
            this.getAbsolutePath = function () {
              return i + '/' + this.getPath();
            };
          }
        }
      }),
      (r.create.hideNav = function () {
        var t = o.getQueryElement(this.options.hideNav);
        t && ((t.style.display = 'none'), (this.nav = t));
      }),
      (r.destroy.hideNav = function () {
        this.nav && (this.nav.style.display = '');
      }),
      (i.destroy = function () {
        for (var t in (this.allOff(), r.destroy)) r.destroy[t].call(this);
        delete this.element.infiniteScrollGUID,
          delete l[this.guid],
          s && this.$element && s.removeData(this.element, 'infiniteScroll');
      }),
      (r.throttle = function (n, o) {
        var r, s;
        return (
          (o = o || 200),
          function () {
            var t = +new Date(),
              e = arguments,
              i = function () {
                (r = t), n.apply(this, e);
              }.bind(this);
            r && t < r + o ? (clearTimeout(s), (s = setTimeout(i, o))) : i();
          }
        );
      }),
      (r.data = function (t) {
        var e = (t = o.getQueryElement(t)) && t.infiniteScrollGUID;
        return e && l[e];
      }),
      (r.setJQuery = function (t) {
        s = t;
      }),
      o.htmlInit(r, 'infinite-scroll'),
      (i._init = function () {}),
      s && s.bridget && s.bridget('infiniteScroll', r),
      r
    );
  }),
  (function (e, i) {
    'function' == typeof define && define.amd
      ? define('infinite-scroll/js/page-load', ['./core'], function (t) {
          return i(e, t);
        })
      : 'object' == typeof module && module.exports
      ? (module.exports = i(e, require('./core')))
      : i(e, e.InfiniteScroll);
  })(window, function (n, o) {
    function s(t) {
      for (
        var e = document.createDocumentFragment(), i = 0;
        t && i < t.length;
        i++
      )
        e.appendChild(t[i]);
      return e;
    }
    function r(t, e) {
      for (var i = t.attributes, n = 0; n < i.length; n++) {
        var o = i[n];
        e.setAttribute(o.name, o.value);
      }
    }
    var t = o.prototype;
    return (
      (o.defaults.loadOnScroll = !0),
      (o.defaults.checkLastPage = !0),
      (o.defaults.responseType = 'document'),
      (o.create.pageLoad = function () {
        (this.canLoad = !0),
          this.on('scrollThreshold', this.onScrollThresholdLoad),
          this.on('load', this.checkLastPage),
          this.options.outlayer && this.on('append', this.onAppendOutlayer);
      }),
      (t.onScrollThresholdLoad = function () {
        this.options.loadOnScroll && this.loadNextPage();
      }),
      (t.loadNextPage = function () {
        if (!this.isLoading && this.canLoad) {
          var e = this.getAbsolutePath();
          this.isLoading = !0;
          var t = function (t) {
              this.onPageLoad(t, e);
            }.bind(this),
            i = function (t) {
              this.onPageError(t, e);
            }.bind(this),
            n = function (t) {
              this.lastPageReached(t, e);
            }.bind(this);
          (o = e),
            (r = this.options.responseType),
            (s = t),
            (l = i),
            (a = n),
            (h = new XMLHttpRequest()).open('GET', o, !0),
            (h.responseType = r || ''),
            h.setRequestHeader('X-Requested-With', 'XMLHttpRequest'),
            (h.onload = function () {
              if (200 == h.status) s(h.response);
              else if (204 == h.status) a(h.response);
              else {
                var t = new Error(h.statusText);
                l(t);
              }
            }),
            (h.onerror = function () {
              var t = new Error('Network error requesting ' + o);
              l(t);
            }),
            h.send(),
            this.dispatchEvent('request', null, [e]);
        }
        var o, r, s, l, a, h;
      }),
      (t.onPageLoad = function (t, e) {
        return (
          this.options.append || (this.isLoading = !1),
          this.pageIndex++,
          this.loadCount++,
          this.dispatchEvent('load', null, [t, e]),
          this.appendNextPage(t, e),
          t
        );
      }),
      (t.appendNextPage = function (t, e) {
        var i = this.options.append;
        if ('document' == this.options.responseType && i) {
          var n = t.querySelectorAll(i),
            o = s(n),
            r = function () {
              this.appendItems(n, o),
                (this.isLoading = !1),
                this.dispatchEvent('append', null, [t, e, n]);
            }.bind(this);
          this.options.outlayer ? this.appendOutlayerItems(o, r) : r();
        }
      }),
      (t.appendItems = function (t, e) {
        t &&
          t.length &&
          ((function (t) {
            for (
              var e = t.querySelectorAll('script'), i = 0;
              i < e.length;
              i++
            ) {
              var n = e[i],
                o = document.createElement('script');
              r(n, o),
                (o.innerHTML = n.innerHTML),
                n.parentNode.replaceChild(o, n);
            }
          })((e = e || s(t))),
          this.element.appendChild(e));
      }),
      (t.appendOutlayerItems = function (t, e) {
        var i = o.imagesLoaded || n.imagesLoaded;
        return i
          ? void i(t, e)
          : (console.error(
              '[InfiniteScroll] imagesLoaded required for outlayer option'
            ),
            void (this.isLoading = !1));
      }),
      (t.onAppendOutlayer = function (t, e, i) {
        this.options.outlayer.appended(i);
      }),
      (t.checkLastPage = function (t, e) {
        var i = this.options.checkLastPage;
        if (i) {
          var n,
            o = this.options.path;
          if ('function' == typeof o)
            if (!this.getPath()) return void this.lastPageReached(t, e);
          if (
            ('string' == typeof i ? (n = i) : this.isPathSelector && (n = o),
            n && t.querySelector)
          )
            t.querySelector(n) || this.lastPageReached(t, e);
        }
      }),
      (t.lastPageReached = function (t, e) {
        (this.canLoad = !1), this.dispatchEvent('last', null, [t, e]);
      }),
      (t.onPageError = function (t, e) {
        return (
          (this.isLoading = !1),
          (this.canLoad = !1),
          this.dispatchEvent('error', null, [t, e]),
          t
        );
      }),
      (o.create.prefill = function () {
        if (this.options.prefill) {
          var t = this.options.append;
          if (!t)
            return void console.error(
              'append option required for prefill. Set as :' + t
            );
          this.updateMeasurements(),
            this.updateScroller(),
            (this.isPrefilling = !0),
            this.on('append', this.prefill),
            this.once('error', this.stopPrefill),
            this.once('last', this.stopPrefill),
            this.prefill();
        }
      }),
      (t.prefill = function () {
        var t = this.getPrefillDistance();
        (this.isPrefilling = 0 <= t),
          this.isPrefilling
            ? (this.log('prefill'), this.loadNextPage())
            : this.stopPrefill();
      }),
      (t.getPrefillDistance = function () {
        return this.options.elementScroll
          ? this.scroller.clientHeight - this.scroller.scrollHeight
          : this.windowHeight - this.element.clientHeight;
      }),
      (t.stopPrefill = function () {
        this.log('stopPrefill'), this.off('append', this.prefill);
      }),
      o
    );
  }),
  (function (i, n) {
    'function' == typeof define && define.amd
      ? define(
          'infinite-scroll/js/scroll-watch',
          ['./core', 'fizzy-ui-utils/utils'],
          function (t, e) {
            return n(i, t, e);
          }
        )
      : 'object' == typeof module && module.exports
      ? (module.exports = n(i, require('./core'), require('fizzy-ui-utils')))
      : n(i, i.InfiniteScroll, i.fizzyUIUtils);
  })(window, function (i, t, e) {
    var n = t.prototype;
    return (
      (t.defaults.scrollThreshold = 400),
      (t.create.scrollWatch = function () {
        (this.pageScrollHandler = this.onPageScroll.bind(this)),
          (this.resizeHandler = this.onResize.bind(this));
        var t = this.options.scrollThreshold;
        (!t && 0 !== t) || this.enableScrollWatch();
      }),
      (t.destroy.scrollWatch = function () {
        this.disableScrollWatch();
      }),
      (n.enableScrollWatch = function () {
        this.isScrollWatching ||
          ((this.isScrollWatching = !0),
          this.updateMeasurements(),
          this.updateScroller(),
          this.on('last', this.disableScrollWatch),
          this.bindScrollWatchEvents(!0));
      }),
      (n.disableScrollWatch = function () {
        this.isScrollWatching &&
          (this.bindScrollWatchEvents(!1), delete this.isScrollWatching);
      }),
      (n.bindScrollWatchEvents = function (t) {
        var e = t ? 'addEventListener' : 'removeEventListener';
        this.scroller[e]('scroll', this.pageScrollHandler),
          i[e]('resize', this.resizeHandler);
      }),
      (n.onPageScroll = t.throttle(function () {
        this.getBottomDistance() <= this.options.scrollThreshold &&
          this.dispatchEvent('scrollThreshold');
      })),
      (n.getBottomDistance = function () {
        return this.options.elementScroll
          ? this.getElementBottomDistance()
          : this.getWindowBottomDistance();
      }),
      (n.getWindowBottomDistance = function () {
        return (
          this.top +
          this.element.clientHeight -
          (i.pageYOffset + this.windowHeight)
        );
      }),
      (n.getElementBottomDistance = function () {
        return (
          this.scroller.scrollHeight -
          (this.scroller.scrollTop + this.scroller.clientHeight)
        );
      }),
      (n.onResize = function () {
        this.updateMeasurements();
      }),
      e.debounceMethod(t, 'onResize', 150),
      t
    );
  }),
  (function (i, n) {
    'function' == typeof define && define.amd
      ? define(
          'infinite-scroll/js/history',
          ['./core', 'fizzy-ui-utils/utils'],
          function (t, e) {
            return n(i, t, e);
          }
        )
      : 'object' == typeof module && module.exports
      ? (module.exports = n(i, require('./core'), require('fizzy-ui-utils')))
      : n(i, i.InfiniteScroll, i.fizzyUIUtils);
  })(window, function (n, t, e) {
    var i = t.prototype;
    t.defaults.history = 'replace';
    var r = document.createElement('a');
    return (
      (t.create.history = function () {
        if (this.options.history)
          return (
            (r.href = this.getAbsolutePath()),
            (r.origin || r.protocol + '//' + r.host) == location.origin
              ? void (this.options.append
                  ? this.createHistoryAppend()
                  : this.createHistoryPageLoad())
              : void console.error(
                  '[InfiniteScroll] cannot set history with different origin: ' +
                    r.origin +
                    ' on ' +
                    location.origin +
                    ' . History behavior disabled.'
                )
          );
      }),
      (i.createHistoryAppend = function () {
        this.updateMeasurements(),
          this.updateScroller(),
          (this.scrollPages = [
            { top: 0, path: location.href, title: document.title },
          ]),
          (this.scrollPageIndex = 0),
          (this.scrollHistoryHandler = this.onScrollHistory.bind(this)),
          (this.unloadHandler = this.onUnload.bind(this)),
          this.scroller.addEventListener('scroll', this.scrollHistoryHandler),
          this.on('append', this.onAppendHistory),
          this.bindHistoryAppendEvents(!0);
      }),
      (i.bindHistoryAppendEvents = function (t) {
        var e = t ? 'addEventListener' : 'removeEventListener';
        this.scroller[e]('scroll', this.scrollHistoryHandler),
          n[e]('unload', this.unloadHandler);
      }),
      (i.createHistoryPageLoad = function () {
        this.on('load', this.onPageLoadHistory);
      }),
      (t.destroy.history = i.destroyHistory =
        function () {
          this.options.history &&
            this.options.append &&
            this.bindHistoryAppendEvents(!1);
        }),
      (i.onAppendHistory = function (t, e, i) {
        if (i && i.length) {
          var n = i[0],
            o = this.getElementScrollY(n);
          (r.href = e),
            this.scrollPages.push({ top: o, path: r.href, title: t.title });
        }
      }),
      (i.getElementScrollY = function (t) {
        return this.options.elementScroll
          ? this.getElementElementScrollY(t)
          : this.getElementWindowScrollY(t);
      }),
      (i.getElementWindowScrollY = function (t) {
        return t.getBoundingClientRect().top + n.pageYOffset;
      }),
      (i.getElementElementScrollY = function (t) {
        return t.offsetTop - this.top;
      }),
      (i.onScrollHistory = function () {
        for (
          var t, e, i = this.getScrollViewY(), n = 0;
          n < this.scrollPages.length;
          n++
        ) {
          var o = this.scrollPages[n];
          if (o.top >= i) break;
          (t = n), (e = o);
        }
        t != this.scrollPageIndex &&
          ((this.scrollPageIndex = t), this.setHistory(e.title, e.path));
      }),
      e.debounceMethod(t, 'onScrollHistory', 150),
      (i.getScrollViewY = function () {
        return this.options.elementScroll
          ? this.scroller.scrollTop + this.scroller.clientHeight / 2
          : n.pageYOffset + this.windowHeight / 2;
      }),
      (i.setHistory = function (t, e) {
        var i = this.options.history;
        i &&
          history[i + 'State'] &&
          (history[i + 'State'](null, t, e),
          this.options.historyTitle && (document.title = t),
          this.dispatchEvent('history', null, [t, e]));
      }),
      (i.onUnload = function () {
        var t = this.scrollPageIndex;
        if (0 !== t) {
          var e = this.scrollPages[t],
            i = n.pageYOffset - e.top + this.top;
          this.destroyHistory(), scrollTo(0, i);
        }
      }),
      (i.onPageLoadHistory = function (t, e) {
        this.setHistory(t.title, e);
      }),
      t
    );
  }),
  (function (i, n) {
    'function' == typeof define && define.amd
      ? define(
          'infinite-scroll/js/button',
          ['./core', 'fizzy-ui-utils/utils'],
          function (t, e) {
            return n(i, t, e);
          }
        )
      : 'object' == typeof module && module.exports
      ? (module.exports = n(i, require('./core'), require('fizzy-ui-utils')))
      : n(i, i.InfiniteScroll, i.fizzyUIUtils);
  })(window, function (t, e, i) {
    function n(t, e) {
      (this.element = t),
        (this.infScroll = e),
        (this.clickHandler = this.onClick.bind(this)),
        this.element.addEventListener('click', this.clickHandler),
        e.on('request', this.disable.bind(this)),
        e.on('load', this.enable.bind(this)),
        e.on('error', this.hide.bind(this)),
        e.on('last', this.hide.bind(this));
    }
    return (
      (e.create.button = function () {
        var t = i.getQueryElement(this.options.button);
        t && (this.button = new n(t, this));
      }),
      (e.destroy.button = function () {
        this.button && this.button.destroy();
      }),
      (n.prototype.onClick = function (t) {
        t.preventDefault(), this.infScroll.loadNextPage();
      }),
      (n.prototype.enable = function () {
        this.element.removeAttribute('disabled');
      }),
      (n.prototype.disable = function () {
        this.element.disabled = 'disabled';
      }),
      (n.prototype.hide = function () {
        this.element.style.display = 'none';
      }),
      (n.prototype.destroy = function () {
        this.element.removeEventListener('click', this.clickHandler);
      }),
      (e.Button = n),
      e
    );
  }),
  (function (i, n) {
    'function' == typeof define && define.amd
      ? define(
          'infinite-scroll/js/status',
          ['./core', 'fizzy-ui-utils/utils'],
          function (t, e) {
            return n(i, t, e);
          }
        )
      : 'object' == typeof module && module.exports
      ? (module.exports = n(i, require('./core'), require('fizzy-ui-utils')))
      : n(i, i.InfiniteScroll, i.fizzyUIUtils);
  })(window, function (t, e, i) {
    function n(t) {
      r(t, 'none');
    }
    function o(t) {
      r(t, 'block');
    }
    function r(t, e) {
      t && (t.style.display = e);
    }
    var s = e.prototype;
    return (
      (e.create.status = function () {
        var t = i.getQueryElement(this.options.status);
        t &&
          ((this.statusElement = t),
          (this.statusEventElements = {
            request: t.querySelector('.infinite-scroll-request'),
            error: t.querySelector('.infinite-scroll-error'),
            last: t.querySelector('.infinite-scroll-last'),
          }),
          this.on('request', this.showRequestStatus),
          this.on('error', this.showErrorStatus),
          this.on('last', this.showLastStatus),
          this.bindHideStatus('on'));
      }),
      (s.bindHideStatus = function (t) {
        var e = this.options.append ? 'append' : 'load';
        this[t](e, this.hideAllStatus);
      }),
      (s.showRequestStatus = function () {
        this.showStatus('request');
      }),
      (s.showErrorStatus = function () {
        this.showStatus('error');
      }),
      (s.showLastStatus = function () {
        this.showStatus('last'), this.bindHideStatus('off');
      }),
      (s.showStatus = function (t) {
        o(this.statusElement),
          this.hideStatusEventElements(),
          o(this.statusEventElements[t]);
      }),
      (s.hideAllStatus = function () {
        n(this.statusElement), this.hideStatusEventElements();
      }),
      (s.hideStatusEventElements = function () {
        for (var t in this.statusEventElements) {
          n(this.statusEventElements[t]);
        }
      }),
      e
    );
  }),
  (function (t) {
    'function' == typeof define && define.amd
      ? define(
          [
            'infinite-scroll/js/core',
            'infinite-scroll/js/page-load',
            'infinite-scroll/js/scroll-watch',
            'infinite-scroll/js/history',
            'infinite-scroll/js/button',
            'infinite-scroll/js/status',
          ],
          t
        )
      : 'object' == typeof module &&
        module.exports &&
        (module.exports = t(
          require('./core'),
          require('./page-load'),
          require('./scroll-watch'),
          require('./history'),
          require('./button'),
          require('./status')
        ));
  })(
    (window,
    function (t) {
      return t;
    })
  ),
  (function (e, i) {
    'use strict';
    'function' == typeof define && define.amd
      ? define(
          'imagesloaded/imagesloaded',
          ['ev-emitter/ev-emitter'],
          function (t) {
            return i(e, t);
          }
        )
      : 'object' == typeof module && module.exports
      ? (module.exports = i(e, require('ev-emitter')))
      : (e.imagesLoaded = i(e, e.EvEmitter));
  })('undefined' != typeof window ? window : this, function (e, t) {
    function r(t, e) {
      for (var i in e) t[i] = e[i];
      return t;
    }
    function s(t, e, i) {
      if (!(this instanceof s)) return new s(t, e, i);
      var n,
        o = t;
      return (
        'string' == typeof t && (o = document.querySelectorAll(t)),
        o
          ? ((this.elements =
              ((n = o),
              Array.isArray(n)
                ? n
                : 'object' == typeof n && 'number' == typeof n.length
                ? h.call(n)
                : [n])),
            (this.options = r({}, this.options)),
            'function' == typeof e ? (i = e) : r(this.options, e),
            i && this.on('always', i),
            this.getImages(),
            l && (this.jqDeferred = new l.Deferred()),
            void setTimeout(this.check.bind(this)))
          : void a.error('Bad element for imagesLoaded ' + (o || t))
      );
    }
    function i(t) {
      this.img = t;
    }
    function n(t, e) {
      (this.url = t), (this.element = e), (this.img = new Image());
    }
    var l = e.jQuery,
      a = e.console,
      h = Array.prototype.slice;
    ((s.prototype = Object.create(t.prototype)).options = {}),
      (s.prototype.getImages = function () {
        (this.images = []), this.elements.forEach(this.addElementImages, this);
      }),
      (s.prototype.addElementImages = function (t) {
        'IMG' == t.nodeName && this.addImage(t),
          !0 === this.options.background && this.addElementBackgroundImages(t);
        var e = t.nodeType;
        if (e && c[e]) {
          for (var i = t.querySelectorAll('img'), n = 0; n < i.length; n++) {
            var o = i[n];
            this.addImage(o);
          }
          if ('string' == typeof this.options.background) {
            var r = t.querySelectorAll(this.options.background);
            for (n = 0; n < r.length; n++) {
              var s = r[n];
              this.addElementBackgroundImages(s);
            }
          }
        }
      });
    var c = { 1: !0, 9: !0, 11: !0 };
    return (
      (s.prototype.addElementBackgroundImages = function (t) {
        var e = getComputedStyle(t);
        if (e)
          for (
            var i = /url\((['"])?(.*?)\1\)/gi, n = i.exec(e.backgroundImage);
            null !== n;

          ) {
            var o = n && n[2];
            o && this.addBackground(o, t), (n = i.exec(e.backgroundImage));
          }
      }),
      (s.prototype.addImage = function (t) {
        var e = new i(t);
        this.images.push(e);
      }),
      (s.prototype.addBackground = function (t, e) {
        var i = new n(t, e);
        this.images.push(i);
      }),
      (s.prototype.check = function () {
        function e(t, e, i) {
          setTimeout(function () {
            n.progress(t, e, i);
          });
        }
        var n = this;
        return (
          (this.progressedCount = 0),
          (this.hasAnyBroken = !1),
          this.images.length
            ? void this.images.forEach(function (t) {
                t.once('progress', e), t.check();
              })
            : void this.complete()
        );
      }),
      (s.prototype.progress = function (t, e, i) {
        this.progressedCount++,
          (this.hasAnyBroken = this.hasAnyBroken || !t.isLoaded),
          this.emitEvent('progress', [this, t, e]),
          this.jqDeferred &&
            this.jqDeferred.notify &&
            this.jqDeferred.notify(this, t),
          this.progressedCount == this.images.length && this.complete(),
          this.options.debug && a && a.log('progress: ' + i, t, e);
      }),
      (s.prototype.complete = function () {
        var t = this.hasAnyBroken ? 'fail' : 'done';
        if (
          ((this.isComplete = !0),
          this.emitEvent(t, [this]),
          this.emitEvent('always', [this]),
          this.jqDeferred)
        ) {
          var e = this.hasAnyBroken ? 'reject' : 'resolve';
          this.jqDeferred[e](this);
        }
      }),
      ((i.prototype = Object.create(t.prototype)).check = function () {
        return this.getIsImageComplete()
          ? void this.confirm(0 !== this.img.naturalWidth, 'naturalWidth')
          : ((this.proxyImage = new Image()),
            this.proxyImage.addEventListener('load', this),
            this.proxyImage.addEventListener('error', this),
            this.img.addEventListener('load', this),
            this.img.addEventListener('error', this),
            void (this.proxyImage.src = this.img.src));
      }),
      (i.prototype.getIsImageComplete = function () {
        return this.img.complete && this.img.naturalWidth;
      }),
      (i.prototype.confirm = function (t, e) {
        (this.isLoaded = t), this.emitEvent('progress', [this, this.img, e]);
      }),
      (i.prototype.handleEvent = function (t) {
        var e = 'on' + t.type;
        this[e] && this[e](t);
      }),
      (i.prototype.onload = function () {
        this.confirm(!0, 'onload'), this.unbindEvents();
      }),
      (i.prototype.onerror = function () {
        this.confirm(!1, 'onerror'), this.unbindEvents();
      }),
      (i.prototype.unbindEvents = function () {
        this.proxyImage.removeEventListener('load', this),
          this.proxyImage.removeEventListener('error', this),
          this.img.removeEventListener('load', this),
          this.img.removeEventListener('error', this);
      }),
      ((n.prototype = Object.create(i.prototype)).check = function () {
        this.img.addEventListener('load', this),
          this.img.addEventListener('error', this),
          (this.img.src = this.url),
          this.getIsImageComplete() &&
            (this.confirm(0 !== this.img.naturalWidth, 'naturalWidth'),
            this.unbindEvents());
      }),
      (n.prototype.unbindEvents = function () {
        this.img.removeEventListener('load', this),
          this.img.removeEventListener('error', this);
      }),
      (n.prototype.confirm = function (t, e) {
        (this.isLoaded = t),
          this.emitEvent('progress', [this, this.element, e]);
      }),
      (s.makeJQueryPlugin = function (t) {
        (t = t || e.jQuery) &&
          ((l = t).fn.imagesLoaded = function (t, e) {
            return new s(this, t, e).jqDeferred.promise(l(this));
          });
      })(),
      s
    );
  });
!(function (a) {
  'use strict';
  (a.fn.fitVids = function (t) {
    var i = { customSelector: null, ignore: null };
    if (!document.getElementById('fit-vids-style')) {
      var e = document.head || document.getElementsByTagName('head')[0],
        r = document.createElement('div');
      (r.innerHTML =
        '<p>x</p><style id="fit-vids-style">.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}</style>'),
        e.appendChild(r.childNodes[1]);
    }
    return (
      t && a.extend(i, t),
      this.each(function () {
        var t = [
          'iframe[src*="player.vimeo.com"]',
          'iframe[src*="youtube.com"]',
          'iframe[src*="youtube-nocookie.com"]',
          'iframe[src*="kickstarter.com"][src*="video.html"]',
          'object',
          'embed',
        ];
        i.customSelector && t.push(i.customSelector);
        var r = '.fitvidsignore';
        i.ignore && (r = r + ', ' + i.ignore);
        var e = a(this).find(t.join(','));
        (e = (e = e.not('object object')).not(r)).each(function () {
          var t = a(this);
          if (
            !(
              0 < t.parents(r).length ||
              ('embed' === this.tagName.toLowerCase() &&
                t.parent('object').length) ||
              t.parent('.fluid-width-video-wrapper').length
            )
          ) {
            t.css('height') ||
              t.css('width') ||
              (!isNaN(t.attr('height')) && !isNaN(t.attr('width'))) ||
              (t.attr('height', 9), t.attr('width', 16));
            var e =
              ('object' === this.tagName.toLowerCase() ||
              (t.attr('height') && !isNaN(parseInt(t.attr('height'), 10)))
                ? parseInt(t.attr('height'), 10)
                : t.height()) /
              (isNaN(parseInt(t.attr('width'), 10))
                ? t.width()
                : parseInt(t.attr('width'), 10));
            if (!t.attr('name')) {
              var i = 'fitvid' + a.fn.fitVids._count;
              t.attr('name', i), a.fn.fitVids._count++;
            }
            t
              .wrap('<div class="fluid-width-video-wrapper"></div>')
              .parent('.fluid-width-video-wrapper')
              .css('padding-top', 100 * e + '%'),
              t.removeAttr('height').removeAttr('width');
          }
        });
      })
    );
  }),
    (a.fn.fitVids._count = 0);
})(window.jQuery || window.Zepto);
!(function (t) {
  var e = (function (o, k) {
    'use strict';
    if (k.getElementsByClassName) {
      var D,
        H,
        O = k.documentElement,
        l = o.Date,
        i = o.HTMLPictureElement,
        c = 'addEventListener',
        P = 'getAttribute',
        u = o[c],
        $ = o.setTimeout,
        d = o.requestAnimationFrame || $,
        f = o.requestIdleCallback,
        I = /^picture$/i,
        a = ['load', 'error', 'lazyincluded', '_lazyloaded'],
        n = {},
        q = Array.prototype.forEach,
        j = function (t, e) {
          return (
            n[e] || (n[e] = new RegExp('(\\s|^)' + e + '(\\s|$)')),
            n[e].test(t[P]('class') || '') && n[e]
          );
        },
        G = function (t, e) {
          j(t, e) ||
            t.setAttribute('class', (t[P]('class') || '').trim() + ' ' + e);
        },
        J = function (t, e) {
          var n;
          (n = j(t, e)) &&
            t.setAttribute('class', (t[P]('class') || '').replace(n, ' '));
        },
        K = function (e, n, t) {
          var i = t ? c : 'removeEventListener';
          t && K(e, n),
            a.forEach(function (t) {
              e[i](t, n);
            });
        },
        Q = function (t, e, n, i, a) {
          var r = k.createEvent('Event');
          return (
            n || (n = {}),
            (n.instance = D),
            r.initEvent(e, !i, !a),
            (r.detail = n),
            t.dispatchEvent(r),
            r
          );
        },
        U = function (t, e) {
          var n;
          !i && (n = o.picturefill || H.pf)
            ? (e && e.src && !t[P]('srcset') && t.setAttribute('srcset', e.src),
              n({ reevaluate: !0, elements: [t] }))
            : e && e.src && (t.src = e.src);
        },
        V = function (t, e) {
          return (getComputedStyle(t, null) || {})[e];
        },
        s = function (t, e, n) {
          for (
            n = n || t.offsetWidth;
            n < H.minSize && e && !t._lazysizesWidth;

          )
            (n = e.offsetWidth), (e = e.parentNode);
          return n;
        },
        X = (function () {
          var n,
            i,
            e = [],
            a = [],
            r = e,
            s = function () {
              var t = r;
              for (r = e.length ? a : e, n = !0, i = !1; t.length; )
                t.shift()();
              n = !1;
            },
            t = function (t, e) {
              n && !e
                ? t.apply(this, arguments)
                : (r.push(t), i || ((i = !0), (k.hidden ? $ : d)(s)));
            };
          return (t._lsFlush = s), t;
        })(),
        Y = function (n, t) {
          return t
            ? function () {
                X(n);
              }
            : function () {
                var t = this,
                  e = arguments;
                X(function () {
                  n.apply(t, e);
                });
              };
        },
        Z = function (t) {
          var n,
            i = 0,
            a = H.throttleDelay,
            r = H.ricTimeout,
            e = function () {
              (n = !1), (i = l.now()), t();
            },
            s =
              f && r > 49
                ? function () {
                    f(e, { timeout: r }),
                      r !== H.ricTimeout && (r = H.ricTimeout);
                  }
                : Y(function () {
                    $(e);
                  }, !0);
          return function (t) {
            var e;
            (t = !0 === t) && (r = 33),
              n ||
                ((n = !0),
                (e = a - (l.now() - i)),
                e < 0 && (e = 0),
                t || e < 9 ? s() : $(s, e));
          };
        },
        tt = function (t) {
          var e,
            n,
            i = 99,
            a = function () {
              (e = null), t();
            },
            r = function () {
              var t = l.now() - n;
              t < i ? $(r, i - t) : (f || a)(a);
            };
          return function () {
            (n = l.now()), e || (e = $(r, i));
          };
        };
      !(function () {
        var t,
          e = {
            lazyClass: 'lazyload',
            loadedClass: 'lazyloaded',
            loadingClass: 'lazyloading',
            preloadClass: 'lazypreload',
            errorClass: 'lazyerror',
            autosizesClass: 'lazyautosizes',
            srcAttr: 'data-src',
            srcsetAttr: 'data-srcset',
            sizesAttr: 'data-sizes',
            minSize: 40,
            customMedia: {},
            init: !0,
            expFactor: 1.5,
            hFac: 0.8,
            loadMode: 2,
            loadHidden: !0,
            ricTimeout: 0,
            throttleDelay: 125,
          };
        H = o.lazySizesConfig || o.lazysizesConfig || {};
        for (t in e) t in H || (H[t] = e[t]);
        (o.lazySizesConfig = H),
          $(function () {
            H.init && r();
          });
      })();
      var t = (function () {
          var m,
            z,
            d,
            v,
            e,
            g,
            y,
            h,
            p,
            C,
            b,
            A,
            r = /^img$/i,
            f = /^iframe$/i,
            E = 'onscroll' in o && !/(gle|ing)bot/.test(navigator.userAgent),
            w = 0,
            M = 0,
            N = 0,
            _ = -1,
            W = function (t) {
              N--,
                t && t.target && K(t.target, W),
                (!t || N < 0 || !t.target) && (N = 0);
            },
            x = function (t) {
              return (
                null == A && (A = 'hidden' == V(k.body, 'visibility')),
                A ||
                  ('hidden' != V(t.parentNode, 'visibility') &&
                    'hidden' != V(t, 'visibility'))
              );
            },
            T = function (t, e) {
              var n,
                i = t,
                a = x(t);
              for (
                h -= e, b += e, p -= e, C += e;
                a && (i = i.offsetParent) && i != k.body && i != O;

              )
                (a = (V(i, 'opacity') || 1) > 0) &&
                  'visible' != V(i, 'overflow') &&
                  ((n = i.getBoundingClientRect()),
                  (a =
                    C > n.left &&
                    p < n.right &&
                    b > n.top - 1 &&
                    h < n.bottom + 1));
              return a;
            },
            t = function () {
              var t,
                e,
                n,
                i,
                a,
                r,
                s,
                o,
                l,
                c,
                u,
                d,
                f = D.elements;
              if ((v = H.loadMode) && N < 8 && (t = f.length)) {
                for (
                  e = 0,
                    _++,
                    c =
                      !H.expand || H.expand < 1
                        ? O.clientHeight > 500 && O.clientWidth > 500
                          ? 500
                          : 370
                        : H.expand,
                    u = c * H.expFactor,
                    d = H.hFac,
                    A = null,
                    M < u && N < 1 && _ > 2 && v > 2 && !k.hidden
                      ? ((M = u), (_ = 0))
                      : (M = v > 1 && _ > 1 && N < 6 ? c : w);
                  e < t;
                  e++
                )
                  if (f[e] && !f[e]._lazyRace)
                    if (E)
                      if (
                        (((o = f[e][P]('data-expand')) && (r = 1 * o)) ||
                          (r = M),
                        l !== r &&
                          ((g = innerWidth + r * d),
                          (y = innerHeight + r),
                          (s = -1 * r),
                          (l = r)),
                        (n = f[e].getBoundingClientRect()),
                        (b = n.bottom) >= s &&
                          (h = n.top) <= y &&
                          (C = n.right) >= s * d &&
                          (p = n.left) <= g &&
                          (b || C || p || h) &&
                          (H.loadHidden || x(f[e])) &&
                          ((z && N < 3 && !o && (v < 3 || _ < 4)) ||
                            T(f[e], r)))
                      ) {
                        if ((R(f[e]), (a = !0), N > 9)) break;
                      } else
                        !a &&
                          z &&
                          !i &&
                          N < 4 &&
                          _ < 4 &&
                          v > 2 &&
                          (m[0] || H.preloadAfterLoad) &&
                          (m[0] ||
                            (!o &&
                              (b ||
                                C ||
                                p ||
                                h ||
                                'auto' != f[e][P](H.sizesAttr)))) &&
                          (i = m[0] || f[e]);
                    else R(f[e]);
                i && !a && R(i);
              }
            },
            n = Z(t),
            B = function (t) {
              G(t.target, H.loadedClass),
                J(t.target, H.loadingClass),
                K(t.target, F),
                Q(t.target, 'lazyloaded');
            },
            i = Y(B),
            F = function (t) {
              i({ target: t.target });
            },
            S = function (e, n) {
              try {
                e.contentWindow.location.replace(n);
              } catch (t) {
                e.src = n;
              }
            },
            L = function (t) {
              var e,
                n = t[P](H.srcsetAttr);
              (e = H.customMedia[t[P]('data-media') || t[P]('media')]) &&
                t.setAttribute('media', e),
                n && t.setAttribute('srcset', n);
            },
            s = Y(function (t, e, n, i, a) {
              var r, s, o, l, c, u;
              (c = Q(t, 'lazybeforeunveil', e)).defaultPrevented ||
                (i && (n ? G(t, H.autosizesClass) : t.setAttribute('sizes', i)),
                (s = t[P](H.srcsetAttr)),
                (r = t[P](H.srcAttr)),
                a && ((o = t.parentNode), (l = o && I.test(o.nodeName || ''))),
                (u = e.firesLoad || ('src' in t && (s || r || l))),
                (c = { target: t }),
                u &&
                  (K(t, W, !0),
                  clearTimeout(d),
                  (d = $(W, 2500)),
                  G(t, H.loadingClass),
                  K(t, F, !0)),
                l && q.call(o.getElementsByTagName('source'), L),
                s
                  ? t.setAttribute('srcset', s)
                  : r && !l && (f.test(t.nodeName) ? S(t, r) : (t.src = r)),
                a && (s || l) && U(t, { src: r })),
                t._lazyRace && delete t._lazyRace,
                J(t, H.lazyClass),
                X(function () {
                  (!u || (t.complete && t.naturalWidth > 1)) &&
                    (u ? W(c) : N--, B(c));
                }, !0);
            }),
            R = function (t) {
              var e,
                n = r.test(t.nodeName),
                i = n && (t[P](H.sizesAttr) || t[P]('sizes')),
                a = 'auto' == i;
              ((!a && z) ||
                !n ||
                (!t[P]('src') && !t.srcset) ||
                t.complete ||
                j(t, H.errorClass) ||
                !j(t, H.lazyClass)) &&
                ((e = Q(t, 'lazyunveilread').detail),
                a && et.updateElem(t, !0, t.offsetWidth),
                (t._lazyRace = !0),
                N++,
                s(t, e, a, i, n));
            },
            a = function () {
              if (!z) {
                if (l.now() - e < 999) return void $(a, 999);
                var t = tt(function () {
                  (H.loadMode = 3), n();
                });
                (z = !0),
                  (H.loadMode = 3),
                  n(),
                  u(
                    'scroll',
                    function () {
                      3 == H.loadMode && (H.loadMode = 2), t();
                    },
                    !0
                  );
              }
            };
          return {
            _: function () {
              (e = l.now()),
                (D.elements = k.getElementsByClassName(H.lazyClass)),
                (m = k.getElementsByClassName(
                  H.lazyClass + ' ' + H.preloadClass
                )),
                u('scroll', n, !0),
                u('resize', n, !0),
                o.MutationObserver
                  ? new MutationObserver(n).observe(O, {
                      childList: !0,
                      subtree: !0,
                      attributes: !0,
                    })
                  : (O[c]('DOMNodeInserted', n, !0),
                    O[c]('DOMAttrModified', n, !0),
                    setInterval(n, 999)),
                u('hashchange', n, !0),
                [
                  'focus',
                  'mouseover',
                  'click',
                  'load',
                  'transitionend',
                  'animationend',
                  'webkitAnimationEnd',
                ].forEach(function (t) {
                  k[c](t, n, !0);
                }),
                /d$|^c/.test(k.readyState)
                  ? a()
                  : (u('load', a), k[c]('DOMContentLoaded', n), $(a, 2e4)),
                D.elements.length ? (t(), X._lsFlush()) : n();
            },
            checkElems: n,
            unveil: R,
          };
        })(),
        et = (function () {
          var n,
            r = Y(function (t, e, n, i) {
              var a, r, s;
              if (
                ((t._lazysizesWidth = i),
                (i += 'px'),
                t.setAttribute('sizes', i),
                I.test(e.nodeName || ''))
              )
                for (
                  a = e.getElementsByTagName('source'), r = 0, s = a.length;
                  r < s;
                  r++
                )
                  a[r].setAttribute('sizes', i);
              n.detail.dataAttr || U(t, n.detail);
            }),
            i = function (t, e, n) {
              var i,
                a = t.parentNode;
              a &&
                ((n = s(t, a, n)),
                (i = Q(t, 'lazybeforesizes', { width: n, dataAttr: !!e })),
                i.defaultPrevented ||
                  ((n = i.detail.width) &&
                    n !== t._lazysizesWidth &&
                    r(t, a, i, n)));
            },
            t = function () {
              var t,
                e = n.length;
              if (e) for (t = 0; t < e; t++) i(n[t]);
            },
            e = tt(t);
          return {
            _: function () {
              (n = k.getElementsByClassName(H.autosizesClass)), u('resize', e);
            },
            checkElems: e,
            updateElem: i,
          };
        })(),
        r = function () {
          r.i || ((r.i = !0), et._(), t._());
        };
      return (D = {
        cfg: H,
        autoSizer: et,
        loader: t,
        init: r,
        uP: U,
        aC: G,
        rC: J,
        hC: j,
        fire: Q,
        gW: s,
        rAF: X,
      });
    }
  })(t, t.document);
  (t.lazySizes = e),
    'object' == typeof module && module.exports && (module.exports = e);
})(window);
!(function (n) {
  'use strict';
  function d(n, t) {
    var r = (65535 & n) + (65535 & t);
    return (((n >> 16) + (t >> 16) + (r >> 16)) << 16) | (65535 & r);
  }
  function f(n, t, r, e, o, u) {
    return d(((c = d(d(t, n), d(e, u))) << o) | (c >>> (32 - o)), r);
    var c;
  }
  function l(n, t, r, e, o, u, c) {
    return f((t & r) | (~t & e), n, t, o, u, c);
  }
  function v(n, t, r, e, o, u, c) {
    return f((t & e) | (r & ~e), n, t, o, u, c);
  }
  function g(n, t, r, e, o, u, c) {
    return f(t ^ r ^ e, n, t, o, u, c);
  }
  function m(n, t, r, e, o, u, c) {
    return f(r ^ (t | ~e), n, t, o, u, c);
  }
  function i(n, t) {
    var r, e, o, u, c;
    (n[t >> 5] |= 128 << t % 32), (n[14 + (((t + 64) >>> 9) << 4)] = t);
    var f = 1732584193,
      i = -271733879,
      a = -1732584194,
      h = 271733878;
    for (r = 0; r < n.length; r += 16)
      (i = m(
        (i = m(
          (i = m(
            (i = m(
              (i = g(
                (i = g(
                  (i = g(
                    (i = g(
                      (i = v(
                        (i = v(
                          (i = v(
                            (i = v(
                              (i = l(
                                (i = l(
                                  (i = l(
                                    (i = l(
                                      (o = i),
                                      (a = l(
                                        (u = a),
                                        (h = l(
                                          (c = h),
                                          (f = l(
                                            (e = f),
                                            i,
                                            a,
                                            h,
                                            n[r],
                                            7,
                                            -680876936
                                          )),
                                          i,
                                          a,
                                          n[r + 1],
                                          12,
                                          -389564586
                                        )),
                                        f,
                                        i,
                                        n[r + 2],
                                        17,
                                        606105819
                                      )),
                                      h,
                                      f,
                                      n[r + 3],
                                      22,
                                      -1044525330
                                    )),
                                    (a = l(
                                      a,
                                      (h = l(
                                        h,
                                        (f = l(
                                          f,
                                          i,
                                          a,
                                          h,
                                          n[r + 4],
                                          7,
                                          -176418897
                                        )),
                                        i,
                                        a,
                                        n[r + 5],
                                        12,
                                        1200080426
                                      )),
                                      f,
                                      i,
                                      n[r + 6],
                                      17,
                                      -1473231341
                                    )),
                                    h,
                                    f,
                                    n[r + 7],
                                    22,
                                    -45705983
                                  )),
                                  (a = l(
                                    a,
                                    (h = l(
                                      h,
                                      (f = l(
                                        f,
                                        i,
                                        a,
                                        h,
                                        n[r + 8],
                                        7,
                                        1770035416
                                      )),
                                      i,
                                      a,
                                      n[r + 9],
                                      12,
                                      -1958414417
                                    )),
                                    f,
                                    i,
                                    n[r + 10],
                                    17,
                                    -42063
                                  )),
                                  h,
                                  f,
                                  n[r + 11],
                                  22,
                                  -1990404162
                                )),
                                (a = l(
                                  a,
                                  (h = l(
                                    h,
                                    (f = l(
                                      f,
                                      i,
                                      a,
                                      h,
                                      n[r + 12],
                                      7,
                                      1804603682
                                    )),
                                    i,
                                    a,
                                    n[r + 13],
                                    12,
                                    -40341101
                                  )),
                                  f,
                                  i,
                                  n[r + 14],
                                  17,
                                  -1502002290
                                )),
                                h,
                                f,
                                n[r + 15],
                                22,
                                1236535329
                              )),
                              (a = v(
                                a,
                                (h = v(
                                  h,
                                  (f = v(f, i, a, h, n[r + 1], 5, -165796510)),
                                  i,
                                  a,
                                  n[r + 6],
                                  9,
                                  -1069501632
                                )),
                                f,
                                i,
                                n[r + 11],
                                14,
                                643717713
                              )),
                              h,
                              f,
                              n[r],
                              20,
                              -373897302
                            )),
                            (a = v(
                              a,
                              (h = v(
                                h,
                                (f = v(f, i, a, h, n[r + 5], 5, -701558691)),
                                i,
                                a,
                                n[r + 10],
                                9,
                                38016083
                              )),
                              f,
                              i,
                              n[r + 15],
                              14,
                              -660478335
                            )),
                            h,
                            f,
                            n[r + 4],
                            20,
                            -405537848
                          )),
                          (a = v(
                            a,
                            (h = v(
                              h,
                              (f = v(f, i, a, h, n[r + 9], 5, 568446438)),
                              i,
                              a,
                              n[r + 14],
                              9,
                              -1019803690
                            )),
                            f,
                            i,
                            n[r + 3],
                            14,
                            -187363961
                          )),
                          h,
                          f,
                          n[r + 8],
                          20,
                          1163531501
                        )),
                        (a = v(
                          a,
                          (h = v(
                            h,
                            (f = v(f, i, a, h, n[r + 13], 5, -1444681467)),
                            i,
                            a,
                            n[r + 2],
                            9,
                            -51403784
                          )),
                          f,
                          i,
                          n[r + 7],
                          14,
                          1735328473
                        )),
                        h,
                        f,
                        n[r + 12],
                        20,
                        -1926607734
                      )),
                      (a = g(
                        a,
                        (h = g(
                          h,
                          (f = g(f, i, a, h, n[r + 5], 4, -378558)),
                          i,
                          a,
                          n[r + 8],
                          11,
                          -2022574463
                        )),
                        f,
                        i,
                        n[r + 11],
                        16,
                        1839030562
                      )),
                      h,
                      f,
                      n[r + 14],
                      23,
                      -35309556
                    )),
                    (a = g(
                      a,
                      (h = g(
                        h,
                        (f = g(f, i, a, h, n[r + 1], 4, -1530992060)),
                        i,
                        a,
                        n[r + 4],
                        11,
                        1272893353
                      )),
                      f,
                      i,
                      n[r + 7],
                      16,
                      -155497632
                    )),
                    h,
                    f,
                    n[r + 10],
                    23,
                    -1094730640
                  )),
                  (a = g(
                    a,
                    (h = g(
                      h,
                      (f = g(f, i, a, h, n[r + 13], 4, 681279174)),
                      i,
                      a,
                      n[r],
                      11,
                      -358537222
                    )),
                    f,
                    i,
                    n[r + 3],
                    16,
                    -722521979
                  )),
                  h,
                  f,
                  n[r + 6],
                  23,
                  76029189
                )),
                (a = g(
                  a,
                  (h = g(
                    h,
                    (f = g(f, i, a, h, n[r + 9], 4, -640364487)),
                    i,
                    a,
                    n[r + 12],
                    11,
                    -421815835
                  )),
                  f,
                  i,
                  n[r + 15],
                  16,
                  530742520
                )),
                h,
                f,
                n[r + 2],
                23,
                -995338651
              )),
              (a = m(
                a,
                (h = m(
                  h,
                  (f = m(f, i, a, h, n[r], 6, -198630844)),
                  i,
                  a,
                  n[r + 7],
                  10,
                  1126891415
                )),
                f,
                i,
                n[r + 14],
                15,
                -1416354905
              )),
              h,
              f,
              n[r + 5],
              21,
              -57434055
            )),
            (a = m(
              a,
              (h = m(
                h,
                (f = m(f, i, a, h, n[r + 12], 6, 1700485571)),
                i,
                a,
                n[r + 3],
                10,
                -1894986606
              )),
              f,
              i,
              n[r + 10],
              15,
              -1051523
            )),
            h,
            f,
            n[r + 1],
            21,
            -2054922799
          )),
          (a = m(
            a,
            (h = m(
              h,
              (f = m(f, i, a, h, n[r + 8], 6, 1873313359)),
              i,
              a,
              n[r + 15],
              10,
              -30611744
            )),
            f,
            i,
            n[r + 6],
            15,
            -1560198380
          )),
          h,
          f,
          n[r + 13],
          21,
          1309151649
        )),
        (a = m(
          a,
          (h = m(
            h,
            (f = m(f, i, a, h, n[r + 4], 6, -145523070)),
            i,
            a,
            n[r + 11],
            10,
            -1120210379
          )),
          f,
          i,
          n[r + 2],
          15,
          718787259
        )),
        h,
        f,
        n[r + 9],
        21,
        -343485551
      )),
        (f = d(f, e)),
        (i = d(i, o)),
        (a = d(a, u)),
        (h = d(h, c));
    return [f, i, a, h];
  }
  function a(n) {
    var t,
      r = '',
      e = 32 * n.length;
    for (t = 0; t < e; t += 8)
      r += String.fromCharCode((n[t >> 5] >>> t % 32) & 255);
    return r;
  }
  function h(n) {
    var t,
      r = [];
    for (r[(n.length >> 2) - 1] = void 0, t = 0; t < r.length; t += 1) r[t] = 0;
    var e = 8 * n.length;
    for (t = 0; t < e; t += 8)
      r[t >> 5] |= (255 & n.charCodeAt(t / 8)) << t % 32;
    return r;
  }
  function e(n) {
    var t,
      r,
      e = '0123456789abcdef',
      o = '';
    for (r = 0; r < n.length; r += 1)
      (t = n.charCodeAt(r)), (o += e.charAt((t >>> 4) & 15) + e.charAt(15 & t));
    return o;
  }
  function r(n) {
    return unescape(encodeURIComponent(n));
  }
  function o(n) {
    return a(i(h((t = r(n))), 8 * t.length));
    var t;
  }
  function u(n, t) {
    return (function (n, t) {
      var r,
        e,
        o = h(n),
        u = [],
        c = [];
      for (
        u[15] = c[15] = void 0,
          16 < o.length && (o = i(o, 8 * n.length)),
          r = 0;
        r < 16;
        r += 1
      )
        (u[r] = 909522486 ^ o[r]), (c[r] = 1549556828 ^ o[r]);
      return (
        (e = i(u.concat(h(t)), 512 + 8 * t.length)), a(i(c.concat(e), 640))
      );
    })(r(n), r(t));
  }
  function t(n, t, r) {
    return t ? (r ? u(t, n) : e(u(t, n))) : r ? o(n) : e(o(n));
  }
  'function' == typeof define && define.amd
    ? define(function () {
        return t;
      })
    : 'object' == typeof module && module.exports
    ? (module.exports = t)
    : (n.md5 = t);
})(this);
!(function (h, i, n, a) {
  function l(t, e) {
    (this.settings = null),
      (this.options = h.extend({}, l.Defaults, e)),
      (this.$element = h(t)),
      (this._handlers = {}),
      (this._plugins = {}),
      (this._supress = {}),
      (this._current = null),
      (this._speed = null),
      (this._coordinates = []),
      (this._breakpoint = null),
      (this._width = null),
      (this._items = []),
      (this._clones = []),
      (this._mergers = []),
      (this._widths = []),
      (this._invalidated = {}),
      (this._pipe = []),
      (this._drag = {
        time: null,
        target: null,
        pointer: null,
        stage: { start: null, current: null },
        direction: null,
      }),
      (this._states = {
        current: {},
        tags: {
          initializing: ['busy'],
          animating: ['busy'],
          dragging: ['interacting'],
        },
      }),
      h.each(
        ['onResize', 'onThrottledResize'],
        h.proxy(function (t, e) {
          this._handlers[e] = h.proxy(this[e], this);
        }, this)
      ),
      h.each(
        l.Plugins,
        h.proxy(function (t, e) {
          this._plugins[t.charAt(0).toLowerCase() + t.slice(1)] = new e(this);
        }, this)
      ),
      h.each(
        l.Workers,
        h.proxy(function (t, e) {
          this._pipe.push({ filter: e.filter, run: h.proxy(e.run, this) });
        }, this)
      ),
      this.setup(),
      this.initialize();
  }
  (l.Defaults = {
    items: 3,
    loop: !1,
    center: !1,
    rewind: !1,
    checkVisibility: !0,
    mouseDrag: !0,
    touchDrag: !0,
    pullDrag: !0,
    freeDrag: !1,
    margin: 0,
    stagePadding: 0,
    merge: !1,
    mergeFit: !0,
    autoWidth: !1,
    startPosition: 0,
    rtl: !1,
    smartSpeed: 250,
    fluidSpeed: !1,
    dragEndSpeed: !1,
    responsive: {},
    responsiveRefreshRate: 200,
    responsiveBaseElement: i,
    fallbackEasing: 'swing',
    slideTransition: '',
    info: !1,
    nestedItemSelector: !1,
    itemElement: 'div',
    stageElement: 'div',
    refreshClass: 'owl-refresh',
    loadedClass: 'owl-loaded',
    loadingClass: 'owl-loading',
    rtlClass: 'owl-rtl',
    responsiveClass: 'owl-responsive',
    dragClass: 'owl-drag',
    itemClass: 'owl-item',
    stageClass: 'owl-stage',
    stageOuterClass: 'owl-stage-outer',
    grabClass: 'owl-grab',
  }),
    (l.Width = { Default: 'default', Inner: 'inner', Outer: 'outer' }),
    (l.Type = { Event: 'event', State: 'state' }),
    (l.Plugins = {}),
    (l.Workers = [
      {
        filter: ['width', 'settings'],
        run: function () {
          this._width = this.$element.width();
        },
      },
      {
        filter: ['width', 'items', 'settings'],
        run: function (t) {
          t.current = this._items && this._items[this.relative(this._current)];
        },
      },
      {
        filter: ['items', 'settings'],
        run: function () {
          this.$stage.children('.cloned').remove();
        },
      },
      {
        filter: ['width', 'items', 'settings'],
        run: function (t) {
          var e = this.settings.margin || '',
            i = !this.settings.autoWidth,
            s = this.settings.rtl,
            n = {
              width: 'auto',
              'margin-left': s ? e : '',
              'margin-right': s ? '' : e,
            };
          i || this.$stage.children().css(n), (t.css = n);
        },
      },
      {
        filter: ['width', 'items', 'settings'],
        run: function (t) {
          var e =
              (this.width() / this.settings.items).toFixed(3) -
              this.settings.margin,
            i = null,
            s = this._items.length,
            n = !this.settings.autoWidth,
            o = [];
          for (t.items = { merge: !1, width: e }; s--; )
            (i = this._mergers[s]),
              (i =
                (this.settings.mergeFit && Math.min(i, this.settings.items)) ||
                i),
              (t.items.merge = 1 < i || t.items.merge),
              (o[s] = n ? e * i : this._items[s].width());
          this._widths = o;
        },
      },
      {
        filter: ['items', 'settings'],
        run: function () {
          var t = [],
            e = this._items,
            i = this.settings,
            s = Math.max(2 * i.items, 4),
            n = 2 * Math.ceil(e.length / 2),
            o = i.loop && e.length ? (i.rewind ? s : Math.max(s, n)) : 0,
            r = '',
            a = '';
          for (o /= 2; 0 < o; )
            t.push(this.normalize(t.length / 2, !0)),
              (r += e[t[t.length - 1]][0].outerHTML),
              t.push(this.normalize(e.length - 1 - (t.length - 1) / 2, !0)),
              (a = e[t[t.length - 1]][0].outerHTML + a),
              --o;
          (this._clones = t),
            h(r).addClass('cloned').appendTo(this.$stage),
            h(a).addClass('cloned').prependTo(this.$stage);
        },
      },
      {
        filter: ['width', 'items', 'settings'],
        run: function () {
          for (
            var t = this.settings.rtl ? 1 : -1,
              e = this._clones.length + this._items.length,
              i = -1,
              s = 0,
              n = 0,
              o = [];
            ++i < e;

          )
            (s = o[i - 1] || 0),
              (n = this._widths[this.relative(i)] + this.settings.margin),
              o.push(s + n * t);
          this._coordinates = o;
        },
      },
      {
        filter: ['width', 'items', 'settings'],
        run: function () {
          var t = this.settings.stagePadding,
            e = this._coordinates,
            i = {
              width: Math.ceil(Math.abs(e[e.length - 1])) + 2 * t,
              'padding-left': t || '',
              'padding-right': t || '',
            };
          this.$stage.css(i);
        },
      },
      {
        filter: ['width', 'items', 'settings'],
        run: function (t) {
          var e = this._coordinates.length,
            i = !this.settings.autoWidth,
            s = this.$stage.children();
          if (i && t.items.merge)
            for (; e--; )
              (t.css.width = this._widths[this.relative(e)]),
                s.eq(e).css(t.css);
          else i && ((t.css.width = t.items.width), s.css(t.css));
        },
      },
      {
        filter: ['items'],
        run: function () {
          this._coordinates.length < 1 && this.$stage.removeAttr('style');
        },
      },
      {
        filter: ['width', 'items', 'settings'],
        run: function (t) {
          (t.current = t.current ? this.$stage.children().index(t.current) : 0),
            (t.current = Math.max(
              this.minimum(),
              Math.min(this.maximum(), t.current)
            )),
            this.reset(t.current);
        },
      },
      {
        filter: ['position'],
        run: function () {
          this.animate(this.coordinates(this._current));
        },
      },
      {
        filter: ['width', 'position', 'items', 'settings'],
        run: function () {
          var t,
            e,
            i,
            s,
            n = this.settings.rtl ? 1 : -1,
            o = 2 * this.settings.stagePadding,
            r = this.coordinates(this.current()) + o,
            a = r + this.width() * n,
            h = [];
          for (i = 0, s = this._coordinates.length; i < s; i++)
            (t = this._coordinates[i - 1] || 0),
              (e = Math.abs(this._coordinates[i]) + o * n),
              ((this.op(t, '<=', r) && this.op(t, '>', a)) ||
                (this.op(e, '<', r) && this.op(e, '>', a))) &&
                h.push(i);
          this.$stage.children('.active').removeClass('active'),
            this.$stage
              .children(':eq(' + h.join('), :eq(') + ')')
              .addClass('active'),
            this.$stage.children('.center').removeClass('center'),
            this.settings.center &&
              this.$stage.children().eq(this.current()).addClass('center');
        },
      },
    ]),
    (l.prototype.initializeStage = function () {
      (this.$stage = this.$element.find('.' + this.settings.stageClass)),
        this.$stage.length ||
          (this.$element.addClass(this.options.loadingClass),
          (this.$stage = h('<' + this.settings.stageElement + '>', {
            class: this.settings.stageClass,
          }).wrap(h('<div/>', { class: this.settings.stageOuterClass }))),
          this.$element.append(this.$stage.parent()));
    }),
    (l.prototype.initializeItems = function () {
      var t = this.$element.find('.owl-item');
      if (t.length)
        return (
          (this._items = t.get().map(function (t) {
            return h(t);
          })),
          (this._mergers = this._items.map(function () {
            return 1;
          })),
          void this.refresh()
        );
      this.replace(this.$element.children().not(this.$stage.parent())),
        this.isVisible() ? this.refresh() : this.invalidate('width'),
        this.$element
          .removeClass(this.options.loadingClass)
          .addClass(this.options.loadedClass);
    }),
    (l.prototype.initialize = function () {
      var t, e, i;
      this.enter('initializing'),
        this.trigger('initialize'),
        this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl),
        this.settings.autoWidth &&
          !this.is('pre-loading') &&
          ((t = this.$element.find('img')),
          (e = this.settings.nestedItemSelector
            ? '.' + this.settings.nestedItemSelector
            : a),
          (i = this.$element.children(e).width()),
          t.length && i <= 0 && this.preloadAutoWidthImages(t));
      this.initializeStage(),
        this.initializeItems(),
        this.registerEventHandlers(),
        this.leave('initializing'),
        this.trigger('initialized');
    }),
    (l.prototype.isVisible = function () {
      return !this.settings.checkVisibility || this.$element.is(':visible');
    }),
    (l.prototype.setup = function () {
      var e = this.viewport(),
        t = this.options.responsive,
        i = -1,
        s = null;
      t
        ? (h.each(t, function (t) {
            t <= e && i < t && (i = Number(t));
          }),
          'function' ==
            typeof (s = h.extend({}, this.options, t[i])).stagePadding &&
            (s.stagePadding = s.stagePadding()),
          delete s.responsive,
          s.responsiveClass &&
            this.$element.attr(
              'class',
              this.$element
                .attr('class')
                .replace(
                  new RegExp(
                    '(' + this.options.responsiveClass + '-)\\S+\\s',
                    'g'
                  ),
                  '$1' + i
                )
            ))
        : (s = h.extend({}, this.options)),
        this.trigger('change', { property: { name: 'settings', value: s } }),
        (this._breakpoint = i),
        (this.settings = s),
        this.invalidate('settings'),
        this.trigger('changed', {
          property: { name: 'settings', value: this.settings },
        });
    }),
    (l.prototype.optionsLogic = function () {
      this.settings.autoWidth &&
        ((this.settings.stagePadding = !1), (this.settings.merge = !1));
    }),
    (l.prototype.prepare = function (t) {
      var e = this.trigger('prepare', { content: t });
      return (
        e.data ||
          (e.data = h('<' + this.settings.itemElement + '/>')
            .addClass(this.options.itemClass)
            .append(t)),
        this.trigger('prepared', { content: e.data }),
        e.data
      );
    }),
    (l.prototype.update = function () {
      for (
        var t = 0,
          e = this._pipe.length,
          i = h.proxy(function (t) {
            return this[t];
          }, this._invalidated),
          s = {};
        t < e;

      )
        (this._invalidated.all || 0 < h.grep(this._pipe[t].filter, i).length) &&
          this._pipe[t].run(s),
          t++;
      (this._invalidated = {}), this.is('valid') || this.enter('valid');
    }),
    (l.prototype.width = function (t) {
      switch ((t = t || l.Width.Default)) {
        case l.Width.Inner:
        case l.Width.Outer:
          return this._width;
        default:
          return (
            this._width - 2 * this.settings.stagePadding + this.settings.margin
          );
      }
    }),
    (l.prototype.refresh = function () {
      this.enter('refreshing'),
        this.trigger('refresh'),
        this.setup(),
        this.optionsLogic(),
        this.$element.addClass(this.options.refreshClass),
        this.update(),
        this.$element.removeClass(this.options.refreshClass),
        this.leave('refreshing'),
        this.trigger('refreshed');
    }),
    (l.prototype.onThrottledResize = function () {
      i.clearTimeout(this.resizeTimer),
        (this.resizeTimer = i.setTimeout(
          this._handlers.onResize,
          this.settings.responsiveRefreshRate
        ));
    }),
    (l.prototype.onResize = function () {
      return (
        !!this._items.length &&
        this._width !== this.$element.width() &&
        !!this.isVisible() &&
        (this.enter('resizing'),
        this.trigger('resize').isDefaultPrevented()
          ? (this.leave('resizing'), !1)
          : (this.invalidate('width'),
            this.refresh(),
            this.leave('resizing'),
            void this.trigger('resized')))
      );
    }),
    (l.prototype.registerEventHandlers = function () {
      h.support.transition &&
        this.$stage.on(
          h.support.transition.end + '.owl.core',
          h.proxy(this.onTransitionEnd, this)
        ),
        !1 !== this.settings.responsive &&
          this.on(i, 'resize', this._handlers.onThrottledResize),
        this.settings.mouseDrag &&
          (this.$element.addClass(this.options.dragClass),
          this.$stage.on('mousedown.owl.core', h.proxy(this.onDragStart, this)),
          this.$stage.on(
            'dragstart.owl.core selectstart.owl.core',
            function () {
              return !1;
            }
          )),
        this.settings.touchDrag &&
          (this.$stage.on(
            'touchstart.owl.core',
            h.proxy(this.onDragStart, this)
          ),
          this.$stage.on(
            'touchcancel.owl.core',
            h.proxy(this.onDragEnd, this)
          ));
    }),
    (l.prototype.onDragStart = function (t) {
      var e = null;
      3 !== t.which &&
        ((e = h.support.transform
          ? {
              x: (e = this.$stage
                .css('transform')
                .replace(/.*\(|\)| /g, '')
                .split(','))[16 === e.length ? 12 : 4],
              y: e[16 === e.length ? 13 : 5],
            }
          : ((e = this.$stage.position()),
            {
              x: this.settings.rtl
                ? e.left +
                  this.$stage.width() -
                  this.width() +
                  this.settings.margin
                : e.left,
              y: e.top,
            })),
        this.is('animating') &&
          (h.support.transform ? this.animate(e.x) : this.$stage.stop(),
          this.invalidate('position')),
        this.$element.toggleClass(
          this.options.grabClass,
          'mousedown' === t.type
        ),
        this.speed(0),
        (this._drag.time = new Date().getTime()),
        (this._drag.target = h(t.target)),
        (this._drag.stage.start = e),
        (this._drag.stage.current = e),
        (this._drag.pointer = this.pointer(t)),
        h(n).on(
          'mouseup.owl.core touchend.owl.core',
          h.proxy(this.onDragEnd, this)
        ),
        h(n).one(
          'mousemove.owl.core touchmove.owl.core',
          h.proxy(function (t) {
            var e = this.difference(this._drag.pointer, this.pointer(t));
            h(n).on(
              'mousemove.owl.core touchmove.owl.core',
              h.proxy(this.onDragMove, this)
            ),
              (Math.abs(e.x) < Math.abs(e.y) && this.is('valid')) ||
                (t.preventDefault(),
                this.enter('dragging'),
                this.trigger('drag'));
          }, this)
        ));
    }),
    (l.prototype.onDragMove = function (t) {
      var e = null,
        i = null,
        s = null,
        n = this.difference(this._drag.pointer, this.pointer(t)),
        o = this.difference(this._drag.stage.start, n);
      this.is('dragging') &&
        (t.preventDefault(),
        this.settings.loop
          ? ((e = this.coordinates(this.minimum())),
            (i = this.coordinates(this.maximum() + 1) - e),
            (o.x = ((((o.x - e) % i) + i) % i) + e))
          : ((e = this.settings.rtl
              ? this.coordinates(this.maximum())
              : this.coordinates(this.minimum())),
            (i = this.settings.rtl
              ? this.coordinates(this.minimum())
              : this.coordinates(this.maximum())),
            (s = this.settings.pullDrag ? (-1 * n.x) / 5 : 0),
            (o.x = Math.max(Math.min(o.x, e + s), i + s))),
        (this._drag.stage.current = o),
        this.animate(o.x));
    }),
    (l.prototype.onDragEnd = function (t) {
      var e = this.difference(this._drag.pointer, this.pointer(t)),
        i = this._drag.stage.current,
        s = (0 < e.x) ^ this.settings.rtl ? 'left' : 'right';
      h(n).off('.owl.core'),
        this.$element.removeClass(this.options.grabClass),
        ((0 !== e.x && this.is('dragging')) || !this.is('valid')) &&
          (this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed),
          this.current(this.closest(i.x, 0 !== e.x ? s : this._drag.direction)),
          this.invalidate('position'),
          this.update(),
          (this._drag.direction = s),
          (3 < Math.abs(e.x) || 300 < new Date().getTime() - this._drag.time) &&
            this._drag.target.one('click.owl.core', function () {
              return !1;
            })),
        this.is('dragging') &&
          (this.leave('dragging'), this.trigger('dragged'));
    }),
    (l.prototype.closest = function (i, s) {
      var n = -1,
        o = this.width(),
        r = this.coordinates();
      return (
        this.settings.freeDrag ||
          h.each(
            r,
            h.proxy(function (t, e) {
              return (
                'left' === s && e - 30 < i && i < e + 30
                  ? (n = t)
                  : 'right' === s && e - o - 30 < i && i < e - o + 30
                  ? (n = t + 1)
                  : this.op(i, '<', e) &&
                    this.op(i, '>', r[t + 1] !== a ? r[t + 1] : e - o) &&
                    (n = 'left' === s ? t + 1 : t),
                -1 === n
              );
            }, this)
          ),
        this.settings.loop ||
          (this.op(i, '>', r[this.minimum()])
            ? (n = i = this.minimum())
            : this.op(i, '<', r[this.maximum()]) && (n = i = this.maximum())),
        n
      );
    }),
    (l.prototype.animate = function (t) {
      var e = 0 < this.speed();
      this.is('animating') && this.onTransitionEnd(),
        e && (this.enter('animating'), this.trigger('translate')),
        h.support.transform3d && h.support.transition
          ? this.$stage.css({
              transform: 'translate3d(' + t + 'px,0px,0px)',
              transition:
                this.speed() / 1e3 +
                's' +
                (this.settings.slideTransition
                  ? ' ' + this.settings.slideTransition
                  : ''),
            })
          : e
          ? this.$stage.animate(
              { left: t + 'px' },
              this.speed(),
              this.settings.fallbackEasing,
              h.proxy(this.onTransitionEnd, this)
            )
          : this.$stage.css({ left: t + 'px' });
    }),
    (l.prototype.is = function (t) {
      return this._states.current[t] && 0 < this._states.current[t];
    }),
    (l.prototype.current = function (t) {
      if (t === a) return this._current;
      if (0 === this._items.length) return a;
      if (((t = this.normalize(t)), this._current !== t)) {
        var e = this.trigger('change', {
          property: { name: 'position', value: t },
        });
        e.data !== a && (t = this.normalize(e.data)),
          (this._current = t),
          this.invalidate('position'),
          this.trigger('changed', {
            property: { name: 'position', value: this._current },
          });
      }
      return this._current;
    }),
    (l.prototype.invalidate = function (t) {
      return (
        'string' === h.type(t) &&
          ((this._invalidated[t] = !0),
          this.is('valid') && this.leave('valid')),
        h.map(this._invalidated, function (t, e) {
          return e;
        })
      );
    }),
    (l.prototype.reset = function (t) {
      (t = this.normalize(t)) !== a &&
        ((this._speed = 0),
        (this._current = t),
        this.suppress(['translate', 'translated']),
        this.animate(this.coordinates(t)),
        this.release(['translate', 'translated']));
    }),
    (l.prototype.normalize = function (t, e) {
      var i = this._items.length,
        s = e ? 0 : this._clones.length;
      return (
        !this.isNumeric(t) || i < 1
          ? (t = a)
          : (t < 0 || i + s <= t) &&
            (t = ((((t - s / 2) % i) + i) % i) + s / 2),
        t
      );
    }),
    (l.prototype.relative = function (t) {
      return (t -= this._clones.length / 2), this.normalize(t, !0);
    }),
    (l.prototype.maximum = function (t) {
      var e,
        i,
        s,
        n = this.settings,
        o = this._coordinates.length;
      if (n.loop) o = this._clones.length / 2 + this._items.length - 1;
      else if (n.autoWidth || n.merge) {
        if ((e = this._items.length))
          for (
            i = this._items[--e].width(), s = this.$element.width();
            e-- && !((i += this._items[e].width() + this.settings.margin) > s);

          );
        o = e + 1;
      } else
        o = n.center ? this._items.length - 1 : this._items.length - n.items;
      return t && (o -= this._clones.length / 2), Math.max(o, 0);
    }),
    (l.prototype.minimum = function (t) {
      return t ? 0 : this._clones.length / 2;
    }),
    (l.prototype.items = function (t) {
      return t === a
        ? this._items.slice()
        : ((t = this.normalize(t, !0)), this._items[t]);
    }),
    (l.prototype.mergers = function (t) {
      return t === a
        ? this._mergers.slice()
        : ((t = this.normalize(t, !0)), this._mergers[t]);
    }),
    (l.prototype.clones = function (i) {
      function s(t) {
        return t % 2 == 0 ? n + t / 2 : e - (t + 1) / 2;
      }
      var e = this._clones.length / 2,
        n = e + this._items.length;
      return i === a
        ? h.map(this._clones, function (t, e) {
            return s(e);
          })
        : h.map(this._clones, function (t, e) {
            return t === i ? s(e) : null;
          });
    }),
    (l.prototype.speed = function (t) {
      return t !== a && (this._speed = t), this._speed;
    }),
    (l.prototype.coordinates = function (t) {
      var e,
        i = 1,
        s = t - 1;
      return t === a
        ? h.map(
            this._coordinates,
            h.proxy(function (t, e) {
              return this.coordinates(e);
            }, this)
          )
        : (this.settings.center
            ? (this.settings.rtl && ((i = -1), (s = t + 1)),
              (e = this._coordinates[t]),
              (e += ((this.width() - e + (this._coordinates[s] || 0)) / 2) * i))
            : (e = this._coordinates[s] || 0),
          (e = Math.ceil(e)));
    }),
    (l.prototype.duration = function (t, e, i) {
      return 0 === i
        ? 0
        : Math.min(Math.max(Math.abs(e - t), 1), 6) *
            Math.abs(i || this.settings.smartSpeed);
    }),
    (l.prototype.to = function (t, e) {
      var i = this.current(),
        s = null,
        n = t - this.relative(i),
        o = (0 < n) - (n < 0),
        r = this._items.length,
        a = this.minimum(),
        h = this.maximum();
      this.settings.loop
        ? (!this.settings.rewind && Math.abs(n) > r / 2 && (n += -1 * o * r),
          (s = (((((t = i + n) - a) % r) + r) % r) + a) !== t &&
            s - n <= h &&
            0 < s - n &&
            ((i = s - n), (t = s), this.reset(i)))
        : (t = this.settings.rewind
            ? ((t % (h += 1)) + h) % h
            : Math.max(a, Math.min(h, t))),
        this.speed(this.duration(i, t, e)),
        this.current(t),
        this.isVisible() && this.update();
    }),
    (l.prototype.next = function (t) {
      (t = t || !1), this.to(this.relative(this.current()) + 1, t);
    }),
    (l.prototype.prev = function (t) {
      (t = t || !1), this.to(this.relative(this.current()) - 1, t);
    }),
    (l.prototype.onTransitionEnd = function (t) {
      if (
        t !== a &&
        (t.stopPropagation(),
        (t.target || t.srcElement || t.originalTarget) !== this.$stage.get(0))
      )
        return !1;
      this.leave('animating'), this.trigger('translated');
    }),
    (l.prototype.viewport = function () {
      var t;
      return (
        this.options.responsiveBaseElement !== i
          ? (t = h(this.options.responsiveBaseElement).width())
          : i.innerWidth
          ? (t = i.innerWidth)
          : n.documentElement && n.documentElement.clientWidth
          ? (t = n.documentElement.clientWidth)
          : console.warn('Can not detect viewport width.'),
        t
      );
    }),
    (l.prototype.replace = function (t) {
      this.$stage.empty(),
        (this._items = []),
        (t = t && (t instanceof jQuery ? t : h(t))),
        this.settings.nestedItemSelector &&
          (t = t.find('.' + this.settings.nestedItemSelector)),
        t
          .filter(function () {
            return 1 === this.nodeType;
          })
          .each(
            h.proxy(function (t, e) {
              (e = this.prepare(e)),
                this.$stage.append(e),
                this._items.push(e),
                this._mergers.push(
                  +e
                    .find('[data-merge]')
                    .addBack('[data-merge]')
                    .attr('data-merge') || 1
                );
            }, this)
          ),
        this.reset(
          this.isNumeric(this.settings.startPosition)
            ? this.settings.startPosition
            : 0
        ),
        this.invalidate('items');
    }),
    (l.prototype.add = function (t, e) {
      var i = this.relative(this._current);
      (e = e === a ? this._items.length : this.normalize(e, !0)),
        (t = t instanceof jQuery ? t : h(t)),
        this.trigger('add', { content: t, position: e }),
        (t = this.prepare(t)),
        0 === this._items.length || e === this._items.length
          ? (0 === this._items.length && this.$stage.append(t),
            0 !== this._items.length && this._items[e - 1].after(t),
            this._items.push(t),
            this._mergers.push(
              +t
                .find('[data-merge]')
                .addBack('[data-merge]')
                .attr('data-merge') || 1
            ))
          : (this._items[e].before(t),
            this._items.splice(e, 0, t),
            this._mergers.splice(
              e,
              0,
              +t
                .find('[data-merge]')
                .addBack('[data-merge]')
                .attr('data-merge') || 1
            )),
        this._items[i] && this.reset(this._items[i].index()),
        this.invalidate('items'),
        this.trigger('added', { content: t, position: e });
    }),
    (l.prototype.remove = function (t) {
      (t = this.normalize(t, !0)) !== a &&
        (this.trigger('remove', { content: this._items[t], position: t }),
        this._items[t].remove(),
        this._items.splice(t, 1),
        this._mergers.splice(t, 1),
        this.invalidate('items'),
        this.trigger('removed', { content: null, position: t }));
    }),
    (l.prototype.preloadAutoWidthImages = function (t) {
      t.each(
        h.proxy(function (t, e) {
          this.enter('pre-loading'),
            (e = h(e)),
            h(new Image())
              .one(
                'load',
                h.proxy(function (t) {
                  e.attr('src', t.target.src),
                    e.css('opacity', 1),
                    this.leave('pre-loading'),
                    this.is('pre-loading') ||
                      this.is('initializing') ||
                      this.refresh();
                }, this)
              )
              .attr(
                'src',
                e.attr('src') || e.attr('data-src') || e.attr('data-src-retina')
              );
        }, this)
      );
    }),
    (l.prototype.destroy = function () {
      for (var t in (this.$element.off('.owl.core'),
      this.$stage.off('.owl.core'),
      h(n).off('.owl.core'),
      !1 !== this.settings.responsive &&
        (i.clearTimeout(this.resizeTimer),
        this.off(i, 'resize', this._handlers.onThrottledResize)),
      this._plugins))
        this._plugins[t].destroy();
      this.$stage.children('.cloned').remove(),
        this.$stage.unwrap(),
        this.$stage.children().contents().unwrap(),
        this.$stage.children().unwrap(),
        this.$stage.remove(),
        this.$element
          .removeClass(this.options.refreshClass)
          .removeClass(this.options.loadingClass)
          .removeClass(this.options.loadedClass)
          .removeClass(this.options.rtlClass)
          .removeClass(this.options.dragClass)
          .removeClass(this.options.grabClass)
          .attr(
            'class',
            this.$element
              .attr('class')
              .replace(
                new RegExp(this.options.responsiveClass + '-\\S+\\s', 'g'),
                ''
              )
          )
          .removeData('owl.carousel');
    }),
    (l.prototype.op = function (t, e, i) {
      var s = this.settings.rtl;
      switch (e) {
        case '<':
          return s ? i < t : t < i;
        case '>':
          return s ? t < i : i < t;
        case '>=':
          return s ? t <= i : i <= t;
        case '<=':
          return s ? i <= t : t <= i;
      }
    }),
    (l.prototype.on = function (t, e, i, s) {
      t.addEventListener
        ? t.addEventListener(e, i, s)
        : t.attachEvent && t.attachEvent('on' + e, i);
    }),
    (l.prototype.off = function (t, e, i, s) {
      t.removeEventListener
        ? t.removeEventListener(e, i, s)
        : t.detachEvent && t.detachEvent('on' + e, i);
    }),
    (l.prototype.trigger = function (t, e, i, s, n) {
      var o = { item: { count: this._items.length, index: this.current() } },
        r = h.camelCase(
          h
            .grep(['on', t, i], function (t) {
              return t;
            })
            .join('-')
            .toLowerCase()
        ),
        a = h.Event(
          [t, 'owl', i || 'carousel'].join('.').toLowerCase(),
          h.extend({ relatedTarget: this }, o, e)
        );
      return (
        this._supress[t] ||
          (h.each(this._plugins, function (t, e) {
            e.onTrigger && e.onTrigger(a);
          }),
          this.register({ type: l.Type.Event, name: t }),
          this.$element.trigger(a),
          this.settings &&
            'function' == typeof this.settings[r] &&
            this.settings[r].call(this, a)),
        a
      );
    }),
    (l.prototype.enter = function (t) {
      h.each(
        [t].concat(this._states.tags[t] || []),
        h.proxy(function (t, e) {
          this._states.current[e] === a && (this._states.current[e] = 0),
            this._states.current[e]++;
        }, this)
      );
    }),
    (l.prototype.leave = function (t) {
      h.each(
        [t].concat(this._states.tags[t] || []),
        h.proxy(function (t, e) {
          this._states.current[e]--;
        }, this)
      );
    }),
    (l.prototype.register = function (i) {
      if (i.type === l.Type.Event) {
        if (
          (h.event.special[i.name] || (h.event.special[i.name] = {}),
          !h.event.special[i.name].owl)
        ) {
          var e = h.event.special[i.name]._default;
          (h.event.special[i.name]._default = function (t) {
            return !e ||
              !e.apply ||
              (t.namespace && -1 !== t.namespace.indexOf('owl'))
              ? t.namespace && -1 < t.namespace.indexOf('owl')
              : e.apply(this, arguments);
          }),
            (h.event.special[i.name].owl = !0);
        }
      } else
        i.type === l.Type.State &&
          (this._states.tags[i.name]
            ? (this._states.tags[i.name] = this._states.tags[i.name].concat(
                i.tags
              ))
            : (this._states.tags[i.name] = i.tags),
          (this._states.tags[i.name] = h.grep(
            this._states.tags[i.name],
            h.proxy(function (t, e) {
              return h.inArray(t, this._states.tags[i.name]) === e;
            }, this)
          )));
    }),
    (l.prototype.suppress = function (t) {
      h.each(
        t,
        h.proxy(function (t, e) {
          this._supress[e] = !0;
        }, this)
      );
    }),
    (l.prototype.release = function (t) {
      h.each(
        t,
        h.proxy(function (t, e) {
          delete this._supress[e];
        }, this)
      );
    }),
    (l.prototype.pointer = function (t) {
      var e = { x: null, y: null };
      return (
        (t =
          (t = t.originalEvent || t || i.event).touches && t.touches.length
            ? t.touches[0]
            : t.changedTouches && t.changedTouches.length
            ? t.changedTouches[0]
            : t).pageX
          ? ((e.x = t.pageX), (e.y = t.pageY))
          : ((e.x = t.clientX), (e.y = t.clientY)),
        e
      );
    }),
    (l.prototype.isNumeric = function (t) {
      return !isNaN(parseFloat(t));
    }),
    (l.prototype.difference = function (t, e) {
      return { x: t.x - e.x, y: t.y - e.y };
    }),
    (h.fn.owlCarousel = function (e) {
      var s = Array.prototype.slice.call(arguments, 1);
      return this.each(function () {
        var t = h(this),
          i = t.data('owl.carousel');
        i ||
          ((i = new l(this, 'object' == typeof e && e)),
          t.data('owl.carousel', i),
          h.each(
            [
              'next',
              'prev',
              'to',
              'destroy',
              'refresh',
              'replace',
              'add',
              'remove',
            ],
            function (t, e) {
              i.register({ type: l.Type.Event, name: e }),
                i.$element.on(
                  e + '.owl.carousel.core',
                  h.proxy(function (t) {
                    t.namespace &&
                      t.relatedTarget !== this &&
                      (this.suppress([e]),
                      i[e].apply(this, [].slice.call(arguments, 1)),
                      this.release([e]));
                  }, i)
                );
            }
          )),
          'string' == typeof e && '_' !== e.charAt(0) && i[e].apply(i, s);
      });
    }),
    (h.fn.owlCarousel.Constructor = l);
})(window.Zepto || window.jQuery, window, document),
  (function (e, i) {
    var s = function (t) {
      (this._core = t),
        (this._interval = null),
        (this._visible = null),
        (this._handlers = {
          'initialized.owl.carousel': e.proxy(function (t) {
            t.namespace && this._core.settings.autoRefresh && this.watch();
          }, this),
        }),
        (this._core.options = e.extend({}, s.Defaults, this._core.options)),
        this._core.$element.on(this._handlers);
    };
    (s.Defaults = { autoRefresh: !0, autoRefreshInterval: 500 }),
      (s.prototype.watch = function () {
        this._interval ||
          ((this._visible = this._core.isVisible()),
          (this._interval = i.setInterval(
            e.proxy(this.refresh, this),
            this._core.settings.autoRefreshInterval
          )));
      }),
      (s.prototype.refresh = function () {
        this._core.isVisible() !== this._visible &&
          ((this._visible = !this._visible),
          this._core.$element.toggleClass('owl-hidden', !this._visible),
          this._visible &&
            this._core.invalidate('width') &&
            this._core.refresh());
      }),
      (s.prototype.destroy = function () {
        var t, e;
        for (t in (i.clearInterval(this._interval), this._handlers))
          this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          'function' != typeof this[e] && (this[e] = null);
      }),
      (e.fn.owlCarousel.Constructor.Plugins.AutoRefresh = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, o) {
    var e = function (t) {
      (this._core = t),
        (this._loaded = []),
        (this._handlers = {
          'initialized.owl.carousel change.owl.carousel resized.owl.carousel':
            a.proxy(function (t) {
              if (
                t.namespace &&
                this._core.settings &&
                this._core.settings.lazyLoad &&
                ((t.property && 'position' == t.property.name) ||
                  'initialized' == t.type)
              ) {
                var e = this._core.settings,
                  i = (e.center && Math.ceil(e.items / 2)) || e.items,
                  s = (e.center && -1 * i) || 0,
                  n =
                    (t.property && void 0 !== t.property.value
                      ? t.property.value
                      : this._core.current()) + s,
                  o = this._core.clones().length,
                  r = a.proxy(function (t, e) {
                    this.load(e);
                  }, this);
                for (
                  0 < e.lazyLoadEager &&
                  ((i += e.lazyLoadEager),
                  e.loop && ((n -= e.lazyLoadEager), i++));
                  s++ < i;

                )
                  this.load(o / 2 + this._core.relative(n)),
                    o && a.each(this._core.clones(this._core.relative(n)), r),
                    n++;
              }
            }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this._core.$element.on(this._handlers);
    };
    (e.Defaults = { lazyLoad: !1, lazyLoadEager: 0 }),
      (e.prototype.load = function (t) {
        var e = this._core.$stage.children().eq(t),
          i = e && e.find('.owl-lazy');
        !i ||
          -1 < a.inArray(e.get(0), this._loaded) ||
          (i.each(
            a.proxy(function (t, e) {
              var i,
                s = a(e),
                n =
                  (1 < o.devicePixelRatio && s.attr('data-src-retina')) ||
                  s.attr('data-src') ||
                  s.attr('data-srcset');
              this._core.trigger('load', { element: s, url: n }, 'lazy'),
                s.is('img')
                  ? s
                      .one(
                        'load.owl.lazy',
                        a.proxy(function () {
                          s.css('opacity', 1),
                            this._core.trigger(
                              'loaded',
                              { element: s, url: n },
                              'lazy'
                            );
                        }, this)
                      )
                      .attr('src', n)
                  : s.is('source')
                  ? s
                      .one(
                        'load.owl.lazy',
                        a.proxy(function () {
                          this._core.trigger(
                            'loaded',
                            { element: s, url: n },
                            'lazy'
                          );
                        }, this)
                      )
                      .attr('srcset', n)
                  : (((i = new Image()).onload = a.proxy(function () {
                      s.css({
                        'background-image': 'url("' + n + '")',
                        opacity: '1',
                      }),
                        this._core.trigger(
                          'loaded',
                          { element: s, url: n },
                          'lazy'
                        );
                    }, this)),
                    (i.src = n));
            }, this)
          ),
          this._loaded.push(e.get(0)));
      }),
      (e.prototype.destroy = function () {
        var t, e;
        for (t in this.handlers) this._core.$element.off(t, this.handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          'function' != typeof this[e] && (this[e] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Lazy = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (r, i) {
    var s = function (t) {
      (this._core = t),
        (this._previousHeight = null),
        (this._handlers = {
          'initialized.owl.carousel refreshed.owl.carousel': r.proxy(function (
            t
          ) {
            t.namespace && this._core.settings.autoHeight && this.update();
          },
          this),
          'changed.owl.carousel': r.proxy(function (t) {
            t.namespace &&
              this._core.settings.autoHeight &&
              'position' === t.property.name &&
              this.update();
          }, this),
          'loaded.owl.lazy': r.proxy(function (t) {
            t.namespace &&
              this._core.settings.autoHeight &&
              t.element.closest('.' + this._core.settings.itemClass).index() ===
                this._core.current() &&
              this.update();
          }, this),
        }),
        (this._core.options = r.extend({}, s.Defaults, this._core.options)),
        this._core.$element.on(this._handlers),
        (this._intervalId = null);
      var e = this;
      r(i).on('load', function () {
        e._core.settings.autoHeight && e.update();
      }),
        r(i).resize(function () {
          e._core.settings.autoHeight &&
            (null != e._intervalId && clearTimeout(e._intervalId),
            (e._intervalId = setTimeout(function () {
              e.update();
            }, 250)));
        });
    };
    (s.Defaults = { autoHeight: !1, autoHeightClass: 'owl-height' }),
      (s.prototype.update = function () {
        var t = this._core._current,
          e = t + this._core.settings.items,
          i = this._core.settings.lazyLoad,
          s = this._core.$stage.children().toArray().slice(t, e),
          n = [],
          o = 0;
        r.each(s, function (t, e) {
          n.push(r(e).height());
        }),
          (o = Math.max.apply(null, n)) <= 1 &&
            i &&
            this._previousHeight &&
            (o = this._previousHeight),
          (this._previousHeight = o),
          this._core.$stage
            .parent()
            .height(o)
            .addClass(this._core.settings.autoHeightClass);
      }),
      (s.prototype.destroy = function () {
        var t, e;
        for (t in this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          'function' != typeof this[e] && (this[e] = null);
      }),
      (r.fn.owlCarousel.Constructor.Plugins.AutoHeight = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (c, e) {
    var i = function (t) {
      (this._core = t),
        (this._videos = {}),
        (this._playing = null),
        (this._handlers = {
          'initialized.owl.carousel': c.proxy(function (t) {
            t.namespace &&
              this._core.register({
                type: 'state',
                name: 'playing',
                tags: ['interacting'],
              });
          }, this),
          'resize.owl.carousel': c.proxy(function (t) {
            t.namespace &&
              this._core.settings.video &&
              this.isInFullScreen() &&
              t.preventDefault();
          }, this),
          'refreshed.owl.carousel': c.proxy(function (t) {
            t.namespace &&
              this._core.is('resizing') &&
              this._core.$stage.find('.cloned .owl-video-frame').remove();
          }, this),
          'changed.owl.carousel': c.proxy(function (t) {
            t.namespace &&
              'position' === t.property.name &&
              this._playing &&
              this.stop();
          }, this),
          'prepared.owl.carousel': c.proxy(function (t) {
            if (t.namespace) {
              var e = c(t.content).find('.owl-video');
              e.length &&
                (e.css('display', 'none'), this.fetch(e, c(t.content)));
            }
          }, this),
        }),
        (this._core.options = c.extend({}, i.Defaults, this._core.options)),
        this._core.$element.on(this._handlers),
        this._core.$element.on(
          'click.owl.video',
          '.owl-video-play-icon',
          c.proxy(function (t) {
            this.play(t);
          }, this)
        );
    };
    (i.Defaults = { video: !1, videoHeight: !1, videoWidth: !1 }),
      (i.prototype.fetch = function (t, e) {
        var i = t.attr('data-vimeo-id')
            ? 'vimeo'
            : t.attr('data-vzaar-id')
            ? 'vzaar'
            : 'youtube',
          s =
            t.attr('data-vimeo-id') ||
            t.attr('data-youtube-id') ||
            t.attr('data-vzaar-id'),
          n = t.attr('data-width') || this._core.settings.videoWidth,
          o = t.attr('data-height') || this._core.settings.videoHeight,
          r = t.attr('href');
        if (!r) throw new Error('Missing video URL.');
        if (
          -1 <
          (s = r.match(
            /(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|be\-nocookie\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/
          ))[3].indexOf('youtu')
        )
          i = 'youtube';
        else if (-1 < s[3].indexOf('vimeo')) i = 'vimeo';
        else {
          if (!(-1 < s[3].indexOf('vzaar')))
            throw new Error('Video URL not supported.');
          i = 'vzaar';
        }
        (s = s[6]),
          (this._videos[r] = { type: i, id: s, width: n, height: o }),
          e.attr('data-video', r),
          this.thumbnail(t, this._videos[r]);
      }),
      (i.prototype.thumbnail = function (e, t) {
        function i(t) {
          (s = l.lazyLoad
            ? c('<div/>', { class: 'owl-video-tn ' + h, srcType: t })
            : c('<div/>', {
                class: 'owl-video-tn',
                style: 'opacity:1;background-image:url(' + t + ')',
              })),
            e.after(s),
            e.after('<div class="owl-video-play-icon"></div>');
        }
        var s,
          n,
          o =
            t.width && t.height
              ? 'width:' + t.width + 'px;height:' + t.height + 'px;'
              : '',
          r = e.find('img'),
          a = 'src',
          h = '',
          l = this._core.settings;
        if (
          (e.wrap(c('<div/>', { class: 'owl-video-wrapper', style: o })),
          this._core.settings.lazyLoad && ((a = 'data-src'), (h = 'owl-lazy')),
          r.length)
        )
          return i(r.attr(a)), r.remove(), !1;
        'youtube' === t.type
          ? ((n = '//img.youtube.com/vi/' + t.id + '/hqdefault.jpg'), i(n))
          : 'vimeo' === t.type
          ? c.ajax({
              type: 'GET',
              url: '//vimeo.com/api/v2/video/' + t.id + '.json',
              jsonp: 'callback',
              dataType: 'jsonp',
              success: function (t) {
                (n = t[0].thumbnail_large), i(n);
              },
            })
          : 'vzaar' === t.type &&
            c.ajax({
              type: 'GET',
              url: '//vzaar.com/api/videos/' + t.id + '.json',
              jsonp: 'callback',
              dataType: 'jsonp',
              success: function (t) {
                (n = t.framegrab_url), i(n);
              },
            });
      }),
      (i.prototype.stop = function () {
        this._core.trigger('stop', null, 'video'),
          this._playing.find('.owl-video-frame').remove(),
          this._playing.removeClass('owl-video-playing'),
          (this._playing = null),
          this._core.leave('playing'),
          this._core.trigger('stopped', null, 'video');
      }),
      (i.prototype.play = function (t) {
        var e,
          i = c(t.target).closest('.' + this._core.settings.itemClass),
          s = this._videos[i.attr('data-video')],
          n = s.width || '100%',
          o = s.height || this._core.$stage.height();
        this._playing ||
          (this._core.enter('playing'),
          this._core.trigger('play', null, 'video'),
          (i = this._core.items(this._core.relative(i.index()))),
          this._core.reset(i.index()),
          (e = c(
            '<iframe frameborder="0" allowfullscreen mozallowfullscreen webkitAllowFullScreen ></iframe>'
          )).attr('height', o),
          e.attr('width', n),
          'youtube' === s.type
            ? e.attr(
                'src',
                '//www.youtube.com/embed/' +
                  s.id +
                  '?autoplay=1&rel=0&v=' +
                  s.id
              )
            : 'vimeo' === s.type
            ? e.attr('src', '//player.vimeo.com/video/' + s.id + '?autoplay=1')
            : 'vzaar' === s.type &&
              e.attr(
                'src',
                '//view.vzaar.com/' + s.id + '/player?autoplay=true'
              ),
          c(e)
            .wrap('<div class="owl-video-frame" />')
            .insertAfter(i.find('.owl-video')),
          (this._playing = i.addClass('owl-video-playing')));
      }),
      (i.prototype.isInFullScreen = function () {
        var t =
          e.fullscreenElement ||
          e.mozFullScreenElement ||
          e.webkitFullscreenElement;
        return t && c(t).parent().hasClass('owl-video-frame');
      }),
      (i.prototype.destroy = function () {
        var t, e;
        for (t in (this._core.$element.off('click.owl.video'), this._handlers))
          this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          'function' != typeof this[e] && (this[e] = null);
      }),
      (c.fn.owlCarousel.Constructor.Plugins.Video = i);
  })(window.Zepto || window.jQuery, (window, document)),
  (function (r) {
    var e = function (t) {
      (this.core = t),
        (this.core.options = r.extend({}, e.Defaults, this.core.options)),
        (this.swapping = !0),
        (this.previous = void 0),
        (this.next = void 0),
        (this.handlers = {
          'change.owl.carousel': r.proxy(function (t) {
            t.namespace &&
              'position' == t.property.name &&
              ((this.previous = this.core.current()),
              (this.next = t.property.value));
          }, this),
          'drag.owl.carousel dragged.owl.carousel translated.owl.carousel':
            r.proxy(function (t) {
              t.namespace && (this.swapping = 'translated' == t.type);
            }, this),
          'translate.owl.carousel': r.proxy(function (t) {
            t.namespace &&
              this.swapping &&
              (this.core.options.animateOut || this.core.options.animateIn) &&
              this.swap();
          }, this),
        }),
        this.core.$element.on(this.handlers);
    };
    (e.Defaults = { animateOut: !1, animateIn: !1 }),
      (e.prototype.swap = function () {
        if (
          1 === this.core.settings.items &&
          r.support.animation &&
          r.support.transition
        ) {
          this.core.speed(0);
          var t,
            e = r.proxy(this.clear, this),
            i = this.core.$stage.children().eq(this.previous),
            s = this.core.$stage.children().eq(this.next),
            n = this.core.settings.animateIn,
            o = this.core.settings.animateOut;
          this.core.current() !== this.previous &&
            (o &&
              ((t =
                this.core.coordinates(this.previous) -
                this.core.coordinates(this.next)),
              i
                .one(r.support.animation.end, e)
                .css({ left: t + 'px' })
                .addClass('animated owl-animated-out')
                .addClass(o)),
            n &&
              s
                .one(r.support.animation.end, e)
                .addClass('animated owl-animated-in')
                .addClass(n));
        }
      }),
      (e.prototype.clear = function (t) {
        r(t.target)
          .css({ left: '' })
          .removeClass('animated owl-animated-out owl-animated-in')
          .removeClass(this.core.settings.animateIn)
          .removeClass(this.core.settings.animateOut),
          this.core.onTransitionEnd();
      }),
      (e.prototype.destroy = function () {
        var t, e;
        for (t in this.handlers) this.core.$element.off(t, this.handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          'function' != typeof this[e] && (this[e] = null);
      }),
      (r.fn.owlCarousel.Constructor.Plugins.Animate = e);
  })(window.Zepto || window.jQuery, (window, document)),
  (function (s, n, e) {
    var i = function (t) {
      (this._core = t),
        (this._call = null),
        (this._time = 0),
        (this._timeout = 0),
        (this._paused = !0),
        (this._handlers = {
          'changed.owl.carousel': s.proxy(function (t) {
            t.namespace && 'settings' === t.property.name
              ? this._core.settings.autoplay
                ? this.play()
                : this.stop()
              : t.namespace &&
                'position' === t.property.name &&
                this._paused &&
                (this._time = 0);
          }, this),
          'initialized.owl.carousel': s.proxy(function (t) {
            t.namespace && this._core.settings.autoplay && this.play();
          }, this),
          'play.owl.autoplay': s.proxy(function (t, e, i) {
            t.namespace && this.play(e, i);
          }, this),
          'stop.owl.autoplay': s.proxy(function (t) {
            t.namespace && this.stop();
          }, this),
          'mouseover.owl.autoplay': s.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is('rotating') &&
              this.pause();
          }, this),
          'mouseleave.owl.autoplay': s.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is('rotating') &&
              this.play();
          }, this),
          'touchstart.owl.core': s.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is('rotating') &&
              this.pause();
          }, this),
          'touchend.owl.core': s.proxy(function () {
            this._core.settings.autoplayHoverPause && this.play();
          }, this),
        }),
        this._core.$element.on(this._handlers),
        (this._core.options = s.extend({}, i.Defaults, this._core.options));
    };
    (i.Defaults = {
      autoplay: !1,
      autoplayTimeout: 5e3,
      autoplayHoverPause: !1,
      autoplaySpeed: !1,
    }),
      (i.prototype._next = function (t) {
        (this._call = n.setTimeout(
          s.proxy(this._next, this, t),
          this._timeout * (Math.round(this.read() / this._timeout) + 1) -
            this.read()
        )),
          this._core.is('interacting') ||
            e.hidden ||
            this._core.next(t || this._core.settings.autoplaySpeed);
      }),
      (i.prototype.read = function () {
        return new Date().getTime() - this._time;
      }),
      (i.prototype.play = function (t, e) {
        var i;
        this._core.is('rotating') || this._core.enter('rotating'),
          (t = t || this._core.settings.autoplayTimeout),
          (i = Math.min(this._time % (this._timeout || t), t)),
          this._paused
            ? ((this._time = this.read()), (this._paused = !1))
            : n.clearTimeout(this._call),
          (this._time += (this.read() % t) - i),
          (this._timeout = t),
          (this._call = n.setTimeout(s.proxy(this._next, this, e), t - i));
      }),
      (i.prototype.stop = function () {
        this._core.is('rotating') &&
          ((this._time = 0),
          (this._paused = !0),
          n.clearTimeout(this._call),
          this._core.leave('rotating'));
      }),
      (i.prototype.pause = function () {
        this._core.is('rotating') &&
          !this._paused &&
          ((this._time = this.read()),
          (this._paused = !0),
          n.clearTimeout(this._call));
      }),
      (i.prototype.destroy = function () {
        var t, e;
        for (t in (this.stop(), this._handlers))
          this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          'function' != typeof this[e] && (this[e] = null);
      }),
      (s.fn.owlCarousel.Constructor.Plugins.autoplay = i);
  })(window.Zepto || window.jQuery, window, document),
  (function (o) {
    'use strict';
    var e = function (t) {
      (this._core = t),
        (this._initialized = !1),
        (this._pages = []),
        (this._controls = {}),
        (this._templates = []),
        (this.$element = this._core.$element),
        (this._overrides = {
          next: this._core.next,
          prev: this._core.prev,
          to: this._core.to,
        }),
        (this._handlers = {
          'prepared.owl.carousel': o.proxy(function (t) {
            t.namespace &&
              this._core.settings.dotsData &&
              this._templates.push(
                '<div class="' +
                  this._core.settings.dotClass +
                  '">' +
                  o(t.content)
                    .find('[data-dot]')
                    .addBack('[data-dot]')
                    .attr('data-dot') +
                  '</div>'
              );
          }, this),
          'added.owl.carousel': o.proxy(function (t) {
            t.namespace &&
              this._core.settings.dotsData &&
              this._templates.splice(t.position, 0, this._templates.pop());
          }, this),
          'remove.owl.carousel': o.proxy(function (t) {
            t.namespace &&
              this._core.settings.dotsData &&
              this._templates.splice(t.position, 1);
          }, this),
          'changed.owl.carousel': o.proxy(function (t) {
            t.namespace && 'position' == t.property.name && this.draw();
          }, this),
          'initialized.owl.carousel': o.proxy(function (t) {
            t.namespace &&
              !this._initialized &&
              (this._core.trigger('initialize', null, 'navigation'),
              this.initialize(),
              this.update(),
              this.draw(),
              (this._initialized = !0),
              this._core.trigger('initialized', null, 'navigation'));
          }, this),
          'refreshed.owl.carousel': o.proxy(function (t) {
            t.namespace &&
              this._initialized &&
              (this._core.trigger('refresh', null, 'navigation'),
              this.update(),
              this.draw(),
              this._core.trigger('refreshed', null, 'navigation'));
          }, this),
        }),
        (this._core.options = o.extend({}, e.Defaults, this._core.options)),
        this.$element.on(this._handlers);
    };
    (e.Defaults = {
      nav: !1,
      navText: [
        '<span aria-label="Previous">&#x2039;</span>',
        '<span aria-label="Next">&#x203a;</span>',
      ],
      navSpeed: !1,
      navElement: 'button type="button" role="presentation"',
      navContainer: !1,
      navContainerClass: 'owl-nav',
      navClass: ['owl-prev', 'owl-next'],
      slideBy: 1,
      dotClass: 'owl-dot',
      dotsClass: 'owl-dots',
      dots: !0,
      dotsEach: !1,
      dotsData: !1,
      dotsSpeed: !1,
      dotsContainer: !1,
    }),
      (e.prototype.initialize = function () {
        var t,
          i = this._core.settings;
        for (t in ((this._controls.$relative = (
          i.navContainer
            ? o(i.navContainer)
            : o('<div>').addClass(i.navContainerClass).appendTo(this.$element)
        ).addClass('disabled')),
        (this._controls.$previous = o('<' + i.navElement + '>')
          .addClass(i.navClass[0])
          .html(i.navText[0])
          .prependTo(this._controls.$relative)
          .on(
            'click',
            o.proxy(function (t) {
              this.prev(i.navSpeed);
            }, this)
          )),
        (this._controls.$next = o('<' + i.navElement + '>')
          .addClass(i.navClass[1])
          .html(i.navText[1])
          .appendTo(this._controls.$relative)
          .on(
            'click',
            o.proxy(function (t) {
              this.next(i.navSpeed);
            }, this)
          )),
        i.dotsData ||
          (this._templates = [
            o('<button role="button">')
              .addClass(i.dotClass)
              .append(o('<span>'))
              .prop('outerHTML'),
          ]),
        (this._controls.$absolute = (
          i.dotsContainer
            ? o(i.dotsContainer)
            : o('<div>').addClass(i.dotsClass).appendTo(this.$element)
        ).addClass('disabled')),
        this._controls.$absolute.on(
          'click',
          'button',
          o.proxy(function (t) {
            var e = o(t.target).parent().is(this._controls.$absolute)
              ? o(t.target).index()
              : o(t.target).parent().index();
            t.preventDefault(), this.to(e, i.dotsSpeed);
          }, this)
        ),
        this._overrides))
          this._core[t] = o.proxy(this[t], this);
      }),
      (e.prototype.destroy = function () {
        var t, e, i, s, n;
        for (t in ((n = this._core.settings), this._handlers))
          this.$element.off(t, this._handlers[t]);
        for (e in this._controls)
          '$relative' === e && n.navContainer
            ? this._controls[e].html('')
            : this._controls[e].remove();
        for (s in this.overides) this._core[s] = this._overrides[s];
        for (i in Object.getOwnPropertyNames(this))
          'function' != typeof this[i] && (this[i] = null);
      }),
      (e.prototype.update = function () {
        var t,
          e,
          i = this._core.clones().length / 2,
          s = i + this._core.items().length,
          n = this._core.maximum(!0),
          o = this._core.settings,
          r = o.center || o.autoWidth || o.dotsData ? 1 : o.dotsEach || o.items;
        if (
          ('page' !== o.slideBy && (o.slideBy = Math.min(o.slideBy, o.items)),
          o.dots || 'page' == o.slideBy)
        )
          for (this._pages = [], t = i, e = 0; t < s; t++) {
            if (r <= e || 0 === e) {
              if (
                (this._pages.push({
                  start: Math.min(n, t - i),
                  end: t - i + r - 1,
                }),
                Math.min(n, t - i) === n)
              )
                break;
              (e = 0), 0;
            }
            e += this._core.mergers(this._core.relative(t));
          }
      }),
      (e.prototype.draw = function () {
        var t,
          e = this._core.settings,
          i = this._core.items().length <= e.items,
          s = this._core.relative(this._core.current()),
          n = e.loop || e.rewind;
        this._controls.$relative.toggleClass('disabled', !e.nav || i),
          e.nav &&
            (this._controls.$previous.toggleClass(
              'disabled',
              !n && s <= this._core.minimum(!0)
            ),
            this._controls.$next.toggleClass(
              'disabled',
              !n && s >= this._core.maximum(!0)
            )),
          this._controls.$absolute.toggleClass('disabled', !e.dots || i),
          e.dots &&
            ((t =
              this._pages.length - this._controls.$absolute.children().length),
            e.dotsData && 0 != t
              ? this._controls.$absolute.html(this._templates.join(''))
              : 0 < t
              ? this._controls.$absolute.append(
                  new Array(1 + t).join(this._templates[0])
                )
              : t < 0 && this._controls.$absolute.children().slice(t).remove(),
            this._controls.$absolute.find('.active').removeClass('active'),
            this._controls.$absolute
              .children()
              .eq(o.inArray(this.current(), this._pages))
              .addClass('active'));
      }),
      (e.prototype.onTrigger = function (t) {
        var e = this._core.settings;
        t.page = {
          index: o.inArray(this.current(), this._pages),
          count: this._pages.length,
          size:
            e &&
            (e.center || e.autoWidth || e.dotsData ? 1 : e.dotsEach || e.items),
        };
      }),
      (e.prototype.current = function () {
        var i = this._core.relative(this._core.current());
        return o
          .grep(
            this._pages,
            o.proxy(function (t, e) {
              return t.start <= i && t.end >= i;
            }, this)
          )
          .pop();
      }),
      (e.prototype.getPosition = function (t) {
        var e,
          i,
          s = this._core.settings;
        return (
          'page' == s.slideBy
            ? ((e = o.inArray(this.current(), this._pages)),
              (i = this._pages.length),
              t ? ++e : --e,
              (e = this._pages[((e % i) + i) % i].start))
            : ((e = this._core.relative(this._core.current())),
              (i = this._core.items().length),
              t ? (e += s.slideBy) : (e -= s.slideBy)),
          e
        );
      }),
      (e.prototype.next = function (t) {
        o.proxy(this._overrides.to, this._core)(this.getPosition(!0), t);
      }),
      (e.prototype.prev = function (t) {
        o.proxy(this._overrides.to, this._core)(this.getPosition(!1), t);
      }),
      (e.prototype.to = function (t, e, i) {
        var s;
        !i && this._pages.length
          ? ((s = this._pages.length),
            o.proxy(this._overrides.to, this._core)(
              this._pages[((t % s) + s) % s].start,
              e
            ))
          : o.proxy(this._overrides.to, this._core)(t, e);
      }),
      (o.fn.owlCarousel.Constructor.Plugins.Navigation = e);
  })(window.Zepto || window.jQuery, (window, document)),
  (function (s, n) {
    'use strict';
    var e = function (t) {
      (this._core = t),
        (this._hashes = {}),
        (this.$element = this._core.$element),
        (this._handlers = {
          'initialized.owl.carousel': s.proxy(function (t) {
            t.namespace &&
              'URLHash' === this._core.settings.startPosition &&
              s(n).trigger('hashchange.owl.navigation');
          }, this),
          'prepared.owl.carousel': s.proxy(function (t) {
            if (t.namespace) {
              var e = s(t.content)
                .find('[data-hash]')
                .addBack('[data-hash]')
                .attr('data-hash');
              if (!e) return;
              this._hashes[e] = t.content;
            }
          }, this),
          'changed.owl.carousel': s.proxy(function (t) {
            if (t.namespace && 'position' === t.property.name) {
              var i = this._core.items(
                  this._core.relative(this._core.current())
                ),
                e = s
                  .map(this._hashes, function (t, e) {
                    return t === i ? e : null;
                  })
                  .join();
              if (!e || n.location.hash.slice(1) === e) return;
              n.location.hash = e;
            }
          }, this),
        }),
        (this._core.options = s.extend({}, e.Defaults, this._core.options)),
        this.$element.on(this._handlers),
        s(n).on(
          'hashchange.owl.navigation',
          s.proxy(function (t) {
            var e = n.location.hash.substring(1),
              i = this._core.$stage.children(),
              s = this._hashes[e] && i.index(this._hashes[e]);
            void 0 !== s &&
              s !== this._core.current() &&
              this._core.to(this._core.relative(s), !1, !0);
          }, this)
        );
    };
    (e.Defaults = { URLhashListener: !1 }),
      (e.prototype.destroy = function () {
        var t, e;
        for (t in (s(n).off('hashchange.owl.navigation'), this._handlers))
          this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          'function' != typeof this[e] && (this[e] = null);
      }),
      (s.fn.owlCarousel.Constructor.Plugins.Hash = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (n, o) {
    function e(t, i) {
      var s = !1,
        e = t.charAt(0).toUpperCase() + t.slice(1);
      return (
        n.each((t + ' ' + a.join(e + ' ') + e).split(' '), function (t, e) {
          if (r[e] !== o) return (s = !i || e), !1;
        }),
        s
      );
    }
    function t(t) {
      return e(t, !0);
    }
    var r = n('<support>').get(0).style,
      a = 'Webkit Moz O ms'.split(' '),
      i = {
        transition: {
          end: {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd',
            transition: 'transitionend',
          },
        },
        animation: {
          end: {
            WebkitAnimation: 'webkitAnimationEnd',
            MozAnimation: 'animationend',
            OAnimation: 'oAnimationEnd',
            animation: 'animationend',
          },
        },
      },
      s = function () {
        return !!e('transform');
      },
      h = function () {
        return !!e('perspective');
      },
      l = function () {
        return !!e('animation');
      };
    !(function () {
      return !!e('transition');
    })() ||
      ((n.support.transition = new String(t('transition'))),
      (n.support.transition.end = i.transition.end[n.support.transition])),
      l() &&
        ((n.support.animation = new String(t('animation'))),
        (n.support.animation.end = i.animation.end[n.support.animation])),
      s() &&
        ((n.support.transform = new String(t('transform'))),
        (n.support.transform3d = h()));
  })(window.Zepto || window.jQuery, (window, void document));
!(function (e, t) {
  'function' == typeof define && define.amd
    ? define(t)
    : 'object' == typeof exports
    ? (module.exports = t())
    : (e.PhotoSwipeUI_Default = t());
})(this, function () {
  'use strict';
  return function (l, s) {
    function e(e) {
      if (S) return !0;
      (e = e || window.event), x.timeToIdle && x.mouseUsed && !_ && A();
      for (
        var t,
          n,
          o = (e.target || e.srcElement).getAttribute('class') || '',
          l = 0;
        l < U.length;
        l++
      )
        (t = U[l]).onTap &&
          -1 < o.indexOf('pswp__' + t.name) &&
          (t.onTap(), (n = !0));
      if (n) {
        e.stopPropagation && e.stopPropagation(), (S = !0);
        var r = s.features.isOldAndroid ? 600 : 30;
        setTimeout(function () {
          S = !1;
        }, r);
      }
    }
    function n(e, t, n) {
      s[(n ? 'add' : 'remove') + 'Class'](e, 'pswp__' + t);
    }
    function o() {
      var e = 1 === x.getNumItemsFn();
      e !== F && (n(m, 'ui--one-slide', e), (F = e));
    }
    function t() {
      n(v, 'share-modal--hidden', y);
    }
    function r() {
      return (
        (y = !y)
          ? (s.removeClass(v, 'pswp__share-modal--fade-in'),
            setTimeout(function () {
              y && t();
            }, 300))
          : (t(),
            setTimeout(function () {
              y || s.addClass(v, 'pswp__share-modal--fade-in');
            }, 30)),
        y || M(),
        0
      );
    }
    function i(e) {
      var t = (e = e || window.event).target || e.srcElement;
      return (
        l.shout('shareLinkClick', e, t),
        !(
          !t.href ||
          (!t.hasAttribute('download') &&
            (window.open(
              t.href,
              'pswp_share',
              'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420,top=100,left=' +
                (window.screen ? Math.round(screen.width / 2 - 275) : 100)
            ),
            y || r(),
            1))
        )
      );
    }
    function a(e) {
      for (var t = 0; t < x.closeElClasses.length; t++)
        if (s.hasClass(e, 'pswp__' + x.closeElClasses[t])) return !0;
    }
    function u(e) {
      var t = (e = e || window.event).relatedTarget || e.toElement;
      (t && 'HTML' !== t.nodeName) ||
        (clearTimeout(K),
        (K = setTimeout(function () {
          L.setIdle(!0);
        }, x.timeToIdleOutside)));
    }
    function c(e) {
      var t = e.vGap;
      if (
        !l.likelyTouchDevice ||
        x.mouseUsed ||
        screen.width > x.fitControlsWidth
      ) {
        var n = x.barsSize;
        if (x.captionEl && 'auto' === n.bottom)
          if (
            (h ||
              ((h = s.createEl(
                'pswp__caption pswp__caption--fake'
              )).appendChild(s.createEl('pswp__caption__center')),
              m.insertBefore(h, f),
              s.addClass(m, 'pswp__ui--fit')),
            x.addCaptionHTMLFn(e, h, !0))
          ) {
            var o = h.clientHeight;
            t.bottom = parseInt(o, 10) || 44;
          } else t.bottom = n.top;
        else t.bottom = 'auto' === n.bottom ? 0 : n.bottom;
        t.top = n.top;
      } else t.top = t.bottom = 0;
    }
    function p() {
      function e(e) {
        if (e)
          for (var t = e.length, n = 0; n < t; n++) {
            (l = e[n]), (r = l.className);
            for (var o = 0; o < U.length; o++)
              (i = U[o]),
                -1 < r.indexOf('pswp__' + i.name) &&
                  (x[i.option]
                    ? (s.removeClass(l, 'pswp__element--disabled'),
                      i.onInit && i.onInit(l))
                    : s.addClass(l, 'pswp__element--disabled'));
          }
      }
      var l, r, i;
      e(m.children);
      var t = s.getChildByClass(m, 'pswp__top-bar');
      t && e(t.children);
    }
    var d,
      m,
      f,
      h,
      w,
      g,
      v,
      b,
      _,
      C,
      T,
      I,
      E,
      F,
      x,
      S,
      k,
      K,
      L = this,
      O = !1,
      R = !0,
      y = !0,
      z = {
        barsSize: { top: 44, bottom: 'auto' },
        closeElClasses: ['item', 'caption', 'zoom-wrap', 'ui', 'top-bar'],
        timeToIdle: 4e3,
        timeToIdleOutside: 1e3,
        loadingIndicatorDelay: 1e3,
        addCaptionHTMLFn: function (e, t) {
          return e.title
            ? ((t.children[0].innerHTML = e.title), !0)
            : ((t.children[0].innerHTML = ''), !1);
        },
        closeEl: !0,
        captionEl: !0,
        fullscreenEl: !0,
        zoomEl: !0,
        shareEl: !0,
        counterEl: !0,
        arrowEl: !0,
        preloaderEl: !0,
        tapToClose: !1,
        tapToToggleControls: !0,
        clickToCloseNonZoomable: !0,
        shareButtons: [
          {
            id: 'facebook',
            label: 'Share on Facebook',
            url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}',
          },
          {
            id: 'twitter',
            label: 'Tweet',
            url: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}',
          },
          {
            id: 'pinterest',
            label: 'Pin it',
            url: 'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}',
          },
          {
            id: 'download',
            label: 'Download image',
            url: '{{raw_image_url}}',
            download: !0,
          },
        ],
        getImageURLForShare: function () {
          return l.currItem.src || '';
        },
        getPageURLForShare: function () {
          return window.location.href;
        },
        getTextForShare: function () {
          return l.currItem.title || '';
        },
        indexIndicatorSep: ' / ',
        fitControlsWidth: 1200,
      },
      M = function () {
        for (var e, t, n, o, l = '', r = 0; r < x.shareButtons.length; r++)
          (e = x.shareButtons[r]),
            (t = x.getImageURLForShare(e)),
            (n = x.getPageURLForShare(e)),
            (o = x.getTextForShare(e)),
            (l +=
              '<a href="' +
              e.url
                .replace('{{url}}', encodeURIComponent(n))
                .replace('{{image_url}}', encodeURIComponent(t))
                .replace('{{raw_image_url}}', t)
                .replace('{{text}}', encodeURIComponent(o)) +
              '" target="_blank" class="pswp__share--' +
              e.id +
              '"' +
              (e.download ? 'download' : '') +
              '>' +
              e.label +
              '</a>'),
            x.parseShareButtonOut && (l = x.parseShareButtonOut(e, l));
        (v.children[0].innerHTML = l), (v.children[0].onclick = i);
      },
      D = 0,
      A = function () {
        clearTimeout(K), (D = 0), _ && L.setIdle(!1);
      },
      P = function (e) {
        I !== e && (n(T, 'preloader--active', !e), (I = e));
      },
      U = [
        {
          name: 'caption',
          option: 'captionEl',
          onInit: function (e) {
            f = e;
          },
        },
        {
          name: 'share-modal',
          option: 'shareEl',
          onInit: function (e) {
            v = e;
          },
          onTap: function () {
            r();
          },
        },
        {
          name: 'button--share',
          option: 'shareEl',
          onInit: function (e) {
            g = e;
          },
          onTap: function () {
            r();
          },
        },
        { name: 'button--zoom', option: 'zoomEl', onTap: l.toggleDesktopZoom },
        {
          name: 'counter',
          option: 'counterEl',
          onInit: function (e) {
            w = e;
          },
        },
        { name: 'button--close', option: 'closeEl', onTap: l.close },
        { name: 'button--arrow--left', option: 'arrowEl', onTap: l.prev },
        { name: 'button--arrow--right', option: 'arrowEl', onTap: l.next },
        {
          name: 'button--fs',
          option: 'fullscreenEl',
          onTap: function () {
            d.isFullscreen() ? d.exit() : d.enter();
          },
        },
        {
          name: 'preloader',
          option: 'preloaderEl',
          onInit: function (e) {
            T = e;
          },
        },
      ];
    (L.init = function () {
      var t;
      s.extend(l.options, z, !0),
        (x = l.options),
        (m = s.getChildByClass(l.scrollWrap, 'pswp__ui')),
        (C = l.listen)('onVerticalDrag', function (e) {
          R && e < 0.95
            ? L.hideControls()
            : !R && 0.95 <= e && L.showControls();
        }),
        C('onPinchClose', function (e) {
          R && e < 0.9
            ? (L.hideControls(), (t = !0))
            : t && !R && 0.9 < e && L.showControls();
        }),
        C('zoomGestureEnded', function () {
          (t = !1) && !R && L.showControls();
        }),
        C('beforeChange', L.update),
        C('doubleTap', function (e) {
          var t = l.currItem.initialZoomLevel;
          l.getZoomLevel() !== t
            ? l.zoomTo(t, e, 333)
            : l.zoomTo(x.getDoubleTapZoom(!1, l.currItem), e, 333);
        }),
        C('preventDragEvent', function (e, t, n) {
          var o = e.target || e.srcElement;
          o &&
            o.getAttribute('class') &&
            -1 < e.type.indexOf('mouse') &&
            (0 < o.getAttribute('class').indexOf('__caption') ||
              /(SMALL|STRONG|EM)/i.test(o.tagName)) &&
            (n.prevent = !1);
        }),
        C('bindEvents', function () {
          s.bind(m, 'pswpTap click', e),
            s.bind(l.scrollWrap, 'pswpTap', L.onGlobalTap),
            l.likelyTouchDevice ||
              s.bind(l.scrollWrap, 'mouseover', L.onMouseOver);
        }),
        C('unbindEvents', function () {
          y || r(),
            k && clearInterval(k),
            s.unbind(document, 'mouseout', u),
            s.unbind(document, 'mousemove', A),
            s.unbind(m, 'pswpTap click', e),
            s.unbind(l.scrollWrap, 'pswpTap', L.onGlobalTap),
            s.unbind(l.scrollWrap, 'mouseover', L.onMouseOver),
            d &&
              (s.unbind(document, d.eventK, L.updateFullscreen),
              d.isFullscreen() && ((x.hideAnimationDuration = 0), d.exit()),
              (d = null));
        }),
        C('destroy', function () {
          x.captionEl &&
            (h && m.removeChild(h), s.removeClass(f, 'pswp__caption--empty')),
            v && (v.children[0].onclick = null),
            s.removeClass(m, 'pswp__ui--over-close'),
            s.addClass(m, 'pswp__ui--hidden'),
            L.setIdle(!1);
        }),
        x.showAnimationDuration || s.removeClass(m, 'pswp__ui--hidden'),
        C('initialZoomIn', function () {
          x.showAnimationDuration && s.removeClass(m, 'pswp__ui--hidden');
        }),
        C('initialZoomOut', function () {
          s.addClass(m, 'pswp__ui--hidden');
        }),
        C('parseVerticalMargin', c),
        p(),
        x.shareEl && g && v && (y = !0),
        o(),
        x.timeToIdle &&
          C('mouseUsed', function () {
            s.bind(document, 'mousemove', A),
              s.bind(document, 'mouseout', u),
              (k = setInterval(function () {
                2 === ++D && L.setIdle(!0);
              }, x.timeToIdle / 2));
          }),
        x.fullscreenEl &&
          !s.features.isOldAndroid &&
          ((d = d || L.getFullscreenAPI())
            ? (s.bind(document, d.eventK, L.updateFullscreen),
              L.updateFullscreen(),
              s.addClass(l.template, 'pswp--supports-fs'))
            : s.removeClass(l.template, 'pswp--supports-fs')),
        x.preloaderEl &&
          (P(!0),
          C('beforeChange', function () {
            clearTimeout(E),
              (E = setTimeout(function () {
                l.currItem && l.currItem.loading
                  ? (l.allowProgressiveImg() &&
                      (!l.currItem.img || l.currItem.img.naturalWidth)) ||
                    P(!1)
                  : P(!0);
              }, x.loadingIndicatorDelay));
          }),
          C('imageLoadComplete', function (e, t) {
            l.currItem === t && P(!0);
          }));
    }),
      (L.setIdle = function (e) {
        n(m, 'ui--idle', (_ = e));
      }),
      (L.update = function () {
        (O =
          !(!R || !l.currItem) &&
          (L.updateIndexIndicator(),
          x.captionEl &&
            (x.addCaptionHTMLFn(l.currItem, f),
            n(f, 'caption--empty', !l.currItem.title)),
          !0)),
          y || r(),
          o();
      }),
      (L.updateFullscreen = function (e) {
        e &&
          setTimeout(function () {
            l.setScrollOffset(0, s.getScrollY());
          }, 50),
          s[(d.isFullscreen() ? 'add' : 'remove') + 'Class'](
            l.template,
            'pswp--fs'
          );
      }),
      (L.updateIndexIndicator = function () {
        x.counterEl &&
          (w.innerHTML =
            l.getCurrentIndex() + 1 + x.indexIndicatorSep + x.getNumItemsFn());
      }),
      (L.onGlobalTap = function (e) {
        var t = (e = e || window.event).target || e.srcElement;
        if (!S)
          if (e.detail && 'mouse' === e.detail.pointerType) {
            if (a(t)) return void l.close();
            s.hasClass(t, 'pswp__img') &&
              (1 === l.getZoomLevel() && l.getZoomLevel() <= l.currItem.fitRatio
                ? x.clickToCloseNonZoomable && l.close()
                : l.toggleDesktopZoom(e.detail.releasePoint));
          } else if (
            (x.tapToToggleControls && (R ? L.hideControls() : L.showControls()),
            x.tapToClose && (s.hasClass(t, 'pswp__img') || a(t)))
          )
            return void l.close();
      }),
      (L.onMouseOver = function (e) {
        var t = (e = e || window.event).target || e.srcElement;
        n(m, 'ui--over-close', a(t));
      }),
      (L.hideControls = function () {
        s.addClass(m, 'pswp__ui--hidden'), (R = !1);
      }),
      (L.showControls = function () {
        (R = !0), O || L.update(), s.removeClass(m, 'pswp__ui--hidden');
      }),
      (L.supportsFullscreen = function () {
        var e = document;
        return !!(
          e.exitFullscreen ||
          e.mozCancelFullScreen ||
          e.webkitExitFullscreen ||
          e.msExitFullscreen
        );
      }),
      (L.getFullscreenAPI = function () {
        var e,
          t = document.documentElement,
          n = 'fullscreenchange';
        return (
          t.requestFullscreen
            ? (e = {
                enterK: 'requestFullscreen',
                exitK: 'exitFullscreen',
                elementK: 'fullscreenElement',
                eventK: n,
              })
            : t.mozRequestFullScreen
            ? (e = {
                enterK: 'mozRequestFullScreen',
                exitK: 'mozCancelFullScreen',
                elementK: 'mozFullScreenElement',
                eventK: 'moz' + n,
              })
            : t.webkitRequestFullscreen
            ? (e = {
                enterK: 'webkitRequestFullscreen',
                exitK: 'webkitExitFullscreen',
                elementK: 'webkitFullscreenElement',
                eventK: 'webkit' + n,
              })
            : t.msRequestFullscreen &&
              (e = {
                enterK: 'msRequestFullscreen',
                exitK: 'msExitFullscreen',
                elementK: 'msFullscreenElement',
                eventK: 'MSFullscreenChange',
              }),
          e &&
            ((e.enter = function () {
              return (
                (b = x.closeOnScroll),
                (x.closeOnScroll = !1),
                'webkitRequestFullscreen' !== this.enterK
                  ? l.template[this.enterK]()
                  : void l.template[this.enterK](Element.ALLOW_KEYBOARD_INPUT)
              );
            }),
            (e.exit = function () {
              return (x.closeOnScroll = b), document[this.exitK]();
            }),
            (e.isFullscreen = function () {
              return document[this.elementK];
            })),
          e
        );
      });
  };
});
!(function (e, t) {
  'function' == typeof define && define.amd
    ? define(t)
    : 'object' == typeof exports
    ? (module.exports = t())
    : (e.PhotoSwipe = t());
})(this, function () {
  'use strict';
  return function (m, i, e, t) {
    var f = {
      features: null,
      bind: function (e, t, n, i) {
        var o = (i ? 'remove' : 'add') + 'EventListener';
        t = t.split(' ');
        for (var a = 0; a < t.length; a++) t[a] && e[o](t[a], n, !1);
      },
      isArray: function (e) {
        return e instanceof Array;
      },
      createEl: function (e, t) {
        var n = document.createElement(t || 'div');
        return e && (n.className = e), n;
      },
      getScrollY: function () {
        var e = window.pageYOffset;
        return void 0 !== e ? e : document.documentElement.scrollTop;
      },
      unbind: function (e, t, n) {
        f.bind(e, t, n, !0);
      },
      removeClass: function (e, t) {
        var n = new RegExp('(\\s|^)' + t + '(\\s|$)');
        e.className = e.className
          .replace(n, ' ')
          .replace(/^\s\s*/, '')
          .replace(/\s\s*$/, '');
      },
      addClass: function (e, t) {
        f.hasClass(e, t) || (e.className += (e.className ? ' ' : '') + t);
      },
      hasClass: function (e, t) {
        return (
          e.className && new RegExp('(^|\\s)' + t + '(\\s|$)').test(e.className)
        );
      },
      getChildByClass: function (e, t) {
        for (var n = e.firstChild; n; ) {
          if (f.hasClass(n, t)) return n;
          n = n.nextSibling;
        }
      },
      arraySearch: function (e, t, n) {
        for (var i = e.length; i--; ) if (e[i][n] === t) return i;
        return -1;
      },
      extend: function (e, t, n) {
        for (var i in t)
          if (t.hasOwnProperty(i)) {
            if (n && e.hasOwnProperty(i)) continue;
            e[i] = t[i];
          }
      },
      easing: {
        sine: {
          out: function (e) {
            return Math.sin(e * (Math.PI / 2));
          },
          inOut: function (e) {
            return -(Math.cos(Math.PI * e) - 1) / 2;
          },
        },
        cubic: {
          out: function (e) {
            return --e * e * e + 1;
          },
        },
      },
      detectFeatures: function () {
        if (f.features) return f.features;
        var e = f.createEl().style,
          t = '',
          n = {};
        if (
          ((n.oldIE = document.all && !document.addEventListener),
          (n.touch = 'ontouchstart' in window),
          window.requestAnimationFrame &&
            ((n.raf = window.requestAnimationFrame),
            (n.caf = window.cancelAnimationFrame)),
          (n.pointerEvent =
            !!window.PointerEvent || navigator.msPointerEnabled),
          !n.pointerEvent)
        ) {
          var i = navigator.userAgent;
          if (/iP(hone|od)/.test(navigator.platform)) {
            var o = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
            o &&
              0 < o.length &&
              1 <= (o = parseInt(o[1], 10)) &&
              o < 8 &&
              (n.isOldIOSPhone = !0);
          }
          var a = i.match(/Android\s([0-9\.]*)/),
            r = a ? a[1] : 0;
          1 <= (r = parseFloat(r)) &&
            (r < 4.4 && (n.isOldAndroid = !0), (n.androidVersion = r)),
            (n.isMobileOpera = /opera mini|opera mobi/i.test(i));
        }
        for (
          var l,
            s,
            u = ['transform', 'perspective', 'animationName'],
            c = ['', 'webkit', 'Moz', 'ms', 'O'],
            d = 0;
          d < 4;
          d++
        ) {
          t = c[d];
          for (var p = 0; p < 3; p++)
            (l = u[p]),
              (s = t + (t ? l.charAt(0).toUpperCase() + l.slice(1) : l)),
              !n[l] && s in e && (n[l] = s);
          t &&
            !n.raf &&
            ((t = t.toLowerCase()),
            (n.raf = window[t + 'RequestAnimationFrame']),
            n.raf &&
              (n.caf =
                window[t + 'CancelAnimationFrame'] ||
                window[t + 'CancelRequestAnimationFrame']));
        }
        if (!n.raf) {
          var m = 0;
          (n.raf = function (e) {
            var t = new Date().getTime(),
              n = Math.max(0, 16 - (t - m)),
              i = window.setTimeout(function () {
                e(t + n);
              }, n);
            return (m = t + n), i;
          }),
            (n.caf = function (e) {
              clearTimeout(e);
            });
        }
        return (
          (n.svg =
            !!document.createElementNS &&
            !!document.createElementNS('http://www.w3.org/2000/svg', 'svg')
              .createSVGRect),
          (f.features = n)
        );
      },
    };
    f.detectFeatures(),
      f.features.oldIE &&
        (f.bind = function (e, t, n, i) {
          t = t.split(' ');
          for (
            var o,
              a = (i ? 'detach' : 'attach') + 'Event',
              r = function () {
                n.handleEvent.call(n);
              },
              l = 0;
            l < t.length;
            l++
          )
            if ((o = t[l]))
              if ('object' == typeof n && n.handleEvent) {
                if (i) {
                  if (!n['oldIE' + o]) return !1;
                } else n['oldIE' + o] = r;
                e[a]('on' + o, n['oldIE' + o]);
              } else e[a]('on' + o, n);
        });
    var h = this,
      y = {
        allowPanToNext: !0,
        spacing: 0.12,
        bgOpacity: 1,
        mouseUsed: !1,
        loop: !0,
        pinchToClose: !0,
        closeOnScroll: !0,
        closeOnVerticalDrag: !0,
        verticalDragRange: 0.75,
        hideAnimationDuration: 333,
        showAnimationDuration: 333,
        showHideOpacity: !1,
        focus: !0,
        escKey: !0,
        arrowKeys: !0,
        mainScrollEndFriction: 0.35,
        panEndFriction: 0.35,
        isClickableElement: function (e) {
          return 'A' === e.tagName;
        },
        getDoubleTapZoom: function (e, t) {
          return e || t.initialZoomLevel < 0.7 ? 1 : 1.33;
        },
        maxSpreadZoom: 1.33,
        modal: !0,
        scaleMode: 'fit',
      };
    f.extend(y, t);
    function n() {
      return { x: 0, y: 0 };
    }
    function o(e, t) {
      f.extend(h, t.publicMethods), je.push(e);
    }
    function s(e) {
      var t = Vt();
      return t - 1 < e ? e - t : e < 0 ? t + e : e;
    }
    function a(e, t) {
      return et[e] || (et[e] = []), et[e].push(t);
    }
    function v(e) {
      var t = et[e];
      if (t) {
        var n = Array.prototype.slice.call(arguments);
        n.shift();
        for (var i = 0; i < t.length; i++) t[i].apply(h, n);
      }
    }
    function c() {
      return new Date().getTime();
    }
    function x(e) {
      (Ne = e), (h.bg.style.opacity = e * y.bgOpacity);
    }
    function r(e, t, n, i, o) {
      (!Qe || (o && o !== h.currItem)) &&
        (i /= o ? o.fitRatio : h.currItem.fitRatio),
        (e[le] = j + t + 'px, ' + n + 'px' + J + ' scale(' + i + ')');
    }
    function d(e, t) {
      if (!y.loop && t) {
        var n = W + (Ke.x * Xe - e) / Ke.x,
          i = Math.round(e - bt.x);
        ((n < 0 && 0 < i) || (n >= Vt() - 1 && i < 0)) &&
          (e = bt.x + i * y.mainScrollEndFriction);
      }
      (bt.x = e), it(e, B);
    }
    function p(e, t) {
      var n = It[e] - Ve[e];
      return We[e] + Ye[e] + n - (t / $) * n;
    }
    function g(e, t) {
      (e.x = t.x), (e.y = t.y), t.id && (e.id = t.id);
    }
    function w(e) {
      (e.x = Math.round(e.x)), (e.y = Math.round(e.y));
    }
    function b(e, t) {
      var n = Jt(h.currItem, Ge, e);
      return t && (Pe = n), n;
    }
    function I(e) {
      return (e = e || h.currItem).initialZoomLevel;
    }
    function C(e) {
      return 0 < (e = e || h.currItem).w ? y.maxSpreadZoom : 1;
    }
    function D(e, t, n, i) {
      return i === h.currItem.initialZoomLevel
        ? ((n[e] = h.currItem.initialPosition[e]), !0)
        : ((n[e] = p(e, i)),
          n[e] > t.min[e]
            ? ((n[e] = t.min[e]), !0)
            : n[e] < t.max[e] && ((n[e] = t.max[e]), !0));
    }
    function l(e) {
      var t = '';
      y.escKey && 27 === e.keyCode
        ? (t = 'close')
        : y.arrowKeys &&
          (37 === e.keyCode ? (t = 'prev') : 39 === e.keyCode && (t = 'next')),
        t &&
          (e.ctrlKey ||
            e.altKey ||
            e.shiftKey ||
            e.metaKey ||
            (e.preventDefault ? e.preventDefault() : (e.returnValue = !1),
            h[t]()));
    }
    function u(e) {
      e && (Se || Me || Fe || Ie) && (e.preventDefault(), e.stopPropagation());
    }
    function T() {
      h.setScrollOffset(0, f.getScrollY());
    }
    function M(e) {
      rt[e] && (rt[e].raf && de(rt[e].raf), lt--, delete rt[e]);
    }
    function S(e) {
      rt[e] && M(e), rt[e] || (lt++, (rt[e] = {}));
    }
    function A() {
      for (var e in rt) rt.hasOwnProperty(e) && M(e);
    }
    function E(e, t, n, i, o, a, r) {
      var l,
        s = c();
      S(e);
      var u = function () {
        if (rt[e]) {
          if (((l = c() - s), i <= l)) return M(e), a(n), void (r && r());
          a((n - t) * o(l / i) + t), (rt[e].raf = ce(u));
        }
      };
      u();
    }
    function O(e, t) {
      return (
        (vt.x = Math.abs(e.x - t.x)),
        (vt.y = Math.abs(e.y - t.y)),
        Math.sqrt(vt.x * vt.x + vt.y * vt.y)
      );
    }
    function k(e, t) {
      return (
        (St.prevent = !Mt(e.target, y.isClickableElement)),
        v('preventDragEvent', e, t, St),
        St.prevent
      );
    }
    function R(e, t) {
      return (t.x = e.pageX), (t.y = e.pageY), (t.id = e.identifier), t;
    }
    function P(e, t, n) {
      (n.x = 0.5 * (e.x + t.x)), (n.y = 0.5 * (e.y + t.y));
    }
    function Z() {
      var e = Be.y - h.currItem.initialPosition.y;
      return 1 - Math.abs(e / (Ge.y / 2));
    }
    function F(e) {
      for (; 0 < Ot.length; ) Ot.pop();
      return (
        se
          ? ((He = 0),
            ft.forEach(function (e) {
              0 === He ? (Ot[0] = e) : 1 === He && (Ot[1] = e), He++;
            }))
          : -1 < e.type.indexOf('touch')
          ? e.touches &&
            0 < e.touches.length &&
            ((Ot[0] = R(e.touches[0], At)),
            1 < e.touches.length && (Ot[1] = R(e.touches[1], Et)))
          : ((At.x = e.pageX), (At.y = e.pageY), (At.id = ''), (Ot[0] = At)),
        Ot
      );
    }
    function L(e, t) {
      var n,
        i,
        o,
        a,
        r = Be[e] + t[e],
        l = 0 < t[e],
        s = bt.x + t.x,
        u = bt.x - ht.x;
      return (
        (n = r > Pe.min[e] || r < Pe.max[e] ? y.panEndFriction : 1),
        (r = Be[e] + t[e] * n),
        (!y.allowPanToNext && q !== h.currItem.initialZoomLevel) ||
        (Ze
          ? 'h' !== Le ||
            'x' !== e ||
            Me ||
            (l
              ? (r > Pe.min[e] &&
                  ((n = y.panEndFriction), Pe.min[e], (i = Pe.min[e] - We[e])),
                (i <= 0 || u < 0) && 1 < Vt()
                  ? ((a = s), u < 0 && s > ht.x && (a = ht.x))
                  : Pe.min.x !== Pe.max.x && (o = r))
              : (r < Pe.max[e] &&
                  ((n = y.panEndFriction), Pe.max[e], (i = We[e] - Pe.max[e])),
                (i <= 0 || 0 < u) && 1 < Vt()
                  ? ((a = s), 0 < u && s < ht.x && (a = ht.x))
                  : Pe.min.x !== Pe.max.x && (o = r)))
          : (a = s),
        'x' !== e)
          ? void (Fe || Ee || (q > h.currItem.fitRatio && (Be[e] += t[e] * n)))
          : (void 0 !== a && (d(a, !0), (Ee = a !== ht.x)),
            Pe.min.x !== Pe.max.x &&
              (void 0 !== o ? (Be.x = o) : Ee || (Be.x += t.x * n)),
            void 0 !== a)
      );
    }
    function z(e) {
      if (!('mousedown' === e.type && 0 < e.button)) {
        if (Gt) return void e.preventDefault();
        if (!Ce || 'mousedown' !== e.type) {
          if ((k(e, !0) && e.preventDefault(), v('pointerDown'), se)) {
            var t = f.arraySearch(ft, e.pointerId, 'id');
            t < 0 && (t = ft.length),
              (ft[t] = { x: e.pageX, y: e.pageY, id: e.pointerId });
          }
          var n = F(e),
            i = n.length;
          (Oe = null),
            A(),
            (De && 1 !== i) ||
              ((De = ze = !0),
              f.bind(window, X, h),
              (be = Ue = _e = Ie = Ee = Se = Te = Me = !1),
              (Le = null),
              v('firstTouchStart', n),
              g(We, Be),
              (Ye.x = Ye.y = 0),
              g(pt, n[0]),
              g(mt, pt),
              (ht.x = Ke.x * Xe),
              (yt = [{ x: pt.x, y: pt.y }]),
              (ge = xe = c()),
              b(q, !0),
              Dt(),
              Tt()),
            !ke &&
              1 < i &&
              !Fe &&
              !Ee &&
              (($ = q),
              (ke = Te = !(Me = !1)),
              (Ye.y = Ye.x = 0),
              g(We, Be),
              g(ut, n[0]),
              g(ct, n[1]),
              P(ut, ct, Ct),
              (It.x = Math.abs(Ct.x) - Be.x),
              (It.y = Math.abs(Ct.y) - Be.y),
              (Re = O(ut, ct)));
        }
      }
    }
    function _(e) {
      if ((e.preventDefault(), se)) {
        var t = f.arraySearch(ft, e.pointerId, 'id');
        if (-1 < t) {
          var n = ft[t];
          (n.x = e.pageX), (n.y = e.pageY);
        }
      }
      if (De) {
        var i = F(e);
        if (Le || Se || ke) Oe = i;
        else if (bt.x !== Ke.x * Xe) Le = 'h';
        else {
          var o = Math.abs(i[0].x - pt.x) - Math.abs(i[0].y - pt.y);
          10 <= Math.abs(o) && ((Le = 0 < o ? 'h' : 'v'), (Oe = i));
        }
      }
    }
    function N(e) {
      if (ye.isOldAndroid) {
        if (Ce && 'mouseup' === e.type) return;
        -1 < e.type.indexOf('touch') &&
          (clearTimeout(Ce),
          (Ce = setTimeout(function () {
            Ce = 0;
          }, 600)));
      }
      var t;
      if ((v('pointerUp'), k(e, !1) && e.preventDefault(), se)) {
        var n = f.arraySearch(ft, e.pointerId, 'id');
        if (-1 < n)
          if (((t = ft.splice(n, 1)[0]), navigator.msPointerEnabled)) {
            (t.type = { 4: 'mouse', 2: 'touch', 3: 'pen' }[e.pointerType]),
              t.type || (t.type = e.pointerType || 'mouse');
          } else t.type = e.pointerType || 'mouse';
      }
      var i,
        o = F(e),
        a = o.length;
      if (('mouseup' === e.type && (a = 0), 2 === a)) return !(Oe = null);
      1 === a && g(mt, o[0]),
        0 !== a ||
          Le ||
          Fe ||
          (t ||
            ('mouseup' === e.type
              ? (t = { x: e.pageX, y: e.pageY, type: 'mouse' })
              : e.changedTouches &&
                e.changedTouches[0] &&
                (t = {
                  x: e.changedTouches[0].pageX,
                  y: e.changedTouches[0].pageY,
                  type: 'touch',
                })),
          v('touchRelease', e, t));
      var r = -1;
      if (
        (0 === a &&
          ((De = !1),
          f.unbind(window, X, h),
          Dt(),
          ke ? (r = 0) : -1 !== wt && (r = c() - wt)),
        (wt = 1 === a ? c() : -1),
        (i = -1 !== r && r < 150 ? 'zoom' : 'swipe'),
        ke &&
          a < 2 &&
          ((ke = !1), 1 === a && (i = 'zoomPointerUp'), v('zoomGestureEnded')),
        (Oe = null),
        Se || Me || Fe || Ie)
      )
        if ((A(), (we = we || Rt()).calculateSwipeSpeed('x'), Ie)) {
          if (Z() < y.verticalDragRange) h.close();
          else {
            var l = Be.y,
              s = Ne;
            E('verticalDrag', 0, 1, 300, f.easing.cubic.out, function (e) {
              (Be.y = (h.currItem.initialPosition.y - l) * e + l),
                x((1 - s) * e + s),
                tt();
            }),
              v('onVerticalDrag', 1);
          }
        } else {
          if ((Ee || Fe) && 0 === a) {
            if (Zt(i, we)) return;
            i = 'zoomPointerUp';
          }
          if (!Fe)
            return 'swipe' !== i
              ? void Lt()
              : void (!Ee && q > h.currItem.fitRatio && Pt(we));
        }
    }
    var U,
      H,
      Y,
      W,
      B,
      G,
      X,
      V,
      K,
      q,
      $,
      j,
      J,
      Q,
      ee,
      te,
      ne,
      ie,
      oe,
      ae,
      re,
      le,
      se,
      ue,
      ce,
      de,
      pe,
      me,
      fe,
      he,
      ye,
      ve,
      xe,
      ge,
      we,
      be,
      Ie,
      Ce,
      De,
      Te,
      Me,
      Se,
      Ae,
      Ee,
      Oe,
      ke,
      Re,
      Pe,
      Ze,
      Fe,
      Le,
      ze,
      _e,
      Ne,
      Ue,
      He,
      Ye = n(),
      We = n(),
      Be = n(),
      Ge = {},
      Xe = 0,
      Ve = {},
      Ke = n(),
      qe = 0,
      $e = !0,
      je = [],
      Je = {},
      Qe = !1,
      et = {},
      tt = function (e) {
        Ze &&
          (e &&
            (q > h.currItem.fitRatio
              ? Qe || (Qt(h.currItem, !1, !0), (Qe = !0))
              : Qe && (Qt(h.currItem), (Qe = !1))),
          r(Ze, Be.x, Be.y, q));
      },
      nt = function (e) {
        e.container &&
          r(
            e.container.style,
            e.initialPosition.x,
            e.initialPosition.y,
            e.initialZoomLevel,
            e
          );
      },
      it = function (e, t) {
        t[le] = j + e + 'px, 0px' + J;
      },
      ot = null,
      at = function () {
        ot &&
          (f.unbind(document, 'mousemove', at),
          f.addClass(m, 'pswp--has_mouse'),
          (y.mouseUsed = !0),
          v('mouseUsed')),
          (ot = setTimeout(function () {
            ot = null;
          }, 100));
      },
      rt = {},
      lt = 0,
      st = {
        shout: v,
        listen: a,
        viewportSize: Ge,
        options: y,
        isMainScrollAnimating: function () {
          return Fe;
        },
        getZoomLevel: function () {
          return q;
        },
        getCurrentIndex: function () {
          return W;
        },
        isDragging: function () {
          return De;
        },
        isZooming: function () {
          return ke;
        },
        setScrollOffset: function (e, t) {
          (Ve.x = e), (he = Ve.y = t), v('updateScrollOffset', Ve);
        },
        applyZoomPan: function (e, t, n, i) {
          (Be.x = t), (Be.y = n), (q = e), tt(i);
        },
        init: function () {
          if (!U && !H) {
            var e;
            (h.framework = f),
              (h.template = m),
              (h.bg = f.getChildByClass(m, 'pswp__bg')),
              (pe = m.className),
              (U = !0),
              (ye = f.detectFeatures()),
              (ce = ye.raf),
              (de = ye.caf),
              (le = ye.transform),
              (fe = ye.oldIE),
              (h.scrollWrap = f.getChildByClass(m, 'pswp__scroll-wrap')),
              (h.container = f.getChildByClass(
                h.scrollWrap,
                'pswp__container'
              )),
              (B = h.container.style),
              (h.itemHolders = te =
                [
                  { el: h.container.children[0], wrap: 0, index: -1 },
                  { el: h.container.children[1], wrap: 0, index: -1 },
                  { el: h.container.children[2], wrap: 0, index: -1 },
                ]),
              (te[0].el.style.display = te[2].el.style.display = 'none'),
              (function () {
                if (le) {
                  var e = ye.perspective && !ue;
                  return (
                    (j = 'translate' + (e ? '3d(' : '(')),
                    (J = ye.perspective ? ', 0px)' : ')')
                  );
                }
                (le = 'left'),
                  f.addClass(m, 'pswp--ie'),
                  (it = function (e, t) {
                    t.left = e + 'px';
                  }),
                  (nt = function (e) {
                    var t = 1 < e.fitRatio ? 1 : e.fitRatio,
                      n = e.container.style,
                      i = t * e.w,
                      o = t * e.h;
                    (n.width = i + 'px'),
                      (n.height = o + 'px'),
                      (n.left = e.initialPosition.x + 'px'),
                      (n.top = e.initialPosition.y + 'px');
                  }),
                  (tt = function () {
                    if (Ze) {
                      var e = Ze,
                        t = h.currItem,
                        n = 1 < t.fitRatio ? 1 : t.fitRatio,
                        i = n * t.w,
                        o = n * t.h;
                      (e.width = i + 'px'),
                        (e.height = o + 'px'),
                        (e.left = Be.x + 'px'),
                        (e.top = Be.y + 'px');
                    }
                  });
              })(),
              (K = {
                resize: h.updateSize,
                orientationchange: function () {
                  clearTimeout(ve),
                    (ve = setTimeout(function () {
                      Ge.x !== h.scrollWrap.clientWidth && h.updateSize();
                    }, 500));
                },
                scroll: T,
                keydown: l,
                click: u,
              });
            var t = ye.isOldIOSPhone || ye.isOldAndroid || ye.isMobileOpera;
            for (
              (ye.animationName && ye.transform && !t) ||
                (y.showAnimationDuration = y.hideAnimationDuration = 0),
                e = 0;
              e < je.length;
              e++
            )
              h['init' + je[e]]();
            if (i) (h.ui = new i(h, f)).init();
            v('firstUpdate'),
              (W = W || y.index || 0),
              (isNaN(W) || W < 0 || W >= Vt()) && (W = 0),
              (h.currItem = Xt(W)),
              (ye.isOldIOSPhone || ye.isOldAndroid) && ($e = !1),
              m.setAttribute('aria-hidden', 'false'),
              y.modal &&
                ($e
                  ? (m.style.position = 'fixed')
                  : ((m.style.position = 'absolute'),
                    (m.style.top = f.getScrollY() + 'px'))),
              void 0 === he && (v('initialLayout'), (he = me = f.getScrollY()));
            var n = 'pswp--open ';
            for (
              y.mainClass && (n += y.mainClass + ' '),
                y.showHideOpacity && (n += 'pswp--animate_opacity '),
                n += ue ? 'pswp--touch' : 'pswp--notouch',
                n += ye.animationName ? ' pswp--css_animation' : '',
                n += ye.svg ? ' pswp--svg' : '',
                f.addClass(m, n),
                h.updateSize(),
                G = -1,
                qe = null,
                e = 0;
              e < 3;
              e++
            )
              it((e + G) * Ke.x, te[e].el.style);
            fe || f.bind(h.scrollWrap, V, h),
              a('initialZoomInEnd', function () {
                h.setContent(te[0], W - 1),
                  h.setContent(te[2], W + 1),
                  (te[0].el.style.display = te[2].el.style.display = 'block'),
                  y.focus && m.focus(),
                  f.bind(document, 'keydown', h),
                  ye.transform && f.bind(h.scrollWrap, 'click', h),
                  y.mouseUsed || f.bind(document, 'mousemove', at),
                  f.bind(window, 'resize scroll orientationchange', h),
                  v('bindEvents');
              }),
              h.setContent(te[1], W),
              h.updateCurrItem(),
              v('afterInit'),
              $e ||
                (Q = setInterval(function () {
                  lt ||
                    De ||
                    ke ||
                    q !== h.currItem.initialZoomLevel ||
                    h.updateSize();
                }, 1e3)),
              f.addClass(m, 'pswp--visible');
          }
        },
        close: function () {
          U &&
            ((H = !(U = !1)),
            v('close'),
            f.unbind(window, 'resize scroll orientationchange', h),
            f.unbind(window, 'scroll', K.scroll),
            f.unbind(document, 'keydown', h),
            f.unbind(document, 'mousemove', at),
            ye.transform && f.unbind(h.scrollWrap, 'click', h),
            De && f.unbind(window, X, h),
            clearTimeout(ve),
            v('unbindEvents'),
            Kt(h.currItem, null, !0, h.destroy));
        },
        destroy: function () {
          v('destroy'),
            Yt && clearTimeout(Yt),
            m.setAttribute('aria-hidden', 'true'),
            (m.className = pe),
            Q && clearInterval(Q),
            f.unbind(h.scrollWrap, V, h),
            f.unbind(window, 'scroll', h),
            Dt(),
            A(),
            (et = null);
        },
        panTo: function (e, t, n) {
          n ||
            (e > Pe.min.x ? (e = Pe.min.x) : e < Pe.max.x && (e = Pe.max.x),
            t > Pe.min.y ? (t = Pe.min.y) : t < Pe.max.y && (t = Pe.max.y)),
            (Be.x = e),
            (Be.y = t),
            tt();
        },
        handleEvent: function (e) {
          (e = e || window.event), K[e.type] && K[e.type](e);
        },
        goTo: function (e) {
          var t = (e = s(e)) - W;
          (qe = t),
            (W = e),
            (h.currItem = Xt(W)),
            (Xe -= t),
            d(Ke.x * Xe),
            A(),
            (Fe = !1),
            h.updateCurrItem();
        },
        next: function () {
          h.goTo(W + 1);
        },
        prev: function () {
          h.goTo(W - 1);
        },
        updateCurrZoomItem: function (e) {
          if ((e && v('beforeChange', 0), te[1].el.children.length)) {
            var t = te[1].el.children[0];
            Ze = f.hasClass(t, 'pswp__zoom-wrap') ? t.style : null;
          } else Ze = null;
          (Pe = h.currItem.bounds),
            ($ = q = h.currItem.initialZoomLevel),
            (Be.x = Pe.center.x),
            (Be.y = Pe.center.y),
            e && v('afterChange');
        },
        invalidateCurrItems: function () {
          ee = !0;
          for (var e = 0; e < 3; e++)
            te[e].item && (te[e].item.needsUpdate = !0);
        },
        updateCurrItem: function (e) {
          if (0 !== qe) {
            var t,
              n = Math.abs(qe);
            if (!(e && n < 2)) {
              (h.currItem = Xt(W)),
                (Qe = !1),
                v('beforeChange', qe),
                3 <= n && ((G += qe + (0 < qe ? -3 : 3)), (n = 3));
              for (var i = 0; i < n; i++)
                0 < qe
                  ? ((t = te.shift()),
                    (te[2] = t),
                    it((++G + 2) * Ke.x, t.el.style),
                    h.setContent(t, W - n + i + 1 + 1))
                  : ((t = te.pop()),
                    te.unshift(t),
                    it(--G * Ke.x, t.el.style),
                    h.setContent(t, W + n - i - 1 - 1));
              if (Ze && 1 === Math.abs(qe)) {
                var o = Xt(ne);
                o.initialZoomLevel !== q && (Jt(o, Ge), Qt(o), nt(o));
              }
              (qe = 0), h.updateCurrZoomItem(), (ne = W), v('afterChange');
            }
          }
        },
        updateSize: function (e) {
          if (!$e && y.modal) {
            var t = f.getScrollY();
            if (
              (he !== t && ((m.style.top = t + 'px'), (he = t)),
              !e && Je.x === window.innerWidth && Je.y === window.innerHeight)
            )
              return;
            (Je.x = window.innerWidth),
              (Je.y = window.innerHeight),
              (m.style.height = Je.y + 'px');
          }
          if (
            ((Ge.x = h.scrollWrap.clientWidth),
            (Ge.y = h.scrollWrap.clientHeight),
            T(),
            (Ke.x = Ge.x + Math.round(Ge.x * y.spacing)),
            (Ke.y = Ge.y),
            d(Ke.x * Xe),
            v('beforeResize'),
            void 0 !== G)
          ) {
            for (var n, i, o, a = 0; a < 3; a++)
              (n = te[a]),
                it((a + G) * Ke.x, n.el.style),
                (o = W + a - 1),
                y.loop && 2 < Vt() && (o = s(o)),
                (i = Xt(o)) && (ee || i.needsUpdate || !i.bounds)
                  ? (h.cleanSlide(i),
                    h.setContent(n, o),
                    1 === a && ((h.currItem = i), h.updateCurrZoomItem(!0)),
                    (i.needsUpdate = !1))
                  : -1 === n.index && 0 <= o && h.setContent(n, o),
                i && i.container && (Jt(i, Ge), Qt(i), nt(i));
            ee = !1;
          }
          ($ = q = h.currItem.initialZoomLevel),
            (Pe = h.currItem.bounds) &&
              ((Be.x = Pe.center.x), (Be.y = Pe.center.y), tt(!0)),
            v('resize');
        },
        zoomTo: function (t, e, n, i, o) {
          e &&
            (($ = q),
            (It.x = Math.abs(e.x) - Be.x),
            (It.y = Math.abs(e.y) - Be.y),
            g(We, Be));
          var a = b(t, !1),
            r = {};
          D('x', a, r, t), D('y', a, r, t);
          var l = q,
            s = Be.x,
            u = Be.y;
          w(r);
          function c(e) {
            1 === e
              ? ((q = t), (Be.x = r.x), (Be.y = r.y))
              : ((q = (t - l) * e + l),
                (Be.x = (r.x - s) * e + s),
                (Be.y = (r.y - u) * e + u)),
              o && o(e),
              tt(1 === e);
          }
          n ? E('customZoomTo', 0, 1, n, i || f.easing.sine.inOut, c) : c(1);
        },
      },
      ut = {},
      ct = {},
      dt = {},
      pt = {},
      mt = {},
      ft = [],
      ht = {},
      yt = [],
      vt = {},
      xt = 0,
      gt = n(),
      wt = 0,
      bt = n(),
      It = n(),
      Ct = n(),
      Dt = function () {
        Ae && (de(Ae), (Ae = null));
      },
      Tt = function () {
        De && ((Ae = ce(Tt)), kt());
      },
      Mt = function (e, t) {
        return (
          !(!e || e === document) &&
          !(
            e.getAttribute('class') &&
            -1 < e.getAttribute('class').indexOf('pswp__scroll-wrap')
          ) &&
          (t(e) ? e : Mt(e.parentNode, t))
        );
      },
      St = {},
      At = {},
      Et = {},
      Ot = [],
      kt = function () {
        if (Oe) {
          var e = Oe.length;
          if (0 !== e)
            if (
              (g(ut, Oe[0]),
              (dt.x = ut.x - pt.x),
              (dt.y = ut.y - pt.y),
              ke && 1 < e)
            ) {
              if (
                ((pt.x = ut.x),
                (pt.y = ut.y),
                !dt.x &&
                  !dt.y &&
                  ((s = Oe[1]), (u = ct), s.x === u.x && s.y === u.y))
              )
                return;
              g(ct, Oe[1]), Me || ((Me = !0), v('zoomGestureStarted'));
              var t = O(ut, ct),
                n = Ft(t);
              n >
                h.currItem.initialZoomLevel +
                  h.currItem.initialZoomLevel / 15 && (Ue = !0);
              var i = 1,
                o = I(),
                a = C();
              if (n < o)
                if (y.pinchToClose && !Ue && $ <= h.currItem.initialZoomLevel) {
                  var r = 1 - (o - n) / (o / 1.2);
                  x(r), v('onPinchClose', r), (_e = !0);
                } else 1 < (i = (o - n) / o) && (i = 1), (n = o - i * (o / 3));
              else
                a < n &&
                  (1 < (i = (n - a) / (6 * o)) && (i = 1), (n = a + i * o));
              i < 0 && (i = 0),
                P(ut, ct, gt),
                (Ye.x += gt.x - Ct.x),
                (Ye.y += gt.y - Ct.y),
                g(Ct, gt),
                (Be.x = p('x', n)),
                (Be.y = p('y', n)),
                (be = q < n),
                (q = n),
                tt();
            } else {
              if (!Le) return;
              if (
                (ze &&
                  ((ze = !1),
                  10 <= Math.abs(dt.x) && (dt.x -= Oe[0].x - mt.x),
                  10 <= Math.abs(dt.y) && (dt.y -= Oe[0].y - mt.y)),
                (pt.x = ut.x),
                (pt.y = ut.y),
                0 === dt.x && 0 === dt.y)
              )
                return;
              if (
                'v' === Le &&
                y.closeOnVerticalDrag &&
                'fit' === y.scaleMode &&
                q === h.currItem.initialZoomLevel
              ) {
                (Ye.y += dt.y), (Be.y += dt.y);
                var l = Z();
                return (Ie = !0), v('onVerticalDrag', l), x(l), void tt();
              }
              (function (e, t, n) {
                if (50 < e - ge) {
                  var i = 2 < yt.length ? yt.shift() : {};
                  (i.x = t), (i.y = n), yt.push(i), (ge = e);
                }
              })(c(), ut.x, ut.y),
                (Se = !0),
                (Pe = h.currItem.bounds),
                L('x', dt) || (L('y', dt), w(Be), tt());
            }
        }
        var s, u;
      },
      Rt = function () {
        var t,
          n,
          i = {
            lastFlickOffset: {},
            lastFlickDist: {},
            lastFlickSpeed: {},
            slowDownRatio: {},
            slowDownRatioReverse: {},
            speedDecelerationRatio: {},
            speedDecelerationRatioAbs: {},
            distanceOffset: {},
            backAnimDestination: {},
            backAnimStarted: {},
            calculateSwipeSpeed: function (e) {
              (n =
                1 < yt.length
                  ? ((t = c() - ge + 50), yt[yt.length - 2][e])
                  : ((t = c() - xe), mt[e])),
                (i.lastFlickOffset[e] = pt[e] - n),
                (i.lastFlickDist[e] = Math.abs(i.lastFlickOffset[e])),
                20 < i.lastFlickDist[e]
                  ? (i.lastFlickSpeed[e] = i.lastFlickOffset[e] / t)
                  : (i.lastFlickSpeed[e] = 0),
                Math.abs(i.lastFlickSpeed[e]) < 0.1 &&
                  (i.lastFlickSpeed[e] = 0),
                (i.slowDownRatio[e] = 0.95),
                (i.slowDownRatioReverse[e] = 1 - i.slowDownRatio[e]),
                (i.speedDecelerationRatio[e] = 1);
            },
            calculateOverBoundsAnimOffset: function (t, e) {
              i.backAnimStarted[t] ||
                (Be[t] > Pe.min[t]
                  ? (i.backAnimDestination[t] = Pe.min[t])
                  : Be[t] < Pe.max[t] && (i.backAnimDestination[t] = Pe.max[t]),
                void 0 !== i.backAnimDestination[t] &&
                  ((i.slowDownRatio[t] = 0.7),
                  (i.slowDownRatioReverse[t] = 1 - i.slowDownRatio[t]),
                  i.speedDecelerationRatioAbs[t] < 0.05 &&
                    ((i.lastFlickSpeed[t] = 0),
                    (i.backAnimStarted[t] = !0),
                    E(
                      'bounceZoomPan' + t,
                      Be[t],
                      i.backAnimDestination[t],
                      e || 300,
                      f.easing.sine.out,
                      function (e) {
                        (Be[t] = e), tt();
                      }
                    ))));
            },
            calculateAnimOffset: function (e) {
              i.backAnimStarted[e] ||
                ((i.speedDecelerationRatio[e] =
                  i.speedDecelerationRatio[e] *
                  (i.slowDownRatio[e] +
                    i.slowDownRatioReverse[e] -
                    (i.slowDownRatioReverse[e] * i.timeDiff) / 10)),
                (i.speedDecelerationRatioAbs[e] = Math.abs(
                  i.lastFlickSpeed[e] * i.speedDecelerationRatio[e]
                )),
                (i.distanceOffset[e] =
                  i.lastFlickSpeed[e] *
                  i.speedDecelerationRatio[e] *
                  i.timeDiff),
                (Be[e] += i.distanceOffset[e]));
            },
            panAnimLoop: function () {
              if (
                rt.zoomPan &&
                ((rt.zoomPan.raf = ce(i.panAnimLoop)),
                (i.now = c()),
                (i.timeDiff = i.now - i.lastNow),
                (i.lastNow = i.now),
                i.calculateAnimOffset('x'),
                i.calculateAnimOffset('y'),
                tt(),
                i.calculateOverBoundsAnimOffset('x'),
                i.calculateOverBoundsAnimOffset('y'),
                i.speedDecelerationRatioAbs.x < 0.05 &&
                  i.speedDecelerationRatioAbs.y < 0.05)
              )
                return (
                  (Be.x = Math.round(Be.x)),
                  (Be.y = Math.round(Be.y)),
                  tt(),
                  void M('zoomPan')
                );
            },
          };
        return i;
      },
      Pt = function (e) {
        return (
          e.calculateSwipeSpeed('y'),
          (Pe = h.currItem.bounds),
          (e.backAnimDestination = {}),
          (e.backAnimStarted = {}),
          Math.abs(e.lastFlickSpeed.x) <= 0.05 &&
          Math.abs(e.lastFlickSpeed.y) <= 0.05
            ? ((e.speedDecelerationRatioAbs.x = e.speedDecelerationRatioAbs.y =
                0),
              e.calculateOverBoundsAnimOffset('x'),
              e.calculateOverBoundsAnimOffset('y'),
              !0)
            : (S('zoomPan'), (e.lastNow = c()), void e.panAnimLoop())
        );
      },
      Zt = function (e, t) {
        var n, i, o;
        if ((Fe || (xt = W), 'swipe' === e)) {
          var a = pt.x - mt.x,
            r = t.lastFlickDist.x < 10;
          30 < a && (r || 20 < t.lastFlickOffset.x)
            ? (i = -1)
            : a < -30 && (r || t.lastFlickOffset.x < -20) && (i = 1);
        }
        i &&
          ((W += i) < 0
            ? ((W = y.loop ? Vt() - 1 : 0), (o = !0))
            : W >= Vt() && ((W = y.loop ? 0 : Vt() - 1), (o = !0)),
          (o && !y.loop) || ((qe += i), (Xe -= i), (n = !0)));
        var l,
          s = Ke.x * Xe,
          u = Math.abs(s - bt.x);
        return (
          (l =
            n || s > bt.x == 0 < t.lastFlickSpeed.x
              ? ((l =
                  0 < Math.abs(t.lastFlickSpeed.x)
                    ? u / Math.abs(t.lastFlickSpeed.x)
                    : 333),
                (l = Math.min(l, 400)),
                Math.max(l, 250))
              : 333),
          xt === W && (n = !1),
          (Fe = !0),
          v('mainScrollAnimStart'),
          E('mainScroll', bt.x, s, l, f.easing.cubic.out, d, function () {
            A(),
              (Fe = !1),
              (xt = -1),
              (!n && xt === W) || h.updateCurrItem(),
              v('mainScrollAnimComplete');
          }),
          n && h.updateCurrItem(!0),
          n
        );
      },
      Ft = function (e) {
        return (1 / Re) * e * $;
      },
      Lt = function () {
        var e = q,
          t = I(),
          n = C();
        q < t ? (e = t) : n < q && (e = n);
        var i,
          o = Ne;
        return (
          _e && !be && !Ue && q < t
            ? h.close()
            : (_e &&
                (i = function (e) {
                  x((1 - o) * e + o);
                }),
              h.zoomTo(e, 0, 200, f.easing.cubic.out, i)),
          !0
        );
      };
    o('Gestures', {
      publicMethods: {
        initGestures: function () {
          function e(e, t, n, i, o) {
            (ie = e + t), (oe = e + n), (ae = e + i), (re = o ? e + o : '');
          }
          (se = ye.pointerEvent) && ye.touch && (ye.touch = !1),
            se
              ? navigator.msPointerEnabled
                ? e('MSPointer', 'Down', 'Move', 'Up', 'Cancel')
                : e('pointer', 'down', 'move', 'up', 'cancel')
              : ye.touch
              ? (e('touch', 'start', 'move', 'end', 'cancel'), (ue = !0))
              : e('mouse', 'down', 'move', 'up'),
            (X = oe + ' ' + ae + ' ' + re),
            (V = ie),
            se &&
              !ue &&
              (ue =
                1 < navigator.maxTouchPoints || 1 < navigator.msMaxTouchPoints),
            (h.likelyTouchDevice = ue),
            (K[ie] = z),
            (K[oe] = _),
            (K[ae] = N),
            re && (K[re] = K[ae]),
            ye.touch &&
              ((V += ' mousedown'),
              (X += ' mousemove mouseup'),
              (K.mousedown = K[ie]),
              (K.mousemove = K[oe]),
              (K.mouseup = K[ae])),
            ue || (y.allowPanToNext = !1);
        },
      },
    });
    function zt() {
      return {
        center: { x: 0, y: 0 },
        max: { x: 0, y: 0 },
        min: { x: 0, y: 0 },
      };
    }
    function _t(e, t, n, i, o, a) {
      t.loadError ||
        (i &&
          ((t.imageAppended = !0),
          Qt(t, i, t === h.currItem && Qe),
          n.appendChild(i),
          a &&
            setTimeout(function () {
              t &&
                t.loaded &&
                t.placeholder &&
                ((t.placeholder.style.display = 'none'),
                (t.placeholder = null));
            }, 500)));
    }
    function Nt(e) {
      function t() {
        (e.loading = !1),
          (e.loaded = !0),
          e.loadComplete ? e.loadComplete(e) : (e.img = null),
          (n.onload = n.onerror = null),
          (n = null);
      }
      (e.loading = !0), (e.loaded = !1);
      var n = (e.img = f.createEl('pswp__img', 'img'));
      return (
        (n.onload = t),
        (n.onerror = function () {
          (e.loadError = !0), t();
        }),
        (n.src = e.src),
        n
      );
    }
    function Ut(e, t) {
      return (
        e.src &&
        e.loadError &&
        e.container &&
        (t && (e.container.innerHTML = ''),
        (e.container.innerHTML = y.errorMsg.replace('%url%', e.src)),
        1)
      );
    }
    function Ht() {
      if ($t.length) {
        for (var e, t = 0; t < $t.length; t++)
          (e = $t[t]).holder.index === e.index &&
            _t(e.index, e.item, e.baseDiv, e.img, 0, e.clearPlaceholder);
        $t = [];
      }
    }
    var Yt,
      Wt,
      Bt,
      Gt,
      Xt,
      Vt,
      Kt = function (r, e, l, t) {
        var s;
        Yt && clearTimeout(Yt),
          (Bt = Gt = !0),
          r.initialLayout
            ? ((s = r.initialLayout), (r.initialLayout = null))
            : (s = y.getThumbBoundsFn && y.getThumbBoundsFn(W));
        function u() {
          M('initialZoom'),
            l
              ? (h.template.removeAttribute('style'),
                h.bg.removeAttribute('style'))
              : (x(1),
                e && (e.style.display = 'block'),
                f.addClass(m, 'pswp--animated-in'),
                v('initialZoom' + (l ? 'OutEnd' : 'InEnd'))),
            t && t(),
            (Gt = !1);
        }
        var c = l ? y.hideAnimationDuration : y.showAnimationDuration;
        if (!c || !s || void 0 === s.x)
          return (
            v('initialZoom' + (l ? 'Out' : 'In')),
            (q = r.initialZoomLevel),
            g(Be, r.initialPosition),
            tt(),
            (m.style.opacity = l ? 0 : 1),
            x(1),
            void (c
              ? setTimeout(function () {
                  u();
                }, c)
              : u())
          );
        var d, p;
        (d = Y),
          (p = !h.currItem.src || h.currItem.loadError || y.showHideOpacity),
          r.miniImg && (r.miniImg.style.webkitBackfaceVisibility = 'hidden'),
          l ||
            ((q = s.w / r.w),
            (Be.x = s.x),
            (Be.y = s.y - me),
            (h[p ? 'template' : 'bg'].style.opacity = 0.001),
            tt()),
          S('initialZoom'),
          l && !d && f.removeClass(m, 'pswp--animated-in'),
          p &&
            (l
              ? f[(d ? 'remove' : 'add') + 'Class'](m, 'pswp--animate_opacity')
              : setTimeout(function () {
                  f.addClass(m, 'pswp--animate_opacity');
                }, 30)),
          (Yt = setTimeout(
            function () {
              if ((v('initialZoom' + (l ? 'Out' : 'In')), l)) {
                var t = s.w / r.w,
                  n = Be.x,
                  i = Be.y,
                  o = q,
                  a = Ne,
                  e = function (e) {
                    1 === e
                      ? ((q = t), (Be.x = s.x), (Be.y = s.y - he))
                      : ((q = (t - o) * e + o),
                        (Be.x = (s.x - n) * e + n),
                        (Be.y = (s.y - he - i) * e + i)),
                      tt(),
                      p ? (m.style.opacity = 1 - e) : x(a - e * a);
                  };
                d
                  ? E('initialZoom', 0, 1, c, f.easing.cubic.out, e, u)
                  : (e(1), (Yt = setTimeout(u, c + 20)));
              } else
                (q = r.initialZoomLevel),
                  g(Be, r.initialPosition),
                  tt(),
                  x(1),
                  p ? (m.style.opacity = 1) : x(1),
                  (Yt = setTimeout(u, c + 20));
            },
            l ? 25 : 90
          ));
      },
      qt = {},
      $t = [],
      jt = {
        index: 0,
        errorMsg:
          '<div class="pswp__error-msg"><a href="%url%" target="_blank">The image</a> could not be loaded.</div>',
        forceProgressiveLoading: !1,
        preload: [1, 1],
        getNumItemsFn: function () {
          return Wt.length;
        },
      },
      Jt = function (e, t, n) {
        if (!e.src || e.loadError)
          return (
            (e.w = e.h = 0),
            (e.initialZoomLevel = e.fitRatio = 1),
            (e.bounds = zt()),
            (e.initialPosition = e.bounds.center),
            e.bounds
          );
        var i,
          o,
          a,
          r,
          l = !n;
        if (
          (l &&
            (e.vGap || (e.vGap = { top: 0, bottom: 0 }),
            v('parseVerticalMargin', e)),
          (qt.x = t.x),
          (qt.y = t.y - e.vGap.top - e.vGap.bottom),
          l)
        ) {
          var s = qt.x / e.w,
            u = qt.y / e.h;
          e.fitRatio = s < u ? s : u;
          var c = y.scaleMode;
          'orig' === c ? (n = 1) : 'fit' === c && (n = e.fitRatio),
            1 < n && (n = 1),
            (e.initialZoomLevel = n),
            e.bounds || (e.bounds = zt());
        }
        return n
          ? ((o = (i = e).w * n),
            (a = e.h * n),
            ((r = i.bounds).center.x = Math.round((qt.x - o) / 2)),
            (r.center.y = Math.round((qt.y - a) / 2) + i.vGap.top),
            (r.max.x = o > qt.x ? Math.round(qt.x - o) : r.center.x),
            (r.max.y =
              a > qt.y ? Math.round(qt.y - a) + i.vGap.top : r.center.y),
            (r.min.x = o > qt.x ? 0 : r.center.x),
            (r.min.y = a > qt.y ? i.vGap.top : r.center.y),
            l &&
              n === e.initialZoomLevel &&
              (e.initialPosition = e.bounds.center),
            e.bounds)
          : void 0;
      },
      Qt = function (e, t, n) {
        if (e.src) {
          t = t || e.container.lastChild;
          var i = n ? e.w : Math.round(e.w * e.fitRatio),
            o = n ? e.h : Math.round(e.h * e.fitRatio);
          e.placeholder &&
            !e.loaded &&
            ((e.placeholder.style.width = i + 'px'),
            (e.placeholder.style.height = o + 'px')),
            (t.style.width = i + 'px'),
            (t.style.height = o + 'px');
        }
      };
    o('Controller', {
      publicMethods: {
        lazyLoadItem: function (e) {
          e = s(e);
          var t = Xt(e);
          t &&
            ((!t.loaded && !t.loading) || ee) &&
            (v('gettingData', e, t), t.src && Nt(t));
        },
        initController: function () {
          f.extend(y, jt, !0),
            (h.items = Wt = e),
            (Xt = h.getItemAt),
            (Vt = y.getNumItemsFn),
            y.loop,
            Vt() < 3 && (y.loop = !1),
            a('beforeChange', function (e) {
              var t,
                n = y.preload,
                i = null === e || 0 <= e,
                o = Math.min(n[0], Vt()),
                a = Math.min(n[1], Vt());
              for (t = 1; t <= (i ? a : o); t++) h.lazyLoadItem(W + t);
              for (t = 1; t <= (i ? o : a); t++) h.lazyLoadItem(W - t);
            }),
            a('initialLayout', function () {
              h.currItem.initialLayout =
                y.getThumbBoundsFn && y.getThumbBoundsFn(W);
            }),
            a('mainScrollAnimComplete', Ht),
            a('initialZoomInEnd', Ht),
            a('destroy', function () {
              for (var e, t = 0; t < Wt.length; t++)
                (e = Wt[t]).container && (e.container = null),
                  e.placeholder && (e.placeholder = null),
                  e.img && (e.img = null),
                  e.preloader && (e.preloader = null),
                  e.loadError && (e.loaded = e.loadError = !1);
              $t = null;
            });
        },
        getItemAt: function (e) {
          return 0 <= e && void 0 !== Wt[e] && Wt[e];
        },
        allowProgressiveImg: function () {
          return (
            y.forceProgressiveLoading ||
            !ue ||
            y.mouseUsed ||
            1200 < screen.width
          );
        },
        setContent: function (t, n) {
          y.loop && (n = s(n));
          var e = h.getItemAt(t.index);
          e && (e.container = null);
          var i,
            o = h.getItemAt(n);
          if (o) {
            v('gettingData', n, o), (t.index = n);
            var a = ((t.item = o).container = f.createEl('pswp__zoom-wrap'));
            if (
              (!o.src &&
                o.html &&
                (o.html.tagName
                  ? a.appendChild(o.html)
                  : (a.innerHTML = o.html)),
              Ut(o),
              Jt(o, Ge),
              !o.src || o.loadError || o.loaded)
            )
              o.src &&
                !o.loadError &&
                (((i = f.createEl('pswp__img', 'img')).style.opacity = 1),
                (i.src = o.src),
                Qt(o, i),
                _t(0, o, a, i));
            else {
              if (
                ((o.loadComplete = function (e) {
                  if (U) {
                    if (t && t.index === n) {
                      if (Ut(e, !0))
                        return (
                          (e.loadComplete = e.img = null),
                          Jt(e, Ge),
                          nt(e),
                          void (t.index === W && h.updateCurrZoomItem())
                        );
                      e.imageAppended
                        ? !Gt &&
                          e.placeholder &&
                          ((e.placeholder.style.display = 'none'),
                          (e.placeholder = null))
                        : ye.transform && (Fe || Gt)
                        ? $t.push({
                            item: e,
                            baseDiv: a,
                            img: e.img,
                            index: n,
                            holder: t,
                            clearPlaceholder: !0,
                          })
                        : _t(0, e, a, e.img, 0, !0);
                    }
                    (e.loadComplete = null),
                      (e.img = null),
                      v('imageLoadComplete', n, e);
                  }
                }),
                f.features.transform)
              ) {
                var r = 'pswp__img pswp__img--placeholder';
                r += o.msrc ? '' : ' pswp__img--placeholder--blank';
                var l = f.createEl(r, o.msrc ? 'img' : '');
                o.msrc && (l.src = o.msrc),
                  Qt(o, l),
                  a.appendChild(l),
                  (o.placeholder = l);
              }
              o.loading || Nt(o),
                h.allowProgressiveImg() &&
                  (!Bt && ye.transform
                    ? $t.push({
                        item: o,
                        baseDiv: a,
                        img: o.img,
                        index: n,
                        holder: t,
                      })
                    : _t(0, o, a, o.img, 0, !0));
            }
            Bt || n !== W ? nt(o) : ((Ze = a.style), Kt(o, i || o.img)),
              (t.el.innerHTML = ''),
              t.el.appendChild(a);
          } else t.el.innerHTML = '';
        },
        cleanSlide: function (e) {
          e.img && (e.img.onload = e.img.onerror = null),
            (e.loaded = e.loading = e.img = e.imageAppended = !1);
        },
      },
    });
    function en(e, t, n) {
      var i = document.createEvent('CustomEvent'),
        o = {
          origEvent: e,
          target: e.target,
          releasePoint: t,
          pointerType: n || 'touch',
        };
      i.initCustomEvent('pswpTap', !0, !0, o), e.target.dispatchEvent(i);
    }
    var tn,
      nn,
      on = {};
    o('Tap', {
      publicMethods: {
        initTap: function () {
          a('firstTouchStart', h.onTapStart),
            a('touchRelease', h.onTapRelease),
            a('destroy', function () {
              (on = {}), (tn = null);
            });
        },
        onTapStart: function (e) {
          1 < e.length && (clearTimeout(tn), (tn = null));
        },
        onTapRelease: function (e, t) {
          if (t && !Se && !Te && !lt) {
            var n = t;
            if (
              tn &&
              (clearTimeout(tn),
              (tn = null),
              (i = n),
              (o = on),
              Math.abs(i.x - o.x) < 25 && Math.abs(i.y - o.y) < 25)
            )
              return void v('doubleTap', n);
            if ('mouse' === t.type) return void en(e, t, 'mouse');
            if (
              'BUTTON' === e.target.tagName.toUpperCase() ||
              f.hasClass(e.target, 'pswp__single-tap')
            )
              return void en(e, t);
            g(on, n),
              (tn = setTimeout(function () {
                en(e, t), (tn = null);
              }, 300));
          }
          var i, o;
        },
      },
    }),
      o('DesktopZoom', {
        publicMethods: {
          initDesktopZoom: function () {
            fe ||
              (ue
                ? a('mouseUsed', function () {
                    h.setupDesktopZoom();
                  })
                : h.setupDesktopZoom(!0));
          },
          setupDesktopZoom: function (e) {
            nn = {};
            var t = 'wheel mousewheel DOMMouseScroll';
            a('bindEvents', function () {
              f.bind(m, t, h.handleMouseWheel);
            }),
              a('unbindEvents', function () {
                nn && f.unbind(m, t, h.handleMouseWheel);
              }),
              (h.mouseZoomedIn = !1);
            function n() {
              h.mouseZoomedIn &&
                (f.removeClass(m, 'pswp--zoomed-in'), (h.mouseZoomedIn = !1)),
                q < 1
                  ? f.addClass(m, 'pswp--zoom-allowed')
                  : f.removeClass(m, 'pswp--zoom-allowed'),
                o();
            }
            var i,
              o = function () {
                i && (f.removeClass(m, 'pswp--dragging'), (i = !1));
              };
            a('resize', n),
              a('afterChange', n),
              a('pointerDown', function () {
                h.mouseZoomedIn && ((i = !0), f.addClass(m, 'pswp--dragging'));
              }),
              a('pointerUp', o),
              e || n();
          },
          handleMouseWheel: function (e) {
            if (q <= h.currItem.fitRatio)
              return (
                y.modal &&
                  (!y.closeOnScroll || lt || De
                    ? e.preventDefault()
                    : le && 2 < Math.abs(e.deltaY) && ((Y = !0), h.close())),
                !0
              );
            if ((e.stopPropagation(), (nn.x = 0), 'deltaX' in e))
              1 === e.deltaMode
                ? ((nn.x = 18 * e.deltaX), (nn.y = 18 * e.deltaY))
                : ((nn.x = e.deltaX), (nn.y = e.deltaY));
            else if ('wheelDelta' in e)
              e.wheelDeltaX && (nn.x = -0.16 * e.wheelDeltaX),
                e.wheelDeltaY
                  ? (nn.y = -0.16 * e.wheelDeltaY)
                  : (nn.y = -0.16 * e.wheelDelta);
            else {
              if (!('detail' in e)) return;
              nn.y = e.detail;
            }
            b(q, !0);
            var t = Be.x - nn.x,
              n = Be.y - nn.y;
            (y.modal ||
              (t <= Pe.min.x &&
                t >= Pe.max.x &&
                n <= Pe.min.y &&
                n >= Pe.max.y)) &&
              e.preventDefault(),
              h.panTo(t, n);
          },
          toggleDesktopZoom: function (e) {
            e = e || { x: Ge.x / 2 + Ve.x, y: Ge.y / 2 + Ve.y };
            var t = y.getDoubleTapZoom(!0, h.currItem),
              n = q === t;
            (h.mouseZoomedIn = !n),
              h.zoomTo(n ? h.currItem.initialZoomLevel : t, e, 333),
              f[(n ? 'remove' : 'add') + 'Class'](m, 'pswp--zoomed-in');
          },
        },
      });
    function an() {
      return xn.hash.substring(1);
    }
    function rn() {
      sn && clearTimeout(sn), cn && clearTimeout(cn);
    }
    function ln() {
      var e = an(),
        t = {};
      if (e.length < 5) return t;
      var n,
        i = e.split('&');
      for (n = 0; n < i.length; n++)
        if (i[n]) {
          var o = i[n].split('=');
          o.length < 2 || (t[o[0]] = o[1]);
        }
      if (y.galleryPIDs) {
        var a = t.pid;
        for (n = t.pid = 0; n < Wt.length; n++)
          if (Wt[n].pid === a) {
            t.pid = n;
            break;
          }
      } else t.pid = parseInt(t.pid, 10) - 1;
      return t.pid < 0 && (t.pid = 0), t;
    }
    var sn,
      un,
      cn,
      dn,
      pn,
      mn,
      fn,
      hn,
      yn,
      vn,
      xn,
      gn,
      wn = { history: !0, galleryUID: 1 },
      bn = function () {
        if ((cn && clearTimeout(cn), lt || De)) cn = setTimeout(bn, 500);
        else {
          dn ? clearTimeout(un) : (dn = !0);
          var e = W + 1,
            t = Xt(W);
          t.hasOwnProperty('pid') && (e = t.pid);
          var n = fn + '&gid=' + y.galleryUID + '&pid=' + e;
          hn || (-1 === xn.hash.indexOf(n) && (vn = !0));
          var i = xn.href.split('#')[0] + '#' + n;
          gn
            ? '#' + n !== window.location.hash &&
              history[hn ? 'replaceState' : 'pushState']('', document.title, i)
            : hn
            ? xn.replace(i)
            : (xn.hash = n),
            (hn = !0),
            (un = setTimeout(function () {
              dn = !1;
            }, 60));
        }
      };
    o('History', {
      publicMethods: {
        initHistory: function () {
          if ((f.extend(y, wn, !0), y.history)) {
            (xn = window.location),
              (hn = yn = vn = !1),
              (fn = an()),
              (gn = 'pushState' in history),
              -1 < fn.indexOf('gid=') &&
                (fn = (fn = fn.split('&gid=')[0]).split('?gid=')[0]),
              a('afterChange', h.updateURL),
              a('unbindEvents', function () {
                f.unbind(window, 'hashchange', h.onHashChange);
              });
            var e = function () {
              (mn = !0),
                yn ||
                  (vn
                    ? history.back()
                    : fn
                    ? (xn.hash = fn)
                    : gn
                    ? history.pushState(
                        '',
                        document.title,
                        xn.pathname + xn.search
                      )
                    : (xn.hash = '')),
                rn();
            };
            a('unbindEvents', function () {
              Y && e();
            }),
              a('destroy', function () {
                mn || e();
              }),
              a('firstUpdate', function () {
                W = ln().pid;
              });
            var t = fn.indexOf('pid=');
            -1 < t &&
              '&' === (fn = fn.substring(0, t)).slice(-1) &&
              (fn = fn.slice(0, -1)),
              setTimeout(function () {
                U && f.bind(window, 'hashchange', h.onHashChange);
              }, 40);
          }
        },
        onHashChange: function () {
          return an() === fn
            ? ((yn = !0), void h.close())
            : void (dn || ((pn = !0), h.goTo(ln().pid), (pn = !1)));
        },
        updateURL: function () {
          rn(), pn || (hn ? (sn = setTimeout(bn, 800)) : bn());
        },
      },
    }),
      f.extend(h, st);
  };
});
var timeout,
  html = $('html'),
  body = $('body'),
  st = 0,
  lastSt = 0,
  titleOffset = 0,
  contentOffset = 0,
  progress = $('.sticky-progress');
function sticky() {
  'use strict';
  (st = jQuery(window).scrollTop()),
    0 < titleOffset &&
      0 < contentOffset &&
      (lastSt < st
        ? titleOffset < st && body.addClass('sticky-visible')
        : st <= titleOffset && body.removeClass('sticky-visible')),
    progress.css(
      'transform',
      'translate3d(' +
        (-100 + Math.min((100 * st) / contentOffset, 100)) +
        '%,0,0)'
    ),
    (lastSt = st);
}
function subMenu() {
  'use strict';
  var t = $('.main-nav'),
    e = t.find('.menu-item[href*="..."]');
  if (e.length) {
    e.nextAll('.menu-item').wrapAll('<div class="sub-menu" />'),
      e.replaceWith(
        '<button class="button-icon menu-item-button menu-item-more" aria-label="More"><svg class="icon"><use xlink:href="#dots-horizontal"></use></svg></button>'
      );
    var a = t.find('.menu-item-more'),
      n = $('.sub-menu');
    a.append(n),
      a.on('click', function () {
        n.is(':visible')
          ? n.addClass('animate__animated animate__zoomOut')
          : n.show().addClass('animate__animated animate__bounceIn');
      }),
      n.on('animationend', function (t) {
        n.removeClass('animate__animated animate__bounceIn animate__zoomOut'),
          'zoomOut' == t.originalEvent.animationName && n.hide();
      });
  }
}
function whiteLogo() {
  'use strict';
  if ('' != themeOptions.white_logo) {
    var t =
      '<img class="logo-image white" src="' + themeOptions.white_logo + '">';
    $('.logo').prepend(t);
  }
}
function whiteIcon() {
  'use strict';
  if (void 0 !== themeOptions.white_icon && '' != themeOptions.white_icon) {
    var t =
      '<img class="cover-icon-image white" src="' +
      themeOptions.white_icon +
      '">';
    $('.cover-icon').prepend(t);
  }
}
function featured() {
  'use strict';
  $('.featured-feed').owlCarousel({
    dots: !1,
    margin: 30,
    nav: !0,
    navText: [
      '<svg class="icon"><use xlink:href="#chevron-left"></use></svg>',
      '<svg class="icon"><use xlink:href="#chevron-right"></use></svg>',
    ],
    responsive: { 0: { items: 1 }, 768: { items: 2 }, 992: { items: 3 } },
  });
}
function pagination() {
  'use strict';
  var t = $('.post-feed');
  body.hasClass('paged-next') &&
    t.infiniteScroll({
      append: '.feed',
      button: '.infinite-scroll-button',
      debug: !1,
      hideNav: '.pagination',
      path: '.pagination .older-posts',
      scrollThreshold: !1,
      status: '.infinite-scroll-status',
    }),
    t.on('append.infiniteScroll', function (t, e, a, n) {
      $(n[0]).addClass('feed-paged');
    });
}
function video() {
  'use strict';
  $('.single-content').fitVids();
}
function gallery() {
  'use strict';
  document.querySelectorAll('.kg-gallery-image img').forEach(function (t) {
    var e = t.closest('.kg-gallery-image'),
      a = t.attributes.width.value / t.attributes.height.value;
    e.style.flex = a + ' 1 0%';
  }),
    pswp(
      '.kg-gallery-container',
      '.kg-gallery-image',
      '.kg-gallery-image',
      !1,
      !0
    );
}
function table() {
  'use strict';
  (body.hasClass('post-template') || body.hasClass('page-template')) &&
    $('.single-content')
      .find('.table')
      .each(function (t, e) {
        var a = [];
        $(e)
          .find('thead th')
          .each(function (t, e) {
            a.push($(e).text());
          }),
          $(e)
            .find('tr')
            .each(function (t, e) {
              $(e)
                .find('td')
                .each(function (t, e) {
                  $(e).attr('data-label', a[t]);
                });
            });
      });
}
function toc() {
  'use strict';
  if (body.hasClass('post-template')) {
    var n = '',
      t = $('.sticky-toc-button');
    $('.single-content')
      .find('> h2, > h3')
      .each(function (t, e) {
        var a =
          'H3' == $(this).prop('tagName')
            ? 'sticky-toc-link sticky-toc-link-indented'
            : 'sticky-toc-link';
        n +=
          '<a class="' +
          a +
          '" href="#' +
          $(e).attr('id') +
          '">' +
          $(e).text() +
          '</a>';
      }),
      '' == n && t.remove(),
      $('.sticky-toc').html(n),
      t.on('click', function () {
        body.toggleClass('toc-opened');
      }),
      $('.sticky-toc-link').on('click', function (t) {
        t.preventDefault();
        var e = $(this).attr('href');
        $('html, body').animate({ scrollTop: $(e).offset().top - 82 }, 500);
      });
  }
}
function modal() {
  'use strict';
  var e = $('.modal-overlay'),
    t = $('.modal'),
    a = $('.modal-input');
  $('.js-modal').on('click', function (t) {
    t.preventDefault(),
      e.show().outerWidth(),
      body.addClass('modal-opened'),
      a.focus();
  }),
    $('.modal-close, .modal-overlay').on('click', function () {
      body.removeClass('modal-opened');
    }),
    t.on('click', function (t) {
      t.stopPropagation();
    }),
    $(document).keyup(function (t) {
      27 === t.keyCode &&
        body.hasClass('modal-opened') &&
        body.removeClass('modal-opened');
    }),
    e.on('transitionend', function (t) {
      body.hasClass('modal-opened') || e.hide();
    }),
    t.on('transitionend', function (t) {
      t.stopPropagation();
    });
}
function search() {
  'use strict';
  if ('' != themeOptions.search_key) {
    var n,
      t = $('.search-input'),
      o = $('.search-button'),
      i = $('.search-result'),
      s = $('.popular-wrapper'),
      e =
        siteUrl +
        '/ghost/api/v2/content/posts/?key=' +
        themeOptions.search_key +
        '&limit=all&fields=id,title,url,updated_at,visibility&order=updated_at%20desc&formats=plaintext',
      a = JSON.parse(localStorage.getItem('dawn_search_index'));
    elasticlunr.clearStopWords(),
      localStorage.removeItem('dawn_index'),
      localStorage.removeItem('dawn_last'),
      a &&
      themeOptions.search_migration ==
        localStorage.getItem('dawn_search_migration')
        ? ((n = elasticlunr.Index.load(a)),
          $.get(
            e +
              "&filter=updated_at:>'" +
              localStorage
                .getItem('dawn_search_last')
                .replace(/\..*/, '')
                .replace(/T/, ' ') +
              "'",
            function (t) {
              0 < t.posts.length && l(t);
            }
          ))
        : $.get(e, function (t) {
            0 < t.posts.length &&
              ((n = elasticlunr(function () {
                this.addField('title'),
                  this.addField('plaintext'),
                  this.setRef('id');
              })),
              l(t),
              void 0 !== themeOptions.search_migration &&
                localStorage.setItem(
                  'dawn_search_migration',
                  themeOptions.search_migration
                ));
          }),
      t.on('keyup', function (t) {
        var e = n.search(t.target.value, { expand: !0 }),
          a = '';
        e.forEach(function (t) {
          a +=
            '<div class="search-result-row"><a class="search-result-row-link" href="' +
            t.doc.url +
            '">' +
            t.doc.title +
            '</a></div>';
        }),
          i.html(a),
          0 < t.target.value.length
            ? o.addClass('search-button-clear')
            : o.removeClass('search-button-clear'),
          0 < e.length ? s.hide() : s.show();
      }),
      $('.search-form').on('submit', function (t) {
        t.preventDefault();
      }),
      o.on('click', function () {
        $(this).hasClass('search-button-clear') && t.val('').focus().keyup();
      });
  }
  function l(t) {
    t.posts.forEach(function (t) {
      n.addDoc(t);
    }),
      localStorage.setItem('dawn_search_index', JSON.stringify(n)),
      localStorage.setItem('dawn_search_last', t.posts[0].updated_at);
  }
}
function burger() {
  'use strict';
  $('.burger').on('click', function () {
    body.toggleClass('menu-opened');
  });
}
function gravatar() {
  'use strict';
  var t = $('.account-image');
  t.length &&
    (t.attr(
      'data-src',
      'https://www.gravatar.com/avatar/' +
        md5(t.attr('data-email')) +
        '?d=mp&s=160'
    ),
    lazySizes.loader.unveil(t[0]));
}
function plan() {
  'use strict';
  var t = $('.plan-selector-button');
  t.on('click', function () {
    t.addClass('button-secondary'),
      $(this).removeClass('button-secondary'),
      $(this)
        .closest('.plan-selector')
        .attr(
          'class',
          'plan-selector plan-selector-' + $(this).attr('data-plan')
        );
  });
}
function theme() {
  'use strict';
  var t = $('.js-theme'),
    e = t.find('.theme-text');
  function a() {
    html.removeClass(['theme-dark', 'theme-light']),
      localStorage.removeItem('dawn_theme'),
      e.text(t.attr('data-system'));
  }
  function n() {
    html.removeClass('theme-light').addClass('theme-dark'),
      localStorage.setItem('dawn_theme', 'dark'),
      e.text(t.attr('data-dark'));
  }
  function o() {
    html.removeClass('theme-dark').addClass('theme-light'),
      localStorage.setItem('dawn_theme', 'light'),
      e.text(t.attr('data-light'));
  }
  switch (localStorage.getItem('dawn_theme')) {
    case 'dark':
      n();
      break;
    case 'light':
      o();
      break;
    default:
      a();
  }
  t.on('click', function (t) {
    t.preventDefault(),
      (html.hasClass('theme-dark') || html.hasClass('theme-light')
        ? html.hasClass('theme-dark')
          ? o
          : a
        : n)();
  });
}
function pswp(n, c, r, d, u) {
  function o(t, e) {
    var n,
      a,
      o,
      i,
      s,
      l = document.querySelectorAll('.pswp')[0];
    (s = []),
      $(e)
        .find(c)
        .each(function (t, e) {
          (a = $(e)),
            (o = a.find(r)),
            (i = {
              src: u ? a.find('img').attr('src') : o.attr('href'),
              w: 0,
              h: 0,
            }),
            d && a.find(d).length && (i.title = a.find(d).html()),
            s.push(i);
        }),
      (n = new PhotoSwipe(l, PhotoSwipeUI_Default, s, {
        closeOnScroll: !1,
        history: !1,
        index: t,
        shareEl: !1,
        showAnimationDuration: 0,
        showHideOpacity: !0,
      })).listen('gettingData', function (t, e) {
        if (e.w < 1 || e.h < 1) {
          var a = new Image();
          (a.onload = function () {
            (e.w = this.width), (e.h = this.height), n.updateSize(!0);
          }),
            (a.src = e.src);
        }
      }),
      n.init();
  }
  $(n).on('click', r, function (t) {
    !(function (t) {
      t.preventDefault();
      var e = $(t.target).closest(n).find(c).index($(t.target).closest(c)),
        a = $(t.target).closest(n);
      o(e, a[0]);
    })(t);
  });
}
function notification() {
  'use strict';
  var t = $('.notification');
  $('.notification-close').on('click', function (t) {
    t.preventDefault(), body.addClass('notification-closing');
    var e = window.location.toString();
    if (0 < e.indexOf('?')) {
      var a = e.substring(0, e.indexOf('?'));
      window.history.replaceState({}, document.title, a);
    }
    $(this).closest('.auth-form').length &&
      $(this).closest('.auth-form').removeClass('success error');
  }),
    t.on('transitionend', function () {
      body.hasClass('notification-closing') &&
        body.removeClass('notification-closing notification-opened');
    });
}
function getParameterByName(t, e) {
  'use strict';
  (e = e || window.location.href), (t = t.replace(/[\[\]]/g, '\\$&'));
  var a = new RegExp('[?&]' + t + '(=([^&#]*)|&|#|$)').exec(e);
  return a ? (a[2] ? decodeURIComponent(a[2].replace(/\+/g, ' ')) : '') : null;
}
$(function () {
  'use strict';
  subMenu(),
    whiteLogo(),
    whiteIcon(),
    featured(),
    pagination(),
    video(),
    gallery(),
    table(),
    toc(),
    modal(),
    search(),
    burger(),
    gravatar(),
    plan(),
    theme(),
    notification();
}),
  $(window).on('scroll', function () {
    'use strict';
    body.hasClass('post-template') &&
      (timeout && window.cancelAnimationFrame(timeout),
      (timeout = window.requestAnimationFrame(sticky)));
  }),
  $(window).on('load', function () {
    'use strict';
    if (body.hasClass('post-template')) {
      titleOffset = $('.single-title').offset().top;
      var t = $('.single-content'),
        e = t.height();
      contentOffset = t.offset().top + e - $(window).height() / 2;
    }
  });
