# earthbound-battle-backgrounds
An optimized rewrite of [gjtorikian/Earthbound-Battle-Backgrounds-JS](https://github.com/gjtorikian/Earthbound-Battle-Backgrounds-JS) with cleaner code

# What is this?
Earthbound, also known as *Mother 2* in Japan, is a SNES game released in 1994. This project displays Earthbound's battle backgrounds browsers. In order to render the frames, currently a [Canvas 2D context](https://www.w3.org/TR/2dcontext/) is used. I'd be happy to use a [WebGL 2 context](https://www.khronos.org/registry/webgl/specs/latest/2.0/) once support is more wide-spread.

# Is there a demo?
Yes. You can find a full-screen demo [here](https://kdex.github.io/earthbound-battle-backgrounds).
- Use `[+]` and `[-]` to change layer 1.
- Use `[Shift] + [+]` and `[Shift] + [-]` to change layer 2.

# Installation
```bash
$ npm install
$ jspm install
$ gulp
```

# Project maintenance history
- In 2008, the code for this project started out on [PK Hack](http://starmen.net/pkhack/) as a [Windows screensaver](https://forum.starmen.net/forum/Fan/Games/Kraken-EB-Battle-Animation-Screensaver/first), written in C# by [Mr. Accident](https://forum.starmen.net/members/168).
- In 2010, [gjtorikian](https://github.com/gjtorikian) ported Mr. Accident's Windows screensaver from C# to [Java](https://github.com/gjtorikian/Earthbound-Battle-Backgrounds) to support Android Live screensavers.
- In 2013, gjtorikian ported his own project from Java to [ES5 JavaScript](https://github.com/gjtorikian/Earthbound-Battle-Backgrounds-JS) to support all devices with a web browser. He is well aware that his port is terrible (in fact, he even wrote a [dedicated section](https://github.com/gjtorikian/Earthbound-Battle-Backgrounds-JS/blob/gh-pages/README.md#why-is-this-code-so-terrible) in his README.md, just to reflect that).
- In 2016, [I](https://github.com/kdex) forked gjtorikian's "terrible" port of a port and soon started to re-write his code in [ES6+](https://github.com/kdex/earthbound-battle-backgrounds) for it to stay maintainable.

# How does this port differ?
A great portion of the code was essentially re-written. Essentially, this code…
- …offers a 25% lower memory footprint than gjtorikian's JavaScript port when rendering.
- …highly optimizes changing the background layers at runtime; gjtorikian's version will show a white flash when you're trying to change it. This port doesn't do that.
- …uses [ES6](http://www.ecma-international.org/ecma-262/6.0/) or later language standards.
- …doesn't use RequireJS, but [ES6 modules](http://www.2ality.com/2014/09/es6-modules-final.html).
- …doesn't use functionally-scoped variable declarations (`var`), but `const` and `let`.
- …uses syntactical ES5 getters and setters instead of `getX()`- and `setX()`-style functions (cf. Java).
- …uses ES6 classes.
- …removes UnderscoreJS-inspired functions and uses native ES6 functions instead.
- …removes the weird and broken OOP model that gjtorikian had introduced (`registerType` etc.).
- …removes notable comments such as [ugghhhhhhhhh](https://github.com/gjtorikian/Earthbound-Battle-Backgrounds-JS/blob/gh-pages/src/read_bgs_dat.js#L27).
- …removes unnecessary brackets that gjtorikian put everywhere (cf. his README.md).
- …removes Node Express.
- …removes that weird `LOG_TAG` variable-based logging.
- …fixes minor bugs.
