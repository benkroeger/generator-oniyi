<%
var b = [] 
if (~badges.indexOf('npm')) b.push('[![NPM version][npm-image]][npm-url]')
if (~badges.indexOf('codecov')) b.push('[![Codecov Status][codecov-image]][codecov-url]')
if (~badges.indexOf('downloads')) b.push('[![Downloads][download-image]][npm-url]')
%>

# <%= moduleName %>
<%= b.join('\n') %>

> <%= moduleDescription %>

## Install

```sh
npm install --save <%= moduleName %>
```

## Usage

```js
import <%= camelModuleName %> from '<%= moduleName %>'

<%= camelModuleName %>()
```

## License

<% if (moduleLicense) { %> <%= moduleLicense + " © " %> <%  } %><%= "[" + name + "](" + website + ")" %>

[npm-url]: https://npmjs.org/package/<%= moduleName %>
[npm-image]: https://img.shields.io/npm/v/<%= moduleName %>.svg?style=flat

[codecov-url]: https://codecov.io/github/<%= githubUsername %>/<%= moduleName %>
[codecov-image]: https://img.shields.io/codecov/c/github/<%= githubUsername %>/<%= moduleName %>.svg?style=flat

[download-image]: http://img.shields.io/npm/dm/<%= moduleName %>.svg?style=flat
